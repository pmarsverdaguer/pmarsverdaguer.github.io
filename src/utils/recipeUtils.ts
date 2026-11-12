import type { Dish, RecipeIngredient } from '../types';

export const COMMON_UNITS = [
  'g',
  'mL',
] as const;

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Parsea un texto simple de ingrediente en un RecipeIngredient estructurado.
 * Ej: "300g salmón" -> { amount: 300, unit: 'g', name: 'Salmón' }
 * Ej: "2 huevos ecológicos" -> { amount: 2, unit: 'ud', name: 'Huevos ecológicos' }
 */
export function parseIngredientString(raw: string): RecipeIngredient {
  const trimmed = raw.trim();
  if (!trimmed) return { name: '' };

  // Patrón: número + unidad + nombre (ej: "300g lomo de salmón", "2 cda AOVE", "1 manojo espárragos")
  const matchWithUnit = trimmed.match(
    /^(\d+(?:[.,]\d+)?)\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\.?\s+(?:de\s+)?(.+)$/i
  );
  if (matchWithUnit) {
    const num = parseFloat(matchWithUnit[1].replace(',', '.'));
    const possibleUnit = matchWithUnit[2].toLowerCase();
    const restName = matchWithUnit[3].trim();

    const unitMap: Record<string, string> = {
      g: 'g',
      gr: 'g',
      gramo: 'g',
      gramos: 'g',
      kg: 'kg',
      kilo: 'kg',
      kilos: 'kg',
      ml: 'mL',
      l: 'mL',
      litro: 'mL',
      litros: 'mL',
      ud: '',
      uds: '',
      unidad: '',
      unidades: '',
      cda: 'cda',
      cdas: 'cda',
      cucharada: 'cda',
      cucharadas: 'cda',
      cdta: 'cdta',
      cdtas: 'cdta',
      cucharadita: 'cdta',
      cucharaditas: 'cdta',
      diente: 'dientes',
      dientes: 'dientes',
      manojo: 'manojo',
      manojos: 'manojo',
      pizca: 'pizca',
      pizcas: 'pizca',
      ramita: 'ramitas',
      ramitas: 'ramitas',
      hoja: 'hojas',
      hojas: 'hojas',
      rodaja: 'rodajas',
      rodajas: 'rodajas',
      taza: 'taza',
      tazas: 'taza',
    };

    if (unitMap[possibleUnit]) {
      return {
        amount: num,
        unit: unitMap[possibleUnit],
        name: capitalizeFirst(restName),
      };
    }
  }

  // Patrón: número + nombre sin unidad explícita (ej: "2 huevos camperos", "1 calabacín")
  const matchCountOnly = trimmed.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
  if (matchCountOnly) {
    const num = parseFloat(matchCountOnly[1].replace(',', '.'));
    const restName = matchCountOnly[2].trim();
    return {
      amount: num,
      unit: undefined,
      name: capitalizeFirst(restName),
    };
  }

  return { name: capitalizeFirst(trimmed) };
}

/**
 * Obtiene la lista de ingredientes estructurados de un plato.
 * Si tiene recipeIngredients, los usa; de lo contrario, parsea los strings clásicos.
 */
export function getDishIngredients(dish: Dish): RecipeIngredient[] {
  if (dish.recipeIngredients && Array.isArray(dish.recipeIngredients) && dish.recipeIngredients.length > 0) {
    return dish.recipeIngredients.filter((i) => Boolean(i.name.trim()));
  }
  if (dish.ingredients && Array.isArray(dish.ingredients)) {
    return dish.ingredients
      .map(parseIngredientString)
      .filter((i) => Boolean(i.name.trim()));
  }
  return [];
}

/**
 * Escala y formatea un ingrediente proporcionalmente al número de personas seleccionadas.
 */
export function formatScaledIngredient(
  ing: RecipeIngredient,
  currentServings: number,
  baseServings: number = 2
): string {
  if (ing.amount === undefined || isNaN(ing.amount) || ing.amount <= 0) {
    return ing.name;
  }

  const factor = currentServings / (baseServings > 0 ? baseServings : 2);
  const scaled = ing.amount * factor;

  // Redondear elegantemente (sin 1.333333333333)
  const rounded = Math.round(scaled * 10) / 10;
  const amountStr = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);

  const rawUnit = (ing.unit || '').trim();
  const cleanUnit = rawUnit.toLowerCase() === 'ml' ? 'mL' : rawUnit;

  if (cleanUnit) {
    return `${amountStr}${cleanUnit} ${ing.name}`;
  }
  return `${amountStr} ${ing.name}`;
}

export interface ConsolidatedShoppingIngredient {
  key: string;
  name: string; // Nombre formateado con la suma de cantidades, ej: "550 g Lomo de salmón"
  rawName: string; // Nombre limpio canónico, ej: "Lomo de salmón"
  totalAmount?: number;
  unit?: string;
  count: number;
  dishes: string[];
}

export function normalizeIngredientKey(raw: string): string {
  const lower = raw.trim().toLowerCase();
  if (lower.startsWith('aove') || lower.includes('aceite de oliva')) return 'aove';
  if (lower === 'sal marina' || lower === 'sal marina gruesa' || lower === 'sal marina en escamas') return 'sal marina';
  return lower;
}

export function getCanonicalDisplayName(raw: string, key: string): string {
  if (key === 'aove') return 'Aceite de Oliva Virgen Extra (AOVE)';
  if (key === 'sal marina') return 'Sal marina virgen / escamas';
  const clean = raw.trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Consolida los ingredientes de una lista de platos sumando las cantidades de cada plato.
 */
export function consolidateShoppingIngredients(dishes: Dish[]): ConsolidatedShoppingIngredient[] {
  interface AggItem {
    rawName: string;
    totalAmount: number;
    hasAmount: boolean;
    unit?: string;
    dishes: Set<string>;
  }

  const map = new Map<string, AggItem>();

  for (const dish of dishes) {
    const ings = getDishIngredients(dish);
    for (const ing of ings) {
      const trimmedName = ing.name.trim();
      if (!trimmedName) continue;

      const normKey = normalizeIngredientKey(trimmedName);
      const normUnit = (ing.unit || '').trim().toLowerCase();
      // Agrupar por ingrediente normalizado y unidad compatible
      const compositeKey = normUnit ? `${normKey}:::${normUnit}` : normKey;

      const existing = map.get(compositeKey);
      if (existing) {
        existing.dishes.add(dish.name);
        if (ing.amount !== undefined && !isNaN(ing.amount) && ing.amount > 0) {
          existing.totalAmount += ing.amount;
          existing.hasAmount = true;
        }
      } else {
        const hasAmt = ing.amount !== undefined && !isNaN(ing.amount) && ing.amount > 0;
        map.set(compositeKey, {
          rawName: getCanonicalDisplayName(trimmedName, normKey),
          totalAmount: hasAmt ? ing.amount! : 0,
          hasAmount: hasAmt,
          unit: ing.unit?.trim() || undefined,
          dishes: new Set([dish.name]),
        });
      }
    }
  }

  return Array.from(map.entries())
    .map(([key, data]) => {
      let displayName = data.rawName;
      if (data.hasAmount && data.totalAmount > 0) {
        const rounded = Math.round(data.totalAmount * 10) / 10;
        const amtStr = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
        const rawUnit = (data.unit || '').trim();
        const unitDisplay = rawUnit.toLowerCase() === 'ml' ? 'mL' : rawUnit;
        displayName = unitDisplay ? `${amtStr}${unitDisplay} ${data.rawName}` : `${amtStr} ${data.rawName}`;
      }

      return {
        key,
        name: displayName,
        rawName: data.rawName,
        totalAmount: data.hasAmount ? data.totalAmount : undefined,
        unit: data.unit,
        count: data.dishes.size,
        dishes: Array.from(data.dishes),
      };
    })
    .sort((a, b) => a.rawName.localeCompare(b.rawName, 'es', { sensitivity: 'base' }));
}
