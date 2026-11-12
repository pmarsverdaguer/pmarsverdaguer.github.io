export type CategoryId =
  | 'mar'
  | 'carne'
  | 'huevos'
  | 'verduras'
  | 'legumbres'
  | 'pasta';

export interface CategoryDef {
  id: CategoryId;
  name: string;
  icon: string;
  subcategories: string[];
  color: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    light: string;
  };
  rule: {
    min?: number;
    max?: number;
    unit: 'comidas' | 'huevos';
    label: string;
    description: string;
    isStrict?: boolean;
  };
}

export interface RecipeIngredient {
  name: string;
  amount?: number; // Cantidad base calculada para 'servings' (por defecto 2 personas)
  unit?: string;   // Unidad de medida: g, ml, ud, cda, etc.
}

export interface Dish {
  id: string;
  name: string;
  categoryId: CategoryId;
  subcategory: string;
  cookingTechnique: string;
  preparationTime: number; // minutes
  ingredients: string[];
  recipeIngredients?: RecipeIngredient[];
  servings?: number; // Raciones base de la receta (por defecto 2)
  instructions?: string;
  steps?: string[];
  cookingTips?: string;
  description: string;
  hasEggs?: boolean;
  eggCount?: number; // for egg dishes (e.g. 2 eggs)
  hasVegetables?: boolean;
  vegetableTypes?: string[];
  hasMushrooms?: boolean;
  containsMushrooms?: boolean;
  hasTubers?: boolean;
  hasSeaweed?: boolean;
  hasOliveOil?: boolean;
  containsCruciferous?: boolean;
  isCustom?: boolean;
}

export interface Fruit {
  id: string;
  name: string;
  variety?: string;
  description?: string;
  glycemicIndex?: string;
}

export interface MealSlot {
  dishId: string | null;
  fruitId: string | null;
  notes?: string;
}

export interface DayPlan {
  dayOfWeek: number; // 0 = Lunes, 6 = Domingo
  dateStr: string; // YYYY-MM-DD
  lunch: MealSlot;
  dinner: MealSlot;
}

export interface WeekPlan {
  weekId: string; // e.g. "2026-W45"
  year: number;
  weekNumber: number;
  startDate: string; // ISO Monday
  days: { [dayIndex: number]: DayPlan };
}

export interface NutritionalAudit {
  marCount: number;
  carneBlancaCount: number;
  carneRojaCount: number;
  carneTotalCount: number;
  huevosCount: number;
  setasCount: number;
  tuberculosCount: number;
  legumbresCount: number;
  pastaCount: number;
  verdurasCount: number;
  algasCount: number;
  aoveCount: number;
  frutasCount: number;
  totalMealsPlanned: number;
  alerts: {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    category: string;
    message: string;
    target: string;
    current: number | string;
    fulfilled: boolean;
    val: number;
    min?: number;
    max?: number;
    scaleMax: number;
    hasIssue?: boolean;
    subcategories?: {
      name: string;
      val: number;
      min?: number;
      max?: number;
      exceeded?: boolean;
      underMin?: boolean;
      unfulfilled?: boolean;
      unit?: string;
    }[];
  }[];
}
