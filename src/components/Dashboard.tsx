import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Apple,
  Flame,
  ArrowUpRight,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';
import { CATEGORIES } from '../data/initialData';
import type { Dish, Fruit, WeekPlan } from '../types';
import { DAY_NAMES, getISOWeekInfo } from '../utils/dateUtils';

interface DashboardProps {
  currentWeekPlan: WeekPlan;
  dishesMap: Record<string, Dish>;
  fruitsMap: Record<string, Fruit>;
  onNavigateWeek: (offset: number) => void;
  onResetToCurrentWeek: () => void;
  onSelectDayForDetail: (dayIndex: number) => void;
  onGoToPlanner: () => void;
  onOpenMonthView: () => void;
  onOpenShoppingList: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentWeekPlan,
  dishesMap,
  fruitsMap,
  onNavigateWeek,
  onResetToCurrentWeek,
  onSelectDayForDetail,
  onGoToPlanner,
  onOpenMonthView,
  onOpenShoppingList,
}) => {
  // Determine if the viewed week is the actual current real week
  const [today] = useState(() => new Date());
  const realWeekInfo = getISOWeekInfo(today);
  const isViewingCurrentWeek = currentWeekPlan.weekId === realWeekInfo.weekId;
  const todayDayIdx = (today.getDay() + 6) % 7;

  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  const getDish = (id: string | null) => (id ? dishesMap[id] : null);
  const getFruit = (id: string | null) => (id ? fruitsMap[id] : null);

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-2.5 sm:gap-3 animate-fade-in">
      
      {/* Top Banner: Navigation & Zoom Actions */}
      <div className="bg-[#fcfbf7] border border-[#e8e2d4] rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 shadow-xs shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Week Selector */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateWeek(-1)}
              className="p-2.5 rounded-xl bg-white border border-[#dfd7c8] text-[#554e42] hover:bg-[#f6f2ea] transition shadow-xs cursor-pointer"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#2f3833]">
                Menú de la Semana
              </h2>
              <span className="text-xs uppercase tracking-wider font-bold text-[#507252] bg-[#eef4ee] px-3 py-1 rounded-full border border-[#d6e4d6] inline-flex items-center justify-center leading-none">
                Semana {currentWeekPlan.weekNumber} · {currentWeekPlan.year}
              </span>
            </div>

            <button
              onClick={() => onNavigateWeek(1)}
              className="p-2.5 rounded-xl bg-white border border-[#dfd7c8] text-[#554e42] hover:bg-[#f6f2ea] transition shadow-xs cursor-pointer"
              title="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isViewingCurrentWeek && (
              <button
                onClick={onResetToCurrentWeek}
                className="text-xs text-[#507252] hover:text-[#385139] font-semibold bg-[#eef4ee] hover:bg-[#e2ede2] border border-[#d2e2d2] px-2.5 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
                title="Volver a la semana actual"
              >
                Volver a hoy
              </button>
            )}
          </div>

          {/* Zoom Buttons & Planner Shortcut */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            <button
              onClick={onOpenMonthView}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-white border border-[#dfd7c8] text-[#4f483c] hover:bg-[#f8f5ee] transition text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
              title="Abrir calendario mensual"
            >
              <Calendar className="w-4 h-4 text-[#527354]" />
              <span>Vista Mensual</span>
            </button>

            <button
              onClick={onOpenShoppingList}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-white border border-[#dfd7c8] text-[#4f483c] hover:bg-[#f8f5ee] transition text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
              title="Consultar la lista de la compra con todos los ingredientes de esta semana"
            >
              <ShoppingCart className="w-4 h-4 text-[#527354]" />
              <span>Lista de la Compra</span>
            </button>

            <button
              onClick={onGoToPlanner}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4.5 py-2 rounded-xl bg-[#527354] hover:bg-[#435e45] text-white transition text-xs sm:text-sm font-semibold shadow-sm cursor-pointer"
            >
              <span>Editar en Planificador</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7 Days of the Week: Se adapta a la altura exacta de la pantalla SIN scroll */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {Array.from({ length: 7 }, (_, dayIdx) => {
          const dayPlan = currentWeekPlan.days[dayIdx];
          const isToday = isViewingCurrentWeek && dayIdx === todayDayIdx;

          const lunchDish = getDish(dayPlan?.lunch?.dishId);
          const lunchFruit = getFruit(dayPlan?.lunch?.fruitId);
          const dinnerDish = getDish(dayPlan?.dinner?.dishId);
          const dinnerFruit = getFruit(dayPlan?.dinner?.fruitId);

          const lunchCategory = lunchDish ? categoryMap[lunchDish.categoryId] : null;
          const dinnerCategory = dinnerDish ? categoryMap[dinnerDish.categoryId] : null;

          return (
            <div
              key={dayIdx}
              onClick={() => onSelectDayForDetail(dayIdx)}
              className={`flex flex-col justify-between h-full min-h-0 rounded-2xl p-3 sm:p-3.5 cursor-pointer transition-all duration-200 border text-left hover:shadow-lg ${
                isToday
                  ? 'bg-[#f4f7f4] border-[#709572] ring-2 ring-[#709572]/20 shadow-xs'
                  : 'bg-white border-[#e8e1d2] hover:border-[#8cb08e]'
              }`}
            >
              {/* Day Header */}
              <div className="shrink-0 flex items-center justify-between pb-2 mb-1.5 border-b border-[#eee7da]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#637265] block leading-tight">
                    {DAY_NAMES[dayIdx]}
                  </span>
                  <div className="text-sm sm:text-base font-bold text-[#2d3748] mt-0.5">
                    {dayPlan ? dayPlan.dateStr.split('-').slice(1).reverse().join('/') : ''}
                  </div>
                </div>
                {isToday && (
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#527354] text-white shrink-0">
                    Hoy
                  </span>
                )}
              </div>

              {/* Day Content */}
              <div className="flex-1 min-h-0 flex flex-col justify-between gap-2">
                
                {/* ALMUERZO */}
                <div className="flex-1 min-h-0 bg-[#fbf9f5] rounded-xl p-2.5 sm:p-3 border border-[#eee6d8] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8b7965]">
                        Almuerzo
                      </span>
                    </div>

                    {lunchCategory && (
                      <div className="mb-1">
                        <span
                          className="inline-block text-[10.5px] px-2 py-0.5 rounded-md font-semibold leading-tight"
                          style={{
                            backgroundColor: lunchCategory.color.light,
                            color: lunchCategory.color.text,
                          }}
                        >
                          {lunchDish?.subcategory || lunchCategory.name}
                        </span>
                      </div>
                    )}

                    {lunchDish ? (
                      <div className="space-y-0.5">
                        <p className="text-[13px] sm:text-[13.5px] font-semibold text-[#27352a] leading-snug line-clamp-2">
                          {lunchDish.name}
                        </p>
                        <div className="flex items-center space-x-1.5 text-[11px] text-[#708073]">
                          <Flame className="w-3.5 h-3.5 text-[#c0735a] shrink-0" />
                          <span className="truncate">{lunchDish.cookingTechnique}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#a09a8f] italic py-1">Sin comida asignada</p>
                    )}
                  </div>

                  {/* Dessert Fruit */}
                  <div className="mt-1.5 pt-1.5 border-t border-[#f0eade] flex items-center space-x-1.5 text-[11.5px] text-[#4d6350] shrink-0">
                    <Apple className="w-3.5 h-3.5 text-[#6fa373] shrink-0" />
                    <span className="font-medium truncate">
                      {lunchFruit ? lunchFruit.name : 'Sin fruta'}
                    </span>
                  </div>
                </div>

                {/* CENA */}
                <div className="flex-1 min-h-0 bg-[#fbf9f5] rounded-xl p-2.5 sm:p-3 border border-[#eee6d8] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#697b8b]">
                        Cena
                      </span>
                    </div>

                    {dinnerCategory && (
                      <div className="mb-1">
                        <span
                          className="inline-block text-[10.5px] px-2 py-0.5 rounded-md font-semibold leading-tight"
                          style={{
                            backgroundColor: dinnerCategory.color.light,
                            color: dinnerCategory.color.text,
                          }}
                        >
                          {dinnerDish?.subcategory || dinnerCategory.name}
                        </span>
                      </div>
                    )}

                    {dinnerDish ? (
                      <div className="space-y-0.5">
                        <p className="text-[13px] sm:text-[13.5px] font-semibold text-[#27352a] leading-snug line-clamp-2">
                          {dinnerDish.name}
                        </p>
                        <div className="flex items-center space-x-1.5 text-[11px] text-[#708073]">
                          <Flame className="w-3.5 h-3.5 text-[#c0735a] shrink-0" />
                          <span className="truncate">{dinnerDish.cookingTechnique}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#a09a8f] italic py-1">Sin comida asignada</p>
                    )}
                  </div>

                  {/* Dessert Fruit */}
                  <div className="mt-1.5 pt-1.5 border-t border-[#f0eade] flex items-center space-x-1.5 text-[11.5px] text-[#4d6350] shrink-0">
                    <Apple className="w-3.5 h-3.5 text-[#6fa373] shrink-0" />
                    <span className="font-medium truncate">
                      {dinnerFruit ? dinnerFruit.name : 'Sin fruta'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Footer hint */}
              <div className="shrink-0 mt-2 pt-1.5 text-xs text-[#527354] font-semibold text-center flex items-center justify-center space-x-1 border-t border-[#f1ebe0]">
                <span>Ver resumen del día</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#7aa07c]" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
