import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Check,
  Printer,
  Lightbulb,
  ArrowLeft,
  Egg,
  Salad,
  Waves,
  Droplet,
  Utensils,
  Share2,
  Plus,
  Minus,
  Users,
} from 'lucide-react';
import { CATEGORIES } from '../data/initialData';
import type { Dish } from '../types';
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

interface StandaloneRecipeViewProps {
  dish?: Dish | null;
  onGoToApp: () => void;
}

export const StandaloneRecipeView: React.FC<StandaloneRecipeViewProps> = ({ dish, onGoToApp }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [customServings, setCustomServings] = useState<number | null>(null);

  const servings = customServings ?? dish?.servings ?? 2;

  useEffect(() => {
    if (dish) {
      document.title = `${dish.name} · Receta Modo Cocina`;
    }
  }, [dish]);

  if (!dish) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-[#ded5c5] max-w-md w-full shadow-lg">
          <Utensils className="w-12 h-12 text-[#9e9282] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#2d3831]">Receta no encontrada</h2>
          <p className="text-xs sm:text-sm text-[#736858] mt-2">
            No se ha podido localizar el plato solicitado. Es posible que haya sido eliminado o que el enlace sea incorrecto.
          </p>
          <button
            onClick={onGoToApp}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#527354] text-white text-xs sm:text-sm font-semibold hover:bg-[#435e45] transition cursor-pointer"
          >
            Ir al Planificador Principal
          </button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === dish.categoryId);

  const getCookingTip = (d: Dish): string => {
    if (d.cookingTips && d.cookingTips.trim()) {
      return d.cookingTips.trim();
    }
    if (d.categoryId === 'mar') {
      return 'Cocinar a fuego moderado para proteger los ácidos grasos omega 3 (EPA y DHA). Terminar con un chorrito de AOVE en crudo al servir para realzar el sabor y la absorción de nutrientes.';
    }
    if (d.categoryId === 'carne') {
      return 'Cocinar a temperatura media sin tostar ni quemar en exceso la superficie. Dejar reposar 1 o 2 minutos antes de cortar para que los jugos se redistribuyan de forma homogénea.';
    }
    if (d.categoryId === 'huevos') {
      return 'Cocinar a fuego lento o medio-bajo para no sobrecocinar la proteína y mantener la biodisponibilidad de la colina y vitaminas de la yema.';
    }
    if (d.categoryId === 'legumbres') {
      return 'Añadir una hoja de laurel, comino o alga kombu durante la cocción para ablandar las fibras y favorecer una digestión suave y ligera.';
    }
    if (d.categoryId === 'verduras') {
      return 'Mantener un punto al dente (vapor o salteado breve) para conservar al máximo la vitamina C, los antioxidantes y la fibra prebiótica.';
    }
    return 'Acompañar con aceite de oliva virgen extra en crudo para potenciar la asimilación de los nutrientes y proteger la mucosa gástrica.';
  };

  const effectiveSteps =
    dish.steps && dish.steps.length > 0
      ? dish.steps
      : [
          `Preparar y limpiar los ingredientes (${dish.ingredients.join(', ')}).`,
          `Cocinar aplicando la técnica recomendada: ${dish.cookingTechnique} (~${dish.preparationTime} min).`,
          'Servir al momento y aderezar al gusto con un hilo de AOVE en crudo.',
        ];

  const totalSteps = effectiveSteps.length;
  const doneStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = Math.round((doneStepsCount / totalSteps) * 100);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#2c362e] font-sans">
      {/* Top Navigation Bar (Hidden in print) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#eae1d2] shadow-2xs print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onGoToApp}
            className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-[#527354] hover:text-[#38523a] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Menú</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#faf8f4] border border-[#ded5c5] text-[#554a3a] hover:bg-[#f1ebe0] transition text-xs font-semibold cursor-pointer"
              title="Copiar enlace de esta receta"
            >
              <Share2 className="w-3.5 h-3.5 text-[#6c5f4d]" />
              <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ded5c5] text-[#554a3a] hover:bg-[#f1ebe0] transition text-xs font-semibold cursor-pointer"
              title="Imprimir esta receta"
            >
              <Printer className="w-3.5 h-3.5 text-[#527354]" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Recipe Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Banner de Cabecera del Plato */}
        <div className="bg-white border border-[#ded5c5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center space-x-2">
              {category && (
                <span
                  className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide"
                  style={{ backgroundColor: category.color.light, color: category.color.text }}
                >
                  {category.name}
                </span>
              )}
              <span className="text-xs font-medium text-[#7d8c80] bg-[#f4f7f4] px-2.5 py-1 rounded-full border border-[#d6e5d6]">
                {dish.subcategory}
              </span>
            </div>

            <span className="text-xs text-[#8c7f6b] font-medium print:hidden">
              Pestaña independiente para cocinar
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-[#232c25] tracking-tight leading-snug">
              {dish.name}
            </h1>
            {dish.description && (
              <p className="text-sm sm:text-base text-[#615748] mt-2 leading-relaxed">
                {dish.description}
              </p>
            )}
          </div>

          {/* Métricas destacadas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#fdf0ec] border border-[#f5d9cf] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-[#c0735a]" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-[#807666] block">Técnica:</span>
                <span className="font-bold text-xs sm:text-sm text-[#2d3831] truncate block">
                  {dish.cookingTechnique}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#eef4ee] border border-[#d4e5d4] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#426144]" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-[#807666] block">Tiempo estimado:</span>
                <span className="font-bold text-xs sm:text-sm text-[#2d3831] block">
                  ~{dish.preparationTime} min
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] flex items-center space-x-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-[#f5ede4] border border-[#e8dcd0] flex items-center justify-center shrink-0">
                <Utensils className="w-5 h-5 text-[#8c5822]" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-[#807666] block">Ingredientes:</span>
                <span className="font-bold text-xs sm:text-sm text-[#2d3831] block">
                  {dish.ingredients.length} elementos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredientes y Alimentos Complementarios */}
        <div className="bg-white border border-[#ded5c5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#2d3831] flex items-center gap-2">
                <span>Ingredientes Necesarios</span>
                <span className="text-xs font-normal text-[#8c7f6b] print:hidden">
                  (marca los que vayas teniendo listos)
                </span>
              </h2>

              {/* Selector de personas / comensales para ajustar proporciones */}
              <div className="flex items-center space-x-1.5 bg-[#f4f7f4] border border-[#d6e5d6] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#2f4232] print:border-none">
                <Users className="w-3.5 h-3.5 text-[#507252]" />
                <button
                  type="button"
                  onClick={() => setCustomServings(Math.max(1, servings - 1))}
                  className="p-1 hover:bg-[#e2ede2] rounded-lg transition text-[#405c44] cursor-pointer print:hidden"
                  title="Restar comensal"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-20 text-center select-none font-bold text-xs text-[#2c3d2e]">
                  {servings} {servings === 1 ? 'persona' : 'personas'}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomServings(Math.min(20, servings + 1))}
                  className="p-1 hover:bg-[#e2ede2] rounded-lg transition text-[#405c44] cursor-pointer print:hidden"
                  title="Añadir comensal"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {getDishIngredients(dish).map((ing, i) => {
                const isChecked = Boolean(checkedIngredients[i]);
                const formatted = formatScaledIngredient(ing, servings, dish.servings || 2);
                return (
                  <label
                    key={i}
                    onClick={() => setCheckedIngredients((prev) => ({ ...prev, [i]: !prev[i] }))}
                    className={`flex items-center space-x-3 p-3 rounded-2xl border transition cursor-pointer select-none ${
                      isChecked
                        ? 'bg-[#f4f8f4] border-[#b8d6b8] text-[#556957]'
                        : 'bg-[#faf8f4] border-[#ede5d8] text-[#2d3831] hover:bg-white hover:border-[#cfdcce]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition shrink-0 ${
                        isChecked
                          ? 'bg-[#527354] text-white'
                          : 'bg-white border border-[#c4d8c4]'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through opacity-75' : ''}`}>
                      {formatted}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Aportes complementarios */}
          {(dish.hasEggs ||
            (dish.eggCount !== undefined && dish.eggCount > 0) ||
            dish.hasVegetables ||
            dish.hasMushrooms ||
            dish.containsMushrooms ||
            dish.hasTubers ||
            dish.hasSeaweed ||
            dish.hasOliveOil) && (
            <div className="pt-4 border-t border-[#f0eae0]">
              <span className="text-xs uppercase font-bold text-[#807666] tracking-wider block mb-2.5">
                Alimentos complementarios incluidos
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {(dish.hasEggs || (dish.eggCount !== undefined && dish.eggCount > 0)) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fdf8eb] text-[#856b28] border border-[#eddba4] font-medium">
                    <Egg className="w-4 h-4 text-[#b5973b] shrink-0" />
                    <span>{dish.eggCount && dish.eggCount > 0 ? `${dish.eggCount} huevos` : 'Huevos'}</span>
                  </span>
                )}
                {(dish.hasVegetables || (dish.vegetableTypes && dish.vegetableTypes.length > 0)) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f7f1] text-[#3d6e42] border border-[#d2e6d5] font-medium">
                    <Salad className="w-4 h-4 text-[#3d6e42] shrink-0" />
                    <span>
                      Verduras {dish.vegetableTypes && dish.vegetableTypes.length > 0 ? `(${dish.vegetableTypes.join(', ')})` : ''}
                    </span>
                  </span>
                )}
                {(dish.hasMushrooms || dish.containsMushrooms) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf5f0] text-[#7d5e3c] border border-[#e8d5c4] font-medium">
                    <MushroomIcon className="w-4 h-4 text-[#7d5e3c] shrink-0" />
                    <span>Setas y hongos</span>
                  </span>
                )}
                {dish.hasTubers && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fdf5f0] text-[#915632] border border-[#ebd2c3] font-medium">
                    <TuberIcon className="w-4 h-4 text-[#915632] shrink-0" />
                    <span>Tubérculos y raíces</span>
                  </span>
                )}
                {dish.hasSeaweed && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f6f8] text-[#2c6175] border border-[#c4e0eb] font-medium">
                    <Waves className="w-4 h-4 text-[#2c6175] shrink-0" />
                    <span>Algas</span>
                  </span>
                )}
                {dish.hasOliveOil && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f9f0] text-[#636e2f] border border-[#e0e5be] font-medium">
                    <Droplet className="w-4 h-4 text-[#636e2f] shrink-0" />
                    <span>AOVE</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modo de Preparación (Paso a Paso Interactivo) */}
        <div className="bg-white border border-[#ded5c5] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f0eae0] flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#2d3831]">
                Modo de preparación
              </h2>
              <p className="text-xs text-[#7d7363] mt-0.5 print:hidden">
                Sigue cada paso con tranquilidad mientras cocinas
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold text-[#527354] bg-[#eef4ee] px-3 py-1.5 rounded-full border border-[#d2e3d2] print:hidden">
              <span>{doneStepsCount} de {totalSteps} pasos completados</span>
              <span className="opacity-60">({progressPct}%)</span>
            </div>
          </div>

          {/* Barra de progreso visual */}
          <div className="w-full bg-[#f0eae0] h-1.5 rounded-full overflow-hidden print:hidden">
            <div
              className="bg-[#527354] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Lista de pasos con casillas grandes */}
          <ol className="space-y-3 pt-2">
            {effectiveSteps.map((step, idx) => {
              const isDone = Boolean(completedSteps[idx]);
              return (
                <li
                  key={idx}
                  onClick={() => setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                  className={`flex items-start space-x-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isDone
                      ? 'bg-[#f4f8f4] border-[#b8d6b8] text-[#556957]'
                      : 'bg-[#faf8f4] border-[#ede5d8] text-[#2d3831] hover:bg-white hover:border-[#cfdcce]'
                  }`}
                >
                  <button
                    type="button"
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition shadow-2xs ${
                      isDone
                        ? 'bg-[#527354] text-white'
                        : 'bg-white text-[#527354] border border-[#c4d8c4]'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                  </button>
                  <span className={`text-sm sm:text-base leading-relaxed flex-1 ${isDone ? 'line-through opacity-75' : ''}`}>
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Consejos de Preparación y Notas (Al final del todo) */}
        <div className="p-5 bg-[#fdfbf2] border border-[#ede4cb] rounded-3xl flex items-start space-x-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-[#faedd2] border border-[#ebd8b0] flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 text-[#a87a1d]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-[#7a5c1a] uppercase tracking-wide block">
              Consejos de preparación
            </span>
            <p className="text-xs sm:text-sm text-[#665426] mt-1.5 leading-relaxed">
              {getCookingTip(dish)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
