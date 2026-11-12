import type { CategoryDef, Dish, Fruit } from '../types';

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'mar',
    name: 'Alimentos del mar',
    icon: 'Waves',
    subcategories: ['Pescado Azul', 'Pescado Blanco', 'Cefalópodos', 'Marisco'],
    color: {
      bg: '#f0f7f9',
      light: '#e1f0f4',
      text: '#225566',
      border: '#b8dde6',
      badge: '#4a8296',
    },
    rule: {
      min: 3,
      max: 4,
      unit: 'comidas',
      label: '3 - 4 veces/sem',
      description: 'Pescado azul, blanco, cefalópodos y marisco. Fuente de omega 3 EPA/DHA antiinflamatorio, selenio y zinc.',
      isStrict: true,
    },
  },
  {
    id: 'carne',
    name: 'Carne',
    icon: 'Beef',
    subcategories: ['Carne Blanca', 'Carne Roja'],
    color: {
      bg: '#faf2f0',
      light: '#f7e5e1',
      text: '#834739',
      border: '#ecc2ba',
      badge: '#b36b5c',
    },
    rule: {
      min: 3,
      max: 4,
      unit: 'comidas',
      label: '3 - 4 veces/sem',
      description: 'Ecológica y de pasto. Blanca 2-3 veces; Roja máximo 1-2 veces por semana.',
      isStrict: true,
    },
  },
  {
    id: 'huevos',
    name: 'Huevos',
    icon: 'Egg',
    subcategories: ['Revueltos y Tortillas', 'Otros Huevos'],
    color: {
      bg: '#fbf8eb',
      light: '#f7f1d4',
      text: '#7d6928',
      border: '#eddba4',
      badge: '#b5973b',
    },
    rule: {
      min: 5,
      max: 7,
      unit: 'huevos',
      label: '5 - 7 huevos/sem',
      description: 'Código 0 o 1. Colina para membranas y neuronas, eleva el colesterol bueno HDL.',
      isStrict: true,
    },
  },
  {
    id: 'verduras',
    name: 'Verduras Variadas',
    icon: 'Salad',
    subcategories: ['Verduras'],
    color: {
      bg: '#f1f7f2',
      light: '#e2efe4',
      text: '#345e3c',
      border: '#bcdabc',
      badge: '#54875c',
    },
    rule: {
      min: 14,
      unit: 'comidas',
      label: 'A diario (almuerzo y cena)',
      description: 'Base vegetal diaria en almuerzos y cenas (plato principal o acompañamiento).',
      isStrict: false,
    },
  },
  {
    id: 'legumbres',
    name: 'Legumbres',
    icon: 'Soup',
    subcategories: ['Lentejas', 'Garbanzos', 'Alubias', 'Guisantes/Habas'],
    color: {
      bg: '#f8f4f9',
      light: '#efe5f2',
      text: '#674677',
      border: '#dfcde6',
      badge: '#8f68a3',
    },
    rule: {
      max: 1,
      unit: 'comidas',
      label: 'Máx. 1 vez/sem',
      description: 'Lentejas, garbanzos, alubias o guisantes/habas con remojo de 48h o bote de cristal.',
      isStrict: true,
    },
  },
  {
    id: 'pasta',
    name: 'Pasta',
    icon: 'Utensils',
    subcategories: ['Trigo Blanco', 'Trigo Integral', 'Trigo Sarraceno'],
    color: {
      bg: '#f9f6f0',
      light: '#f2eae0',
      text: '#6b5e43',
      border: '#ddd1be',
      badge: '#8c7e62',
    },
    rule: {
      max: 1,
      unit: 'comidas',
      label: '0 - 1 vez/sem',
      description: 'Trigo sarraceno (sin gluten), trigo integral o trigo blanco.',
      isStrict: false,
    },
  },
];

export const INITIAL_FRUITS: Fruit[] = [
  {
    id: 'fr-manzana-reineta',
    name: 'Manzana Reineta',
    description: 'Pectina prebiótica y quercetina. Alternar variedades estimula la microbiota.',
  },
  {
    id: 'fr-manzana-golden',
    name: 'Manzana Golden',
    description: 'Fruta princesa. Digestión suave y rica en antioxidantes.',
  },
  {
    id: 'fr-granada',
    name: 'Granada',
    description: 'La reina de las frutas por su extraordinario poder antioxidante (punicalaginas).',
  },
  {
    id: 'fr-arandanos',
    name: 'Arándanos Silvestres',
    description: 'Antocianinas protectoras cardiovasculares y neuronales.',
  },
  {
    id: 'fr-kiwi',
    name: 'Kiwi Verde',
    description: 'Actinidina para facilitar la digestión y abundante vitamina C natural.',
  },
  {
    id: 'fr-frambuesas',
    name: 'Frambuesas',
    description: 'Bajo impacto glucémico. (Nota: precaución con fármacos específicos).',
  },
  {
    id: 'fr-aguacate',
    name: 'Aguacate',
    description: 'Grasas monoinsaturadas saludables, potasio y fibra sin azúcares simples.',
  },
  {
    id: 'fr-pera',
    name: 'Pera',
    description: 'Fibra soluble suave que favorece el tránsito intestinal.',
  },
  {
    id: 'fr-moras',
    name: 'Moras Silvestres',
    description: 'Polifenoles que protegen las membranas celulares del estrés oxidativo.',
  },
  {
    id: 'fr-fresas',
    name: 'Fresas Ecológicas',
    description: 'Consumir siempre ecológicas para evitar pesticidas de síntesis.',
  },
  {
    id: 'fr-papaya',
    name: 'Papaya',
    description: 'Aporte de papaína natural para mejorar la digestión enzimática.',
  },
];

export const INITIAL_DISHES: Dish[] = [
  // Alimentos del mar: Pescado Azul, Pescado Blanco, Cefalópodos, Marisco
  {
    id: 'dish-mar-1',
    name: 'Salmón al Vapor con Espárragos Verdes',
    categoryId: 'mar',
    subcategory: 'Pescado Azul',
    cookingTechnique: 'Vapor suave (7-8 min)',
    preparationTime: 20,
    ingredients: ['Lomo de salmón', 'Espárragos trigueros', 'AOVE en crudo', 'Eneldo fresco', 'Sal marina'],
    servings: 2,
    recipeIngredients: [
      { name: 'Lomo de salmón', amount: 300, unit: 'g' },
      { name: 'Espárragos trigueros', amount: 1 },
      { name: 'AOVE en crudo', amount: 20, unit: 'mL' },
      { name: 'Eneldo fresco', amount: 1 },
      { name: 'Sal marina' },
    ],
    description: 'Aporte de omega 3 DHA/EPA al vapor suave sin oxidar los lípidos saludables.',
    steps: [
      'Lavar los espárragos trigueros y retirar la parte leñosa inferior.',
      'Colocar los espárragos en la vaporera durante 3 minutos a fuego medio.',
      'Añadir el lomo de salmón con la piel hacia abajo y cocinar al vapor tapado durante 6-7 minutos.',
      'Emplatar con el eneldo fresco por encima, una pizca de sal marina y un hilo generoso de AOVE en crudo.'
    ],
    cookingTips: 'No sobrepasar los 7-8 minutos de vapor para preservar los ácidos grasos omega 3 y mantener el interior del salmón meloso y jugoso.',
    hasVegetables: true,
    vegetableTypes: ['hojas_tallos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-mar-2',
    name: 'Sardinas al Horno Suave con Puerros',
    categoryId: 'mar',
    subcategory: 'Pescado Azul',
    cookingTechnique: 'Horno suave a 150°C (12 min)',
    preparationTime: 25,
    ingredients: ['Sardinas frescas pequeñas', 'Puerro laminado', 'Tomate maduro pelado', 'AOVE'],
    servings: 2,
    recipeIngredients: [
      { name: 'Sardinas frescas pequeñas', amount: 350, unit: 'g' },
      { name: 'Puerro laminado', amount: 2 },
      { name: 'Tomate maduro pelado', amount: 2 },
      { name: 'AOVE', amount: 20, unit: 'mL' },
    ],
    description: 'Pescado azul pequeño con mínimo contenido en metales pesados y rico en selenio.',
    steps: [
      'Limpiar las sardinas retirando escamas e interiores, y secar con papel absorbente.',
      'Cortar el puerro en juliana fina y disponerlo en la base de una fuente refractaria con un hilo de AOVE.',
      'Colocar las sardinas sobre la cama de puerro y añadir el tomate maduro en dados.',
      'Hornear a 150°C durante solo 12 minutos para evitar oxidar las grasas marinas y finalizar con sal marina en escamas.',
    ],
    cookingTips: 'Mantener la temperatura del horno baja (150°C) es clave para que los ácidos grasos omega 3 de la sardina no se hidroperoxiden.',
    hasVegetables: true,
    vegetableTypes: ['bulbos', 'solanaceas'],
    hasOliveOil: true,
  },
  {
    id: 'dish-mar-3',
    name: 'Dorada a la Plancha Suave con Calabacín',
    categoryId: 'mar',
    subcategory: 'Pescado Blanco',
    cookingTechnique: 'Plancha suave sin dorar en exceso',
    preparationTime: 25,
    ingredients: ['Dorada de lonja', 'Calabacín en rodajas', 'Cebolla dulce', 'AOVE en crudo'],
    servings: 2,
    recipeIngredients: [
      { name: 'Dorada de lonja', amount: 2 },
      { name: 'Calabacín en rodajas', amount: 1 },
      { name: 'Cebolla dulce', amount: 1 },
      { name: 'AOVE en crudo', amount: 20, unit: 'mL' },
    ],
    description: 'Proteína blanca digestiva y ligera para una digestión nocturna óptima.',
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-mar-4',
    name: 'Sepia con Ajo, Perejil y Ensalada de Canónigos',
    categoryId: 'mar',
    subcategory: 'Cefalópodos',
    cookingTechnique: 'Plancha rápida sin tostar',
    preparationTime: 15,
    ingredients: ['Sepia fresca limpia', 'Ajo majado', 'Perejil', 'Canónigos frescos', 'AOVE'],
    description: 'Cefalópodo rico en taurina y minerales marinos esenciales.',
    hasVegetables: true,
    vegetableTypes: ['bulbos', 'hojas_tallos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-mar-5',
    name: 'Mejillones al Vapor con Laurel y Limón',
    categoryId: 'mar',
    subcategory: 'Marisco',
    cookingTechnique: 'Vapor en su jugo (4 min)',
    preparationTime: 15,
    ingredients: ['Mejillones gallegos', 'Laurel', 'Zumo de limón natural', 'Pimienta negra'],
    description: 'Aporte de hierro biodisponible, zinc, selenio y vitamina B12.',
  },
  {
    id: 'dish-mar-6',
    name: 'Lubina al Vapor con Ensalada de Alga Wakame',
    categoryId: 'mar',
    subcategory: 'Pescado Blanco',
    cookingTechnique: 'Vapor y algas rehidratadas',
    preparationTime: 20,
    ingredients: ['Lomo de lubina', 'Alga wakame rehidratada', 'Pepino laminado', 'AOVE'],
    description: 'Combinación marina de pescado blanco y algas con minerales traza.',
    hasSeaweed: true,
    hasOliveOil: true,
  },

  // Carne: Carne Blanca, Carne Roja
  {
    id: 'dish-carne-1',
    name: 'Pollo de Pasto con Brócoli al Vapor y Ajo',
    categoryId: 'carne',
    subcategory: 'Carne Blanca',
    cookingTechnique: 'Plancha suave / Vapor para el brócoli',
    preparationTime: 20,
    ingredients: ['Pechuga de pollo de pasto ecológico', 'Brócoli al vapor', 'Ajo picado', 'AOVE'],
    servings: 2,
    recipeIngredients: [
      { name: 'Pechuga de pollo de pasto ecológico', amount: 350, unit: 'g' },
      { name: 'Brócoli al vapor', amount: 300, unit: 'g' },
      { name: 'Dientes de ajo', amount: 2 },
      { name: 'AOVE', amount: 15, unit: 'mL' },
    ],
    description: 'Carne blanca de pasto con sulforafano del brócoli protector celular.',
    steps: [
      'Cortar el brócoli en ramilletes pequeños y cocinarlos al vapor durante 4-5 minutos (deben quedar crujientes y de color verde intenso).',
      'Marcar la pechuga de pollo de pasto en una sartén o plancha a fuego medio con unas gotas de AOVE hasta que esté dorada por fuera y jugosa por dentro.',
      'Saltear brevemente el ajo picado sin dejar que se queme y verter sobre el brócoli.',
      'Servir el pollo acompañado del brócoli con un hilo de AOVE virgen extra en crudo y sal marina.',
    ],
    cookingTips: 'Cocer el brócoli un máximo de 5 minutos al vapor preserva la enzima mirosinasa, fundamental para asimilar al 100% el sulforafano anticancerígeno.',
    hasVegetables: true,
    vegetableTypes: ['cruciferas', 'bulbos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-carne-2',
    name: 'Conejo Estofado con Tomillo y Alcachofas',
    categoryId: 'carne',
    subcategory: 'Carne Blanca',
    cookingTechnique: 'Fuego lento tapado en cazuela',
    preparationTime: 40,
    ingredients: ['Conejo troceado', 'Alcachofas frescas', 'Cebolla', 'Tomillo', 'Romero', 'AOVE'],
    description: 'Carne blanca muy magra con cinarina hepatoprotectora de la alcachofa.',
    hasVegetables: true,
    vegetableTypes: ['alcachofas', 'bulbos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-carne-3',
    name: 'Pavo con Salteado de Champiñones y Espinacas',
    categoryId: 'carne',
    subcategory: 'Carne Blanca',
    cookingTechnique: 'Salteado breve en AOVE',
    preparationTime: 20,
    ingredients: ['Pechuga de pavo de pasto', 'Champiñón Portobello', 'Espinacas frescas', 'AOVE'],
    description: 'Triptófano y glucanos de los hongos en una combinación digestiva.',
    hasMushrooms: true,
    containsMushrooms: true,
    hasVegetables: true,
    vegetableTypes: ['hojas_tallos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-carne-4',
    name: 'Ternera de Pasto con Setas Shiitake Salteadas',
    categoryId: 'carne',
    subcategory: 'Carne Roja',
    cookingTechnique: 'Plancha corta a fuego medio',
    preparationTime: 20,
    ingredients: ['Medallón de ternera de pasto ecológico', 'Setas shiitake', 'Ajo majado', 'Sal marina', 'AOVE'],
    description: 'Carne roja (máx 1-2 sem). Grasas saturadas no oxidadas y lentinano de las setas.',
    hasMushrooms: true,
    containsMushrooms: true,
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-carne-5',
    name: 'Cordero de Pasto con Calabaza al Romero',
    categoryId: 'carne',
    subcategory: 'Carne Roja',
    cookingTechnique: 'Horno suave a 160°C tapado',
    preparationTime: 45,
    ingredients: ['Paletilla de cordero troceada', 'Calabaza en dados', 'Cebolla', 'Romero fresco', 'AOVE'],
    description: 'Carne roja de pastoreo con carotenoides prebióticos de la calabaza.',
    hasTubers: true,
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },

  // Huevos: Revueltos y Tortillas, Otros Huevos
  {
    id: 'dish-huevo-1',
    name: 'Tortilla Francesa de 2 Huevos Camperos con Ajos Tiernos',
    categoryId: 'huevos',
    subcategory: 'Revueltos y Tortillas',
    cookingTechnique: 'Sartén a fuego medio con ghee o AOVE',
    preparationTime: 12,
    ingredients: ['Huevos ecológicos (código 0)', 'Ajos tiernos', 'Espinacas frescas', 'AOVE'],
    servings: 2,
    recipeIngredients: [
      { name: 'Huevos ecológicos (código 0)', amount: 4 },
      { name: 'Ajos tiernos', amount: 1 },
      { name: 'Espinacas frescas', amount: 150, unit: 'g' },
      { name: 'AOVE', amount: 10, unit: 'mL' },
    ],
    description: 'Aporte de colina y fosfolípidos que optimizan el perfil HDL.',
    steps: [
      'Saltear los ajos tiernos y las espinacas frescas en la sartén con media cucharadita de AOVE durante 2 minutos hasta que pierdan volumen.',
      'Batir ligeramente los 2 huevos camperos con una pizca de sal marina (sin batir en exceso para no incorporar demasiado aire).',
      'Verter los huevos en la sartén a fuego medio-bajo, permitiendo que cuaje la base suavemente.',
      'Doblar con cuidado y retirar cuando el interior aún permanezca jugoso y tierno.',
    ],
    cookingTips: 'No sobrecocinar la tortilla; una consistencia cremosa en el centro preserva la biodisponibilidad de la colina y la lecitina del huevo.',
    hasEggs: true,
    eggCount: 2,
    hasVegetables: true,
    vegetableTypes: ['bulbos', 'hojas_tallos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-huevo-2',
    name: 'Revuelto de 2 Huevos con Boletus y Perejil',
    categoryId: 'huevos',
    subcategory: 'Revueltos y Tortillas',
    cookingTechnique: 'Revuelto cremoso a fuego lento',
    preparationTime: 15,
    ingredients: ['2 huevos ecológicos', 'Boletus', 'Perejil fresco', 'AOVE virgen extra'],
    description: 'Yema cremosa sin oxidar combinada con betaglucanos de las setas.',
    hasEggs: true,
    eggCount: 2,
    hasMushrooms: true,
    containsMushrooms: true,
    hasOliveOil: true,
  },
  {
    id: 'dish-huevo-3',
    name: 'Huevos Poché sobre Crema de Calabacín y Puerro',
    categoryId: 'huevos',
    subcategory: 'Otros Huevos',
    cookingTechnique: 'Escalfado en agua sin freír',
    preparationTime: 18,
    ingredients: ['2 huevos camperos (código 1)', 'Calabacín al vapor', 'Puerro', 'AOVE en crudo'],
    description: 'Cocción que respeta la estructura de la grasa de la yema evitando la glicación.',
    hasEggs: true,
    eggCount: 2,
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },

  // Verduras Variadas: Verduras
  {
    id: 'dish-verd-1',
    name: 'Alcachofas al Vapor con Limón y AOVE',
    categoryId: 'verduras',
    subcategory: 'Verduras',
    cookingTechnique: 'Vapor tapado (18 min)',
    preparationTime: 25,
    ingredients: ['Alcachofas tiernas', 'Zumo de limón', 'AOVE abundante', 'Sal marina gruesa'],
    description: 'Capacidad azotúrica y uricosúrica, favorece la bilis y aporta inulina prebiótica.',
    hasVegetables: true,
    vegetableTypes: ['alcachofas'],
    hasOliveOil: true,
  },
  {
    id: 'dish-verd-2',
    name: 'Ensalada de Escarola, Canónigos y Aguacate',
    categoryId: 'verduras',
    subcategory: 'Verduras',
    cookingTechnique: 'Crudo / Fresco',
    preparationTime: 10,
    ingredients: ['Escarola rizada', 'Canónigos', 'Medio aguacate', 'AOVE en crudo'],
    description: 'Fitoquímicos crudos con enzimas intactas y grasas monoinsaturadas.',
    hasVegetables: true,
    vegetableTypes: ['hojas_tallos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-setas-1',
    name: 'Salteado de Shiitake y Portobello al Ajillo',
    categoryId: 'verduras',
    subcategory: 'Verduras',
    cookingTechnique: 'Salteado a fuego medio en AOVE',
    preparationTime: 15,
    ingredients: ['Shiitake fresco', 'Portobello', 'Ajo laminado', 'Rúcula fresca', 'AOVE'],
    description: 'Inmunomodulación directa a través de fitonutrientes fúngicos.',
    hasMushrooms: true,
    containsMushrooms: true,
    hasVegetables: true,
    vegetableTypes: ['bulbos', 'hojas_tallos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-setas-2',
    name: 'Guiso Micológico de Boletus con Puerros',
    categoryId: 'verduras',
    subcategory: 'Verduras',
    cookingTechnique: 'Guiso suave tapado (15 min)',
    preparationTime: 20,
    ingredients: ['Boletus edulis', 'Puerro dulce', 'Caldo suave de verduras casero', 'AOVE'],
    description: 'Hongos silvestres ricos en ergosterol y glucanos.',
    hasMushrooms: true,
    containsMushrooms: true,
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-tuber-1',
    name: 'Crema de Calabaza y Boniato Asados',
    categoryId: 'verduras',
    subcategory: 'Verduras',
    cookingTechnique: 'Horno suave a 160°C y triturado',
    preparationTime: 35,
    ingredients: ['Calabaza', 'Boniato', 'Pizca de jengibre', 'Semillas de calabaza activadas', 'AOVE'],
    description: 'Carbohidratos complejos prebióticos de digestión lenta y alta tolerancia.',
    hasTubers: true,
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-tuber-2',
    name: 'Remolacha y Zanahorias al Vapor con Nueces Crudas',
    categoryId: 'verduras',
    subcategory: 'Verduras',
    cookingTechnique: 'Vapor corto (12 min)',
    preparationTime: 20,
    ingredients: ['Remolacha al vapor', 'Zanahorias al vapor', 'Nueces crudas activadas', 'AOVE'],
    description: 'Betalainas y prebióticos con ácidos grasos no oxidados.',
    hasTubers: true,
    hasOliveOil: true,
  },

  // Legumbres: Lentejas, Garbanzos, Alubias, Guisantes/Habas
  {
    id: 'dish-legum-1',
    name: 'Lentejas con Verduras en Olla a Presión (Remojo 48h)',
    categoryId: 'legumbres',
    subcategory: 'Lentejas',
    cookingTechnique: 'Remojo 48h + Olla a presión',
    preparationTime: 30,
    ingredients: ['Lentejas pardinas ecológicas', 'Zanahoria', 'Puerro', 'Laurel', 'Comino', 'AOVE'],
    servings: 2,
    recipeIngredients: [
      { name: 'Lentejas pardinas ecológicas', amount: 160, unit: 'g' },
      { name: 'Zanahoria', amount: 2 },
      { name: 'Puerro', amount: 1 },
      { name: 'Hoja de laurel', amount: 1 },
      { name: 'Comino' },
      { name: 'AOVE', amount: 20, unit: 'mL' },
    ],
    description: 'Procedimiento de remojo prolongado y presión para desactivar fitatos y lectinas.',
    steps: [
      'Remojar las lentejas durante 48 horas en agua abundante con una pizca de sal marina o bicarbonato, cambiando el agua dos veces.',
      'Escurrir y aclarar muy bien las lentejas.',
      'Poner en la olla a presión junto con la zanahoria en rodajas, el puerro, la hoja de laurel y una pizca de comino molido.',
      'Cocinar a presión durante 15 minutos desde que suba la válvula. Dejar despresurizar de forma natural y aderezar en el plato con AOVE crudo.',
    ],
    cookingTips: 'El remojo de 48h con cambio de agua y la cocción a presión desactivan prácticamente la totalidad de antinutrientes como fitatos y lectinas, garantizando una digestión perfecta.',
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-legum-2',
    name: 'Garbanzos en Cristal Salteados con Espinacas',
    categoryId: 'legumbres',
    subcategory: 'Garbanzos',
    cookingTechnique: 'Lavado intensivo + salteado rápido',
    preparationTime: 12,
    ingredients: ['Garbanzos en cristal bien lavados', 'Espinacas frescas', 'Ajo', 'Pimentón dulce'],
    description: 'Legumbre lavada en profundidad para retirar almidones residuales.',
    hasVegetables: true,
    vegetableTypes: ['bulbos', 'hojas_tallos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-legum-3',
    name: 'Alubias Blancas Guisadas con Verduras de Raíz',
    categoryId: 'legumbres',
    subcategory: 'Alubias',
    cookingTechnique: 'Remojo 48h + fuego lento',
    preparationTime: 40,
    ingredients: ['Alubias blancas', 'Cebolla', 'Puerro', 'Zanahoria', 'AOVE', 'Pimentón'],
    description: 'Alubias de cocción lenta y alta digestibilidad.',
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-legum-4',
    name: 'Salteado de Guisantes Tiernos con Cebolla y Jamón',
    categoryId: 'legumbres',
    subcategory: 'Guisantes/Habas',
    cookingTechnique: 'Salteado breve',
    preparationTime: 15,
    ingredients: ['Guisantes tiernos frescos', 'Cebolla tierna', 'Taquitos de jamón ibérico', 'AOVE'],
    description: 'Leguminosa tierna rica en fibra soluble y proteína vegetal.',
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },

  // Pasta: Trigo Blanco, Trigo Integral, Trigo Sarraceno
  {
    id: 'dish-pasta-1',
    name: 'Pasta de Trigo Sarraceno con Pesto de Albahaca y Nueces',
    categoryId: 'pasta',
    subcategory: 'Trigo Sarraceno',
    cookingTechnique: 'Cocción al dente (7 min)',
    preparationTime: 15,
    ingredients: ['Pasta 100% trigo sarraceno', 'Albahaca fresca', 'Nueces crudas', 'Ajo', 'AOVE virgen extra'],
    servings: 2,
    recipeIngredients: [
      { name: 'Pasta 100% trigo sarraceno', amount: 160, unit: 'g' },
      { name: 'Albahaca fresca', amount: 1 },
      { name: 'Nueces crudas', amount: 40, unit: 'g' },
      { name: 'Diente de ajo', amount: 1 },
      { name: 'AOVE virgen extra', amount: 30, unit: 'mL' },
    ],
    description: 'Pasta sin gluten elaborada con trigo sarraceno, de digestión ligera y rica en rutina protectora vascular.',
    steps: [
      'Hervir abundante agua con sal y cocer la pasta de trigo sarraceno exactamente al dente (7 minutos).',
      'En un mortero o procesador, majar las hojas de albahaca fresca con las nueces crudas, el ajo y un chorro generoso de AOVE virgen extra hasta obtener un pesto rústico.',
      'Escurrir la pasta reservando dos cucharadas del agua de cocción.',
      'Mezclar la pasta caliente con el pesto y el agua reservada para emulsionar sin recalentar el aceite.',
    ],
    cookingTips: 'No calentar nunca el pesto en el fuego; añadirlo en crudo sobre la pasta caliente preserva los antioxidantes de la albahaca y la calidad del AOVE.',
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },
  {
    id: 'dish-pasta-2',
    name: 'Espaguetis Integrales con Tomate Casero y Orégano',
    categoryId: 'pasta',
    subcategory: 'Trigo Integral',
    cookingTechnique: 'Cocción al dente (9 min)',
    preparationTime: 18,
    ingredients: ['Pasta de trigo integral ecológico', 'Tomate maduro triturado', 'Cebolla', 'Orégano', 'AOVE'],
    description: 'Pasta de grano entero para un aporte gradual de energía y fibra.',
    hasVegetables: true,
    vegetableTypes: ['bulbos', 'solanaceas'],
    hasOliveOil: true,
  },
  {
    id: 'dish-pasta-3',
    name: 'Pasta de Trigo Blanco al Ajillo con Perejil',
    categoryId: 'pasta',
    subcategory: 'Trigo Blanco',
    cookingTechnique: 'Cocción al dente (8 min)',
    preparationTime: 12,
    ingredients: ['Pasta de trigo', 'Ajo laminado', 'Guindilla suave', 'Perejil fresco', 'AOVE'],
    description: 'Opción clásica de pasta al dente con sofrito suave de ajo y aceite de oliva virgen extra.',
    hasVegetables: true,
    vegetableTypes: ['bulbos'],
    hasOliveOil: true,
  },
];

export const INITIAL_LIBRARY_ARTICLES = [
  {
    id: 'generalidades-filosofia',
    title: 'Generalidades y Hábitos Maestros de Salud Celular',
    category: 'Principios Clave',
    summary: 'Hara Hachi Bu, no líquidos en comidas, masticación, estrés y comida consciente.',
    content: `
### Alimentos ecológicos y variedad
- Consumir todos los alimentos ecológicos que estén a tu alcance, excepto las legumbres, por su alto contenido en antinutrientes.
- Cuanta más variedad pongas en tu plato, más salud tendrá tu microbiota.
- Cuando hablamos de variedad, nos referimos incluso a que, si comes manzanas, alternes el tipo (hoy reineta, mañana golden, etc.). En la variedad (no en la cantidad) radica el éxito de una buena alimentación. La dieta mediterránea es una de las más saludables del mundo y su gran secreto es la diversidad.

### Líquidos durante las comidas
- **No bebas agua (ni ninguna otra bebida) mientras comes.** Los líquidos diluyen los jugos gástricos y disminuyen la concentración de ácido clorhídrico y proteasas.
- Si bebes agua, añádele un poco de zumo de limón y bébela con una pajita para proteger el esmalte dental. De esta manera mejorarás la acción de las enzimas digestivas.

### La regla japonesa del 80% (Hara Hachi Bu)
- Levántate de la mesa con la sensación de haber podido comer un poco más: «llena solo el 80% de tu estómago».
- Comer hasta la saciedad total sobrecarga el sistema digestivo y desvía energía vital hacia digestiones pesadas.

### Postres sin azúcares refinados
- **No termines nunca la comida con alimentos ricos en azúcar** si quieres tener una buena digestión. El azúcar fermenta rápidamente en el estómago bloqueando la digestión gástrica.

### Evitar fritos, brasa y ahumados
- No comas con frecuencia alimentos fritos, a la brasa o ahumados, ya que estarás ingiriendo sustancias potencialmente cancerígenas como la **acrilamida** o los **hidrocarburos aromáticos policíclicos (HAP)**.
- Recuerda que lo que enferma es el día a día, no lo esporádico. Si sales a comer un día a la semana fuera, come lo que desees y disfrútalo.

### Desterrar el microondas
- **No cocines en el microondas.** Sus ondas electromagnéticas artificiales destruyen la **vitamina C**, las vitaminas del **grupo B** y la **vitamina K**, además de desestructurar la coherencia molecular del agua contenida en los alimentos.

### Masticación y digestión parasimpática
- Mastica bien cada bocado. La digestión comienza en la boca y la ensalivación de los alimentos es clave para el aparato digestivo.
- Come de manera consciente: no veas mientras tanto informativos cargados de noticias con impacto emocional negativo, ni consultes el correo o las redes sociales. El estrés activa el sistema simpático y paraliza las secreciones digestivas.

### Comer es un proceso oxidativo
- Investigadores de *National Geographic* concluyeron que un ser humano con una vida media de 78 años y medio consume unas **50 toneladas de comida** a lo largo de su vida. Cuanto antes te las comas, antes morirás. Come con moderación.
    `,
  },
  {
    id: 'mar-completo',
    title: '1. Alimentos que Provengan del Mar (Al menos 3 o 4 veces por semana)',
    category: 'Alimentos del Mar',
    summary: 'Pescado azul, pescado blanco, cefalópodos, marisco en general y algas sin omitir nada.',
    content: `
### Justificación evolutiva y celular
Consumir al menos **tres o cuatro veces por semana**. Lo que consumas procura que se encuentre en estos cinco grupos: pescado azul, blanco, cefalópodos, marisco en general y algas.

Los seres humanos hemos sido históricamente más marineros que cazadores (siguiendo márgenes costeros y fluviales). Estos alimentos son la **principal fuente de omega 3 de cadena larga (EPA y DHA)**, con un verdadero poder modulador de la inflamación —antiinflamatorio—.
Su consumo habitual previene patologías inflamatorias, autoinmunes y cáncer, además de contribuir a la buena función cognitiva e intelectual. Aportan vitaminas, oligoelementos y minerales como el **selenio** y el **zinc**.

### Grupos y especies recomendadas:

#### 1. Pescado Azul:
- **Especies preferentes:** Salmón, caballa, trucha asalmonada, sardina, boquerón, bonito, anchoas, arenque, anguila, congrio, cazón, lamprea, chicharro o jurel, palometa, melva...
- **Advertencia:** Consume con menor frecuencia los pescados grasos grandes como el **atún** o el **pez espada** debido a su acumulación de metil-mercurio.

#### 2. Pescado Blanco:
- Dorada, lubina, merluza, rodaballo, bacalao, salmonete, mero, gallo, bacaladilla, acedía, lenguado, abadejo, rape, raya, rosada, fletán, perca...

#### 3. Cefalópodos:
- Calamar, pota, pulpo, sepia y chipirones.

#### 4. Marisco en General:
- Gamba, langosta, langostino, cangrejos, camarones, buey de mar, centollo, nécora, percebe, almeja fina, chirla, berberecho, coquina, mejillón, navaja, ostra, vieira, lapa, bígaro, cañaílla, cigalas...

#### 5. Algas:
- Nori, kombu, wakame, hiziki, arame, alaria, cochayuyo, dulce, agar agar, carragaheen, espirulina, chlorella...
    `,
  },
  {
    id: 'carne-completo',
    title: '2. Carne: De Pasto y Ecológica (3 o 4 veces por semana)',
    category: 'Carne de Pasto',
    summary: 'Carne blanca 2-3 veces, carne roja máximo 1-2 veces, y la verdad de las grasas saturadas.',
    content: `
### Frecuencia y selección
Consúmela **tres o cuatro veces en semana**. Procura que sea de pasto y ecológica. Este tipo de carne está cargada de nutrientes y antioxidantes.

### Frecuencias por subtipo:
- **Carne blanca (2 o 3 veces/semana):** Pollo, higaditos de pollo, pavo, codorniz, picantón, pularda, conejo, cerdo...
- **Carne roja (máximo 1 o 2 veces/semana):** Pato, perdiz, faisán, ternera, cordero, buey, cerdo (en forma de jamón), ciervo, venado, toro, caballo, cabra...

### La verdad científica sobre la grasa saturada
No le temas a las grasas de este tipo de carnes. La clave está en no incrementar el consumo de hidratos de carbono refinados simultáneamente.
- La **grasa saturada sin hidrogenar** es una de las grasas más saludables: tus células la fabrican constantemente para incorporarla a sus membranas celulares.
- Constituye el **36% de toda la grasa de las membranas celulares humanas**. Es la grasa más estructural que existe y la más estable frente al calor (la que menos se oxida).
    `,
  },
  {
    id: 'huevos-completo',
    title: '3. Huevos Ecológicos (5 a 7 huevos a la semana)',
    category: 'Huevos',
    summary: 'Colina, omega 3 de cadena larga, código de cáscara 0 o 1 y colesterol HDL.',
    content: `
### Riqueza nutricional y colesterol
Cómete unos **cinco a siete huevos a la semana**.
Gracias a su contenido en colina y omega 3 de cadena larga, el consumo de huevo ecológico, lejos de generar problemas con el colesterol, lo regula, elevando el **HDL (el llamado bueno)**.

Solo en el caso de mutaciones genéticas confirmadas (APOE4, LDLR, APOB, PCSK9) se debe tener cierta precaución con alimentos ricos en colesterol. Sin embargo, no es la concentración de apolipoproteínas (LDL, HDL) lo que predispone a accidentes cardiovasculares, sino su **oxidación o glicación** (reacción que ocurre cuando los niveles de glucosa en sangre están persistentemente altos). El huevo es un alimento extraordinario, especialmente la yema.

### Cómo elegir los huevos en el supermercado:
Fíjate en el código impreso en la cáscara (del 0 al 4):
- **Código 0:** Producción ecológica certificada. (El más recomendado).
- **Código 1:** Gallinas camperas con salida al exterior.
- *Si no son 0 o 1, mejor no comerlos con asiduidad.*
    `,
  },
  {
    id: 'verdura-completo',
    title: '4. Verdura: Diversidad a Diario y Subgrupos',
    category: 'Verduras',
    summary: 'Crucíferas, alcachofas depurativas, ajo y cebolla, hojas verdes y solanáceas moderadas.',
    content: `
### Pauta de consumo
Consume verdura ecológica variada a diario. No es necesario tomar mucha cantidad, lo fundamental es la diversidad. Cocinadas al vapor o hervidas con poca agua y escasos minutos de ebullición.

### Familias botánicas y propiedades:

#### 1. Crucíferas:
- **Especies:** Brócoli, coliflor, romanescu, col verde, lombarda, coles de Bruselas, rábano negro, nabo, rúcula, kale, wasabi, col china, repollo, bimi...
- **Propiedades:** Anticancerígenas, antioxidantes y antiinflamatorias.
- *Atención médica:* Si padeces o has padecido miomas uterinos, endometriosis, fibroquistes mamarios, cáncer de mama u ovario, no consumas crucíferas más de 1 o 2 veces por semana (pueden estimular la enzima CYP 1B1 generando metabolitos estrogénicos proliferativos).

#### 2. Alcachofas o Alcauciles:
- Altamente depurativas hepáticas y renales por su contenido en **cinarina**.
- Gran capacidad **azotúrica y uricosúrica** (elimina urea y ácido úrico).
- Mejora la producción de jugos gástricos, excreta bilis y es rica en **inulina** (prebiótico de primer orden).

#### 3. Ajo y Cebolla:
- Más de 30 sustancias anticancerígenas: sulfuro de alilo, quercitina y ajoeno.
- El ajo es hipoglucemiante, hipotensor y antiséptico.
- La quercitina de la cebolla es antihistamínica y expectorante. Las fitóncidas que libera alivian afecciones respiratorias.

#### 4. Hojas verdes y tallos:
- Escarola, cardos, borraja, ruibarbo, okra, salicornia (espárrago de mar), puerro, espárrago, endivia, berros, hinojo, hojas de roble, canónigos, pepino y calabacín.

#### 5. Solanáceas (Tomate, berenjena y pimiento):
- Consumir con moderación por su contenido en saponinas y lectinas.
- Fuera de temporada, no más de 1 o 2 veces en semana.
- Los tomates deben comerse muy rojos, blandos y, si es posible, **sin piel ni semillas**.
- Verduras licuadas en frío: excelente forma de tomar vitaminas y agua estructurada biológica.
    `,
  },
  {
    id: 'fruta-completo',
    title: '5. Fruta (Máx. 2 piezas al día)',
    category: 'Fruta',
    summary: 'Siempre enteras y nunca en zumo. Granada reina, manzana princesa y bayas.',
    content: `
### Pautas de consumo
- Tomar un máximo de **dos piezas al día** (o un par de puñados en bayas), idealmente como **postre** de almuerzo y cena.
- **Nunca en zumo**, para evitar picos abruptos de glucemia y fructosa libre sin matriz de fibra.

### Frutas recomendadas de baja carga glucémica:
- **Granada:** Considerada la reina de las frutas por su riqueza en polifenoles punicalaginas.
- **Manzana:** La princesa de las frutas (alternar reineta, golden, etc. para la flora).
- **Arándanos, moras, frambuesas, grosellas y fresas** (fresas siempre ecológicas).
- **Papaya, kiwi, albaricoques, cerezas, ciruelas, pera, melocotón, nectarinas, paraguayos, sandía.**
- **Aguacate, coco** (aprovechar todo excepto cáscara), **lima y limón.**
- *Precaución:* Frambuesas, pomelo y zumo de piña interaccionan con diversos fármacos.
    `,
  },
  {
    id: 'tuberculos-completo',
    title: '6. Tubérculos o Bayas de Cáscara Dura (1 o 2 veces en semana)',
    category: 'Tubérculos',
    summary: 'Remolacha, zanahoria, calabaza, nabo y boniato como hidratos de carbono complejos.',
    content: `
### Hidratos de carbono limpios
Remolacha, zanahoria, calabaza, nabo, boniato...
- Maravillosos para obtener carbohidratos complejos sin recurrir a cereales refinados.
- Constituyen una fuente de prebióticos fantásticos para alimentar cepas bacterianas beneficiosas.
- Poseen propiedades procinéticas y antioxidantes.
- Consumo recomendado: **1 o 2 veces en semana**.
    `,
  },
  {
    id: 'cereales-gluten',
    title: '7. Pasta, Arroz, Patata y Pan: El Problema del Gluten Industrial',
    category: 'Cereales & Pan',
    summary: 'Apenas consumo. Evitar gluten convencional y trigo moderno (Dr. Alessio Fasano). Sarraceno.',
    content: `
### Impacto en la glucemia
El aporte de hidratos de carbono de asimilación rápida de la pasta, el arroz blanco, las patatas o el pan convencional no compensa los minutos de placer gustativo frente a las elevaciones sostenidas de glucosa e insulina.

### El pan y los cereales antiguos:
- Si se introduce un poco de pan al día, que sea de **trigo sarraceno** (el más aconsejable), centeno puro, kamut, teff, mijo o espelta.
- Huir del trigo industrial moderno y del gluten en general. El organismo humano no fabrica enzimas capaces de descomponer por completo los enlaces de las proteínas de gliadina del trigo modificado.
- Para profundizar, consultar las investigaciones del **Dr. Alessio Fasano** sobre permeabilidad intestinal y zonulina.
    `,
  },
  {
    id: 'lacteos-completo',
    title: '8. Lácteos: Por qué Moderarlos y la Defensa del Ghee',
    category: 'Lácteos & Grasas',
    summary: 'Caseína A1 vs A2, problemas digestivos y articulares, y el valor del butirato en la mantequilla ghee.',
    content: `
### El mito de los lácteos
Una vez alcanzada la edad adulta, la leche de vaca o de otras especies no aporta beneficios biológicos demostrados y casi el 70% de la población presenta intolerancia a la lactosa o reactividad a la caseína.
El consumo habitual de lácteos comerciales pasteurizados puede provocar estreñimiento, desequilibrios del pH gástrico, trastornos digestivos, disminución de la absorción de calcio, dolores articulares, mucosidad e inflamación cutánea.

### Si decides consumirlos:
- Que sea con moderación, siempre de leche entera procedente de vacas de pasto, de **caseína A2**, y en forma fermentada (**yogur o queso de calidad**). Nunca leche desnatada o semidesnatada.

### La mantequilla clarificada (Ghee):
El único lácteo defendido activamente. Gracias a su altísimo contenido en **ácido butírico**:
- Incrementa la sensibilidad de los receptores de insulina.
- Mejora la permeabilidad selectiva y sella las uniones del epitelio intestinal.
- Protege a nivel cardiovascular y cutáneo (vitamina A natural).
- Acción antioxidante y antiinflamatoria.
    `,
  },
  {
    id: 'setas-hongos',
    title: '9. Setas y Hongos: Modulación Inmune (Al menos 2 veces por semana)',
    category: 'Setas y Hongos',
    summary: 'Reinas de la naturaleza, betaglucanos y soporte fito-nutriente inmunológico.',
    content: `
### Fármaco nutriente natural
Las setas son las reinas de la naturaleza. Apenas existe un alimento con una repercusión positiva tan potente sobre el sistema inmunitario.
- Su composición rica en **betaglucanos (como el lentinano)** actúa como un fito-nutriente modulador de los linfocitos y macrófagos.
- Consumo recomendado: **Al menos dos veces en la semana**, ya sea en salteados, cremas o guisadas con ajo y aceite de oliva virgen extra.
    `,
  },
  {
    id: 'legumbres-antinutrientes',
    title: '10. Legumbres: Máximo 1 Vez en Semana con Remojo 48h',
    category: 'Legumbres',
    summary: 'Remojo 48h, olla a presión, guisantes, habas, soja y cacahuetes.',
    content: `
### Antinutrientes en legumbres
Si quieres consumirlas y no tienes problemas de salud digestiva, no lo hagas más de **una vez en la semana**.
- Dejar siempre en remojo **48 horas**, cambiando el agua periódicamente.
- Cocinarlas en **olla a presión** para desnaturalizar las lectinas y saponinas.
- También es muy sensato utilizar legumbres envasadas en cristal y lavarlas abundantemente bajo el grifo antes de cocinarlas para eliminar almidones y espumas.
- *Recordatorio:* Los **guisantes, las habas, la soja y los cacahuetes** también pertenecen botánicamente a la familia de las legumbres.
    `,
  },
  {
    id: 'frutos-secos-aceites',
    title: '11. Frutos Secos y Aceites Culinarios',
    category: 'Frutos Secos & Grasas',
    summary: 'Activación de frutos secos crudos (cero fritos/tostados), AOVE y aceite de coco.',
    content: `
### Frutos secos: Crudos o activados (Nunca fritos ni tostados)
- Aportan fibra insoluble, proteínas, vitaminas y minerales, pero contienen **ácido fítico** (que provoca pérdida de minerales como el calcio por la orina).
- **Nunca fritos ni tostados:** Son ricos en ácidos grasos poliinsaturados que se oxidan rápidamente a altas temperaturas. Ingerirlos fritos o tostados equivale a incorporar ácidos grasos oxidados directamente a tus membranas celulares.
- Lo ideal es activarlos en remojo con agua durante varias horas y comerlos crudos.

### Aceites recomendados:
- **Aceite de Oliva Virgen Extra (AOVE):** El rey indiscutible de las grasas. Utilizar de forma generosa, especialmente en crudo.
- **Aceite de Coco Virgen:** Muy aconsejable para cocinar debido a su estabilidad molecular frente al calor (grasa saturada de cadena media que no se oxida).
- **Mantequilla o Ghee:** Excelente estabilidad térmica.
    `,
  },
];
