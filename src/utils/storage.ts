import { INITIAL_DISHES, INITIAL_FRUITS } from '../data/initialData';
import type { Dish, Fruit, WeekPlan } from '../types';

const DISHES_KEY = 'menu_planificador_dishes_v1';
const FRUITS_KEY = 'menu_planificador_fruits_v1';
const PLANS_KEY = 'menu_planificador_plans_v1';
const EMPTIED_FLAG_KEY = 'menu_planificador_user_emptied_v1';

function migrateDish(d: any): Dish {
  const defaultDish = INITIAL_DISHES.find((init) => init.id === d.id);
  let categoryId = d.categoryId;
  let subcategory = d.subcategory || '';
  let hasMushrooms = Boolean(d.hasMushrooms || d.containsMushrooms || defaultDish?.hasMushrooms || defaultDish?.containsMushrooms);
  let hasTubers = Boolean(d.hasTubers || defaultDish?.hasTubers);
  let hasEggs = Boolean(d.hasEggs || (d.eggCount !== undefined && d.eggCount > 0) || defaultDish?.hasEggs);
  let eggCount = d.eggCount ?? defaultDish?.eggCount ?? (categoryId === 'huevos' ? 2 : 0);
  let hasVegetables = Boolean(
    d.hasVegetables ||
    (d.vegetableTypes && d.vegetableTypes.length > 0) ||
    categoryId === 'verduras' ||
    defaultDish?.hasVegetables
  );
  let vegetableTypes = (d.vegetableTypes && d.vegetableTypes.length > 0) ? d.vegetableTypes : (defaultDish?.vegetableTypes || []);
  let hasSeaweed = Boolean(d.hasSeaweed || defaultDish?.hasSeaweed);
  let hasOliveOil = Boolean(d.hasOliveOil || defaultDish?.hasOliveOil);

  // Map legacy categories
  if (categoryId === 'setas') {
    categoryId = 'verduras';
    subcategory = 'Verduras';
    hasMushrooms = true;
  } else if (categoryId === 'tuberculos') {
    categoryId = 'verduras';
    subcategory = 'Verduras';
    hasTubers = true;
  } else if (categoryId === 'cereales') {
    categoryId = 'pasta';
    subcategory = 'Trigo Sarraceno';
  }

  // Normalize subcategories
  if (categoryId === 'mar') {
    const s = subcategory.toLowerCase();
    if (s.includes('azul')) subcategory = 'Pescado Azul';
    else if (s.includes('blanco')) subcategory = 'Pescado Blanco';
    else if (s.includes('cefal')) subcategory = 'Cefalópodos';
    else if (s.includes('marisco')) subcategory = 'Marisco';
    else if (s.includes('alga')) {
      subcategory = 'Pescado Blanco';
      hasSeaweed = true;
    } else {
      subcategory = 'Pescado Azul';
    }
  } else if (categoryId === 'carne') {
    const s = subcategory.toLowerCase();
    subcategory = s.includes('roja') ? 'Carne Roja' : 'Carne Blanca';
  } else if (categoryId === 'huevos') {
    const s = subcategory.toLowerCase();
    subcategory =
      s.includes('revuelt') || s.includes('tortilla') ? 'Revueltos y Tortillas' : 'Otros Huevos';
    hasEggs = true;
    if (!eggCount || eggCount <= 0) eggCount = 2;
  } else if (categoryId === 'verduras') {
    subcategory = 'Verduras';
    hasVegetables = true;
  } else if (categoryId === 'legumbres') {
    const s = subcategory.toLowerCase();
    if (s.includes('lenteja')) subcategory = 'Lentejas';
    else if (s.includes('garbanzo')) subcategory = 'Garbanzos';
    else if (s.includes('alubia')) subcategory = 'Alubias';
    else subcategory = 'Guisantes/Habas';
  } else if (categoryId === 'pasta') {
    const s = subcategory.toLowerCase();
    if (s.includes('sarracen')) subcategory = 'Trigo Sarraceno';
    else if (s.includes('integral')) subcategory = 'Trigo Integral';
    else subcategory = 'Trigo Blanco';
  }

  return {
    ...d,
    categoryId,
    subcategory,
    steps: d.steps || defaultDish?.steps,
    cookingTips: d.cookingTips || defaultDish?.cookingTips,
    hasMushrooms,
    containsMushrooms: hasMushrooms,
    hasTubers,
    hasEggs,
    eggCount,
    hasVegetables,
    vegetableTypes,
    hasSeaweed,
    hasOliveOil,
  };
}

export function getStoredDishes(): Dish[] {
  try {
    const raw = localStorage.getItem(DISHES_KEY);
    if (raw === null) {
      if (localStorage.getItem(EMPTIED_FLAG_KEY) === 'true') {
        return [];
      }
      localStorage.setItem(DISHES_KEY, JSON.stringify(INITIAL_DISHES));
      return INITIAL_DISHES;
    }
    const parsed: Dish[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }
    return parsed.map(migrateDish);
  } catch {
    return [];
  }
}

export function saveStoredDishes(dishes: Dish[]): void {
  try {
    localStorage.setItem(DISHES_KEY, JSON.stringify(dishes));
  } catch (err) {
    console.error('Error saving dishes to localStorage', err);
  }
}

export function getStoredFruits(): Fruit[] {
  try {
    const raw = localStorage.getItem(FRUITS_KEY);
    if (raw === null) {
      if (localStorage.getItem(EMPTIED_FLAG_KEY) === 'true') {
        return [];
      }
      localStorage.setItem(FRUITS_KEY, JSON.stringify(INITIAL_FRUITS));
      return INITIAL_FRUITS;
    }
    const parsed: Fruit[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function saveStoredFruits(fruits: Fruit[]): void {
  try {
    localStorage.setItem(FRUITS_KEY, JSON.stringify(fruits));
  } catch (err) {
    console.error('Error saving fruits to localStorage', err);
  }
}

export function getStoredPlans(): Record<string, WeekPlan> {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveStoredPlan(plan: WeekPlan): void {
  try {
    const all = getStoredPlans();
    all[plan.weekId] = plan;
    localStorage.setItem(PLANS_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving plan to localStorage', err);
  }
}

export interface AppBackupData {
  version: string;
  exportedAt: string;
  source: string;
  dishes: Dish[];
  fruits: Fruit[];
  plans: Record<string, WeekPlan>;
  shoppingStates?: Record<string, unknown>;
}

/**
 * Genera un archivo JSON descargable con todos los datos de la aplicación
 * (platos, ingredientes, frutas, semanas planificadas y listas de la compra)
 * permitiendo una copia de seguridad 100% offline y compatible con GitHub Pages.
 */
export function exportAllData(): string {
  const dishes = getStoredDishes();
  const fruits = getStoredFruits();
  const plans = getStoredPlans();
  const shoppingStates: Record<string, unknown> = {};

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('menu_shopping_state_')) {
        try {
          const val = localStorage.getItem(key);
          if (val) shoppingStates[key] = JSON.parse(val);
        } catch {
          // ignore parsing error
        }
      }
    }
  } catch {
    // fallback if localStorage inspection is restricted
  }

  const backup: AppBackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'Planificador de Menú Semanal',
    dishes,
    fruits,
    plans,
    shoppingStates,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Importa y valida una copia de seguridad JSON, persistiendo los datos en localStorage.
 */
export function importAllData(jsonStr: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonStr) as Partial<AppBackupData>;
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'El archivo seleccionado no contiene un formato JSON válido.' };
    }

    if (!Array.isArray(data.dishes) || !Array.isArray(data.fruits)) {
      return {
        success: false,
        message: 'El archivo de copia de seguridad no contiene la estructura requerida de platos y frutas.',
      };
    }

    saveStoredDishes(data.dishes.map(migrateDish));
    saveStoredFruits(data.fruits);
    localStorage.removeItem(EMPTIED_FLAG_KEY);

    if (data.plans && typeof data.plans === 'object') {
      localStorage.setItem(PLANS_KEY, JSON.stringify(data.plans));
    }

    if (data.shoppingStates && typeof data.shoppingStates === 'object') {
      Object.entries(data.shoppingStates).forEach(([k, v]) => {
        try {
          localStorage.setItem(k, JSON.stringify(v));
        } catch {
          // ignore
        }
      });
    }

    return { success: true, message: 'Copia de seguridad restaurada correctamente.' };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Formato de datos no reconocido';
    return { success: false, message: `Error al procesar el archivo: ${errMsg}` };
  }
}

/**
 * Restablece y vacía completamente los datos de la aplicación:
 * borra todos los platos del recetario, todas las frutas y deja todas las semanas sin comidas ni frutas asignadas.
 */
export function resetAllDataToDefaults(): void {
  try {
    localStorage.setItem(DISHES_KEY, JSON.stringify([]));
    localStorage.setItem(FRUITS_KEY, JSON.stringify([]));
    localStorage.setItem(PLANS_KEY, JSON.stringify({}));
    localStorage.setItem(EMPTIED_FLAG_KEY, 'true');

    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('menu_shopping_state_')) {
        toRemove.push(key);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // fallback
  }
}
