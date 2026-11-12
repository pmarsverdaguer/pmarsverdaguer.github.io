import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Plus,
  Minus,
  Users,
  Edit2,
  Trash2,
  Flame,
  Clock,
  Egg,
  X,
  Apple,
  Utensils,
  Salad,
  Waves,
  Droplet,
  Lightbulb,
  ListOrdered,
  ExternalLink,
} from 'lucide-react';

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
import { CATEGORIES } from '../data/initialData';
import type { CategoryId, Dish, Fruit, RecipeIngredient } from '../types';
import { getDishIngredients, formatScaledIngredient } from '../utils/recipeUtils';

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

interface RecipesProps {
  dishes: Dish[];
  onAddDish: (dish: Dish) => void;
  onUpdateDish: (dish: Dish) => void;
  onDeleteDish: (dishId: string) => void;
  fruits: Fruit[];
  onAddFruit: (fruit: Fruit) => void;
  onUpdateFruit: (fruit: Fruit) => void;
  onDeleteFruit: (fruitId: string) => void;
}

const VEGETABLE_TYPES_CONFIG = [
  { id: 'all', label: 'Todas las verduras' },
  { id: 'cruciferas', label: 'Crucíferas' },
  { id: 'bulbos', label: 'Bulbos' },
  { id: 'alcachofas', label: 'Alcachofas' },
  { id: 'hojas_tallos', label: 'Hojas y tallos' },
  { id: 'solanaceas', label: 'Solanáceas' },
] as const;

export const Recipes: React.FC<RecipesProps> = ({
  dishes,
  onAddDish,
  onUpdateDish,
  onDeleteDish,
  fruits,
  onAddFruit,
  onUpdateFruit,
  onDeleteFruit,
}) => {
  // Restore view and filter state so screen persists when switching tabs
  const storageState = (() => {
    try {
      const saved = sessionStorage.getItem('menu_recipes_view_state');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  // Subtab: 'dishes' | 'fruits'
  const [subTab, setSubTab] = useState<'dishes' | 'fruits'>(() => storageState?.subTab || 'dishes');

  // Search & filter states for dishes
  const [searchTerm, setSearchTerm] = useState<string>(() => storageState?.searchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => storageState?.selectedCategory || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(() => storageState?.selectedSubcategory || 'all');
  const [selectedTechnique, setSelectedTechnique] = useState<string>(() => storageState?.selectedTechnique || 'all');
  const [selectedVegetableType, setSelectedVegetableType] = useState<string>(() => storageState?.selectedVegetableType || 'all');

  // Persist filter states in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'menu_recipes_view_state',
        JSON.stringify({
          subTab,
          searchTerm,
          selectedCategory,
          selectedSubcategory,
          selectedTechnique,
          selectedVegetableType,
        })
      );
    } catch {
      // ignore
    }
  }, [subTab, searchTerm, selectedCategory, selectedSubcategory, selectedTechnique, selectedVegetableType]);

  // Modal states for dishes
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [viewingDish, setViewingDish] = useState<Dish | null>(null);

  // Search state for fruits
  const [fruitSearch, setFruitSearch] = useState('');
  const [isFruitModalOpen, setIsFruitModalOpen] = useState(false);
  const [editingFruit, setEditingFruit] = useState<Fruit | null>(null);

  // Fruit form fields
  const [formFruitName, setFormFruitName] = useState('');
  const [formFruitDescription, setFormFruitDescription] = useState('');

  // Prevent scroll jump and lock body scroll while modal is active
  useEffect(() => {
    if (viewingDish || isFormOpen || isFruitModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setViewingDish(null);
          setIsFormOpen(false);
          setIsFruitModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [viewingDish, isFormOpen, isFruitModalOpen]);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryId>('mar');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formTechnique, setFormTechnique] = useState('Vapor suave');
  const [formPrepTime, setFormPrepTime] = useState(20);
  const [formIngredients, setFormIngredients] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSteps, setFormSteps] = useState<string[]>(['']);
  const [formCookingTips, setFormCookingTips] = useState('');

  // Structured ingredients for recipe formulation (base 2 diners)
  const [formRecipeIngredients, setFormRecipeIngredients] = useState<
    Array<{ name: string; amount: number | ''; unit: string }>
  >([{ name: '', amount: '', unit: 'g' }]);

  // Diners scale for recipe viewing modal
  const [viewingServings, setViewingServings] = useState<number>(2);

  const handleAddIngredientRow = () => {
    setFormRecipeIngredients((prev) => [...prev, { name: '', amount: '', unit: 'g' }]);
  };

  const handleUpdateIngredientRow = (
    idx: number,
    field: 'name' | 'amount' | 'unit',
    value: string | number | ''
  ) => {
    setFormRecipeIngredients((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleRemoveIngredientRow = (idx: number) => {
    setFormRecipeIngredients((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated.length > 0 ? updated : [{ name: '', amount: '', unit: 'g' }];
    });
  };

  // Step handlers
  const handleStepChange = (idx: number, val: string) => {
    const updated = [...formSteps];
    updated[idx] = val;
    setFormSteps(updated);
  };

  const handleAddStep = () => {
    setFormSteps([...formSteps, '']);
  };

  const handleRemoveStep = (idx: number) => {
    const updated = formSteps.filter((_, i) => i !== idx);
    setFormSteps(updated.length > 0 ? updated : ['']);
  };

  // Complementary food states
  const [formHasEggs, setFormHasEggs] = useState(false);
  const [formEggCount, setFormEggCount] = useState(2);
  const [formHasVegetables, setFormHasVegetables] = useState(false);
  const [formVegetableTypes, setFormVegetableTypes] = useState<string[]>([]);
  const [formHasMushrooms, setFormHasMushrooms] = useState(false);
  const [formHasTubers, setFormHasTubers] = useState(false);
  const [formHasSeaweed, setFormHasSeaweed] = useState(false);
  const [formHasOliveOil, setFormHasOliveOil] = useState(false);

  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  // Techniques list
  const techniques = Array.from(
    new Set(dishes.map((d) => d.cookingTechnique.split('(')[0].trim()))
  );

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

  // Filtered dishes
  const filteredDishes = dishes.filter((dish) => {
    const s = searchTerm.trim().toLowerCase();

    // 1. Búsqueda por texto (nombre, descripción, técnica, ingredientes y alimentos complementarios)
    const matchesSearch =
      !s ||
      dish.name.toLowerCase().includes(s) ||
      dish.ingredients.some((ing) => ing.toLowerCase().includes(s)) ||
      (dish.recipeIngredients && dish.recipeIngredients.some((i) => i.name.toLowerCase().includes(s))) ||
      dish.description.toLowerCase().includes(s) ||
      dish.cookingTechnique.toLowerCase().includes(s) ||
      (s.includes('huevo') && Boolean(dish.hasEggs || (dish.eggCount !== undefined && dish.eggCount > 0))) ||
      (s.includes('verdura') && Boolean(dish.hasVegetables || (dish.vegetableTypes && dish.vegetableTypes.length > 0))) ||
      ((s.includes('seta') || s.includes('hongo')) && Boolean(dish.hasMushrooms || dish.containsMushrooms)) ||
      ((s.includes('tuber') || s.includes('raíz') || s.includes('raiz')) && Boolean(dish.hasTubers)) ||
      (s.includes('alga') && Boolean(dish.hasSeaweed)) ||
      ((s.includes('aove') || s.includes('oliva')) && Boolean(dish.hasOliveOil)) ||
      Boolean(
        dish.vegetableTypes &&
          dish.vegetableTypes.some((t) => {
            const conf = VEGETABLE_TYPES_CONFIG.find((vt) => vt.id === t);
            return t.toLowerCase().includes(s) || (conf && conf.label.toLowerCase().includes(s));
          })
      );

    // 2. Filtro de Categoría y Complementarios
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'verduras') {
        // Al filtrar por verduras: aparecen los platos catalogados como verduras variadas
        // Y TAMBIÉN los platos que tienen verduras como alimento complementario
        matchesCategory =
          dish.categoryId === 'verduras' ||
          Boolean(dish.hasVegetables || (dish.vegetableTypes && dish.vegetableTypes.length > 0));
      } else if (selectedCategory === 'huevos') {
        // Muestra platos de huevos Y platos que tienen huevos como complementario
        matchesCategory =
          dish.categoryId === 'huevos' ||
          Boolean(dish.hasEggs || (dish.eggCount !== undefined && dish.eggCount > 0));
      } else {
        matchesCategory = dish.categoryId === selectedCategory;
      }
    }

    // 3. Filtro de Subcategoría / Tipo de verdura
    let matchesSub = true;
    if (selectedCategory === 'verduras') {
      if (selectedVegetableType !== 'all') {
        // Al filtrar por un tipo de verdura específico:
        // Deben aparecer los platos que tienen ese tipo de verdura (sea principal o complementario)
        // Y SIEMPRE deben aparecer los platos catalogados principalmente como verduras variadas
        const hasSpecificVeg = Boolean(
          dish.vegetableTypes?.includes(selectedVegetableType) ||
          (selectedVegetableType === 'cruciferas' && dish.containsCruciferous)
        );
        matchesSub = dish.categoryId === 'verduras' || hasSpecificVeg;
      }
    } else if (selectedSubcategory !== 'all') {
      matchesSub = dish.subcategory === selectedSubcategory;
    }

    const matchesTechnique =
      selectedTechnique === 'all' || dish.cookingTechnique.toLowerCase().includes(selectedTechnique.toLowerCase());

    return matchesSearch && matchesCategory && matchesSub && matchesTechnique;
  });

  const handleOpenAdd = () => {
    setEditingDish(null);
    setFormName('');
    setFormCategory('mar');
    setFormSubcategory(CATEGORIES[0].subcategories[0]);
    setFormTechnique('Vapor suave');
    setFormPrepTime(20);
    setFormIngredients('');
    setFormRecipeIngredients([{ name: '', amount: '', unit: 'g' }]);
    setFormDescription('');
    setFormSteps(['']);
    setFormCookingTips('');
    setFormHasEggs(false);
    setFormEggCount(2);
    setFormHasVegetables(false);
    setFormVegetableTypes([]);
    setFormHasMushrooms(false);
    setFormHasTubers(false);
    setFormHasSeaweed(false);
    setFormHasOliveOil(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dish: Dish, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingDish(null);
    setEditingDish(dish);
    setFormName(dish.name);
    setFormCategory(dish.categoryId);
    setFormSubcategory(dish.subcategory);
    setFormTechnique(dish.cookingTechnique);
    setFormPrepTime(dish.preparationTime);
    setFormIngredients(dish.ingredients.join(', '));

    const existingIngs = getDishIngredients(dish);
    if (existingIngs.length > 0) {
      setFormRecipeIngredients(
        existingIngs.map((i) => ({
          name: i.name,
          amount: i.amount !== undefined ? i.amount : '',
          unit: i.unit ? (i.unit.toLowerCase() === 'ml' ? 'mL' : i.unit) : '',
        }))
      );
    } else {
      setFormRecipeIngredients([{ name: '', amount: '', unit: 'g' }]);
    }

    setFormDescription(dish.description || '');
    setFormSteps(dish.steps && dish.steps.length > 0 ? [...dish.steps] : ['']);
    setFormCookingTips(dish.cookingTips || '');

    // Huevos
    const hasEggsInitial = Boolean(
      dish.hasEggs || (dish.eggCount !== undefined && dish.eggCount > 0) || dish.categoryId === 'huevos'
    );
    setFormHasEggs(hasEggsInitial);
    setFormEggCount(dish.eggCount && dish.eggCount > 0 ? dish.eggCount : 2);

    // Verduras
    const hasVegInitial = Boolean(
      dish.hasVegetables ||
      (dish.vegetableTypes && dish.vegetableTypes.length > 0) ||
      dish.categoryId === 'verduras'
    );
    setFormHasVegetables(hasVegInitial);
    setFormVegetableTypes(dish.vegetableTypes || (dish.containsCruciferous ? ['cruciferas'] : []));

    // Setas y hongos
    setFormHasMushrooms(Boolean(dish.hasMushrooms || dish.containsMushrooms || (dish.categoryId as string) === 'setas'));

    // Tubérculos y raíces
    setFormHasTubers(Boolean(dish.hasTubers || (dish.categoryId as string) === 'tuberculos'));

    // Algas
    const hasSeaweedInitial = Boolean(
      dish.hasSeaweed ||
      dish.subcategory.toLowerCase().includes('alga') ||
      dish.ingredients.some((i) => i.toLowerCase().includes('alga'))
    );
    setFormHasSeaweed(hasSeaweedInitial);

    // AOVE
    const hasAoveInitial = Boolean(
      dish.hasOliveOil !== undefined
        ? dish.hasOliveOil
        : dish.ingredients.some((i) => i.toLowerCase().includes('aove') || i.toLowerCase().includes('oliva'))
    );
    setFormHasOliveOil(hasAoveInitial);

    setIsFormOpen(true);
  };

  const handleDelete = (dishId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar este plato del recetario?')) {
      if (viewingDish?.id === dishId) setViewingDish(null);
      onDeleteDish(dishId);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    // Build structured recipe ingredients (base: 2 diners)
    const validRecipeIngredients: RecipeIngredient[] = formRecipeIngredients
      .filter((i) => i.name.trim().length > 0)
      .map((i) => ({
        name: i.name.trim(),
        amount: typeof i.amount === 'number' && i.amount > 0
          ? i.amount
          : i.amount !== '' && Number(i.amount) > 0
          ? Number(i.amount)
          : undefined,
        unit: i.unit.trim() || undefined,
      }));

    // Names list for search and fallback compatibility
    const ingArray = validRecipeIngredients.length > 0
      ? validRecipeIngredients.map((i) => i.name)
      : formIngredients
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean);

    const hasVegFinal = Boolean(formHasVegetables || formVegetableTypes.length > 0);
    const stepsFiltered = formSteps.map((s) => s.trim()).filter(Boolean);

    const complementaryData = {
      hasEggs: formHasEggs,
      eggCount: formHasEggs ? Math.max(1, Number(formEggCount) || 1) : 0,
      hasVegetables: hasVegFinal,
      vegetableTypes: hasVegFinal ? formVegetableTypes : [],
      hasMushrooms: formHasMushrooms,
      containsMushrooms: formHasMushrooms,
      hasTubers: formHasTubers,
      hasSeaweed: formHasSeaweed,
      hasOliveOil: formHasOliveOil,
      containsCruciferous: hasVegFinal && formVegetableTypes.includes('cruciferas'),
    };

    if (editingDish) {
      const updated: Dish = {
        ...editingDish,
        name: formName.trim(),
        categoryId: formCategory,
        subcategory: formSubcategory || CATEGORIES.find((c) => c.id === formCategory)?.subcategories[0] || 'General',
        cookingTechnique: formTechnique.trim(),
        preparationTime: Number(formPrepTime) || 15,
        ingredients: ingArray,
        recipeIngredients: validRecipeIngredients.length > 0 ? validRecipeIngredients : undefined,
        servings: 2,
        description: formDescription.trim(),
        steps: stepsFiltered.length > 0 ? stepsFiltered : undefined,
        cookingTips: formCookingTips.trim() || undefined,
        ...complementaryData,
        isCustom: editingDish.isCustom ?? true,
      };
      onUpdateDish(updated);
    } else {
      const newDish: Dish = {
        id: `dish-custom-${Date.now()}`,
        name: formName.trim(),
        categoryId: formCategory,
        subcategory: formSubcategory || CATEGORIES.find((c) => c.id === formCategory)?.subcategories[0] || 'General',
        cookingTechnique: formTechnique.trim(),
        preparationTime: Number(formPrepTime) || 15,
        ingredients: ingArray,
        recipeIngredients: validRecipeIngredients.length > 0 ? validRecipeIngredients : undefined,
        servings: 2,
        description: formDescription.trim(),
        steps: stepsFiltered.length > 0 ? stepsFiltered : undefined,
        cookingTips: formCookingTips.trim() || undefined,
        ...complementaryData,
        isCustom: true,
      };
      onAddDish(newDish);
    }

    setIsFormOpen(false);
  };

  // Fruit handlers
  const handleOpenAddFruit = () => {
    setEditingFruit(null);
    setFormFruitName('');
    setFormFruitDescription('');
    setIsFruitModalOpen(true);
  };

  const handleOpenEditFruit = (fruit: Fruit, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingFruit(fruit);
    setFormFruitName(fruit.name);
    setFormFruitDescription(fruit.description || '');
    setIsFruitModalOpen(true);
  };

  const handleDeleteFruit = (fruitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar esta fruta de la lista?')) {
      onDeleteFruit(fruitId);
    }
  };

  const handleSaveFruitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFruitName.trim()) return;

    if (editingFruit) {
      onUpdateFruit({
        ...editingFruit,
        name: formFruitName.trim(),
        variety: undefined,
        description: formFruitDescription.trim() || undefined,
      });
    } else {
      onAddFruit({
        id: `fr-custom-${Date.now()}`,
        name: formFruitName.trim(),
        description: formFruitDescription.trim() || undefined,
      });
    }
    setIsFruitModalOpen(false);
  };

  const filteredFruits = fruits.filter((fruit) => {
    const q = fruitSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      fruit.name.toLowerCase().includes(q) ||
      (fruit.description && fruit.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Selector de subsección: Platos / Frutas */}
      <div className="flex items-center space-x-2 p-1.5 bg-[#f0eae0] rounded-2xl w-fit border border-[#e4dcce]">
        <button
          onClick={() => setSubTab('dishes')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer ${
            subTab === 'dishes'
              ? 'bg-white text-[#2f3833] shadow-xs'
              : 'text-[#6c614f] hover:text-[#2f3833]'
          }`}
        >
          <Utensils className="w-4 h-4 text-[#527354]" />
          <span>Platos</span>
          <span className="text-xs bg-[#f4efe4] text-[#4f4637] px-2 py-0.5 rounded-full font-bold">
            {dishes.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('fruits')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer ${
            subTab === 'fruits'
              ? 'bg-white text-[#2f3833] shadow-xs'
              : 'text-[#6c614f] hover:text-[#2f3833]'
          }`}
        >
          <Apple className="w-4 h-4 text-[#c0735a]" />
          <span>Frutas</span>
          <span className="text-xs bg-[#f4efe4] text-[#4f4637] px-2 py-0.5 rounded-full font-bold">
            {fruits.length}
          </span>
        </button>
      </div>

      {subTab === 'dishes' ? (
        <div className="space-y-8 animate-fade-in">
          {/* Top Banner Platos */}
          <div className="bg-[#fcfbf7] border border-[#e8e2d4] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#2f3833]">
              Listado de Platos
            </h2>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#527354] hover:bg-[#435e45] text-white transition text-sm font-semibold shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Nuevo Plato</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="mt-5 space-y-3 pt-4 border-t border-[#ede6d8]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8a7f6f] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar plato o ingrediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-[#dfd7c8] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
              />
            </div>

            {/* Technique Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#7b7060] shrink-0">Técnica:</span>
              <select
                value={selectedTechnique}
                onChange={(e) => setSelectedTechnique(e.target.value)}
                className="w-full text-sm bg-white border border-[#dfd7c8] rounded-2xl px-3 py-2 text-[#3b493d] focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
              >
                <option value="all">Todas las técnicas</option>
                {techniques.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-center justify-between sm:justify-end space-x-2 text-xs sm:text-sm text-[#738075]">
              <span><strong>{filteredDishes.length}</strong> de {dishes.length} platos</span>
              {(searchTerm || selectedCategory !== 'all' || selectedSubcategory !== 'all' || selectedTechnique !== 'all' || selectedVegetableType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                    setSelectedTechnique('all');
                    setSelectedVegetableType('all');
                  }}
                  className="text-[#4e7451] underline font-semibold ml-2 hover:text-[#324f35] cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-1">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
                setSelectedVegetableType('all');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#527354] text-white shadow-xs'
                  : 'bg-white border border-[#ded5c5] text-[#554e42] hover:bg-[#f6f2ea]'
              }`}
            >
              Todas ({dishes.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = dishes.filter((d) => {
                if (cat.id === 'verduras') {
                  return d.categoryId === 'verduras' || Boolean(d.hasVegetables || (d.vegetableTypes && d.vegetableTypes.length > 0));
                }
                if (cat.id === 'huevos') {
                  return d.categoryId === 'huevos' || Boolean(d.hasEggs || (d.eggCount !== undefined && d.eggCount > 0));
                }
                return d.categoryId === cat.id;
              }).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory('all');
                    setSelectedVegetableType('all');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#527354] text-white shadow-xs'
                      : 'bg-white border border-[#ded5c5] text-[#554e42] hover:bg-[#f6f2ea]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Subcategory or Vegetable Types Chips */}
          {selectedCategory === 'verduras' ? (
            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pt-1">
              <span className="text-[#877c6c] shrink-0 font-medium flex items-center gap-1">
                <Salad className="w-3.5 h-3.5 text-[#507252]" />
                Tipo de verdura:
              </span>
              {VEGETABLE_TYPES_CONFIG.map((vType) => {
                const count = dishes.filter((d) => {
                  if (vType.id === 'all') {
                    return d.categoryId === 'verduras' || Boolean(d.hasVegetables || (d.vegetableTypes && d.vegetableTypes.length > 0));
                  }
                  return (
                    d.categoryId === 'verduras' ||
                    Boolean(
                      d.vegetableTypes?.includes(vType.id) ||
                      (vType.id === 'cruciferas' && d.containsCruciferous)
                    )
                  );
                }).length;

                const isSelected = selectedVegetableType === vType.id;
                return (
                  <button
                    key={vType.id}
                    onClick={() => setSelectedVegetableType(vType.id)}
                    className={`px-3 py-1 rounded-lg border whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#527354] text-white border-[#527354] font-semibold shadow-2xs'
                        : 'bg-white text-[#6b6252] border-[#ded5c5] hover:bg-[#f4efe4]'
                    }`}
                  >
                    {vType.label} ({count})
                  </button>
                );
              })}
            </div>
          ) : activeCategoryObj && (
            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pt-1">
              <span className="text-[#877c6c] shrink-0 font-medium">Subcategoría:</span>
              <button
                onClick={() => setSelectedSubcategory('all')}
                className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
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
                  className={`px-3 py-1 rounded-lg border whitespace-nowrap transition cursor-pointer ${
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
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDishes.map((dish) => {
          const cat = categoryMap[dish.categoryId];
          return (
            <div
              key={dish.id}
              onClick={() => {
                setViewingDish(dish);
                setViewingServings(dish.servings || 2);
              }}
              className="bg-white border border-[#eae3d5] rounded-3xl p-5 hover:border-[#6f9072] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#f3ede3]">
                  {cat && (
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: cat.color.light, color: cat.color.text }}
                    >
                      {cat.name}
                    </span>
                  )}
                  <span className="text-xs text-[#7d8c80] font-medium">
                    {dish.subcategory}
                  </span>
                </div>

                {/* Dish Name */}
                <h3 className="text-lg font-semibold text-[#2d3831] mt-3 group-hover:text-[#415e43] transition leading-snug">
                  {dish.name}
                </h3>

                <p className="text-xs sm:text-sm text-[#6e7d72] mt-2 line-clamp-2 leading-relaxed">
                  {dish.description}
                </p>

                {/* Technique & Details */}
                <div className="mt-4 space-y-1.5 text-xs text-[#627065] bg-[#faf8f4] p-3 rounded-2xl border border-[#efe9dd]">
                  <div className="flex items-center space-x-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#c0735a] shrink-0" />
                    <span>Técnica: <strong>{dish.cookingTechnique}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#738b75] shrink-0" />
                    <span>Tiempo: <strong>~{dish.preparationTime} min</strong></span>
                  </div>
                  {dish.eggCount && dish.eggCount > 0 ? (
                    <div className="flex items-center space-x-1.5">
                      <Egg className="w-3.5 h-3.5 text-[#b5973b] shrink-0" />
                      <span>Huevos aportados: <strong>{dish.eggCount}</strong></span>
                    </div>
                  ) : null}
                </div>

                {/* Ingredients Pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {dish.ingredients.slice(0, 3).map((ing, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-0.5 rounded-md bg-[#f4f7f4] text-[#475f49] border border-[#d8e6d8]"
                    >
                      {ing}
                    </span>
                  ))}
                  {dish.ingredients.length > 3 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md text-[#78857a]">
                      +{dish.ingredients.length - 3} más
                    </span>
                  )}
                </div>

                {/* Complementary food icons on card */}
                {(dish.hasEggs || (dish.eggCount !== undefined && dish.eggCount > 0) || dish.hasVegetables || dish.hasMushrooms || dish.containsMushrooms || dish.hasTubers || dish.hasSeaweed || dish.hasOliveOil) && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {(dish.hasEggs || (dish.eggCount !== undefined && dish.eggCount > 0)) && (
                      <span
                        title={`Huevos: ${dish.eggCount || 2} uds`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#fdf8eb] text-[#856b28] border border-[#eddba4] text-[11px] font-medium"
                      >
                        <Egg className="w-3 h-3 text-[#b5973b]" />
                        <span>{dish.eggCount || 2}</span>
                      </span>
                    )}
                    {(dish.hasVegetables || (dish.vegetableTypes && dish.vegetableTypes.length > 0)) && (
                      <span
                        title="Verduras"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f0f7f1] text-[#3d6e42] border border-[#d2e6d5] text-[11px] font-medium"
                      >
                        <Salad className="w-3 h-3 text-[#3d6e42]" />
                        <span>Verduras</span>
                      </span>
                    )}
                    {(dish.hasMushrooms || dish.containsMushrooms) && (
                      <span
                        title="Setas y hongos"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#faf5f0] text-[#7d5e3c] border border-[#e8d5c4] text-[11px] font-medium"
                      >
                        <MushroomIcon className="w-3 h-3 text-[#7d5e3c]" />
                        <span>Setas</span>
                      </span>
                    )}
                    {dish.hasTubers && (
                      <span
                        title="Tubérculos y raíces"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#fdf5f0] text-[#915632] border border-[#ebd2c3] text-[11px] font-medium"
                      >
                        <TuberIcon className="w-3 h-3 text-[#915632]" />
                        <span>Tubérculos</span>
                      </span>
                    )}
                    {dish.hasSeaweed && (
                      <span
                        title="Algas"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f0f6f8] text-[#2c6175] border border-[#c4e0eb] text-[11px] font-medium"
                      >
                        <Waves className="w-3 h-3 text-[#2c6175]" />
                        <span>Algas</span>
                      </span>
                    )}
                    {dish.hasOliveOil && (
                      <span
                        title="AOVE"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f8f9f0] text-[#636e2f] border border-[#e0e5be] text-[11px] font-medium"
                      >
                        <Droplet className="w-3 h-3 text-[#636e2f]" />
                        <span>AOVE</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-[#f1ebe0] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#557857] group-hover:underline">
                  Ver detalle →
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={(e) => handleOpenEdit(dish, e)}
                    className="p-2 rounded-xl hover:bg-[#f3eee4] text-[#6b6151] hover:text-[#2d3748] transition"
                    title="Editar receta"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(dish.id, e)}
                    className="p-2 rounded-xl hover:bg-[#fae8e5] text-[#9c8e82] hover:text-[#c0563b] transition"
                    title="Eliminar plato"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="space-y-4 animate-fade-in">
      {/* Lista Editable de Frutas */}
      <div className="bg-white border border-[#eae3d5] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f5ede4] border border-[#e8dcd0] flex items-center justify-center shrink-0">
              <Apple className="w-5 h-5 text-[#8c5822]" />
            </div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#2d3748]">
                Frutas
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f0f5f0] text-[#436444] border border-[#d6e5d6]">
                {fruits.length} {fruits.length === 1 ? 'fruta' : 'frutas'}
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenAddFruit}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#527354] hover:bg-[#435e45] text-white transition text-xs sm:text-sm font-semibold shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Fruta</span>
          </button>
        </div>

        {/* Buscador de frutas */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8a7f6f] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar fruta por nombre o descripción..."
            value={fruitSearch}
            onChange={(e) => setFruitSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-[#fcfbf9] border border-[#dfd6c6] rounded-xl text-xs sm:text-sm text-[#3a342a] focus:outline-hidden focus:border-[#6f9072]"
          />
          {fruitSearch && (
            <button
              onClick={() => setFruitSearch('')}
              className="absolute right-3 top-2.5 text-[#998d7d] hover:text-[#332b21] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabla / Lista compacta de frutas */}
        <div className="border border-[#ede6d8] rounded-2xl overflow-hidden divide-y divide-[#f2ebe0]">
          {filteredFruits.map((fruit) => (
            <div
              key={fruit.id}
              className="px-4 py-3 bg-white hover:bg-[#faf8f4] transition flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-sm text-[#2d3748] block">
                  {fruit.name}
                </span>
                {fruit.description && (
                  <p className="text-xs text-[#79857d] mt-0.5 line-clamp-1">
                    {fruit.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={(e) => handleOpenEditFruit(fruit, e)}
                  className="p-1.5 rounded-lg hover:bg-[#ede7dc] text-[#6b6151] hover:text-[#2d3748] transition cursor-pointer"
                  title="Editar fruta"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDeleteFruit(fruit.id, e)}
                  className="p-1.5 rounded-lg hover:bg-[#fae8e5] text-[#9c8e82] hover:text-[#c0563b] transition cursor-pointer"
                  title="Eliminar fruta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredFruits.length === 0 && (
            <div className="p-8 text-center text-[#79857d]">
              <Apple className="w-8 h-8 mx-auto text-[#c5bcb0] mb-2" />
              <p className="text-sm font-semibold text-[#4e463a]">No se encontraron frutas</p>
              <p className="text-xs text-[#8c8273] mt-0.5">Prueba con otra búsqueda o añade una nueva fruta a la lista.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )}

      {/* Detail Modal: Portal a body, centrado en el viewport sin desplazamiento */}
      {viewingDish &&
        createPortal(
          <div
            onClick={() => setViewingDish(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-6 bg-stone-900/30 backdrop-blur-xs cursor-pointer overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl border border-[#ded5c5] overflow-hidden animate-scale-up cursor-default my-auto"
            >
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#f0eae0] bg-[#faf8f4] flex items-center justify-between shrink-0 gap-2">
                <div className="min-w-0">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#5a7b5c] block truncate">
                    {categoryMap[viewingDish.categoryId]?.name} • {viewingDish.subcategory}
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#2f3833] mt-0.5 truncate">
                    {viewingDish.name}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingDish(null)}
                  className="text-[#847866] hover:text-[#2d3748] p-1.5 sm:p-2 rounded-2xl hover:bg-white cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <span className="text-xs uppercase font-semibold text-[#807666] tracking-wider block mb-1">
                    Descripción del Plato
                  </span>
                  <p className="text-sm text-[#3b473f] bg-[#f8faf8] p-3.5 rounded-2xl border border-[#dce8dc] leading-relaxed">
                    {viewingDish.description || 'Sin descripción detallada.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ede6d9]">
                    <span className="text-[#807666] text-xs block">Técnica:</span>
                    <span className="font-semibold text-[#2d3831] mt-0.5 block">{viewingDish.cookingTechnique}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ede6d9]">
                    <span className="text-[#807666] text-xs block">Tiempo:</span>
                    <span className="font-semibold text-[#2d3831] mt-0.5 block">~{viewingDish.preparationTime} minutos</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-xs uppercase font-semibold text-[#807666] tracking-wider block">
                      Ingredientes ({viewingServings} {viewingServings === 1 ? 'persona' : 'personas'})
                    </span>
                    <div className="flex items-center space-x-1.5 bg-[#f4f7f4] border border-[#d6e5d6] rounded-xl px-2 py-0.5 text-xs font-semibold text-[#2f4232]">
                      <button
                        type="button"
                        onClick={() => setViewingServings((prev) => Math.max(1, prev - 1))}
                        className="p-1 hover:bg-[#e2ede2] rounded-lg transition text-[#405c44] cursor-pointer"
                        title="Restar comensal"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="min-w-20 text-center select-none font-bold text-xs text-[#2c3d2e]">
                        {viewingServings} {viewingServings === 1 ? 'persona' : 'personas'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewingServings((prev) => Math.min(20, prev + 1))}
                        className="p-1 hover:bg-[#e2ede2] rounded-lg transition text-[#405c44] cursor-pointer"
                        title="Añadir comensal"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {getDishIngredients(viewingDish).map((ing, i) => (
                      <span
                        key={i}
                        className="text-xs sm:text-sm px-3 py-1 rounded-xl bg-[#f4f7f4] text-[#3e5241] border border-[#d8e6d8] font-medium"
                      >
                        {formatScaledIngredient(ing, viewingServings, viewingDish.servings || 2)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Complementary foods badges if present */}
                {(viewingDish.hasEggs || (viewingDish.eggCount !== undefined && viewingDish.eggCount > 0) || viewingDish.hasVegetables || viewingDish.hasMushrooms || viewingDish.containsMushrooms || viewingDish.hasTubers || viewingDish.hasSeaweed || viewingDish.hasOliveOil) && (
                  <div>
                    <span className="text-xs uppercase font-semibold text-[#807666] tracking-wider block mb-2">
                      Alimentos Complementarios
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(viewingDish.hasEggs || (viewingDish.eggCount !== undefined && viewingDish.eggCount > 0)) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fdf8eb] text-[#856b28] border border-[#eddba4] font-medium">
                          <Egg className="w-4 h-4 text-[#b5973b] shrink-0" />
                          <span>{viewingDish.eggCount && viewingDish.eggCount > 0 ? `${viewingDish.eggCount} huevos` : 'Huevos'}</span>
                        </span>
                      )}
                      {(viewingDish.hasVegetables || (viewingDish.vegetableTypes && viewingDish.vegetableTypes.length > 0)) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f7f1] text-[#3d6e42] border border-[#d2e6d5] font-medium">
                          <Salad className="w-4 h-4 text-[#3d6e42] shrink-0" />
                          <span>
                            Verduras {viewingDish.vegetableTypes && viewingDish.vegetableTypes.length > 0 ? `(${viewingDish.vegetableTypes.map((t) => {
                              const map: Record<string, string> = { cruciferas: 'Crucíferas', bulbos: 'Bulbos', alcachofas: 'Alcachofas', hojas_tallos: 'Hojas y tallos', solanaceas: 'Solanáceas' };
                              return map[t] || t;
                            }).join(', ')})` : ''}
                          </span>
                        </span>
                      )}
                      {(viewingDish.hasMushrooms || viewingDish.containsMushrooms) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf5f0] text-[#7d5e3c] border border-[#e8d5c4] font-medium">
                          <MushroomIcon className="w-4 h-4 text-[#7d5e3c] shrink-0" />
                          <span>Setas y hongos</span>
                        </span>
                      )}
                      {viewingDish.hasTubers && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fdf5f0] text-[#915632] border border-[#ebd2c3] font-medium">
                          <TuberIcon className="w-4 h-4 text-[#915632] shrink-0" />
                          <span>Tubérculos y raíces</span>
                        </span>
                      )}
                      {viewingDish.hasSeaweed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f6f8] text-[#2c6175] border border-[#c4e0eb] font-medium">
                          <Waves className="w-4 h-4 text-[#2c6175] shrink-0" />
                          <span>Algas</span>
                        </span>
                      )}
                      {viewingDish.hasOliveOil && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f9f0] text-[#636e2f] border border-[#e0e5be] font-medium">
                          <Droplet className="w-4 h-4 text-[#636e2f] shrink-0" />
                          <span>AOVE</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Modo de Preparación */}
                {viewingDish.steps && viewingDish.steps.length > 0 && (
                  <div className="pt-1">
                    <span className="text-xs uppercase font-semibold text-[#807666] tracking-wider block mb-2.5 flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-[#527354]" />
                      <span>Modo de preparación</span>
                    </span>
                    <ol className="space-y-2">
                      {viewingDish.steps.map((step, idx) => (
                        <li
                          key={idx}
                          className="flex items-start space-x-3 text-xs sm:text-sm text-[#2d3831] bg-[#faf8f4] p-3 rounded-2xl border border-[#ede5d8]"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#527354] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed flex-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Consejos de Preparación y Notas (Al final del todo) */}
                <div className="p-4 bg-[#fdfbf2] border border-[#ede4cb] rounded-2xl flex items-start space-x-3 shadow-2xs mt-2">
                  <div className="w-8 h-8 rounded-xl bg-[#faedd2] border border-[#ebd8b0] flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4 text-[#a87a1d]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[#7a5c1a] uppercase tracking-wide block">
                      Consejos de preparación
                    </span>
                    <p className="text-xs sm:text-sm text-[#665426] mt-1 leading-relaxed">
                      {getCookingTip(viewingDish)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-[#faf8f4] border-t border-[#f0eae0] flex justify-between items-center shrink-0">
                <button
                  onClick={() => handleOpenEdit(viewingDish)}
                  className="text-sm font-semibold text-[#507252] hover:underline flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar esta receta</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `${window.location.origin}${window.location.pathname}?recipe=${encodeURIComponent(
                          viewingDish.id
                        )}`,
                        '_blank'
                      )
                    }
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-[#dfd7c8] text-[#4f483c] hover:bg-[#f8f5ee] transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    title="Abrir en pestaña independiente para cocinar sin perderla si actualizas"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#527354]" />
                    <span>Abrir en otra pestaña</span>
                  </button>

                  <button
                    onClick={() => setViewingDish(null)}
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#527354] text-white hover:bg-[#435e45] transition cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Add / Edit Form Modal: Portal a body, centrado en el viewport sin desplazamiento */}
      {isFormOpen &&
        createPortal(
          <div
            onClick={() => setIsFormOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-6 bg-stone-900/30 backdrop-blur-xs cursor-pointer overflow-y-auto"
          >
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSaveForm}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-[#ded5c5] overflow-hidden animate-scale-up cursor-default my-auto"
            >
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#f0eae0] bg-[#faf8f4] flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-lg sm:text-xl text-[#2f3833]">
                  {editingDish ? 'Modificar Plato' : 'Nuevo Plato en el Recetario'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-[#847866] hover:text-[#2d3748] p-1.5 sm:p-2 rounded-2xl hover:bg-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
                {/* 1. Nombre del plato */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f483c] mb-1">
                    Nombre del Plato *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Salmón Salvaje con Espárragos Verdes"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                  />
                </div>

                {/* 2. Descripción del Plato */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f483c] mb-1">
                    Descripción del Plato
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Descripción del plato, detalles de elaboración o notas culinarias..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                  />
                </div>

                {/* 2. Categoría Principal y Subcategoría */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4f483c] mb-1">
                      Categoría Principal *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as CategoryId;
                        setFormCategory(newCat);
                        const subcats = CATEGORIES.find((c) => c.id === newCat)?.subcategories || [];
                        setFormSubcategory(subcats[0] || '');
                      }}
                      className="w-full text-sm px-3.5 py-2.5 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4f483c] mb-1">
                      Subcategoría *
                    </label>
                    <select
                      value={formSubcategory}
                      onChange={(e) => setFormSubcategory(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                    >
                      {(CATEGORIES.find((c) => c.id === formCategory)?.subcategories || []).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Técnica de Cocinado y 4. Tiempo de Preparación */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4f483c] mb-1">
                      Técnica de Cocinado *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Vapor suave, olla presión, horno suave..."
                      value={formTechnique}
                      onChange={(e) => setFormTechnique(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4f483c] mb-1">
                      Tiempo de Preparación (minutos)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={formPrepTime}
                      onChange={(e) => setFormPrepTime(Number(e.target.value))}
                      className="w-full text-sm px-3.5 py-2.5 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                    />
                  </div>
                </div>

                {/* 5. Ingredientes y Cantidades (Base para 2 personas) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#4f483c]">
                        Ingredientes de la receta *
                      </label>
                      <span className="text-[11px] text-[#557557] font-medium flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5" />
                        Base calculada para <strong>2 personas</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddIngredientRow}
                      className="text-xs font-semibold text-[#527354] hover:text-[#3d593f] flex items-center space-x-1 cursor-pointer hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir ingrediente</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formRecipeIngredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {/* Nombre del ingrediente */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            required={idx === 0}
                            placeholder="Nombre del ingrediente"
                            value={ing.name}
                            onChange={(e) => handleUpdateIngredientRow(idx, 'name', e.target.value)}
                            className="w-full text-xs sm:text-sm px-2.5 sm:px-3 py-2 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                          />
                        </div>

                        {/* Cantidad numérica */}
                        <div className="w-16 sm:w-24 shrink-0">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="Cant."
                            value={ing.amount}
                            onChange={(e) => handleUpdateIngredientRow(idx, 'amount', e.target.value)}
                            className="w-full text-xs sm:text-sm px-1.5 sm:px-2.5 py-2 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072] text-right"
                            title="Cantidad para 2 personas"
                          />
                        </div>

                        {/* Unidad: selector de g, mL o nada (número suelto) */}
                        <div className="w-20 sm:w-28 shrink-0">
                          <select
                            value={ing.unit || ''}
                            onChange={(e) => handleUpdateIngredientRow(idx, 'unit', e.target.value)}
                            className="w-full text-xs sm:text-sm px-1.5 sm:px-2.5 py-2 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072] cursor-pointer"
                            title="Selecciona g, mL o déjalo vacío para un número suelto"
                          >
                            <option value="g">g</option>
                            <option value="mL">mL</option>
                            <option value="">(nada)</option>
                            {ing.unit && ing.unit !== 'g' && ing.unit !== 'mL' && (
                              <option value={ing.unit}>{ing.unit}</option>
                            )}
                          </select>
                        </div>

                        {/* Botón eliminar fila */}
                        {formRecipeIngredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredientRow(idx)}
                            className="p-2 text-[#998b79] hover:text-[#b34032] hover:bg-[#faeae7] rounded-xl transition cursor-pointer shrink-0"
                            title="Eliminar ingrediente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Modo de preparación */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#4f483c] flex items-center space-x-1.5">
                      <ListOrdered className="w-4 h-4 text-[#527354]" />
                      <span>Modo de preparación</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddStep}
                      className="text-xs font-semibold text-[#527354] hover:text-[#3d593f] flex items-center space-x-1 cursor-pointer hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir paso</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <span className="w-6 h-6 rounded-full bg-[#eef4ee] text-[#436444] border border-[#d6e5d6] text-xs font-bold flex items-center justify-center shrink-0 mt-2">
                          {idx + 1}
                        </span>
                        <textarea
                          rows={2}
                          value={step}
                          onChange={(e) => handleStepChange(idx, e.target.value)}
                          placeholder={`Paso ${idx + 1}: Describe esta fase de la receta...`}
                          className="flex-1 text-xs sm:text-sm px-3 py-2 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                        />
                        {formSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            className="p-1.5 mt-1.5 text-[#9c8e82] hover:text-[#c0563b] rounded-lg hover:bg-[#fae8e5] transition cursor-pointer"
                            title="Eliminar este paso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Consejos de Preparación */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f483c] mb-1 flex items-center space-x-1.5">
                    <Lightbulb className="w-4 h-4 text-[#b88828]" />
                    <span>Consejos de preparación</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formCookingTips}
                    onChange={(e) => setFormCookingTips(e.target.value)}
                    placeholder="Punto óptimo de cocción, trucos culinarios, sugerencia de acompañamiento o conservación..."
                    className="w-full text-xs sm:text-sm px-3.5 py-2 bg-[#fdfcf9] border border-[#ded5c5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
                  />
                </div>

                {/* 8. Alimentos Complementarios (Formato Compacto) */}
                <div className="p-3 bg-[#faf8f4] rounded-2xl border border-[#ede5d8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4f483c] uppercase tracking-wider flex items-center gap-1.5">
                      <span>Alimentos complementarios</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {/* Huevos */}
                    <div className={`p-2 rounded-xl border transition flex flex-col justify-between ${
                      formHasEggs ? 'bg-[#fdfaf2] border-[#e2cca2] text-[#73591f]' : 'bg-white border-[#e8e2d5] text-[#554c3e]'
                    }`}>
                      <label className="flex items-center space-x-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formHasEggs}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormHasEggs(checked);
                            if (checked && (!formEggCount || formEggCount <= 0)) setFormEggCount(2);
                          }}
                          className="w-3.5 h-3.5 rounded text-[#527354] focus:ring-[#6f9072] border-[#c8beaf] cursor-pointer"
                        />
                        <Egg className="w-3.5 h-3.5 text-[#b5973b] shrink-0" />
                        <span className="text-xs font-semibold">Huevos</span>
                      </label>
                      {formHasEggs && (
                        <div className="mt-1.5 pt-1.5 border-t border-[#f0e2c8] flex items-center justify-between text-[11px]">
                          <span>Cantidad:</span>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="1"
                              max="8"
                              value={formEggCount}
                              onChange={(e) => setFormEggCount(Math.max(1, Number(e.target.value)))}
                              className="w-11 px-1.5 py-0.5 text-xs bg-white border border-[#ded5c5] rounded text-center font-bold text-[#2f3833]"
                            />
                            <span className="text-[10px] text-[#7d6f57]">uds</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Setas y hongos */}
                    <label className={`p-2 rounded-xl border transition flex items-center space-x-2 cursor-pointer select-none ${
                      formHasMushrooms ? 'bg-[#fbf6f2] border-[#d9c4b2] text-[#694b2f]' : 'bg-white border-[#e8e2d5] text-[#554c3e]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formHasMushrooms}
                        onChange={(e) => setFormHasMushrooms(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#527354] focus:ring-[#6f9072] border-[#c8beaf] cursor-pointer"
                      />
                      <MushroomIcon className="w-3.5 h-3.5 text-[#7d5e3c] shrink-0" />
                      <span className="text-xs font-semibold">Setas / Hongos</span>
                    </label>

                    {/* Tubérculos */}
                    <label className={`p-2 rounded-xl border transition flex items-center space-x-2 cursor-pointer select-none ${
                      formHasTubers ? 'bg-[#fdf6f2] border-[#e2c8b8] text-[#7a4829]' : 'bg-white border-[#e8e2d5] text-[#554c3e]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formHasTubers}
                        onChange={(e) => setFormHasTubers(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#527354] focus:ring-[#6f9072] border-[#c8beaf] cursor-pointer"
                      />
                      <TuberIcon className="w-3.5 h-3.5 text-[#915632] shrink-0" />
                      <span className="text-xs font-semibold">Tubérculos</span>
                    </label>

                    {/* Algas */}
                    <label className={`p-2 rounded-xl border transition flex items-center space-x-2 cursor-pointer select-none ${
                      formHasSeaweed ? 'bg-[#f2f7f9] border-[#bedae3] text-[#245061]' : 'bg-white border-[#e8e2d5] text-[#554c3e]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formHasSeaweed}
                        onChange={(e) => setFormHasSeaweed(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#527354] focus:ring-[#6f9072] border-[#c8beaf] cursor-pointer"
                      />
                      <Waves className="w-3.5 h-3.5 text-[#2c6175] shrink-0" />
                      <span className="text-xs font-semibold">Algas</span>
                    </label>

                    {/* AOVE */}
                    <label className={`p-2 rounded-xl border transition flex items-center space-x-2 cursor-pointer select-none ${
                      formHasOliveOil ? 'bg-[#f6f7ed] border-[#d5dcad] text-[#535c24]' : 'bg-white border-[#e8e2d5] text-[#554c3e]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formHasOliveOil}
                        onChange={(e) => setFormHasOliveOil(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#527354] focus:ring-[#6f9072] border-[#c8beaf] cursor-pointer"
                      />
                      <Droplet className="w-3.5 h-3.5 text-[#636e2f] shrink-0" />
                      <span className="text-xs font-semibold">AOVE</span>
                    </label>

                    {/* Verduras */}
                    <div className={`p-2 rounded-xl border transition ${
                      formHasVegetables ? 'bg-[#f2f7f3] border-[#bdd8bf] text-[#2f5533]' : 'bg-white border-[#e8e2d5] text-[#554c3e]'
                    }`}>
                      <label className="flex items-center space-x-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formHasVegetables}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormHasVegetables(checked);
                            if (!checked) setFormVegetableTypes([]);
                          }}
                          className="w-3.5 h-3.5 rounded text-[#527354] focus:ring-[#6f9072] border-[#c8beaf] cursor-pointer"
                        />
                        <Salad className="w-3.5 h-3.5 text-[#3d6e42] shrink-0" />
                        <span className="text-xs font-semibold">Verduras</span>
                      </label>
                    </div>
                  </div>

                  {/* Subcategorías de verduras inline */}
                  {formHasVegetables && (
                    <div className="pt-2 border-t border-[#e8dfd2]">
                      <span className="text-[11px] font-semibold text-[#5a5041] block mb-1.5">
                        Subcategorías de verduras incluidas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'cruciferas', label: 'Crucíferas' },
                          { id: 'bulbos', label: 'Bulbos' },
                          { id: 'alcachofas', label: 'Alcachofas' },
                          { id: 'hojas_tallos', label: 'Hojas y tallos' },
                          { id: 'solanaceas', label: 'Solanáceas' },
                        ].map((vType) => {
                          const isSelected = formVegetableTypes.includes(vType.id);
                          return (
                            <button
                              key={vType.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setFormVegetableTypes(formVegetableTypes.filter((t) => t !== vType.id));
                                } else {
                                  setFormVegetableTypes([...formVegetableTypes, vType.id]);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#527354] text-white border-[#527354] shadow-2xs'
                                  : 'bg-white text-[#52493c] border-[#dfd6c6] hover:bg-[#f4efe4]'
                              }`}
                            >
                              {vType.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-[#faf8f4] border-t border-[#f0eae0] flex justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#6b6252] hover:bg-white border border-[#dfd7c8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#527354] text-white hover:bg-[#435e45] transition shadow-xs cursor-pointer"
                >
                  {editingDish ? 'Guardar Cambios' : 'Crear Plato'}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

      {/* Fruit Create / Edit Modal: Portal a body */}
      {isFruitModalOpen &&
        createPortal(
          <div
            onClick={() => setIsFruitModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-6 bg-stone-900/30 backdrop-blur-xs cursor-pointer overflow-y-auto"
          >
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSaveFruitForm}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-[#ded5c5] overflow-hidden animate-scale-up cursor-default my-auto"
            >
              <div className="px-6 py-4 border-b border-[#f0eae0] bg-[#faf8f4] flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#fdf2ee] border border-[#f5d9cf] flex items-center justify-center">
                    <Apple className="w-4 h-4 text-[#c0735a]" />
                  </div>
                  <h3 className="font-semibold text-lg text-[#2f3833]">
                    {editingFruit ? 'Modificar Fruta' : 'Añadir Nueva Fruta'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFruitModalOpen(false)}
                  className="text-[#847866] hover:text-[#2d3748] p-2 rounded-2xl hover:bg-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f483c] mb-1">
                    Nombre de la Fruta *
                  </label>
                  <input
                    type="text"
                    required
                    value={formFruitName}
                    onChange={(e) => setFormFruitName(e.target.value)}
                    placeholder="Ej. Fresas silvestres, Kiwi amarillo, Manzana Fuji..."
                    className="w-full px-4 py-2.5 bg-[#fcfbf9] border border-[#dcd3c3] rounded-2xl text-xs sm:text-sm text-[#2c3531] focus:outline-hidden focus:border-[#6f9072]"
                  />
                </div>

                {/* Descripción / Notas */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f483c] mb-1">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={formFruitDescription}
                    onChange={(e) => setFormFruitDescription(e.target.value)}
                    placeholder="Notas o descripción sobre la fruta..."
                    className="w-full px-4 py-2.5 bg-[#fcfbf9] border border-[#dcd3c3] rounded-2xl text-xs sm:text-sm text-[#2c3531] focus:outline-hidden focus:border-[#6f9072]"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#faf8f4] border-t border-[#f0eae0] flex justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFruitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#6b6252] hover:bg-white border border-[#dfd7c8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#527354] text-white hover:bg-[#435e45] transition shadow-xs cursor-pointer"
                >
                  {editingFruit ? 'Guardar Cambios' : 'Añadir Fruta'}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

    </div>
  );
};
