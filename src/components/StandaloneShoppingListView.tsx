import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Printer,
  ArrowLeft,
  Search,
  RotateCcw,
  Plus,
  Check,
  CheckCheck,
  Trash2,
  X,
} from 'lucide-react';
import type { Dish, Fruit, WeekPlan } from '../types';
import { consolidateShoppingIngredients } from '../utils/recipeUtils';
import { triggerDebouncedCloudSync } from '../utils/supabaseSync';

interface StandaloneShoppingListViewProps {
  currentWeekPlan: WeekPlan;
  dishesMap: Record<string, Dish>;
  fruitsMap: Record<string, Fruit>;
  onGoToApp: () => void;
}

interface ConsolidatedFruit {
  id: string;
  name: string;
  count: number;
  description?: string;
}

// Normalizador insensible a acentos, mayúsculas y espacios
const normalizeSearchText = (text: string) =>
  (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const itemMatchesSearch = (
  query: string,
  fields: (string | undefined | null)[]
) => {
  const cleanQuery = normalizeSearchText(query);
  if (!cleanQuery) return true;
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const combined = fields
    .filter(Boolean)
    .map((f) => normalizeSearchText(f as string))
    .join(' ');

  return tokens.every((token) => combined.includes(token));
};

export const StandaloneShoppingListView: React.FC<StandaloneShoppingListViewProps> = ({
  currentWeekPlan,
  dishesMap,
  fruitsMap,
  onGoToApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'checked'>('all');
  const [customInput, setCustomInput] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchTerm, filterType]);

  const storageKey = `menu_shopping_state_${currentWeekPlan.weekId}`;
  const prevStorageKeyRef = useRef(storageKey);

  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set<string>(parsed.checkedKeys || []);
      }
    } catch {
      // fallback
    }
    return new Set<string>();
  });

  const [customItems, setCustomItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.customItems || [];
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Re-sync if week changes or if remote sync sends updated state
  useEffect(() => {
    const loadState = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setCheckedKeys(new Set<string>(parsed.checkedKeys || []));
          setCustomItems(parsed.customItems || []);
          return;
        }
      } catch {
        // fallback
      }
      setCheckedKeys(new Set<string>());
      setCustomItems([]);
    };

    if (prevStorageKeyRef.current !== storageKey) {
      prevStorageKeyRef.current = storageKey;
      loadState();
    }

    const handleRemoteUpdate = () => {
      loadState();
    };

    window.addEventListener('menu_storage_updated', handleRemoteUpdate);
    return () => window.removeEventListener('menu_storage_updated', handleRemoteUpdate);
  }, [storageKey]);

  // Save to localStorage and trigger cloud sync
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (prevStorageKeyRef.current !== storageKey) {
      return;
    }
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          checkedKeys: Array.from(checkedKeys),
          customItems,
        })
      );
      triggerDebouncedCloudSync();
    } catch {
      // ignore
    }
  }, [checkedKeys, customItems, storageKey]);

  // Consolidate ingredients and fruits
  const { ingredients, fruits } = useMemo(() => {
    const weekDishes: Dish[] = [];
    const fruitCountMap = new Map<string, { fruit: Fruit; count: number }>();

    if (currentWeekPlan?.days) {
      for (let i = 0; i < 7; i++) {
        const day = currentWeekPlan.days[i];
        if (!day) continue;

        if (day.lunch?.dishId && dishesMap[day.lunch.dishId]) {
          weekDishes.push(dishesMap[day.lunch.dishId]);
        }

        if (day.lunch?.fruitId && fruitsMap[day.lunch.fruitId]) {
          const fruit = fruitsMap[day.lunch.fruitId];
          const existing = fruitCountMap.get(fruit.id);
          if (existing) {
            existing.count += 1;
          } else {
            fruitCountMap.set(fruit.id, { fruit, count: 1 });
          }
        }

        if (day.dinner?.dishId && dishesMap[day.dinner.dishId]) {
          weekDishes.push(dishesMap[day.dinner.dishId]);
        }

        if (day.dinner?.fruitId && fruitsMap[day.dinner.fruitId]) {
          const fruit = fruitsMap[day.dinner.fruitId];
          const existing = fruitCountMap.get(fruit.id);
          if (existing) {
            existing.count += 1;
          } else {
            fruitCountMap.set(fruit.id, { fruit, count: 1 });
          }
        }
      }
    }

    const sortedIngredients = consolidateShoppingIngredients(weekDishes);

    const sortedFruits: ConsolidatedFruit[] = Array.from(fruitCountMap.values())
      .map(({ fruit, count }) => ({
        id: `fruit-${fruit.id}`,
        name: fruit.name,
        count,
        description: fruit.description,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    return {
      ingredients: sortedIngredients,
      fruits: sortedFruits,
    };
  }, [currentWeekPlan, dishesMap, fruitsMap]);

  const toggleItem = (key: string) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!customItems.includes(trimmed)) {
      setCustomItems([...customItems, trimmed]);
    }
    setCustomInput('');
  };

  const handleRemoveCustom = (item: string) => {
    setCustomItems(customItems.filter((i) => i !== item));
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      next.delete(`custom-${item}`);
      return next;
    });
  };

  const handleResetChecks = () => {
    setCheckedKeys(new Set());
  };

  const handleCheckAll = () => {
    const allKeys = new Set<string>();
    ingredients.forEach((ing) => allKeys.add(ing.key));
    fruits.forEach((fr) => allKeys.add(fr.id));
    customItems.forEach((ci) => allKeys.add(`custom-${ci}`));
    setCheckedKeys(allKeys);
  };

  const totalItemKeys = [
    ...ingredients.map((i) => i.key),
    ...fruits.map((f) => f.id),
    ...customItems.map((c) => `custom-${c}`),
  ];
  const totalCount = totalItemKeys.length;
  const checkedCount = totalItemKeys.filter((k) => checkedKeys.has(k)).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const isSearchActive = searchTerm.trim().length > 0;

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch = itemMatchesSearch(searchTerm, [
        ing.name,
        ing.rawName,
      ]);
      const isChecked = checkedKeys.has(ing.key);
      if (!matchesSearch) return false;
      if (filterType === 'pending') return !isChecked;
      if (filterType === 'checked') return isChecked;
      return true;
    });
  }, [ingredients, searchTerm, filterType, checkedKeys]);

  const filteredFruits = useMemo(() => {
    return fruits.filter((fr) => {
      const matchesSearch = itemMatchesSearch(searchTerm, [
        fr.name,
        fr.description,
      ]);
      const isChecked = checkedKeys.has(fr.id);
      if (!matchesSearch) return false;
      if (filterType === 'pending') return !isChecked;
      if (filterType === 'checked') return isChecked;
      return true;
    });
  }, [fruits, searchTerm, filterType, checkedKeys]);

  const filteredCustom = useMemo(() => {
    return customItems.filter((item) => {
      const matchesSearch = itemMatchesSearch(searchTerm, [item]);
      const isChecked = checkedKeys.has(`custom-${item}`);
      if (!matchesSearch) return false;
      if (filterType === 'pending') return !isChecked;
      if (filterType === 'checked') return isChecked;
      return true;
    });
  }, [customItems, searchTerm, filterType, checkedKeys]);

  const totalFilteredCount =
    filteredIngredients.length + filteredFruits.length + filteredCustom.length;
  const noSearchResults = isSearchActive && totalFilteredCount === 0;

  return (
    <div className="min-h-screen bg-[#ede4d3] text-[#2c261e] py-6 sm:py-10 px-3 sm:px-6 font-serif flex flex-col items-center print:bg-white print:p-0 print:block">
      {/* Top Bar for Standalone view */}
      <div className="max-w-xl w-full mb-4 flex items-center justify-between gap-3 print:hidden">
        <button
          onClick={onGoToApp}
          className="flex items-center space-x-2 text-xs font-sans font-semibold text-[#544634] hover:text-[#2d2419] bg-white/70 hover:bg-white px-3.5 py-2 rounded-xl border border-[#d6c7b0] transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Menú</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 text-xs font-sans font-semibold text-[#2d2419] bg-white hover:bg-[#faf8f4] px-4 py-2 rounded-xl border border-[#d6c7b0] transition shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#527354]" />
          <span>Imprimir Lista</span>
        </button>
      </div>

      {/* Main Notepad Paper Sheet */}
      <div
        className="bg-[#faf6eb] text-[#2c261e] rounded-2xl sm:rounded-3xl max-w-xl w-full border-2 border-[#dfd5c2] overflow-hidden shadow-2xl relative print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none print:bg-[#faf6eb]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(45, 35, 20, 0.25)',
        }}
      >
        {/* Notebook Top Header */}
        <div className="bg-[#f0e6d2] px-6 py-5 border-b-2 border-[#dfd2be] flex items-center justify-between print:border-b print:pb-3">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d2419] tracking-tight">
                Lista de la Compra
              </h1>
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#e3d7bf] text-[#4f4230] border border-[#cbbe9f]">
                Sem. {currentWeekPlan.weekNumber} · {currentWeekPlan.year}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#716350] font-serif italic mt-1">
              {isSearchActive
                ? `${totalFilteredCount} coincidencias encontradas`
                : `${totalCount} productos en la lista`}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-[#554736] block">
              Comprados: <strong className="text-[#3b573d]">{checkedCount}</strong> / {totalCount}
            </span>
            <span className="text-[11px] text-[#857662]">({progressPercent}%)</span>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="bg-[#f7f1e1] px-6 py-2.5 border-b border-[#e5d9c2] flex items-center justify-between gap-3 text-xs print:hidden flex-wrap">
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#91816b] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ingrediente..."
              className="w-full pl-8 pr-8 py-1 text-xs font-serif bg-white/70 border border-[#d9ccb5] rounded-lg text-[#2d2419] placeholder-[#9c8e79] focus:outline-none focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#91816b] hover:text-[#2d2419] p-0.5 rounded cursor-pointer"
                title="Borrar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 shrink-0 font-serif text-[11px]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#ded0b6] font-bold text-[#2d2419]'
                  : 'text-[#6c5e4c] hover:text-[#2d2419]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterType === 'pending'
                  ? 'bg-[#ded0b6] font-bold text-[#2d2419]'
                  : 'text-[#6c5e4c] hover:text-[#2d2419]'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterType('checked')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterType === 'checked'
                  ? 'bg-[#ded0b6] font-bold text-[#2d2419]'
                  : 'text-[#6c5e4c] hover:text-[#2d2419]'
              }`}
            >
              Hechos
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {checkedCount > 0 ? (
              <button
                onClick={handleResetChecks}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-[#8c4636] border border-[#d6c8b0] text-xs transition cursor-pointer"
                title="Desmarcar todo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Desmarcar</span>
              </button>
            ) : (
              <button
                onClick={handleCheckAll}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-[#3b573d] border border-[#d6c8b0] text-xs transition cursor-pointer"
                title="Marcar todo como comprado"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar todo</span>
              </button>
            )}
          </div>
        </div>

        {/* Notepad Content: 1 item per row strictly */}
        <div ref={contentRef} className="px-6 sm:px-8 py-6 font-serif space-y-6 print:py-4">
          {noSearchResults ? (
            <div className="py-12 text-center text-[#736551]">
              <Search className="w-8 h-8 mx-auto text-[#a89882] mb-2 stroke-[1.5]" />
              <p className="text-base font-serif font-semibold text-[#3d3224]">
                Sin resultados para &ldquo;{searchTerm}&rdquo;
              </p>
              <p className="text-xs text-[#8c7e6b] mt-1 font-serif">
                No encontramos ningún ingrediente o fruta que coincida.
              </p>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#ded0b6] hover:bg-[#d5c5a8] text-[#2d2419] text-xs font-serif font-medium transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar búsqueda</span>
              </button>
            </div>
          ) : (
            <div className="relative pl-6 before:content-[''] before:absolute before:left-3 before:top-0 before:bottom-0 before:w-[1.5px] before:bg-rose-300/40">
              {/* Ingredientes de los platos: 1 por fila */}
              {filteredIngredients.length > 0 && (
                <div className="mb-6">
                  <div className="border-b border-[#d8c9b0] pb-1 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#544634]">
                      — Ingredientes ({filteredIngredients.length}) —
                    </span>
                  </div>

                  <ul className="divide-y divide-[#ebdcc7]/80">
                    {filteredIngredients.map((ing) => {
                      const isChecked = checkedKeys.has(ing.key);
                      return (
                        <li
                          key={ing.key}
                          onClick={() => toggleItem(ing.key)}
                          className="py-2.5 flex items-center space-x-3 cursor-pointer group select-none hover:bg-[#f3ebd7]/40 -mx-2 px-2 rounded"
                        >
                          <div
                            className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? 'border-[#3b573d] bg-[#3b573d] text-white'
                                : 'border-[#8f7e68] bg-white/70 group-hover:border-[#527354]'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          <span
                            className={`text-base leading-snug transition-all ${
                              isChecked
                                ? 'line-through decoration-[#c25e5e] decoration-1.5 text-[#9e8f7a] italic'
                                : 'text-[#2a2217] font-medium'
                            }`}
                          >
                            {ing.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Frutas: 1 por fila */}
              {filteredFruits.length > 0 && (
                <div className="mb-6">
                  <div className="border-b border-[#d8c9b0] pb-1 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#544634]">
                      — Frutas de la semana ({filteredFruits.length}) —
                    </span>
                  </div>

                  <ul className="divide-y divide-[#ebdcc7]/80">
                    {filteredFruits.map((fr) => {
                      const isChecked = checkedKeys.has(fr.id);
                      return (
                        <li
                          key={fr.id}
                          onClick={() => toggleItem(fr.id)}
                          className="py-2.5 flex items-center space-x-3 cursor-pointer group select-none hover:bg-[#f3ebd7]/40 -mx-2 px-2 rounded"
                        >
                          <div
                            className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? 'border-[#3b573d] bg-[#3b573d] text-white'
                                : 'border-[#8f7e68] bg-white/70 group-hover:border-[#527354]'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          <span
                            className={`text-base leading-snug transition-all ${
                              isChecked
                                ? 'line-through decoration-[#c25e5e] decoration-1.5 text-[#9e8f7a] italic'
                                : 'text-[#2a2217] font-medium'
                            }`}
                          >
                            {fr.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Extras manuales */}
              {(!isSearchActive || filteredCustom.length > 0) && (
                <div>
                  <div className="border-b border-[#d8c9b0] pb-1 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#544634]">
                      — Notas adicionales {filteredCustom.length > 0 ? `(${filteredCustom.length})` : ''} —
                    </span>
                  </div>

                  {!isSearchActive && (
                    <form onSubmit={handleAddCustom} className="flex items-center gap-2 mb-2 print:hidden">
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Escribir otra cosa para la compra..."
                        className="flex-1 px-3 py-1.5 text-sm font-serif bg-white/80 border border-[#d9ccb5] rounded-lg text-[#2d2419] placeholder-[#9c8e79] focus:outline-none focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={!customInput.trim()}
                        className="p-2 rounded-lg bg-[#527354] hover:bg-[#435e45] disabled:bg-[#d6cebf] text-white transition cursor-pointer"
                        title="Añadir nota"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>
                  )}

              {filteredCustom.length > 0 && (
                <ul className="divide-y divide-[#ebdcc7]/80">
                  {filteredCustom.map((item) => {
                    const itemKey = `custom-${item}`;
                    const isChecked = checkedKeys.has(itemKey);
                    return (
                      <li
                        key={itemKey}
                        className="py-2.5 flex items-center justify-between gap-3 group select-none hover:bg-[#f3ebd7]/40 -mx-2 px-2 rounded"
                      >
                        <div
                          onClick={() => toggleItem(itemKey)}
                          className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? 'border-[#3b573d] bg-[#3b573d] text-white'
                                : 'border-[#8f7e68] bg-white/70 group-hover:border-[#527354]'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          <span
                            className={`text-base leading-snug transition-all ${
                              isChecked
                                ? 'line-through decoration-[#c25e5e] decoration-1.5 text-[#9e8f7a] italic'
                                : 'text-[#2a2217] font-medium'
                            }`}
                          >
                            {item}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveCustom(item)}
                          className="p-1 text-[#9e8f7a] hover:text-rose-700 transition cursor-pointer print:hidden"
                          title="Borrar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f0e6d2] px-6 py-3 border-t-2 border-[#dfd2be] text-center font-serif text-xs text-[#716350] italic">
          Planificador Nutricional · Lista de la compra
        </div>
      </div>
    </div>
  );
};
