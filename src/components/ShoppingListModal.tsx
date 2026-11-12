import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  ExternalLink,
  Search,
  RotateCcw,
  Plus,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import type { Dish, Fruit, WeekPlan } from '../types';
import { consolidateShoppingIngredients } from '../utils/recipeUtils';
import { triggerDebouncedCloudSync } from '../utils/supabaseSync';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeekPlan: WeekPlan;
  dishesMap: Record<string, Dish>;
  fruitsMap: Record<string, Fruit>;
  onGoToPlanner?: () => void;
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

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  isOpen,
  onClose,
  currentWeekPlan,
  dishesMap,
  fruitsMap,
  onGoToPlanner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'checked'>('all');
  const [customInput, setCustomInput] = useState('');
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Al escribir en la búsqueda o cambiar filtro, recolocar scroll arriba para ver resultados
  useEffect(() => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [searchTerm, filterType]);

  // Persisted checked state and custom items for this week
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

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Consolidate ingredients and fruits
  const { ingredients, fruits } = useMemo(() => {
    const weekDishes: Dish[] = [];
    const fruitCountMap = new Map<string, { fruit: Fruit; count: number }>();

    if (currentWeekPlan?.days) {
      for (let i = 0; i < 7; i++) {
        const day = currentWeekPlan.days[i];
        if (!day) continue;

        // Lunch dish
        if (day.lunch?.dishId && dishesMap[day.lunch.dishId]) {
          weekDishes.push(dishesMap[day.lunch.dishId]);
        }

        // Lunch fruit
        if (day.lunch?.fruitId && fruitsMap[day.lunch.fruitId]) {
          const fruit = fruitsMap[day.lunch.fruitId];
          const existing = fruitCountMap.get(fruit.id);
          if (existing) {
            existing.count += 1;
          } else {
            fruitCountMap.set(fruit.id, { fruit, count: 1 });
          }
        }

        // Dinner dish
        if (day.dinner?.dishId && dishesMap[day.dinner.dishId]) {
          weekDishes.push(dishesMap[day.dinner.dishId]);
        }

        // Dinner fruit
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

  // Toggle item check
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

  // Add custom manual item
  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!customItems.includes(trimmed)) {
      setCustomItems([...customItems, trimmed]);
    }
    setCustomInput('');
  };

  // Remove custom manual item
  const handleRemoveCustom = (item: string) => {
    setCustomItems(customItems.filter((i) => i !== item));
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      next.delete(`custom-${item}`);
      return next;
    });
  };

  // Uncheck all
  const handleResetChecks = () => {
    setCheckedKeys(new Set());
  };

  // Check all
  const handleCheckAll = () => {
    const allKeys = new Set<string>();
    ingredients.forEach((ing) => allKeys.add(ing.key));
    fruits.forEach((fr) => allKeys.add(fr.id));
    customItems.forEach((ci) => allKeys.add(`custom-${ci}`));
    setCheckedKeys(allKeys);
  };

  // Open in new tab
  const handleOpenInNewTab = () => {
    const url = `${window.location.origin}${window.location.pathname}?shopping-list=${encodeURIComponent(
      currentWeekPlan.weekId
    )}`;
    window.open(url, '_blank');
  };

  // Print list
  const handlePrint = () => {
    window.print();
  };

  // Total items calculations
  const totalItemKeys = [
    ...ingredients.map((i) => i.key),
    ...fruits.map((f) => f.id),
    ...customItems.map((c) => `custom-${c}`),
  ];
  const totalCount = totalItemKeys.length;
  const checkedCount = totalItemKeys.filter((k) => checkedKeys.has(k)).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Search and filter
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

  const hasNoItems = totalCount === 0;
  const totalFilteredCount =
    filteredIngredients.length + filteredFruits.length + filteredCustom.length;
  const noSearchResults = isSearchActive && totalFilteredCount === 0;

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-stone-900/50 backdrop-blur-xs cursor-pointer overflow-y-auto print:p-0 print:static print:inset-auto print:bg-transparent print:overflow-visible print:block"
    >
      {/* Notebook Sheet Container: Proportioned like a real notebook / bloc de notas */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#faf6eb] text-[#2c261e] rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border-2 border-[#dfd5c2] overflow-hidden my-auto cursor-default flex flex-col max-h-[92dvh] sm:max-h-[85vh] animate-scale-up relative print:max-h-none print:shadow-none print:border-none print:max-w-none print:w-full print:m-0 print:rounded-none print:bg-[#faf6eb] print:overflow-visible"
        style={{
          boxShadow: '0 20px 45px -10px rgba(45, 35, 20, 0.25), 0 0 0 1px rgba(180, 160, 130, 0.2)',
        }}
      >
        {/* Notebook Top Header (like a perforated notepad top) */}
        <div className="bg-[#f0e6d2] px-4 sm:px-6 py-3.5 sm:py-4 border-b-2 border-[#dfd2be] flex items-center justify-between shrink-0 relative z-20 print:border-b print:pb-3">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            {/* Red header notch / hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#d5c7b0] border border-[#b8a990] shrink-0 hidden sm:block print:hidden" />
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-2xl font-serif font-bold text-[#2d2419] tracking-tight truncate">
                  Lista de la Compra
                </h3>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#e3d7bf] text-[#4f4230] border border-[#cbbe9f] shrink-0">
                  Sem. {currentWeekPlan.weekNumber}
                </span>
              </div>
              <p className="text-xs text-[#716350] font-serif italic mt-0.5 truncate">
                {hasNoItems
                  ? 'Sin productos planificados aún'
                  : isSearchActive
                  ? `${totalFilteredCount} coincidencias encontradas`
                  : `${totalCount} productos en la lista`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#736551] hover:text-[#1f1911] hover:bg-[#e4d8c2] rounded-full transition cursor-pointer shrink-0 ml-2 print:hidden"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notebook Toolbar: Open in new tab, Print, Check all */}
        {!hasNoItems && (
          <div className="bg-[#f7f1e1] px-4 sm:px-6 py-2 sm:py-2.5 border-b border-[#e5d9c2] flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 flex-wrap text-xs font-serif print:hidden">
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs">
              <span className="text-[#554736] font-medium">
                Comprados: <strong className="text-[#3b573d]">{checkedCount}</strong> / {totalCount}
              </span>
              <span className="text-[#b3a38b]">•</span>
              <span className="text-[#7c6f5d]">{progressPercent}%</span>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2 ml-auto">
              {/* Abrir en otra pestaña */}
              <button
                onClick={handleOpenInNewTab}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#ffffff]/90 hover:bg-[#ffffff] text-[#423727] border border-[#d6c8b0] text-[11px] sm:text-xs transition shadow-2xs cursor-pointer hover:text-[#3b573d] active:scale-95"
                title="Abrir la lista en una pestaña independiente para la cocina o el supermercado"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#507252]" />
                <span className="font-semibold hidden sm:inline">Otra pestaña</span>
                <span className="font-semibold sm:hidden">Pestaña</span>
              </button>

              {/* Imprimir */}
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#ffffff]/90 hover:bg-[#ffffff] text-[#423727] border border-[#d6c8b0] text-[11px] sm:text-xs transition shadow-2xs cursor-pointer active:scale-95"
                title="Imprimir la lista en papel"
              >
                <Printer className="w-3.5 h-3.5 text-[#6c5e4b]" />
                <span className="font-semibold">Imprimir</span>
              </button>

              {/* Reset / Check all */}
              {checkedCount > 0 ? (
                <button
                  onClick={handleResetChecks}
                  className="p-1.5 rounded-lg bg-[#ffffff]/90 hover:bg-[#ffffff] text-[#8c4636] border border-[#d6c8b0] text-xs transition shadow-2xs cursor-pointer active:scale-95"
                  title="Desmarcar todo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleCheckAll}
                  className="p-1.5 rounded-lg bg-[#ffffff]/90 hover:bg-[#ffffff] text-[#3b573d] border border-[#d6c8b0] text-xs transition shadow-2xs cursor-pointer active:scale-95"
                  title="Marcar todo como comprado"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search & Filter: Very discrete notepad search */}
        {!hasNoItems && (
          <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#f5eedc]/70 border-b border-[#e5d9c2] flex items-center justify-between gap-2 shrink-0 print:hidden">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-[#91816b] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ingrediente..."
                className="w-full pl-8 pr-8 py-1 text-xs font-serif bg-white/70 border border-[#d9ccb5] rounded-lg text-[#2d2419] placeholder-[#9c8e79] focus:outline-none focus:bg-white focus:border-[#a8977c]"
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
          </div>
        )}

        {/* Lined Notebook Content: 1 item per row strictly */}
        <div
          ref={listContainerRef}
          className="px-5 sm:px-6 py-4 overflow-y-auto flex-1 font-serif space-y-5 print:overflow-visible print:p-0 print:py-3"
        >
          {hasNoItems ? (
            <div className="py-12 text-center text-[#736551]">
              <p className="text-base italic">No hay ingredientes anotados para esta semana.</p>
              <p className="text-xs text-[#9c8f7d] mt-1 mb-4">
                Asigna platos en el menú para generar automáticamente la lista.
              </p>
              {onGoToPlanner && (
                <button
                  onClick={() => {
                    onClose();
                    onGoToPlanner();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#527354] text-white text-xs font-sans font-semibold shadow-xs cursor-pointer print:hidden"
                >
                  Ir al Planificador
                </button>
              )}
            </div>
          ) : noSearchResults ? (
            <div className="py-10 text-center text-[#736551]">
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
              
              {/* Sección Ingredientes: 1 por fila */}
              {filteredIngredients.length > 0 && (
                <div className="mb-6">
                  <div className="border-b border-[#d8c9b0] pb-1 mb-1">
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
                          className="py-2 flex items-center space-x-3 cursor-pointer group select-none hover:bg-[#f3ebd7]/40 -mx-2 px-2 rounded"
                        >
                          {/* Hand-drawn style square checkbox */}
                          <div
                            className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? 'border-[#3b573d] bg-[#3b573d] text-white'
                                : 'border-[#8f7e68] bg-white/70 group-hover:border-[#527354]'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          {/* Ingredient name - pure name, without dish references */}
                          <span
                            className={`text-[15px] sm:text-base leading-snug transition-all ${
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

              {/* Sección Frutas: 1 por fila */}
              {filteredFruits.length > 0 && (
                <div className="mb-6">
                  <div className="border-b border-[#d8c9b0] pb-1 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#544634]">
                      — Frutas ({filteredFruits.length}) —
                    </span>
                  </div>

                  <ul className="divide-y divide-[#ebdcc7]/80">
                    {filteredFruits.map((fr) => {
                      const isChecked = checkedKeys.has(fr.id);
                      return (
                        <li
                          key={fr.id}
                          onClick={() => toggleItem(fr.id)}
                          className="py-2 flex items-center space-x-3 cursor-pointer group select-none hover:bg-[#f3ebd7]/40 -mx-2 px-2 rounded"
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
                            className={`text-[15px] sm:text-base leading-snug transition-all ${
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

              {/* Sección Extras / Notas manuales: 1 por fila */}
              {(!isSearchActive || filteredCustom.length > 0) && (
                <div>
                  <div className="border-b border-[#d8c9b0] pb-1 mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#544634]">
                      — Notas adicionales {filteredCustom.length > 0 ? `(${filteredCustom.length})` : ''} —
                    </span>
                  </div>

                  {/* Formulario rápido para anotar a mano (solo visible si no se está buscando) */}
                  {!isSearchActive && (
                    <form onSubmit={handleAddCustom} className="flex items-center gap-2 mb-2 print:hidden">
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Escribir otra cosa para la compra..."
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm font-serif bg-white/80 border border-[#d9ccb5] rounded-lg text-[#2d2419] placeholder-[#9c8e79] focus:outline-none focus:bg-white focus:border-[#a8977c]"
                      />
                      <button
                        type="submit"
                        disabled={!customInput.trim()}
                        className="p-1.5 rounded-lg bg-[#527354] hover:bg-[#435e45] disabled:bg-[#d6cebf] text-white transition cursor-pointer disabled:cursor-not-allowed"
                        title="Añadir a la lista"
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
                            className="py-2 flex items-center justify-between gap-3 group select-none hover:bg-[#f3ebd7]/40 -mx-2 px-2 rounded"
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
                                className={`text-[15px] sm:text-base leading-snug transition-all ${
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
                              title="Tachar y borrar"
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

        {/* Notebook Bottom Footer */}
        <div className="bg-[#f0e6d2] px-5 sm:px-6 py-3 border-t-2 border-[#dfd2be] flex items-center justify-between shrink-0 font-serif text-xs text-[#6e5f4c] print:border-t print:pt-2">
          <span className="italic">
            {checkedCount === totalCount && totalCount > 0
              ? '✓ ¡Compra completada con éxito!'
              : 'Toca cada ingrediente para tacharlo'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#527354] hover:bg-[#435e45] text-white font-sans font-semibold text-xs transition shadow-xs cursor-pointer print:hidden"
          >
            Cerrar libreta
          </button>
        </div>
      </div>
    </div>
  );
};
