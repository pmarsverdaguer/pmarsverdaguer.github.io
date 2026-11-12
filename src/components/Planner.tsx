import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  Apple,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Search,
  X,
} from 'lucide-react';
import { CATEGORIES } from '../data/initialData';
import type { Dish, Fruit, MealSlot, NutritionalAudit, WeekPlan } from '../types';
import { autoFillEmptySlots } from '../utils/audit';
import { DAY_NAMES, getISOWeekInfo } from '../utils/dateUtils';

interface PlannerProps {
  currentWeekPlan: WeekPlan;
  dishes: Dish[];
  fruits: Fruit[];
  audit: NutritionalAudit;
  onUpdatePlan: (updatedPlan: WeekPlan) => void;
  onNavigateWeek: (offset: number) => void;
  onResetToCurrentWeek?: () => void;
}

export const Planner: React.FC<PlannerProps> = ({
  currentWeekPlan,
  dishes,
  fruits,
  audit,
  onUpdatePlan,
  onNavigateWeek,
  onResetToCurrentWeek,
}) => {
  // Check if viewing the real current week
  const [today] = useState(() => new Date());
  const realWeekInfo = getISOWeekInfo(today);
  const isViewingCurrentWeek = currentWeekPlan.weekId === realWeekInfo.weekId;

  // Modal selector state
  const [activeSlot, setActiveSlot] = useState<{
    dayIdx: number;
    mealType: 'lunch' | 'dinner';
  } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAuditFilter, setSelectedAuditFilter] = useState<string | null>(null);

  // Lock background scroll when modal is open and handle Escape key
  useEffect(() => {
    if (activeSlot) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setActiveSlot(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [activeSlot]);

  const dishesMap = Object.fromEntries(dishes.map((d) => [d.id, d]));
  const fruitsMap = Object.fromEntries(fruits.map((f) => [f.id, f]));
  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  const isMealContributing = (
    dish: Dish | null,
    fruit: Fruit | null,
    filterId: string | null
  ): boolean => {
    if (!filterId) return false;
    if (filterId === 'frutas') return fruit !== null;
    if (!dish) return false;

    switch (filterId) {
      case 'mar':
        return dish.categoryId === 'mar';
      case 'carne':
        return dish.categoryId === 'carne';
      case 'huevos':
        return Boolean(dish.hasEggs || (dish.eggCount !== undefined && dish.eggCount > 0));
      case 'verduras':
        return Boolean(
          dish.categoryId === 'verduras' ||
          dish.hasVegetables ||
          (dish.vegetableTypes && dish.vegetableTypes.length > 0)
        );
      case 'setas':
        return Boolean(dish.hasMushrooms || dish.containsMushrooms || (dish.categoryId as string) === 'setas');
      case 'tuberculos':
        return Boolean(dish.hasTubers || (dish.categoryId as string) === 'tuberculos');
      case 'legumbres':
        return dish.categoryId === 'legumbres';
      case 'pasta':
        return dish.categoryId === 'pasta' || (dish.categoryId as string) === 'cereales';
      default:
        return false;
    }
  };

  // Handle dish selection
  const handleSelectDish = (dishId: string) => {
    if (!activeSlot) return;
    const { dayIdx, mealType } = activeSlot;
    const currentDay = currentWeekPlan.days[dayIdx];

    const updatedSlot: MealSlot = {
      ...currentDay[mealType],
      dishId,
    };

    const newDays = {
      ...currentWeekPlan.days,
      [dayIdx]: {
        ...currentDay,
        [mealType]: updatedSlot,
      },
    };

    onUpdatePlan({
      ...currentWeekPlan,
      days: newDays,
    });
    setActiveSlot(null);
  };

  // Handle fruit selection directly
  const handleSelectFruit = (dayIdx: number, mealType: 'lunch' | 'dinner', fruitId: string | null) => {
    const currentDay = currentWeekPlan.days[dayIdx];
    const updatedSlot: MealSlot = {
      ...currentDay[mealType],
      fruitId,
    };

    onUpdatePlan({
      ...currentWeekPlan,
      days: {
        ...currentWeekPlan.days,
        [dayIdx]: {
          ...currentDay,
          [mealType]: updatedSlot,
        },
      },
    });
  };

  // Clear a specific meal slot
  const handleClearSlot = (dayIdx: number, mealType: 'lunch' | 'dinner') => {
    const currentDay = currentWeekPlan.days[dayIdx];
    onUpdatePlan({
      ...currentWeekPlan,
      days: {
        ...currentWeekPlan.days,
        [dayIdx]: {
          ...currentDay,
          [mealType]: { dishId: null, fruitId: null },
        },
      },
    });
  };

  // Clear entire week
  const handleClearWholeWeek = () => {
    if (window.confirm('¿Seguro que deseas vaciar todas las comidas y frutas de esta semana?')) {
      const clearedDays: WeekPlan['days'] = {};
      Object.entries(currentWeekPlan.days).forEach(([idx, day]) => {
        clearedDays[Number(idx)] = {
          ...day,
          lunch: { dishId: null, fruitId: null },
          dinner: { dishId: null, fruitId: null },
        };
      });
      onUpdatePlan({
        ...currentWeekPlan,
        days: clearedDays,
      });
    }
  };

  // Auto-fill empty meal slots with balanced random dishes
  const handleAutoFill = () => {
    let emptyMealsCount = 0;
    for (let i = 0; i < 7; i++) {
      if (!currentWeekPlan.days[i]?.lunch?.dishId) emptyMealsCount++;
      if (!currentWeekPlan.days[i]?.dinner?.dishId) emptyMealsCount++;
    }

    if (emptyMealsCount === 0) {
      alert('Todos los platos de la semana ya están asignados. Si deseas completar el menú con nuevos platos, vacía algunos primero.');
      return;
    }

    const filled = autoFillEmptySlots(currentWeekPlan, dishes, fruits);
    onUpdatePlan(filled);
  };

  // Filtered dishes for modal
  const filteredDishes = dishes.filter((d) => {
    const matchesCat = selectedCategory === 'all' || d.categoryId === selectedCategory;
    const matchesSubcat = selectedSubcategory === 'all' || d.subcategory === selectedSubcategory;
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ingredients.some((ing) => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSubcat && matchesSearch;
  });

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="pb-16 animate-fade-in">
      
      {/* Main Grid: Left Column (Week Header + 7 Days) and Right Column (Control de Ingestas aligned from top) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column (spans 3 columns) */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Week Header & Actions Bar: Con la misma anchura/altura vertical que la del dashboard */}
          <div className="bg-[#fcfbf7] border border-[#e8e2d4] rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between sm:justify-start space-x-2 sm:space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => onNavigateWeek(-1)}
                  className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#dfd7c8] text-[#554e42] hover:bg-[#f6f2ea] transition shadow-xs cursor-pointer active:scale-95"
                  title="Semana anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-2xl font-semibold text-[#2f3833]">
                    Semana {currentWeekPlan.weekNumber}
                  </h2>
                  <span className="text-[11px] sm:text-xs font-bold text-[#507252] bg-[#eef4ee] px-2.5 py-0.5 rounded-full border border-[#d6e4d6] inline-flex items-center justify-center leading-none">
                    {currentWeekPlan.year}
                  </span>
                </div>
                <button
                  onClick={() => onNavigateWeek(1)}
                  className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#dfd7c8] text-[#554e42] hover:bg-[#f6f2ea] transition shadow-xs cursor-pointer active:scale-95"
                  title="Semana siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {!isViewingCurrentWeek && onResetToCurrentWeek && (
                  <button
                    onClick={onResetToCurrentWeek}
                    className="text-[11px] sm:text-xs text-[#507252] hover:text-[#385139] font-semibold bg-[#eef4ee] hover:bg-[#e2ede2] border border-[#d2e2d2] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl transition cursor-pointer shadow-2xs whitespace-nowrap active:scale-95"
                    title="Volver a la semana actual"
                  >
                    Hoy
                  </button>
                )}
              </div>

              {/* Quick Balance Actions */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleAutoFill}
                  className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#527354] hover:bg-[#435e45] text-white transition text-xs sm:text-sm font-semibold shadow-xs cursor-pointer active:scale-95"
                  title="Completa automáticamente los días y comidas vacías respetando las ingestas mínimas"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Completar</span>
                </button>

                <button
                  onClick={handleClearWholeWeek}
                  className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-white border border-[#e4dccd] text-[#847866] hover:text-[#b8523c] hover:border-[#f0c2b6] transition text-xs sm:text-sm font-semibold shadow-xs cursor-pointer active:scale-95"
                  title="Vaciar todas las comidas de la semana"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Vaciar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Days Planner Columns */}
          <div className="space-y-4">
          {Array.from({ length: 7 }, (_, dayIdx) => {
            const dayPlan = currentWeekPlan.days[dayIdx];
            const lunchDish = dayPlan?.lunch?.dishId ? dishesMap[dayPlan.lunch.dishId] : null;
            const lunchFruit = dayPlan?.lunch?.fruitId ? fruitsMap[dayPlan.lunch.fruitId] : null;
            const dinnerDish = dayPlan?.dinner?.dishId ? dishesMap[dayPlan.dinner.dishId] : null;
            const dinnerFruit = dayPlan?.dinner?.fruitId ? fruitsMap[dayPlan.dinner.fruitId] : null;

            const isFiltering = selectedAuditFilter !== null;
            const lunchContributes = isMealContributing(lunchDish, lunchFruit, selectedAuditFilter);
            const dinnerContributes = isMealContributing(dinnerDish, dinnerFruit, selectedAuditFilter);

            return (
              <div
                key={dayIdx}
                className="bg-white border border-[#eae3d5] rounded-3xl p-5 sm:p-6 shadow-xs transition-all hover:border-[#cfdcce]"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#f3ede3]">
                  <div className="flex items-center space-x-3.5">
                    <span className="w-9 h-9 rounded-2xl bg-[#f0f5f0] text-[#425c42] font-bold text-sm flex items-center justify-center border border-[#d3e2d3]">
                      {dayIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-[#2f3833]">
                        {DAY_NAMES[dayIdx]}
                      </h3>
                      <p className="text-xs text-[#808d82] font-medium">
                        {dayPlan ? dayPlan.dateStr : ''}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#5a6e5e] bg-[#f8f6f0] px-3.5 py-1 rounded-full border border-[#e8e2d4]">
                    2 Comidas + 2 Frutas
                  </span>
                </div>

                {/* Meals row: Lunch and Dinner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* ALMUERZO */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ${
                      isFiltering
                        ? lunchContributes
                          ? 'bg-[#f4f9f4] border-2 border-[#527354] shadow-md ring-2 ring-[#527354]/25 scale-[1.01]'
                          : 'bg-[#faf8f4] border border-[#ede5d8] opacity-35 grayscale-20'
                        : 'bg-[#faf8f4] border border-[#ede5d8]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#7e6e5a]">
                            Almuerzo
                          </span>
                          {isFiltering && lunchContributes && (
                            <span className="text-[10px] uppercase font-bold text-[#2d5230] bg-[#e2ede2] border border-[#b4d6b6] px-2 py-0.5 rounded-full">
                              Colabora
                            </span>
                          )}
                        </div>
                        {lunchDish && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setActiveSlot({ dayIdx, mealType: 'lunch' })}
                              className="text-[#847866] hover:text-[#425c42] hover:bg-[#eef4ee] transition p-1.5 rounded-lg cursor-pointer"
                              title="Cambiar plato"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleClearSlot(dayIdx, 'lunch')}
                              className="text-[#847866] hover:text-[#c0563b] hover:bg-[#fdeeed] transition p-1.5 rounded-lg cursor-pointer"
                              title="Quitar plato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {lunchDish ? (
                        <div className="space-y-1.5">
                          <h4 className="text-base font-semibold text-[#2d3831] leading-snug">
                            {lunchDish.name}
                          </h4>
                          <div className="flex items-center flex-wrap gap-2 text-xs text-[#6e7d72] pt-0.5">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#eaf2ea] text-[#3f5f42] border border-[#d2e3d2] font-medium">
                              {lunchDish.subcategory}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Flame className="w-3.5 h-3.5 text-[#c0735a]" />
                              <span>{lunchDish.cookingTechnique}</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveSlot({ dayIdx, mealType: 'lunch' })}
                          className="w-full py-4 border-2 border-dashed border-[#dfd6c6] hover:border-[#6f9072] rounded-2xl text-xs sm:text-sm font-semibold text-[#6d6352] hover:text-[#385338] flex items-center justify-center space-x-2 transition bg-white/60 hover:bg-white"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Seleccionar Plato de Almuerzo</span>
                        </button>
                      )}

                      {lunchDish && (
                        <button
                          onClick={() => setActiveSlot({ dayIdx, mealType: 'lunch' })}
                          className="mt-2.5 text-xs font-semibold text-[#486e4b] hover:underline block"
                        >
                          Cambiar plato →
                        </button>
                      )}
                    </div>

                    {/* Dessert Fruit Selector */}
                    <div className="mt-4 pt-3 border-t border-[#eee6da] flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 text-xs text-[#526354] shrink-0 font-semibold">
                        <Apple className="w-4 h-4 text-[#6fa373]" />
                        <span>Postre:</span>
                      </div>
                      <select
                        value={lunchFruit ? lunchFruit.id : ''}
                        onChange={(e) =>
                          handleSelectFruit(dayIdx, 'lunch', e.target.value ? e.target.value : null)
                        }
                        className="text-xs sm:text-sm bg-white border border-[#dfd7c8] rounded-xl px-3 py-1.5 text-[#3b493d] focus:outline-none focus:ring-1 focus:ring-[#6f9072] max-w-[220px]"
                      >
                        <option value="">Seleccionar fruta...</option>
                        {fruits.map((fr) => (
                          <option key={fr.id} value={fr.id}>
                            {fr.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CENA */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ${
                      isFiltering
                        ? dinnerContributes
                          ? 'bg-[#f4f9f4] border-2 border-[#527354] shadow-md ring-2 ring-[#527354]/25 scale-[1.01]'
                          : 'bg-[#faf8f4] border border-[#ede5d8] opacity-35 grayscale-20'
                        : 'bg-[#faf8f4] border border-[#ede5d8]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#647688]">
                            Cena
                          </span>
                          {isFiltering && dinnerContributes && (
                            <span className="text-[10px] uppercase font-bold text-[#2d5230] bg-[#e2ede2] border border-[#b4d6b6] px-2 py-0.5 rounded-full">
                              Colabora
                            </span>
                          )}
                        </div>
                        {dinnerDish && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setActiveSlot({ dayIdx, mealType: 'dinner' })}
                              className="text-[#847866] hover:text-[#425c42] hover:bg-[#eef4ee] transition p-1.5 rounded-lg cursor-pointer"
                              title="Cambiar plato"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleClearSlot(dayIdx, 'dinner')}
                              className="text-[#847866] hover:text-[#c0563b] hover:bg-[#fdeeed] transition p-1.5 rounded-lg cursor-pointer"
                              title="Quitar plato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {dinnerDish ? (
                        <div className="space-y-1.5">
                          <h4 className="text-base font-semibold text-[#2d3831] leading-snug">
                            {dinnerDish.name}
                          </h4>
                          <div className="flex items-center flex-wrap gap-2 text-xs text-[#6e7d72] pt-0.5">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#eaf2ea] text-[#3f5f42] border border-[#d2e3d2] font-medium">
                              {dinnerDish.subcategory}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Flame className="w-3.5 h-3.5 text-[#c0735a]" />
                              <span>{dinnerDish.cookingTechnique}</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveSlot({ dayIdx, mealType: 'dinner' })}
                          className="w-full py-4 border-2 border-dashed border-[#dfd6c6] hover:border-[#6f9072] rounded-2xl text-xs sm:text-sm font-semibold text-[#6d6352] hover:text-[#385338] flex items-center justify-center space-x-2 transition bg-white/60 hover:bg-white"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Seleccionar Plato de Cena</span>
                        </button>
                      )}

                      {dinnerDish && (
                        <button
                          onClick={() => setActiveSlot({ dayIdx, mealType: 'dinner' })}
                          className="mt-2.5 text-xs font-semibold text-[#486e4b] hover:underline block"
                        >
                          Cambiar plato →
                        </button>
                      )}
                    </div>

                    {/* Dessert Fruit Selector */}
                    <div className="mt-4 pt-3 border-t border-[#eee6da] flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 text-xs text-[#526354] shrink-0 font-semibold">
                        <Apple className="w-4 h-4 text-[#6fa373]" />
                        <span>Postre:</span>
                      </div>
                      <select
                        value={dinnerFruit ? dinnerFruit.id : ''}
                        onChange={(e) =>
                          handleSelectFruit(dayIdx, 'dinner', e.target.value ? e.target.value : null)
                        }
                        className="text-xs sm:text-sm bg-white border border-[#dfd7c8] rounded-xl px-3 py-1.5 text-[#3b493d] focus:outline-none focus:ring-1 focus:ring-[#6f9072] max-w-[220px]"
                      >
                        <option value="">Seleccionar fruta...</option>
                        {fruits.map((fr) => (
                          <option key={fr.id} value={fr.id}>
                            {fr.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Live Nutrition Audit Sidebar: Barras horizontales y filtro interactivo de platos */}
        <div className="lg:col-span-1">
          <div
            style={{ top: 'calc(var(--header-height, 77px) + 1rem)' }}
            className="bg-white border border-[#eae3d5] rounded-2xl p-3 sm:p-4 sticky shadow-sm max-h-[calc(100vh-theme(spacing.20))] overflow-y-auto"
          >
            {/* Cabecera compacta con leyenda en una sola línea */}
            <div className="pb-2 border-b border-[#f0eae0]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-[#2d3748]">
                    Control de Ingestas
                  </h3>
                  <p className="text-[10px] text-[#79857d]">
                    Haz clic para ver subcategorías
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#436444] bg-[#eef4ee] px-2 py-0.5 rounded-full border border-[#d7e5d7] shrink-0">
                  {audit.totalMealsPlanned} / 14 platos
                </span>
              </div>

              {/* Leyenda ultra compacta */}
              <div className="flex items-center justify-between text-[10px] text-[#6b7c6f] mt-1.5 pt-1.5 border-t border-[#f4eee6]">
                <span className="inline-flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#1e4622] inline-block"></span>
                  <span>Mínimo</span>
                </span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#9e3f28] inline-block"></span>
                  <span>Máximo</span>
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-[#466649]">
                  <span className="w-2.5 h-1.5 rounded-xs bg-[#cde4cd] border border-[#9fc79f] inline-block"></span>
                  <span>Zona óptima</span>
                </span>
              </div>
            </div>

            <div className="space-y-1.5 mt-2">
              {audit.alerts.map((al) => {
                const isSelected = selectedAuditFilter === al.id;
                const effectiveScaleMax = Math.max(al.scaleMax, al.val, (al.max ?? al.min ?? 1));
                const currentPct = Math.min(100, Math.max(0, Math.round((al.val / effectiveScaleMax) * 100)));

                const hasMin = al.min !== undefined && al.min > 0;
                const hasMax = al.max !== undefined;

                const minPct = hasMin ? Math.min(100, Math.max(0, Math.round((al.min! / effectiveScaleMax) * 100))) : 0;
                const maxPct = hasMax ? Math.min(100, Math.max(0, Math.round((al.max! / effectiveScaleMax) * 100))) : 100;

                const targetZoneLeft = hasMin ? minPct : 0;
                const targetZoneWidth = Math.max(4, (hasMax ? maxPct : 100) - targetZoneLeft);

                return (
                  <div
                    key={al.id}
                    onClick={() => setSelectedAuditFilter(isSelected ? null : al.id)}
                    className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                      al.hasIssue
                        ? isSelected
                          ? 'bg-[#fdf2f0] border-2 border-[#c0563b] ring-2 ring-[#c0563b]/35 shadow-sm'
                          : 'bg-[#fdf4f2] border-2 border-[#d97762] text-[#8a2f1b] ring-1 ring-[#d97762]/25 shadow-xs'
                        : isSelected
                        ? 'bg-[#eef4ee] border-[#527354] ring-2 ring-[#527354] shadow-sm'
                        : al.fulfilled
                        ? 'bg-[#f7faf7] border-[#d7e6d7] hover:border-[#b8d6b8] hover:bg-[#f2f7f2]'
                        : 'bg-[#faf8f4] border-[#eae3d5] hover:border-[#d6cbbb]'
                    }`}
                    title={
                      isSelected
                        ? 'Haz clic para cerrar las subcategorías'
                        : `Haz clic para ver subcategorías de ${al.category}`
                    }
                  >
                    {/* Fila 1: Título, Objetivo al lado del título, Cantidad Actual e Icono de estado */}
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span
                          className={`font-semibold text-xs sm:text-[13px] truncate ${
                            al.hasIssue ? 'text-[#8c2d1b]' : 'text-[#2d3748]'
                          }`}
                        >
                          {al.category}
                        </span>

                        {/* Rango objetivo al lado del título para ahorrar espacio vertical */}
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium shrink-0 ${
                            al.hasIssue
                              ? 'bg-[#fae2df] text-[#8c2d1b] border border-[#f0c0b8]'
                              : 'bg-[#ede7dc] text-[#5e5445] border border-[#dfd6c7]'
                          }`}
                        >
                          {al.min !== undefined && al.max !== undefined
                            ? `${al.min}-${al.max}`
                            : al.min !== undefined
                            ? `≥ ${al.min}`
                            : `≤ ${al.max}`}
                        </span>

                        {isSelected && (
                          <span className="text-[9px] font-bold text-[#2d5230] bg-[#e2ede2] px-1 py-0.2 rounded border border-[#b4d6b6] shrink-0">
                            Activo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span
                          className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold border transition-colors ${
                            al.hasIssue
                              ? 'bg-[#fdeeed] text-[#b03b22] border-[#f4c3ba]'
                              : al.fulfilled
                              ? 'bg-[#eaf4ea] text-[#2d5730] border-[#c2dec2]'
                              : 'bg-[#f5f1e8] text-[#5c5344] border-[#e0d6c4]'
                          }`}
                        >
                          {al.val}
                        </span>
                        {al.hasIssue ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#c0563b] shrink-0" />
                        ) : al.fulfilled ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4a7c4f] shrink-0" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-[#8c7f6b] shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Fila 2: Barra visual con Zona Recomendada y Marcadores de Límite (Pins) */}
                    <div className="relative mt-1.5 h-2.5 w-full bg-[#e8e2d4] rounded-full border border-[#d6cfbe] shadow-inner overflow-visible">
                      {/* Zona objetivo óptima */}
                      <div
                        className="absolute top-0 bottom-0 bg-[#cde4cd] border-y border-[#a8cfa8]/70"
                        style={{
                          left: `${targetZoneLeft}%`,
                          width: `${targetZoneWidth}%`,
                        }}
                      />

                      {/* Barra de progreso actual */}
                      <div
                        className={`h-full rounded-full transition-all duration-300 relative z-10 ${
                          al.hasIssue
                            ? 'bg-[#c0563b]'
                            : al.fulfilled
                            ? 'bg-[#48784d]'
                            : 'bg-[#739477]'
                        }`}
                        style={{ width: `${currentPct}%` }}
                      />

                      {/* Marcador vertical MÍNIMO (solo la línea limpia, sin flechas) */}
                      {hasMin && (
                        <div
                          style={{ left: `${minPct}%` }}
                          className="absolute -top-0.5 -bottom-0.5 w-[2px] bg-[#1e4622] z-20 -translate-x-1/2 pointer-events-none rounded-full shadow-xs"
                          title={`Límite Mínimo: ${al.min}`}
                        />
                      )}

                      {/* Marcador vertical MÁXIMO (solo la línea limpia, sin flechas) */}
                      {hasMax && (
                        <div
                          style={{ left: `${maxPct}%` }}
                          className="absolute -top-0.5 -bottom-0.5 w-[2px] bg-[#9e3f28] z-20 -translate-x-1/2 pointer-events-none rounded-full shadow-xs"
                          title={`Límite Máximo: ${al.max}`}
                        />
                      )}
                    </div>

                    {/* Desplegable de subcategorías al seleccionar el campo (sin mover la pantalla) */}
                    {isSelected && al.subcategories && al.subcategories.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#ded5c5] space-y-1 animate-fade-in cursor-default" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#637267] mb-1">
                          <span>Subcategorías</span>
                          <span>Objetivo / Actual</span>
                        </div>
                        {al.subcategories.map((sub) => {
                          const isSubIssue = sub.underMin || sub.exceeded;
                          return (
                            <div
                              key={sub.name}
                              className={`px-2 py-1 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                isSubIssue
                                  ? 'bg-[#fae6e4] border border-[#e8a397] text-[#93341e] font-semibold shadow-xs'
                                  : 'bg-white/80 border border-[#e6ded2] text-[#424f44]'
                              }`}
                            >
                              <div className="flex items-center space-x-1.5 min-w-0">
                                {isSubIssue ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-[#c0563b] shrink-0" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#7a8c7e] shrink-0" />
                                )}
                                <span className="truncate">{sub.name}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                <span className={`text-[10px] ${isSubIssue ? 'text-[#93341e] font-medium' : 'text-[#717e74]'}`}>
                                  {sub.min !== undefined && sub.max !== undefined
                                    ? `(Obj: ${sub.min}-${sub.max})`
                                    : sub.max !== undefined
                                    ? `(Máx: ${sub.max})`
                                    : `(Mín: ${sub.min})`}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded font-bold text-[11px] ${
                                    isSubIssue
                                      ? 'bg-[#c0563b] text-white'
                                      : 'bg-[#eef2ee] text-[#2f4a32] border border-[#d2dfd2]'
                                  }`}
                                >
                                  {sub.val}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Dish Picker Modal: Portal directo a body, centrado en el viewport sin desplazamiento */}
      {activeSlot &&
        createPortal(
          <div
            onClick={() => setActiveSlot(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-stone-900/25 backdrop-blur-xs cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[85vh] flex flex-col shadow-2xl border border-[#ded5c5] overflow-hidden animate-scale-up cursor-default my-auto"
            >
              
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-[#f0eae0] flex items-center justify-between bg-[#faf8f4] shrink-0">
                <div>
                  <h3 className="font-semibold text-xl text-[#2f3833]">
                    Elegir Plato: {activeSlot.mealType === 'lunch' ? 'Almuerzo' : 'Cena'} del{' '}
                    {DAY_NAMES[activeSlot.dayIdx]}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSlot(null)}
                  className="text-[#847866] hover:text-[#2d3748] p-2 rounded-2xl hover:bg-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Bar */}
              <div className="p-4 sm:p-5 border-b border-[#f0eae0] space-y-3 bg-[#fdfcf9] shrink-0">
                
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8a7f6f] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar plato o ingrediente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-[#dfd7c8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                  />
                </div>

                {/* Categories Pills */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubcategory('all');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#527354] text-white'
                        : 'bg-white border border-[#ded5c5] text-[#554e42] hover:bg-[#f6f2ea]'
                    }`}
                  >
                    Todas las categorías
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory('all');
                      }}
                      className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#527354] text-white'
                          : 'bg-white border border-[#ded5c5] text-[#554e42] hover:bg-[#f6f2ea]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Subcategories if category selected */}
                {activeCategoryObj && (
                  <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pt-1">
                    <span className="text-[#877c6c] shrink-0 font-medium">Subcategoría:</span>
                    <button
                      onClick={() => setSelectedSubcategory('all')}
                      className={`px-2.5 py-0.5 rounded-lg border cursor-pointer ${
                        selectedSubcategory === 'all'
                          ? 'bg-[#e2efe3] text-[#345c37] border-[#bdd6bf] font-semibold'
                          : 'bg-white text-[#6b6252] border-[#ded5c5]'
                      }`}
                    >
                      Todas
                    </button>
                    {activeCategoryObj.subcategories.map((subcat) => (
                      <button
                        key={subcat}
                        onClick={() => setSelectedSubcategory(subcat)}
                        className={`px-2.5 py-0.5 rounded-lg border whitespace-nowrap cursor-pointer ${
                          selectedSubcategory === subcat
                            ? 'bg-[#e2efe3] text-[#345c37] border-[#bdd6bf] font-semibold'
                            : 'bg-white text-[#6b6252] border-[#ded5c5]'
                        }`}
                      >
                        {subcat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dishes List */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
                {filteredDishes.length === 0 ? (
                  <div className="text-center py-10 text-sm text-[#8c8272]">
                    No se encontraron platos con esos filtros.
                  </div>
                ) : (
                  filteredDishes.map((dish) => {
                    const cat = categoryMap[dish.categoryId];
                    return (
                      <div
                        key={dish.id}
                        onClick={() => handleSelectDish(dish.id)}
                        className="p-4 rounded-2xl border border-[#ede5d8] hover:border-[#6f9072] hover:bg-[#f9fbf9] transition cursor-pointer flex items-center justify-between group gap-3"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-base font-semibold text-[#2d3831] group-hover:text-[#425c42] leading-snug">
                            {dish.name}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-[#718074]">
                            <span>{dish.subcategory}</span>
                            <span>•</span>
                            <span>{dish.cookingTechnique}</span>
                          </div>
                        </div>

                        {/* Tipo de alimento fijado junto al botón de Asignar */}
                        <div className="flex items-center space-x-2.5 shrink-0">
                          {cat && (
                            <span
                              className="text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap"
                              style={{ backgroundColor: cat.color.light, color: cat.color.text }}
                            >
                              {cat.name.split(' (')[0]}
                            </span>
                          )}

                          <button className="px-4 py-2 rounded-xl bg-[#f0f5f0] text-[#3f6343] text-xs sm:text-sm font-semibold group-hover:bg-[#527354] group-hover:text-white transition cursor-pointer">
                            Asignar
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#faf8f4] border-t border-[#f0eae0] flex justify-end shrink-0">
                <button
                  onClick={() => setActiveSlot(null)}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#6b6252] hover:bg-white border border-[#dfd7c8] cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

    </div>
  );
};
