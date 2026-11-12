import React, { useState, useEffect } from 'react';
import {
  Apple,
  Flame,
  X,
  Clock,
  ArrowRight,
  ArrowLeft,
  ListOrdered,
  Lightbulb,
  Check,
  Egg,
  Salad,
  Waves,
  Droplet,
  ExternalLink,
  Plus,
  Minus,
  Users,
} from 'lucide-react';
import { CATEGORIES } from '../data/initialData';
import type { DayPlan, Dish, Fruit } from '../types';
import { DAY_NAMES } from '../utils/dateUtils';
import { getDishIngredients, formatScaledIngredient } from '../utils/recipeUtils';

// Icono SVG nítido para Setas y Hongos
const MushroomIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a9 9 0 0 0-9 8.5c0 1.2.9 2 2 2h14c1.1 0 2-.8 2-2A9 9 0 0 0 12 3z" />
    <path d="M10 13.5v5.5a2 2 0 0 0 4 0v-5.5" />
    <circle cx="8.5" cy="8" r="1" fill="currentColor" />
    <circle cx="15.5" cy="9" r="1" fill="currentColor" />
  </svg>
);

// Icono SVG nítido para Tubérculos y Raíces
const TuberIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="12" rx="9" ry="6.5" transform="rotate(-15 12 12)" />
    <circle cx="8.5" cy="11.5" r="0.75" fill="currentColor" />
    <circle cx="14" cy="13.5" r="0.75" fill="currentColor" />
    <circle cx="11.5" cy="14" r="0.75" fill="currentColor" />
  </svg>
);

// Función auxiliar para obtener consejos de preparación (personalizados o recomendados)
const getCookingTip = (dish: Dish): string => {
  if (dish.cookingTips && dish.cookingTips.trim()) {
    return dish.cookingTips.trim();
  }
  if (dish.categoryId === 'mar') {
    return 'Cocinar a fuego moderado para proteger los ácidos grasos omega 3 (EPA y DHA). Terminar con un chorrito de AOVE en crudo al servir para realzar el sabor y la absorción de nutrientes.';
  }
  if (dish.categoryId === 'carne') {
    return 'Cocinar a temperatura media sin tostar ni quemar en exceso la superficie. Dejar reposar 1 o 2 minutos antes de cortar para que los jugos se redistribuyan de forma homogénea.';
  }
  if (dish.categoryId === 'huevos') {
    return 'Cocinar a fuego lento o medio-bajo para no sobrecocinar la proteína y mantener la biodisponibilidad de la colina y vitaminas de la yema.';
  }
  if (dish.categoryId === 'legumbres') {
    return 'Añadir una hoja de laurel, comino o alga kombu durante la cocción para ablandar las fibras y favorecer una digestión suave y ligera.';
  }
  if (dish.categoryId === 'verduras') {
    return 'Mantener un punto al dente (vapor o salteado breve) para conservar al máximo la vitamina C, los antioxidantes y la fibra prebiótica.';
  }
  return 'Acompañar con aceite de oliva virgen extra en crudo para potenciar la asimilación de los nutrientes y proteger la mucosa gástrica.';
};

interface DayDetailModalProps {
  dayPlan: DayPlan;
  dayIndex: number;
  dishesMap: Record<string, Dish>;
  fruitsMap: Record<string, Fruit>;
  onClose: () => void;
  onEditDayInPlanner: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  dayPlan,
  dayIndex,
  dishesMap,
  fruitsMap,
  onClose,
  onEditDayInPlanner,
}) => {
  const [selectedDishInfo, setSelectedDishInfo] = useState<{
    dish: Dish;
    mealType: 'Almuerzo' | 'Cena';
  } | null>(null);

  const [recipeServings, setRecipeServings] = useState<number>(2);

  const handleSelectDishForCooking = (dish: Dish, mealType: 'Almuerzo' | 'Cena') => {
    setSelectedDishInfo({ dish, mealType });
    setRecipeServings(dish.servings || 2);
    setCompletedSteps({});
  };

  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDishInfo) {
          setSelectedDishInfo(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, selectedDishInfo]);

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
  const lunchDish = dayPlan.lunch.dishId ? dishesMap[dayPlan.lunch.dishId] : null;
  const lunchFruit = dayPlan.lunch.fruitId ? fruitsMap[dayPlan.lunch.fruitId] : null;
  const dinnerDish = dayPlan.dinner.dishId ? dishesMap[dayPlan.dinner.dishId] : null;
  const dinnerFruit = dayPlan.dinner.fruitId ? fruitsMap[dayPlan.dinner.fruitId] : null;

  const lunchCat = lunchDish ? categoryMap[lunchDish.categoryId] : null;
  const dinnerCat = dinnerDish ? categoryMap[dinnerDish.categoryId] : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-stone-900/40 backdrop-blur-xs cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl sm:rounded-3xl w-full shadow-2xl border border-[#ded5c5] overflow-hidden animate-scale-up cursor-default my-auto flex flex-col max-h-[92vh] sm:max-h-[90vh] ${
          selectedDishInfo ? 'max-w-2xl' : 'max-w-4xl'
        }`}
      >
        {/* ======================================================== */}
        {/* VISTA 1: RECETA COMPLETA PARA SEGUIR (CUANDO HAY PLATO SELECCIONADO) */}
        {/* ======================================================== */}
        {selectedDishInfo ? (
          <>
            {/* Header de la Receta */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#f0eae0] bg-[#faf8f4] flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDishInfo(null);
                    setCompletedSteps({});
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#dfd6c6] text-[#554a39] hover:bg-[#f3ede3] transition text-xs font-semibold cursor-pointer"
                  title="Volver al resumen del día"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al día</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      selectedDishInfo.mealType === 'Almuerzo'
                        ? 'bg-[#f7f0e6] text-[#8b7965]'
                        : 'bg-[#eaf0f5] text-[#4a6782]'
                    }`}
                  >
                    {selectedDishInfo.mealType}
                  </span>
                  {categoryMap[selectedDishInfo.dish.categoryId] && (
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: categoryMap[selectedDishInfo.dish.categoryId].color.light,
                        color: categoryMap[selectedDishInfo.dish.categoryId].color.text,
                      }}
                    >
                      {categoryMap[selectedDishInfo.dish.categoryId].name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `${window.location.origin}${window.location.pathname}?recipe=${encodeURIComponent(
                        selectedDishInfo.dish.id
                      )}`,
                      '_blank'
                    )
                  }
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#dfd6c6] text-[#425c44] hover:bg-[#eef4ee] hover:border-[#b8d6b8] transition text-xs font-semibold cursor-pointer shadow-2xs"
                  title="Abrir receta en una pestaña independiente para no perderla si actualizas la página"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#527354]" />
                  <span>Abrir en otra pestaña</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#847866] hover:text-[#2d3748] p-2 rounded-2xl hover:bg-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo de la Receta con Scroll suave */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Título y descripción */}
              <div>
                <span className="text-xs text-[#7d8c80] font-medium block">
                  {selectedDishInfo.dish.subcategory} · {DAY_NAMES[dayIndex]}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#2d3831] mt-1 leading-snug">
                  {selectedDishInfo.dish.name}
                </h3>
                {selectedDishInfo.dish.description && (
                  <p className="text-xs sm:text-sm text-[#665e52] mt-1.5 leading-relaxed">
                    {selectedDishInfo.dish.description}
                  </p>
                )}
              </div>

              {/* Métricas: Técnica y Tiempo */}
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 rounded-2xl bg-[#fdfbf7] border border-[#ede6d9] flex items-center space-x-2.5">
                  <Flame className="w-4 h-4 text-[#c0735a] shrink-0" />
                  <div>
                    <span className="text-[#807666] text-[11px] block">Técnica:</span>
                    <span className="font-semibold text-[#2d3831]">{selectedDishInfo.dish.cookingTechnique}</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#fdfbf7] border border-[#ede6d9] flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-[#6e8a71] shrink-0" />
                  <div>
                    <span className="text-[#807666] text-[11px] block">Tiempo estimado:</span>
                    <span className="font-semibold text-[#2d3831]">~{selectedDishInfo.dish.preparationTime} min</span>
                  </div>
                </div>
              </div>

              {/* Ingredientes Clave escalados por comensales */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-xs uppercase font-semibold text-[#807666] tracking-wider block">
                    Ingredientes ({recipeServings} {recipeServings === 1 ? 'persona' : 'personas'})
                  </span>
                  <div className="flex items-center space-x-1.5 bg-[#f4f7f4] border border-[#d6e5d6] rounded-xl px-2 py-0.5 text-xs font-semibold text-[#2f4232]">
                    <Users className="w-3.5 h-3.5 text-[#507252]" />
                    <button
                      type="button"
                      onClick={() => setRecipeServings((prev) => Math.max(1, prev - 1))}
                      className="p-1 hover:bg-[#e2ede2] rounded-lg transition text-[#405c44] cursor-pointer"
                      title="Restar comensal"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="min-w-20 text-center select-none font-bold text-xs text-[#2c3d2e]">
                      {recipeServings} {recipeServings === 1 ? 'persona' : 'personas'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRecipeServings((prev) => Math.min(20, prev + 1))}
                      className="p-1 hover:bg-[#e2ede2] rounded-lg transition text-[#405c44] cursor-pointer"
                      title="Añadir comensal"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getDishIngredients(selectedDishInfo.dish).map((ing, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-xl bg-[#f4f7f4] text-[#3e5241] border border-[#d8e6d8] font-medium"
                    >
                      {formatScaledIngredient(ing, recipeServings, selectedDishInfo.dish.servings || 2)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Alimentos Complementarios con iconos SVG nítidos */}
              {(selectedDishInfo.dish.hasEggs ||
                (selectedDishInfo.dish.eggCount !== undefined && selectedDishInfo.dish.eggCount > 0) ||
                selectedDishInfo.dish.hasVegetables ||
                selectedDishInfo.dish.hasMushrooms ||
                selectedDishInfo.dish.containsMushrooms ||
                selectedDishInfo.dish.hasTubers ||
                selectedDishInfo.dish.hasSeaweed ||
                selectedDishInfo.dish.hasOliveOil) && (
                <div>
                  <span className="text-xs uppercase font-semibold text-[#807666] tracking-wider block mb-2">
                    Aportes Complementarios
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(selectedDishInfo.dish.hasEggs ||
                      (selectedDishInfo.dish.eggCount !== undefined && selectedDishInfo.dish.eggCount > 0)) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fdf8eb] text-[#856b28] border border-[#eddba4] font-medium">
                        <Egg className="w-3.5 h-3.5 text-[#b5973b] shrink-0" />
                        <span>
                          {selectedDishInfo.dish.eggCount && selectedDishInfo.dish.eggCount > 0
                            ? `${selectedDishInfo.dish.eggCount} huevos`
                            : 'Huevos'}
                        </span>
                      </span>
                    )}
                    {(selectedDishInfo.dish.hasVegetables ||
                      (selectedDishInfo.dish.vegetableTypes && selectedDishInfo.dish.vegetableTypes.length > 0)) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f0f7f1] text-[#3d6e42] border border-[#d2e6d5] font-medium">
                        <Salad className="w-3.5 h-3.5 text-[#3d6e42] shrink-0" />
                        <span>Verduras</span>
                      </span>
                    )}
                    {(selectedDishInfo.dish.hasMushrooms || selectedDishInfo.dish.containsMushrooms) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#faf5f0] text-[#7d5e3c] border border-[#e8d5c4] font-medium">
                        <MushroomIcon className="w-3.5 h-3.5 text-[#7d5e3c] shrink-0" />
                        <span>Setas y hongos</span>
                      </span>
                    )}
                    {selectedDishInfo.dish.hasTubers && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fdf5f0] text-[#915632] border border-[#ebd2c3] font-medium">
                        <TuberIcon className="w-3.5 h-3.5 text-[#915632] shrink-0" />
                        <span>Tubérculos</span>
                      </span>
                    )}
                    {selectedDishInfo.dish.hasSeaweed && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f0f6f8] text-[#2c6175] border border-[#c4e0eb] font-medium">
                        <Waves className="w-3.5 h-3.5 text-[#2c6175] shrink-0" />
                        <span>Algas</span>
                      </span>
                    )}
                    {selectedDishInfo.dish.hasOliveOil && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f8f9f0] text-[#636e2f] border border-[#e0e5be] font-medium">
                        <Droplet className="w-3.5 h-3.5 text-[#636e2f] shrink-0" />
                        <span>AOVE</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* MODO DE PREPARACIÓN */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs uppercase font-semibold text-[#807666] tracking-wider flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-[#527354]" />
                    <span>Modo de preparación</span>
                  </span>
                  <span className="text-[11px] text-[#7d8c80] font-medium">
                    {Object.values(completedSteps).filter(Boolean).length} de{' '}
                    {selectedDishInfo.dish.steps && selectedDishInfo.dish.steps.length > 0
                      ? selectedDishInfo.dish.steps.length
                      : 3}{' '}
                    completados
                  </span>
                </div>

                {selectedDishInfo.dish.steps && selectedDishInfo.dish.steps.length > 0 ? (
                  <ol className="space-y-2.5">
                    {selectedDishInfo.dish.steps.map((step, idx) => {
                      const isDone = Boolean(completedSteps[idx]);
                      return (
                        <li
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className={`flex items-start space-x-3 text-xs sm:text-sm p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                            isDone
                              ? 'bg-[#f4f8f4] border-[#b8d6b8] text-[#556957]'
                              : 'bg-[#faf8f4] border-[#ede5d8] text-[#2d3831] hover:bg-white hover:border-[#cfdcce]'
                          }`}
                        >
                          <button
                            type="button"
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isDone
                                ? 'bg-[#527354] text-white shadow-2xs'
                                : 'bg-white text-[#527354] border border-[#c4d8c4]'
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                          </button>
                          <span className={`leading-relaxed flex-1 ${isDone ? 'line-through opacity-80' : ''}`}>
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <ol className="space-y-2.5">
                    {[
                      `Preparar y limpiar los ingredientes (${selectedDishInfo.dish.ingredients.join(', ')}).`,
                      `Cocinar aplicando la técnica recomendada: ${selectedDishInfo.dish.cookingTechnique} (~${selectedDishInfo.dish.preparationTime} min).`,
                      'Servir al momento y aderezar al gusto con un hilo de AOVE en crudo.'
                    ].map((step, idx) => {
                      const isDone = Boolean(completedSteps[idx]);
                      return (
                        <li
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className={`flex items-start space-x-3 text-xs sm:text-sm p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                            isDone
                              ? 'bg-[#f4f8f4] border-[#b8d6b8] text-[#556957]'
                              : 'bg-[#faf8f4] border-[#ede5d8] text-[#2d3831] hover:bg-white hover:border-[#cfdcce]'
                          }`}
                        >
                          <button
                            type="button"
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isDone
                                ? 'bg-[#527354] text-white shadow-2xs'
                                : 'bg-white text-[#527354] border border-[#c4d8c4]'
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                          </button>
                          <span className={`leading-relaxed flex-1 ${isDone ? 'line-through opacity-80' : ''}`}>
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>

              {/* Consejos de Preparación y Notas (Al final del todo) */}
              <div className="p-4 bg-[#fdfbf2] border border-[#ede4cb] rounded-2xl flex items-start space-x-3 shadow-2xs mt-1">
                <div className="w-8 h-8 rounded-xl bg-[#faedd2] border border-[#ebd8b0] flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 text-[#a87a1d]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-[#7a5c1a] uppercase tracking-wide block">
                    Consejos de preparación
                  </span>
                  <p className="text-xs sm:text-sm text-[#665426] mt-1 leading-relaxed">
                    {getCookingTip(selectedDishInfo.dish)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer de la Receta */}
            <div className="px-6 py-3.5 bg-[#faf8f4] border-t border-[#f0eae0] flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedDishInfo(null);
                  setCompletedSteps({});
                }}
                className="text-xs sm:text-sm font-semibold text-[#507252] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al día</span>
              </button>

              <div className="flex items-center space-x-2">
                {/* Switch rápido al otro plato del día */}
                {selectedDishInfo.mealType === 'Almuerzo' && dinnerDish && (
                  <button
                    type="button"
                    onClick={() => handleSelectDishForCooking(dinnerDish, 'Cena')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#dfd7c8] text-[#4f483c] hover:bg-[#f6f2ea] transition cursor-pointer"
                  >
                    Ver Cena →
                  </button>
                )}
                {selectedDishInfo.mealType === 'Cena' && lunchDish && (
                  <button
                    type="button"
                    onClick={() => handleSelectDishForCooking(lunchDish, 'Almuerzo')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#dfd7c8] text-[#4f483c] hover:bg-[#f6f2ea] transition cursor-pointer"
                  >
                    ← Ver Almuerzo
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#527354] text-white hover:bg-[#435e45] transition cursor-pointer shadow-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ======================================================== */
          /* VISTA 2: RESUMEN DEL DÍA (ALMUERZO & CENA)               */
          /* ======================================================== */
          <>
            {/* Header del Día */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#f0eae0] bg-[#faf8f4] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg sm:text-2xl font-semibold text-[#2f3833]">
                  {DAY_NAMES[dayIndex]} · {dayPlan.dateStr}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[#847866] hover:text-[#2d3748] p-1.5 sm:p-2 rounded-2xl hover:bg-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2 Columnas: Almuerzo & Cena (Scrollable on small screens) */}
            <div className="p-3.5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 bg-[#fdfcfb] overflow-y-auto flex-1">
              {/* ALMUERZO */}
              <div
                onClick={() => {
                  if (lunchDish) handleSelectDishForCooking(lunchDish, 'Almuerzo');
                }}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between shadow-xs transition ${
                  lunchDish
                    ? 'border-[#eae3d5] hover:border-[#527354] hover:shadow-md cursor-pointer group'
                    : 'border-[#eae3d5]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8b7965] bg-[#f7f0e6] px-3 py-1 rounded-full">
                      Almuerzo
                    </span>
                    {lunchCat && (
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-md font-semibold"
                        style={{ backgroundColor: lunchCat.color.light, color: lunchCat.color.text }}
                      >
                        {lunchCat.name}
                      </span>
                    )}
                  </div>

                  {lunchDish ? (
                    <>
                      <div>
                        <h4 className="text-lg font-semibold text-[#2d3831] leading-snug group-hover:text-[#436444] transition">
                          {lunchDish.name}
                        </h4>
                        {lunchDish.description && (
                          <p className="text-xs text-[#7d7363] mt-1 line-clamp-2 leading-relaxed">
                            {lunchDish.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs sm:text-sm text-[#5f6f62]">
                        <span className="flex items-center space-x-1">
                          <Flame className="w-4 h-4 text-[#c0735a]" />
                          <span>{lunchDish.cookingTechnique}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-[#6e8a71]" />
                          <span>~{lunchDish.preparationTime} min</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {lunchDish.ingredients.map((ing, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-0.5 rounded-lg bg-[#f6f9f6] text-[#3e5241] border border-[#d9e8d9]"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[#9c9384] italic py-6 text-center">
                      Sin comida asignada
                    </p>
                  )}
                </div>

                {/* Parte inferior fija: Botón Seguir Receta + Fruta */}
                <div className="mt-4 pt-3 space-y-3">
                  {lunchDish && (
                    <div className="flex items-center space-x-1.5">
                      <span className="flex-1 py-2 px-3 rounded-xl bg-[#f2f7f2] group-hover:bg-[#527354] text-[#3e5e40] group-hover:text-white transition text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-2xs">
                        <ListOrdered className="w-3.5 h-3.5" />
                        <span>Seguir receta →</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `${window.location.origin}${window.location.pathname}?recipe=${encodeURIComponent(
                              lunchDish.id
                            )}`,
                            '_blank'
                          );
                        }}
                        className="p-2 rounded-xl bg-white border border-[#ded5c5] hover:bg-[#eef4ee] hover:border-[#b8d6b8] text-[#527354] transition cursor-pointer shadow-2xs"
                        title="Abrir receta en otra pestaña"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Fruta */}
                  <div className="pt-3 border-t border-[#f0eae0] flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center space-x-1.5 text-[#4e5e50] font-semibold">
                      <Apple className="w-4 h-4 text-[#6fa373]" />
                      <span>Fruta:</span>
                    </div>
                    <strong className="text-[#2d3831]">
                      {lunchFruit ? lunchFruit.name : 'Sin fruta asignada'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* CENA */}
              <div
                onClick={() => {
                  if (dinnerDish) handleSelectDishForCooking(dinnerDish, 'Cena');
                }}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between shadow-xs transition ${
                  dinnerDish
                    ? 'border-[#eae3d5] hover:border-[#4a6b82] hover:shadow-md cursor-pointer group'
                    : 'border-[#eae3d5]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#697b8b] bg-[#eaf0f5] px-3 py-1 rounded-full">
                      Cena
                    </span>
                    {dinnerCat && (
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-md font-semibold"
                        style={{ backgroundColor: dinnerCat.color.light, color: dinnerCat.color.text }}
                      >
                        {dinnerCat.name}
                      </span>
                    )}
                  </div>

                  {dinnerDish ? (
                    <>
                      <div>
                        <h4 className="text-lg font-semibold text-[#2d3831] leading-snug group-hover:text-[#385b73] transition">
                          {dinnerDish.name}
                        </h4>
                        {dinnerDish.description && (
                          <p className="text-xs text-[#7d7363] mt-1 line-clamp-2 leading-relaxed">
                            {dinnerDish.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs sm:text-sm text-[#5f6f62]">
                        <span className="flex items-center space-x-1">
                          <Flame className="w-4 h-4 text-[#c0735a]" />
                          <span>{dinnerDish.cookingTechnique}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-[#6e8a71]" />
                          <span>~{dinnerDish.preparationTime} min</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dinnerDish.ingredients.map((ing, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-0.5 rounded-lg bg-[#f6f9f6] text-[#3e5241] border border-[#d9e8d9]"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[#9c9384] italic py-6 text-center">
                      Sin comida asignada
                    </p>
                  )}
                </div>

                {/* Parte inferior fija: Botón Seguir Receta + Fruta */}
                <div className="mt-4 pt-3 space-y-3">
                  {dinnerDish && (
                    <div className="flex items-center space-x-1.5">
                      <span className="flex-1 py-2 px-3 rounded-xl bg-[#f0f4f8] group-hover:bg-[#4a6b82] text-[#365063] group-hover:text-white transition text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-2xs">
                        <ListOrdered className="w-3.5 h-3.5" />
                        <span>Seguir receta →</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `${window.location.origin}${window.location.pathname}?recipe=${encodeURIComponent(
                              dinnerDish.id
                            )}`,
                            '_blank'
                          );
                        }}
                        className="p-2 rounded-xl bg-white border border-[#ded5c5] hover:bg-[#edf3f8] hover:border-[#a9c2d6] text-[#4a6b82] transition cursor-pointer shadow-2xs"
                        title="Abrir receta en otra pestaña"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Fruta */}
                  <div className="pt-3 border-t border-[#f0eae0] flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center space-x-1.5 text-[#4e5e50] font-semibold">
                      <Apple className="w-4 h-4 text-[#6fa373]" />
                      <span>Fruta:</span>
                    </div>
                    <strong className="text-[#2d3831]">
                      {dinnerFruit ? dinnerFruit.name : 'Sin fruta asignada'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Día */}
            <div className="px-6 py-3.5 bg-[#faf8f4] border-t border-[#f0eae0] flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditDayInPlanner();
                }}
                className="text-xs sm:text-sm font-semibold text-[#507252] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Editar este día en el Planificador</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#527354] text-white hover:bg-[#435e45] transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
