import type { Dish, Fruit, NutritionalAudit, WeekPlan } from '../types';
import { getWeekDates, toDateInputString } from './dateUtils';

export function calculateNutritionalAudit(
  plan: WeekPlan | null | undefined,
  dishesMap: Record<string, Dish>
): NutritionalAudit {
  let marCount = 0;
  let carneBlancaCount = 0;
  let carneRojaCount = 0;
  let carneTotalCount = 0;
  let huevosCount = 0;
  let setasCount = 0;
  let tuberculosCount = 0;
  let legumbresCount = 0;
  let pastaCount = 0;
  let verdurasCount = 0;
  let algasCount = 0;
  let aoveCount = 0;
  let frutasCount = 0;
  let totalMealsPlanned = 0;

  const marSubCounts: Record<string, number> = {
    'Pescado Azul': 0,
    'Pescado Blanco': 0,
    'Cefalópodos': 0,
    'Marisco': 0,
  };

  const legSubCounts: Record<string, number> = {
    'Lentejas': 0,
    'Garbanzos': 0,
    'Alubias': 0,
    'Guisantes/Habas': 0,
  };

  const pastaSubCounts: Record<string, number> = {
    'Trigo Sarraceno': 0,
    'Trigo Integral': 0,
    'Trigo Blanco': 0,
  };

  const vegSubCounts: Record<string, number> = {
    'Crucíferas': 0,
    'Hojas verdes y tallos': 0,
    'Bulbos': 0,
    'Solanáceas': 0,
    'Alcachofas': 0,
  };

  let huevosPlatoCount = 0;
  let huevosCompCount = 0;

  if (plan && plan.days) {
    Object.values(plan.days).forEach((day) => {
      // Check lunch
      if (day.lunch.dishId && dishesMap[day.lunch.dishId]) {
        totalMealsPlanned++;
        const dish = dishesMap[day.lunch.dishId];
        tallyDish(dish);
      }
      if (day.lunch.fruitId) {
        frutasCount++;
      }

      // Check dinner
      if (day.dinner.dishId && dishesMap[day.dinner.dishId]) {
        totalMealsPlanned++;
        const dish = dishesMap[day.dinner.dishId];
        tallyDish(dish);
      }
      if (day.dinner.fruitId) {
        frutasCount++;
      }
    });
  }

  function tallyDish(dish: Dish) {
    // 1. Categoría Principal
    if (dish.categoryId === 'mar') {
      marCount++;
      const sub = dish.subcategory.toLowerCase();
      if (sub.includes('azul')) marSubCounts['Pescado Azul']++;
      else if (sub.includes('blanco')) marSubCounts['Pescado Blanco']++;
      else if (sub.includes('cefal')) marSubCounts['Cefalópodos']++;
      else if (sub.includes('marisc')) marSubCounts['Marisco']++;
      else marSubCounts['Pescado Azul']++;
    } else if (dish.categoryId === 'carne') {
      carneTotalCount++;
      if (dish.subcategory.toLowerCase().includes('roja')) {
        carneRojaCount++;
      } else {
        carneBlancaCount++;
      }
    } else if (dish.categoryId === 'legumbres') {
      legumbresCount++;
      const sub = dish.subcategory.toLowerCase();
      if (sub.includes('lenteja')) legSubCounts['Lentejas']++;
      else if (sub.includes('garbanzo')) legSubCounts['Garbanzos']++;
      else if (sub.includes('alubia')) legSubCounts['Alubias']++;
      else legSubCounts['Guisantes/Habas']++;
    } else if (dish.categoryId === 'pasta' || (dish.categoryId as string) === 'cereales') {
      pastaCount++;
      const sub = dish.subcategory.toLowerCase();
      if (sub.includes('sarraceno')) pastaSubCounts['Trigo Sarraceno']++;
      else if (sub.includes('integral')) pastaSubCounts['Trigo Integral']++;
      else pastaSubCounts['Trigo Blanco']++;
    } else if ((dish.categoryId as string) === 'setas') {
      setasCount++;
    } else if ((dish.categoryId as string) === 'tuberculos') {
      tuberculosCount++;
    }

    // 2. Alimentos con presencia (plato principal o complemento)
    // Huevos: las recetas son para 2 personas; el control de ingestas es individual (se divide entre 2)
    if (dish.hasEggs || (dish.eggCount !== undefined && dish.eggCount > 0)) {
      const recipeEggs = dish.eggCount && dish.eggCount > 0 ? dish.eggCount : 2;
      const individualEggs = recipeEggs / 2;
      huevosCount += individualEggs;
      if (dish.categoryId === 'huevos') {
        huevosPlatoCount += individualEggs;
      } else {
        huevosCompCount += individualEggs;
      }
    }

    // Verduras: cuenta si es plato principal de verduras O si se ha marcado la presencia de verduras complementarias
    if (
      dish.categoryId === 'verduras' ||
      dish.hasVegetables ||
      (dish.vegetableTypes && dish.vegetableTypes.length > 0)
    ) {
      verdurasCount++;

      const detectedVegTypes = new Set<string>();

      // Solo se contabilizan los tipos de verdura explícitamente seleccionados en el plato/receta
      if (dish.vegetableTypes && Array.isArray(dish.vegetableTypes)) {
        dish.vegetableTypes.forEach((t) => {
          const lower = String(t).toLowerCase();
          if (lower.includes('alcachof')) detectedVegTypes.add('Alcachofas');
          else if (lower.includes('crucifer')) detectedVegTypes.add('Crucíferas');
          else if (lower.includes('bulbo')) detectedVegTypes.add('Bulbos');
          else if (lower.includes('hoja') || lower.includes('tallo')) detectedVegTypes.add('Hojas verdes y tallos');
          else if (lower.includes('solanace')) detectedVegTypes.add('Solanáceas');
        });
      }

      detectedVegTypes.forEach((norm) => {
        if (vegSubCounts[norm] !== undefined) {
          vegSubCounts[norm]++;
        }
      });
    }

    // Setas y hongos (plato principal o complemento)
    if ((dish.containsMushrooms || dish.hasMushrooms) && (dish.categoryId as string) !== 'setas') {
      setasCount++;
    }
    // Tubérculos y raíces (plato principal o complemento)
    if (dish.hasTubers && (dish.categoryId as string) !== 'tuberculos') {
      tuberculosCount++;
    }
    if (dish.hasSeaweed) {
      algasCount++;
    }
    if (dish.hasOliveOil) {
      aoveCount++;
    }
  }

  const alerts: NutritionalAudit['alerts'] = [];

  // 1. Alimentos del Mar (3-4 veces)
  const marUnderMin = marCount < 3;
  const marOverMax = marCount > 4;
  const azulUnder = marSubCounts['Pescado Azul'] < 1;
  const azulExceeded = marSubCounts['Pescado Azul'] > 2;
  const blancoUnder = marSubCounts['Pescado Blanco'] < 1;
  const blancoExceeded = marSubCounts['Pescado Blanco'] > 2;
  const cefalExceeded = marSubCounts['Cefalópodos'] > 1;
  const mariscExceeded = marSubCounts['Marisco'] > 1;

  const marSubIssue =
    azulUnder ||
    azulExceeded ||
    blancoUnder ||
    blancoExceeded ||
    cefalExceeded ||
    mariscExceeded;

  const marHasIssue = marUnderMin || marOverMax || marSubIssue;
  const marSubcategories = [
    { name: 'Pescado Azul', val: marSubCounts['Pescado Azul'], min: 1, max: 2, underMin: azulUnder, exceeded: azulExceeded, unit: 'comidas' },
    { name: 'Pescado Blanco', val: marSubCounts['Pescado Blanco'], min: 1, max: 2, underMin: blancoUnder, exceeded: blancoExceeded, unit: 'comidas' },
    { name: 'Cefalópodos', val: marSubCounts['Cefalópodos'], min: 0, max: 1, exceeded: cefalExceeded, unit: 'comidas' },
    { name: 'Marisco', val: marSubCounts['Marisco'], min: 0, max: 1, exceeded: mariscExceeded, unit: 'comidas' },
  ];
  alerts.push({
    id: 'mar',
    val: marCount,
    min: 3,
    max: 4,
    scaleMax: 5,
    category: 'Alimentos del Mar',
    current: `${marCount} / 3-4 comidas`,
    target: '3 a 4 veces/semana',
    fulfilled: !marHasIssue,
    hasIssue: marHasIssue,
    type: marHasIssue ? 'error' : 'success',
    message: marOverMax
      ? 'Has superado el límite recomendado en pescado o marisco.'
      : marUnderMin
      ? `Llevas ${marCount} raciones de mar. Se recomiendan al menos 3 o 4 para regular la inflamación.`
      : marSubIssue
      ? 'Alguna subcategoría de pescado está fuera de límites (Pescado Azul 1-2, Blanco 1-2).'
      : '¡Excelente! Cobertura óptima de Omega 3 antiinflamatorio (EPA/DHA), selenio y zinc.',
    subcategories: marSubcategories,
  });

  // 2. Carne y Carne Roja (Total 3-4, Blanca 2-3, Roja 1-2)
  const blancaUnder = carneBlancaCount < 2;
  const blancaExceeded = carneBlancaCount > 3;
  const rojaUnder = carneRojaCount < 1;
  const rojaExceeded = carneRojaCount > 2;
  const carneTotalUnder = carneTotalCount < 3;
  const carneTotalExceeded = carneTotalCount > 4;
  const carneHasIssue = blancaUnder || blancaExceeded || rojaUnder || rojaExceeded || carneTotalUnder || carneTotalExceeded;
  const carneFulfilled = !carneHasIssue;
  const carneSubcategories = [
    { name: 'Carne Blanca', val: carneBlancaCount, min: 2, max: 3, underMin: blancaUnder, exceeded: blancaExceeded, unit: 'comidas' },
    { name: 'Carne Roja', val: carneRojaCount, min: 1, max: 2, underMin: rojaUnder, exceeded: rojaExceeded, unit: 'comidas' },
  ];
  alerts.push({
    id: 'carne',
    val: carneTotalCount,
    min: 3,
    max: 4,
    scaleMax: 6,
    category: 'Carne',
    current: `${carneTotalCount} tot (${carneBlancaCount} blanca, ${carneRojaCount} roja)`,
    target: '3 a 4 veces (Roja máx 1-2)',
    fulfilled: carneFulfilled,
    hasIssue: carneHasIssue,
    type: carneHasIssue ? 'error' : 'success',
    message: rojaExceeded
      ? `Has asignado ${carneRojaCount} raciones de carne roja (máximo 2 por semana).`
      : rojaUnder
      ? 'Recomendado incluir al menos 1 ración de carne roja de pasto rica en hierro hemo y B12.'
      : blancaExceeded
      ? `Has asignado ${carneBlancaCount} raciones de carne blanca (máximo 3 por semana).`
      : blancaUnder
      ? `Llevas ${carneBlancaCount} de carne blanca (recomendado 2 a 3 por semana).`
      : carneTotalExceeded
      ? `Has asignado ${carneTotalCount} raciones de carne (máximo 4 por semana).`
      : carneTotalUnder
      ? `Llevas ${carneTotalCount} raciones totales de carne (mínimo 3 por semana).`
      : 'Equilibrio adecuado de carne blanca y roja de pasto.',
    subcategories: carneSubcategories,
  });

  // 3. Huevos (5-7 unidades totales, sin subcategorías en el contador)
  const huevosUnder = huevosCount < 5;
  const huevosExceeded = huevosCount > 7;
  const huevosHasIssue = huevosUnder || huevosExceeded;
  const huevosOk = !huevosHasIssue;
  alerts.push({
    id: 'huevos',
    val: huevosCount,
    min: 5,
    max: 7,
    scaleMax: 8,
    category: 'Huevos',
    current: `${huevosCount} / 5-7 huevos`,
    target: '5 a 7 huevos/semana',
    fulfilled: huevosOk,
    hasIssue: huevosHasIssue,
    type: huevosHasIssue ? 'error' : 'success',
    message: huevosOk
      ? 'Aporte perfecto de colina y fosfolípidos para la membrana celular y el colesterol HDL.'
      : huevosUnder
      ? `Llevas ${huevosCount} huevos planificados. Meta recomendada: 5 a 7 unidades.`
      : `Has superado los 7 huevos semanales (${huevosCount} unidades).`,
  });

  // 4. Verduras Variadas (base vegetal diaria, subcategorías mín. 1 sin máx, excepto Solanáceas mín. 1 máx. 3)
  const verdurasUnder = verdurasCount < 14;
  const cruciferasUnder = vegSubCounts['Crucíferas'] < 1;
  const hojasUnder = vegSubCounts['Hojas verdes y tallos'] < 1;
  const bulbosUnder = vegSubCounts['Bulbos'] < 1;
  const alcachofasUnder = vegSubCounts['Alcachofas'] < 1;
  const solanaceasUnder = vegSubCounts['Solanáceas'] < 1;
  const solanaceasExceeded = vegSubCounts['Solanáceas'] > 3;

  const vegSubIssue =
    cruciferasUnder ||
    hojasUnder ||
    bulbosUnder ||
    alcachofasUnder ||
    solanaceasUnder ||
    solanaceasExceeded;

  const verdurasHasIssue = verdurasUnder || vegSubIssue;
  const verdurasOk = !verdurasHasIssue;
  const verdurasSubcategories = [
    { name: 'Crucíferas (brócoli, col...)', val: vegSubCounts['Crucíferas'], min: 1, underMin: cruciferasUnder, unit: 'veces' },
    { name: 'Hojas verdes y tallos', val: vegSubCounts['Hojas verdes y tallos'], min: 1, underMin: hojasUnder, unit: 'veces' },
    { name: 'Bulbos (cebolla, puerro, ajo)', val: vegSubCounts['Bulbos'], min: 1, underMin: bulbosUnder, unit: 'veces' },
    { name: 'Alcachofas', val: vegSubCounts['Alcachofas'], min: 1, underMin: alcachofasUnder, unit: 'veces' },
    { name: 'Solanáceas (tomate, pimiento...)', val: vegSubCounts['Solanáceas'], min: 1, max: 3, underMin: solanaceasUnder, exceeded: solanaceasExceeded, unit: 'veces' },
  ];
  alerts.push({
    id: 'verduras',
    val: verdurasCount,
    min: 14,
    scaleMax: 14,
    category: 'Verduras Variadas',
    current: `${verdurasCount} / 14 raciones`,
    target: 'Base diaria (almuerzo y cena)',
    fulfilled: verdurasOk,
    hasIssue: verdurasHasIssue,
    type: verdurasHasIssue ? 'error' : 'success',
    message: solanaceasExceeded
      ? `Has superado las 3 comidas con solanáceas (${vegSubCounts['Solanáceas']} raciones). Máximo 3 por semana.`
      : solanaceasUnder
      ? 'Recomendado incluir al menos 1 ración con solanáceas.'
      : alcachofasUnder
      ? 'Recomendado incluir al menos 1 ración con alcachofas.'
      : cruciferasUnder
      ? 'Recomendado incluir al menos 1 ración con crucíferas (brócoli, coliflor...).'
      : verdurasUnder
      ? `Llevas ${verdurasCount} comidas con verdura. Meta recomendada: 14 raciones.`
      : '¡Excelente cobertura vegetal! Raciones de verduras presentes a diario.',
    subcategories: verdurasSubcategories,
  });

  // 5. Setas y Hongos (al menos 2 veces, cómputo global sin subcategorías en el contador)
  const setasUnder = setasCount < 2;
  const setasHasIssue = setasUnder;
  const setasOk = !setasHasIssue;
  alerts.push({
    id: 'setas',
    val: setasCount,
    min: 2,
    scaleMax: 4,
    category: 'Setas y Hongos',
    current: `${setasCount} / mín. 2 raciones`,
    target: 'Al menos 2 veces/semana',
    fulfilled: setasOk,
    hasIssue: setasHasIssue,
    type: setasHasIssue ? 'error' : 'success',
    message: setasOk
      ? '¡Cumplido! Estímulo inmunitario asegurado gracias a la riqueza en betaglucanos de los hongos.'
      : `Llevas ${setasCount} raciones con setas (plato o complemento). Incorpora al menos 2 a la semana.`,
  });

  // 6. Tubérculos y Raíces (1-2 veces, cómputo global sin subcategorías en el contador)
  const tuberculosUnder = tuberculosCount < 1;
  const tuberculosExceeded = tuberculosCount > 2;
  const tuberculosHasIssue = tuberculosUnder || tuberculosExceeded;
  const tuberculosOk = !tuberculosHasIssue;
  alerts.push({
    id: 'tuberculos',
    val: tuberculosCount,
    min: 1,
    max: 2,
    scaleMax: 3,
    category: 'Tubérculos y Raíces',
    current: `${tuberculosCount} / 1-2 raciones`,
    target: '1 a 2 veces/semana',
    fulfilled: tuberculosOk,
    hasIssue: tuberculosHasIssue,
    type: tuberculosHasIssue ? 'error' : 'success',
    message: tuberculosExceeded
      ? `Llevas ${tuberculosCount} comidas con tubérculos. Conviene no superar 1 o 2 a la semana.`
      : tuberculosUnder
      ? 'Recomendado incluir al menos 1 ración de tubérculos o raíces como fuente prebiótica limpia.'
      : 'Dosis ideal de carbohidratos complejos prebióticos y procinéticos.',
  });

  // 7. Legumbres (Máximo 1 vez)
  const legExceeded = legumbresCount > 1 || Object.values(legSubCounts).some((v) => v > 1);
  const legHasIssue = legExceeded;
  const legSubcategories = [
    { name: 'Lentejas', val: legSubCounts['Lentejas'], min: 0, max: 1, exceeded: legSubCounts['Lentejas'] > 1, unit: 'comidas' },
    { name: 'Garbanzos', val: legSubCounts['Garbanzos'], min: 0, max: 1, exceeded: legSubCounts['Garbanzos'] > 1, unit: 'comidas' },
    { name: 'Alubias', val: legSubCounts['Alubias'], min: 0, max: 1, exceeded: legSubCounts['Alubias'] > 1, unit: 'comidas' },
    { name: 'Guisantes/Habas', val: legSubCounts['Guisantes/Habas'], min: 0, max: 1, exceeded: legSubCounts['Guisantes/Habas'] > 1, unit: 'comidas' },
  ];
  alerts.push({
    id: 'legumbres',
    val: legumbresCount,
    min: 0,
    max: 1,
    scaleMax: 2,
    category: 'Legumbres',
    current: `${legumbresCount} / máx. 1 ración`,
    target: 'Máximo 1 vez/semana (remojo 48h)',
    fulfilled: !legExceeded,
    hasIssue: legHasIssue,
    type: legHasIssue ? 'error' : 'success',
    message: legExceeded
      ? `Has superado el máximo (${legumbresCount} raciones). Se aconseja no pasar de 1 semanal por antinutrientes.`
      : legumbresCount === 1
      ? 'Una ración semanal con 48h de remojo o bote de cristal: tolerancia digestiva óptima.'
      : '0 raciones de legumbres (dentro del límite permitido de 0 a 1).',
    subcategories: legSubcategories,
  });

  // 8. Pasta (Máximo 1 vez)
  const pastaExceeded = pastaCount > 1 || Object.values(pastaSubCounts).some((v) => v > 1);
  const pastaHasIssue = pastaExceeded;
  const pastaSubcategories = [
    { name: 'Trigo Sarraceno (sin gluten)', val: pastaSubCounts['Trigo Sarraceno'], min: 0, max: 1, exceeded: pastaSubCounts['Trigo Sarraceno'] > 1, unit: 'comidas' },
    { name: 'Trigo Integral', val: pastaSubCounts['Trigo Integral'], min: 0, max: 1, exceeded: pastaSubCounts['Trigo Integral'] > 1, unit: 'comidas' },
    { name: 'Trigo Blanco', val: pastaSubCounts['Trigo Blanco'], min: 0, max: 1, exceeded: pastaSubCounts['Trigo Blanco'] > 1, unit: 'comidas' },
  ];
  alerts.push({
    id: 'pasta',
    val: pastaCount,
    min: 0,
    max: 1,
    scaleMax: 2,
    category: 'Pasta',
    current: `${pastaCount} / máx. 1 ración`,
    target: 'Máximo 1 vez/semana',
    fulfilled: !pastaExceeded,
    hasIssue: pastaHasIssue,
    type: pastaHasIssue ? 'error' : 'success',
    message: pastaExceeded
      ? `Has asignado ${pastaCount} comidas con pasta. El límite recomendado es de máximo 1 por semana.`
      : pastaCount === 1
      ? '1 ración semanal de pasta (trigo sarraceno, integral o blanco).'
      : '0 raciones de pasta (dentro del consumo ocasional recomendado).',
    subcategories: pastaSubcategories,
  });

  // 9. Frutas (2 al día = 14 a la semana, cómputo global sin subcategorías en el contador)
  const frutasUnder = frutasCount < 14;
  const frutasHasIssue = frutasUnder;
  const frutasOk = !frutasHasIssue;
  alerts.push({
    id: 'frutas',
    val: frutasCount,
    min: 14,
    scaleMax: 14,
    category: 'Frutas',
    current: `${frutasCount} / 14 frutas`,
    target: '14 raciones (1 en almuerzo y 1 en cena)',
    fulfilled: frutasOk,
    hasIssue: frutasHasIssue,
    type: frutasHasIssue ? 'error' : 'success',
    message: frutasOk
      ? '¡Objetivo alcanzado! 2 raciones diarias de fruta entera.'
      : `Llevas asignadas ${frutasCount} de 14 frutas planificadas.`,
  });

  return {
    marCount,
    carneBlancaCount,
    carneRojaCount,
    carneTotalCount,
    huevosCount,
    setasCount,
    tuberculosCount,
    legumbresCount,
    pastaCount,
    verdurasCount,
    algasCount,
    aoveCount,
    frutasCount,
    totalMealsPlanned,
    alerts,
  };
}

export function createBalancedSampleWeek(
  year: number,
  weekNumber: number,
  weekId: string,
  _dishes: Dish[],
  fruits: Fruit[]
): WeekPlan {
  const dates = getWeekDates(year, weekNumber);

  const f = (index: number) => (fruits[index % fruits.length] ? fruits[index % fruits.length].id : null);

  const sampleDays: Record<number, { lunchDish: string; dinnerDish: string; lunchFruit: number; dinnerFruit: number }> = {
    0: { lunchDish: 'dish-mar-1', dinnerDish: 'dish-verd-1', lunchFruit: 0, dinnerFruit: 1 }, // Lunes: Salmón + Alcachofas
    1: { lunchDish: 'dish-carne-1', dinnerDish: 'dish-huevo-1', lunchFruit: 2, dinnerFruit: 3 }, // Martes: Pollo con brócoli + Tortilla (2 huevos)
    2: { lunchDish: 'dish-mar-3', dinnerDish: 'dish-setas-1', lunchFruit: 4, dinnerFruit: 5 }, // Miércoles: Dorada + Setas shiitake
    3: { lunchDish: 'dish-legum-1', dinnerDish: 'dish-mar-4', lunchFruit: 6, dinnerFruit: 7 }, // Jueves: Lentejas 48h + Sepia
    4: { lunchDish: 'dish-carne-4', dinnerDish: 'dish-tuber-1', lunchFruit: 8, dinnerFruit: 9 }, // Viernes: Ternera (carne roja 1) + Crema calabaza
    5: { lunchDish: 'dish-mar-5', dinnerDish: 'dish-huevo-2', lunchFruit: 1, dinnerFruit: 0 }, // Sábado: Mejillones al vapor + Revuelto boletus (2 huevos)
    6: { lunchDish: 'dish-carne-2', dinnerDish: 'dish-huevo-3', lunchFruit: 3, dinnerFruit: 2 }, // Domingo: Conejo al tomillo + Huevos poché (2 huevos)
  };

  const days: WeekPlan['days'] = {};

  dates.forEach((date, dayIdx) => {
    const config = sampleDays[dayIdx];
    days[dayIdx] = {
      dayOfWeek: dayIdx,
      dateStr: toDateInputString(date),
      lunch: {
        dishId: config ? config.lunchDish : null,
        fruitId: config ? f(config.lunchFruit) : null,
      },
      dinner: {
        dishId: config ? config.dinnerDish : null,
        fruitId: config ? f(config.dinnerFruit) : null,
      },
    };
  });

  return {
    weekId,
    year,
    weekNumber,
    startDate: toDateInputString(dates[0]),
    days,
  };
}

export function createEmptyWeekPlan(
  year: number,
  weekNumber: number,
  weekId: string
): WeekPlan {
  const dates = getWeekDates(year, weekNumber);
  const days: WeekPlan['days'] = {};

  dates.forEach((date, dayIdx) => {
    days[dayIdx] = {
      dayOfWeek: dayIdx,
      dateStr: toDateInputString(date),
      lunch: {
        dishId: null,
        fruitId: null,
      },
      dinner: {
        dishId: null,
        fruitId: null,
      },
    };
  });

  return {
    weekId,
    year,
    weekNumber,
    startDate: toDateInputString(dates[0]),
    days,
  };
}

/**
 * Rellena aleatoriamente los huecos vacíos de la semana cumpliendo de la mejor
 * forma posible con los parámetros y recomendaciones de salud celular.
 * Los platos ya asignados manualmente jamás se modifican.
 */
export function autoFillEmptySlots(
  currentPlan: WeekPlan,
  allDishes: Dish[],
  allFruits: Fruit[]
): WeekPlan {
  const dishesMap = Object.fromEntries(allDishes.map((d) => [d.id, d]));

  // Clonar la estructura actual para no mutar el estado directamente
  const updatedDays: WeekPlan['days'] = {};
  for (let i = 0; i < 7; i++) {
    const existing = currentPlan.days[i];
    updatedDays[i] = {
      dayOfWeek: i,
      dateStr: existing ? existing.dateStr : '',
      lunch: {
        dishId: existing?.lunch?.dishId || null,
        fruitId: existing?.lunch?.fruitId || null,
      },
      dinner: {
        dishId: existing?.dinner?.dishId || null,
        fruitId: existing?.dinner?.fruitId || null,
      },
    };
  }

  // Contabilizar las elecciones manuales ya existentes
  let marCount = 0;
  let carneTotalCount = 0;
  let carneRojaCount = 0;
  let huevosCount = 0;
  let setasCount = 0;
  let tuberculosCount = 0;
  let legumbresCount = 0;
  let pastaCount = 0;

  const usedDishIds = new Set<string>();

  for (let i = 0; i < 7; i++) {
    const d = updatedDays[i];
    if (d.lunch.dishId && dishesMap[d.lunch.dishId]) {
      const dish = dishesMap[d.lunch.dishId];
      tally(dish);
      usedDishIds.add(dish.id);
    }
    if (d.dinner.dishId && dishesMap[d.dinner.dishId]) {
      const dish = dishesMap[d.dinner.dishId];
      tally(dish);
      usedDishIds.add(dish.id);
    }
  }

  function tally(dish: Dish) {
    if (dish.categoryId === 'mar') {
      marCount++;
    } else if (dish.categoryId === 'carne') {
      carneTotalCount++;
      if (dish.subcategory.toLowerCase().includes('roja')) {
        carneRojaCount++;
      }
    } else if (dish.categoryId === 'legumbres') {
      legumbresCount++;
    } else if (dish.categoryId === 'pasta' || (dish.categoryId as string) === 'cereales') {
      pastaCount++;
    } else if ((dish.categoryId as string) === 'setas') {
      setasCount++;
    } else if ((dish.categoryId as string) === 'tuberculos') {
      tuberculosCount++;
    }

    // Huevos: ingesta individual (recetas para 2 personas -> dividir entre 2)
    if (dish.hasEggs || (dish.eggCount !== undefined && dish.eggCount > 0)) {
      const recipeEggs = dish.eggCount && dish.eggCount > 0 ? dish.eggCount : 2;
      huevosCount += recipeEggs / 2;
    }

    // Complementarios
    if ((dish.containsMushrooms || dish.hasMushrooms) && (dish.categoryId as string) !== 'setas') {
      setasCount++;
    }
    if (dish.hasTubers && (dish.categoryId as string) !== 'tuberculos') {
      tuberculosCount++;
    }
  }

  // Identificar huecos de comidas vacíos
  const emptyDishSlots: Array<{ dayIdx: number; mealType: 'lunch' | 'dinner' }> = [];
  for (let i = 0; i < 7; i++) {
    if (!updatedDays[i].lunch.dishId) {
      emptyDishSlots.push({ dayIdx: i, mealType: 'lunch' });
    }
    if (!updatedDays[i].dinner.dishId) {
      emptyDishSlots.push({ dayIdx: i, mealType: 'dinner' });
    }
  }

  // Ordenar para procesar almuerzos primero (adecuados para legumbres/carnes más contundentes)
  emptyDishSlots.sort((a, _b) => (a.mealType === 'lunch' ? -1 : 1));

  // Asignar platos inteligentes a cada hueco libre
  for (const slot of emptyDishSlots) {
    const canAddCarne = carneTotalCount < 4;
    const canAddCarneRoja = carneRojaCount < 1 && canAddCarne;
    const canAddHuevos = huevosCount < 7;
    const canAddTuberculos = tuberculosCount < 2;
    const canAddLegumbres = legumbresCount < 1 && slot.mealType === 'lunch';
    const canAddPasta = pastaCount < 1;

    // Filtrar platos que no violen los techos recomendados
    let candidateDishes = allDishes.filter((dish) => {
      if (dish.categoryId === 'pasta' && !canAddPasta) return false;
      if (dish.categoryId === 'legumbres' && !canAddLegumbres) return false;
      if (dish.hasTubers && !canAddTuberculos) return false;
      if (dish.categoryId === 'carne') {
        if (!canAddCarne) return false;
        if (dish.subcategory.toLowerCase().includes('roja') && !canAddCarneRoja) return false;
      }
      if ((dish.categoryId === 'huevos' || dish.hasEggs) && !canAddHuevos) return false;
      return true;
    });

    if (candidateDishes.length === 0) {
      candidateDishes = allDishes;
    }

    // Calcular puntuación de afinidad con las pautas mínimas pendientes
    const scored = candidateDishes.map((dish) => {
      let score = Math.random() * 3; // Aleatoriedad para que cada clic ofrezca un menú distinto

      // Bonus de variedad (evitar repetir el mismo plato exacto)
      if (!usedDishIds.has(dish.id)) {
        score += 20;
      }

      // Prioridad 1: Alimentos del Mar (mínimo 3 raciones)
      if (dish.categoryId === 'mar') {
        if (marCount < 3) {
          score += 35 * (3 - marCount);
        } else if (marCount < 4) {
          score += 10;
        }
      }

      // Prioridad 2: Setas y hongos (mínimo 2 raciones, contando como plato o complemento)
      if (dish.hasMushrooms || dish.containsMushrooms || (dish.categoryId as string) === 'setas') {
        if (setasCount < 2) {
          score += 30 * (2 - setasCount);
        }
      }

      // Prioridad 3: Huevos ecológicos (5 a 7 huevos semanales)
      if (dish.categoryId === 'huevos' || dish.hasEggs || (dish.eggCount && dish.eggCount > 0)) {
        if (huevosCount < 5) {
          score += 28 * (5 - huevosCount);
        }
      }

      // Prioridad 4: Carne blanca/roja de pasto (hasta 3-4 comidas)
      if (dish.categoryId === 'carne') {
        if (carneTotalCount < 3) {
          score += 22;
          if (!dish.subcategory.toLowerCase().includes('roja') && carneRojaCount >= 1) {
            score += 8;
          }
        }
      }

      // Prioridad 5: Tubérculos prebióticos (1 a 2 veces)
      if (dish.hasTubers || (dish.categoryId as string) === 'tuberculos') {
        if (tuberculosCount < 1) {
          score += 18;
        }
      }

      // Prioridad 6: Legumbres cuidadas (máximo 1 vez a mediodía)
      if (dish.categoryId === 'legumbres') {
        if (legumbresCount === 0 && slot.mealType === 'lunch') {
          score += 20;
        }
      }

      // Prioridad 7: Verduras y hortalizas de temporada
      if (dish.categoryId === 'verduras' || dish.hasVegetables) {
        if (slot.mealType === 'dinner') {
          score += 12; // Las cenas agradecen platos digestivos de verdura
        } else {
          score += 8;
        }
      }

      return { dish, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Seleccionar aleatoriamente entre los 3 mejores candidatos para asegurar diversidad
    const topCandidates = scored.slice(0, Math.min(3, scored.length));
    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)].dish;

    updatedDays[slot.dayIdx][slot.mealType].dishId = chosen.id;
    tally(chosen);
    usedDishIds.add(chosen.id);
  }

  // Rellenar huecos de frutas vacías con variedad de fruta fresca
  if (allFruits.length > 0) {
    const shuffledFruits = [...allFruits].sort(() => Math.random() - 0.5);
    let fruitPointer = 0;

    for (let i = 0; i < 7; i++) {
      if (!updatedDays[i].lunch.fruitId) {
        updatedDays[i].lunch.fruitId = shuffledFruits[fruitPointer % shuffledFruits.length].id;
        fruitPointer++;
      }
      if (!updatedDays[i].dinner.fruitId) {
        updatedDays[i].dinner.fruitId = shuffledFruits[fruitPointer % shuffledFruits.length].id;
        fruitPointer++;
      }
    }
  }

  return {
    ...currentPlan,
    days: updatedDays,
  };
}
