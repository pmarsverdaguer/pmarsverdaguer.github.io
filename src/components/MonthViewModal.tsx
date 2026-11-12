import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Dish, Fruit, WeekPlan } from '../types';
import { DAY_NAMES, MONTH_NAMES, getISOWeekInfo, getMondayOfWeek } from '../utils/dateUtils';

interface MonthViewModalProps {
  currentWeekPlan: WeekPlan;
  allPlans: Record<string, WeekPlan>;
  dishesMap: Record<string, Dish>;
  fruitsMap: Record<string, Fruit>;
  onClose: () => void;
  onSelectWeekAndDay: (weekId: string, dayIndex: number) => void;
}

export const MonthViewModal: React.FC<MonthViewModalProps> = ({
  currentWeekPlan,
  allPlans,
  dishesMap,
  onClose,
  onSelectWeekAndDay,
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Calendar month state
  const [displayedDate, setDisplayedDate] = useState(() => {
    const [y, m] = currentWeekPlan.startDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const year = displayedDate.getFullYear();
  const month = displayedDate.getMonth();

  const handlePrevMonth = () => {
    setDisplayedDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayedDate(new Date(year, month + 1, 1));
  };

  // Build the weeks that belong to this month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startWeekInfo = getISOWeekInfo(firstDayOfMonth);

  // Collect weeks for this month
  const weeksList: Array<{
    weekNumber: number;
    year: number;
    weekId: string;
    days: Array<{
      date: Date;
      dateStr: string;
      dayNumber: number;
      dayOfWeek: number;
      isInCurrentMonth: boolean;
    }>;
  }> = [];

  // Iterate from start Monday to end Sunday
  const curMonday = getMondayOfWeek(startWeekInfo.year, startWeekInfo.week);

  while (curMonday <= lastDayOfMonth || weeksList.length < 4) {
    const { week: wNum, year: wYear, weekId: wId } = getISOWeekInfo(curMonday);

    const days = Array.from({ length: 7 }, (_, dIdx) => {
      const d = new Date(curMonday);
      d.setDate(curMonday.getDate() + dIdx);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');

      return {
        date: d,
        dateStr: `${yStr}-${mStr}-${dayStr}`,
        dayNumber: d.getDate(),
        dayOfWeek: dIdx,
        isInCurrentMonth: d.getMonth() === month,
      };
    });

    weeksList.push({
      weekNumber: wNum,
      year: wYear,
      weekId: wId,
      days,
    });

    // Advance 7 days
    curMonday.setDate(curMonday.getDate() + 7);

    if (weeksList.length >= 6) break;
  }

  const [todayStr] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-stone-900/30 backdrop-blur-xs cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl max-w-[1460px] w-full h-[94vh] sm:h-[92vh] max-h-[94vh] shadow-2xl border border-[#ded5c5] overflow-hidden animate-scale-up flex flex-col cursor-default my-auto"
      >
        {/* Header with Month Navigation */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-[#eee7da] bg-[#faf8f4] flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="min-w-0">
              <h3 className="text-base sm:text-2xl font-semibold text-[#2f3833] truncate">
                {MONTH_NAMES[month]} {year}
              </h3>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 ml-1 sm:ml-3">
              <button
                onClick={handlePrevMonth}
                className="p-1 sm:p-1.5 rounded-xl bg-white border border-[#ded5c5] text-[#554e42] hover:bg-[#f6f2ea] transition shadow-xs cursor-pointer active:scale-95"
                title="Mes anterior"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 sm:p-1.5 rounded-xl bg-white border border-[#ded5c5] text-[#554e42] hover:bg-[#f6f2ea] transition shadow-xs cursor-pointer active:scale-95"
                title="Mes siguiente"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#847866] hover:text-[#2d3748] p-1.5 sm:p-2 rounded-2xl hover:bg-white transition cursor-pointer shrink-0"
            title="Cerrar (Esc)"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Month View for phones & tablets */}
        <div className="flex-1 flex flex-col bg-[#fdfcfb] overflow-x-auto overflow-y-auto">
          <div className="min-w-[620px] sm:min-w-0 flex-1 flex flex-col h-full">
            {/* 7 Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-[#eee7da] bg-[#fbf9f4] text-center text-xs font-bold text-[#685c4c] py-2 shrink-0">
              {DAY_NAMES.map((name) => (
                <div key={name} className="uppercase tracking-wider">
                  <span className="hidden sm:inline">{name}</span>
                  <span className="sm:hidden">{name.slice(0, 3)}</span>
                </div>
              ))}
            </div>

            {/* Table/Matrix of the Month: Each row is an elegant week */}
            <div className="flex-1 flex flex-col divide-y divide-[#eee7da] bg-[#fdfcfb]">
              {weeksList.map((week) => {
                const plan = allPlans[week.weekId] || (week.weekId === currentWeekPlan.weekId ? currentWeekPlan : null);

                return (
                  <div
                    key={week.weekId}
                    className="flex-1 grid grid-cols-7 divide-x divide-[#eee7da] min-h-[85px] sm:min-h-0"
                  >
                    {week.days.map((dayItem) => {
                      const daySlot = plan?.days ? plan.days[dayItem.dayOfWeek] : null;
                      const lunchDish = daySlot?.lunch?.dishId ? dishesMap[daySlot.lunch.dishId] : null;
                      const dinnerDish = daySlot?.dinner?.dishId ? dishesMap[daySlot.dinner.dishId] : null;

                      const hasMeals = !!(lunchDish || dinnerDish);
                      const isToday = dayItem.dateStr === todayStr;

                      return (
                        <div
                          key={dayItem.dateStr}
                          onClick={() => {
                            onSelectWeekAndDay(week.weekId, dayItem.dayOfWeek);
                            onClose();
                          }}
                          className={`p-1.5 sm:p-2.5 transition-all cursor-pointer flex flex-col justify-between hover:bg-[#f7faf7] active:bg-[#edf5ed] ${
                            !dayItem.isInCurrentMonth
                              ? 'bg-[#fcfbfa]/50 opacity-40'
                              : isToday
                              ? 'bg-[#f2f7f2] ring-1 ring-[#709572]/30'
                              : 'bg-white'
                          }`}
                        >
                          {/* Day Number Header */}
                          <div className="flex items-center justify-between pb-1 shrink-0">
                            <span
                              className={`text-xs font-bold ${
                                isToday
                                  ? 'w-5 h-5 rounded-full bg-[#527354] text-white flex items-center justify-center text-[10px]'
                                  : dayItem.isInCurrentMonth
                                  ? 'text-[#2d3831]'
                                  : 'text-[#9b9487]'
                              }`}
                            >
                              {dayItem.dayNumber}
                            </span>

                            {hasMeals && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#698b69]" />
                            )}
                          </div>

                          {/* Clean Meals Display: Comida & Cena */}
                          <div className="flex-1 flex flex-col justify-center space-y-1 my-0.5 overflow-hidden">
                            {hasMeals ? (
                              <>
                                {lunchDish ? (
                                  <div className="text-[11px] leading-tight" title={`Comida: ${lunchDish.name}`}>
                                    <span className="text-[10px] font-bold text-[#8b7965] uppercase mr-1">
                                      C:
                                    </span>
                                    <span className="font-semibold text-[#2b352e] truncate inline">
                                      {lunchDish.name}
                                    </span>
                                  </div>
                                ) : null}

                                {dinnerDish ? (
                                  <div className="text-[11px] leading-tight" title={`Cena: ${dinnerDish.name}`}>
                                    <span className="text-[10px] font-bold text-[#647688] uppercase mr-1">
                                      N:
                                    </span>
                                    <span className="font-semibold text-[#2b352e] truncate inline">
                                      {dinnerDish.name}
                                    </span>
                                  </div>
                                ) : null}
                              </>
                            ) : (
                              <div className="text-[10px] text-[#a89f91] italic py-0.5">
                                Sin plan
                              </div>
                            )}
                          </div>

                          {/* Week label hint */}
                          <div className="text-[9px] text-[#9c9384] text-right truncate shrink-0">
                            S.{week.weekNumber}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#faf8f4] border-t border-[#eee7da] flex justify-between items-center text-xs text-[#738075] shrink-0 gap-2">
          <span className="truncate text-[11px] sm:text-xs">Toca un día para abrirlo en el planificador</span>
          <button
            onClick={onClose}
            className="px-3 sm:px-5 py-1.5 rounded-xl text-xs font-semibold bg-[#527354] text-white hover:bg-[#435e45] transition cursor-pointer shrink-0 active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
