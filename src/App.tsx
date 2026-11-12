import { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Planner } from './components/Planner';
import { Recipes } from './components/Recipes';
import { Library } from './components/Library';
import { DayDetailModal } from './components/DayDetailModal';
import { MonthViewModal } from './components/MonthViewModal';
import { StandaloneRecipeView } from './components/StandaloneRecipeView';
import { StandaloneShoppingListView } from './components/StandaloneShoppingListView';
import { ShoppingListModal } from './components/ShoppingListModal';
import { DataBackupModal } from './components/DataBackupModal';
import { PinLockScreen } from './components/PinLockScreen';
import { isPinUnlocked, lockApp, resetStoredPin } from './utils/pinAuth';
import {
  fetchRemoteSharedData,
  triggerDebouncedCloudSync,
  type RemoteSharedPayload,
} from './utils/supabaseSync';
import type { Dish, Fruit, WeekPlan } from './types';
import {
  getStoredDishes,
  saveStoredDishes,
  getStoredFruits,
  saveStoredFruits,
  getStoredPlans,
  saveStoredPlan,
} from './utils/storage';
import { getISOWeekInfo } from './utils/dateUtils';
import { calculateNutritionalAudit, createBalancedSampleWeek, createEmptyWeekPlan } from './utils/audit';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'planner' | 'recipes' | 'library'>('dashboard');

  // Persistencia de la posición de scroll al cambiar de pestaña
  const tabScrollPositions = useRef<Record<string, number>>({});

  const handleSelectTab = (newTab: 'dashboard' | 'planner' | 'recipes' | 'library') => {
    if (newTab === currentTab) return;
    // Guardar posición de scroll de la pestaña actual
    tabScrollPositions.current[currentTab] = window.scrollY;
    setCurrentTab(newTab);

    // Restaurar inmediatamente la posición de scroll de la pestaña seleccionada
    requestAnimationFrame(() => {
      const savedY = tabScrollPositions.current[newTab] ?? 0;
      window.scrollTo({ top: savedY, behavior: 'instant' });
    });
  };

  // Load Dishes & Fruits
  const [dishes, setDishes] = useState<Dish[]>(() => getStoredDishes());
  const [fruits, setFruits] = useState<Fruit[]>(() => getStoredFruits());

  // Week navigation state
  const [currentWeekInfo] = useState(() => getISOWeekInfo(new Date()));
  const [activeYear, setActiveYear] = useState<number>(currentWeekInfo.year);
  const [activeWeekNum, setActiveWeekNum] = useState<number>(currentWeekInfo.week);

  const activeWeekId = `${activeYear}-W${String(activeWeekNum).padStart(2, '0')}`;

  // Plans stored
  const [plans, setPlans] = useState<Record<string, WeekPlan>>(() => getStoredPlans());

  // PIN de seguridad de 4 dígitos
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isPinUnlocked());

  const handleLockApp = () => {
    lockApp();
    setIsUnlocked(false);
  };

  const handleChangePin = () => {
    resetStoredPin();
    setIsUnlocked(false);
  };

  // Aplicar datos remotos recibidos de Supabase
  const applyRemoteData = (remote: RemoteSharedPayload) => {
    if (remote.dishes && Array.isArray(remote.dishes)) {
      saveStoredDishes(remote.dishes);
      setDishes(remote.dishes);
    }
    if (remote.fruits && Array.isArray(remote.fruits)) {
      saveStoredFruits(remote.fruits);
      setFruits(remote.fruits);
    }
    if (remote.plans && typeof remote.plans === 'object') {
      try {
        localStorage.setItem('menu_planificador_plans_v1', JSON.stringify(remote.plans));
      } catch {
        // ignore
      }
      setPlans(remote.plans);
    }
    if (remote.shoppingStates && typeof remote.shoppingStates === 'object') {
      Object.entries(remote.shoppingStates).forEach(([k, v]) => {
        try {
          localStorage.setItem(k, JSON.stringify(v));
        } catch {
          // ignore
        }
      });
      window.dispatchEvent(new Event('menu_storage_updated'));
    }
  };

  // Sincronización en la nube con Supabase cuando la app está activa o vuelve a ganar foco
  useEffect(() => {
    if (!isUnlocked) return;

    // Cargar datos remotos al desbloquear
    fetchRemoteSharedData().then((remote) => {
      if (remote) applyRemoteData(remote);
    });

    const handleSyncOnVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchRemoteSharedData().then((remote) => {
          if (remote) applyRemoteData(remote);
        });
      }
    };

    window.addEventListener('visibilitychange', handleSyncOnVisible);
    window.addEventListener('focus', handleSyncOnVisible);

    // Consulta ligera cada 20s para recibir cambios del otro móvil en tiempo real
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRemoteSharedData().then((remote) => {
          if (remote) applyRemoteData(remote);
        });
      }
    }, 20000);

    return () => {
      window.removeEventListener('visibilitychange', handleSyncOnVisible);
      window.removeEventListener('focus', handleSyncOnVisible);
      clearInterval(interval);
    };
  }, [isUnlocked]);

  // Zoom Modals
  const [detailDayIdx, setDetailDayIdx] = useState<number | null>(null);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Standalone recipe view (?recipe=xxx) for separate tab
  const [standaloneRecipeId, setStandaloneRecipeId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('recipe');
      return p || null;
    }
    return null;
  });

  // Standalone shopping list view (?shopping-list=xxx) for separate tab
  const [standaloneShoppingListWeekId, setStandaloneShoppingListWeekId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('shopping-list');
      return p || null;
    }
    return null;
  });

  useEffect(() => {
    const handlePopState = () => {
      const r = new URLSearchParams(window.location.search).get('recipe');
      setStandaloneRecipeId(r || null);
      const sl = new URLSearchParams(window.location.search).get('shopping-list');
      setStandaloneShoppingListWeekId(sl || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Maps for fast lookups
  const dishesMap = useMemo(() => Object.fromEntries(dishes.map((d) => [d.id, d])), [dishes]);
  const fruitsMap = useMemo(() => Object.fromEntries(fruits.map((f) => [f.id, f])), [fruits]);

  // Handle data reload from backup import or factory reset
  const handleDataReloaded = () => {
    const d = getStoredDishes();
    const f = getStoredFruits();
    const p = getStoredPlans();
    setDishes(d);
    setFruits(f);
    setPlans(p);
    triggerDebouncedCloudSync({ dishes: d, fruits: f, plans: p });
  };

  // Active plan for current selected week
  const activeWeekPlan = useMemo<WeekPlan>(() => {
    if (plans[activeWeekId]) {
      return plans[activeWeekId];
    }
    const isEmptied =
      typeof window !== 'undefined' &&
      localStorage.getItem('menu_planificador_user_emptied_v1') === 'true';
    if (dishes.length === 0 || isEmptied) {
      return createEmptyWeekPlan(activeYear, activeWeekNum, activeWeekId);
    }
    const sample = createBalancedSampleWeek(activeYear, activeWeekNum, activeWeekId, dishes, fruits);
    saveStoredPlan(sample);
    return sample;
  }, [plans, activeWeekId, activeYear, activeWeekNum, dishes, fruits]);

  // Weekly Nutritional Audit (evaluated for Planner)
  const audit = useMemo(
    () => calculateNutritionalAudit(activeWeekPlan, dishesMap),
    [activeWeekPlan, dishesMap]
  );

  // Save handler for plan updates
  const handleUpdatePlan = (updatedPlan: WeekPlan) => {
    const updated = {
      ...plans,
      [updatedPlan.weekId]: updatedPlan,
    };
    setPlans(updated);
    saveStoredPlan(updatedPlan);
    triggerDebouncedCloudSync({ plans: updated });
  };

  // Week navigation
  const handleNavigateWeek = (offset: number) => {
    let nextWeek = activeWeekNum + offset;
    let nextYear = activeYear;

    if (nextWeek < 1) {
      nextYear -= 1;
      nextWeek = 52;
    } else if (nextWeek > 52) {
      nextYear += 1;
      nextWeek = 1;
    }

    setActiveYear(nextYear);
    setActiveWeekNum(nextWeek);
  };

  const handleResetToCurrentWeek = () => {
    setActiveYear(currentWeekInfo.year);
    setActiveWeekNum(currentWeekInfo.week);
  };

  const handleSelectWeekAndDayFromMonth = (weekId: string, dayIndex: number) => {
    const [yStr, wStr] = weekId.split('-W');
    setActiveYear(Number(yStr));
    setActiveWeekNum(Number(wStr));
    setDetailDayIdx(dayIndex);
  };

  // Recipe CRUD
  const handleAddDish = (newDish: Dish) => {
    const updated = [newDish, ...dishes];
    setDishes(updated);
    saveStoredDishes(updated);
    triggerDebouncedCloudSync({ dishes: updated });
  };

  const handleUpdateDish = (updatedDish: Dish) => {
    const updated = dishes.map((d) => (d.id === updatedDish.id ? updatedDish : d));
    setDishes(updated);
    saveStoredDishes(updated);
    triggerDebouncedCloudSync({ dishes: updated });
  };

  const handleDeleteDish = (dishId: string) => {
    const updated = dishes.filter((d) => d.id !== dishId);
    setDishes(updated);
    saveStoredDishes(updated);
    triggerDebouncedCloudSync({ dishes: updated });
  };

  // Fruit CRUD
  const handleAddFruit = (newFruit: Fruit) => {
    const updated = [newFruit, ...fruits];
    setFruits(updated);
    saveStoredFruits(updated);
    triggerDebouncedCloudSync({ fruits: updated });
  };

  const handleUpdateFruit = (updatedFruit: Fruit) => {
    const updated = fruits.map((f) => (f.id === updatedFruit.id ? updatedFruit : f));
    setFruits(updated);
    saveStoredFruits(updated);
    triggerDebouncedCloudSync({ fruits: updated });
  };

  const handleDeleteFruit = (fruitId: string) => {
    const updated = fruits.filter((f) => f.id !== fruitId);
    setFruits(updated);
    saveStoredFruits(updated);
    triggerDebouncedCloudSync({ fruits: updated });
  };

  // Bloqueo de seguridad con PIN de 4 dígitos
  if (!isUnlocked) {
    return (
      <PinLockScreen
        onUnlock={(remoteData) => {
          if (remoteData) {
            applyRemoteData(remoteData);
          }
          setIsUnlocked(true);
        }}
      />
    );
  }

  if (standaloneRecipeId) {
    return (
      <StandaloneRecipeView
        dish={dishesMap[standaloneRecipeId]}
        onGoToApp={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setStandaloneRecipeId(null);
        }}
      />
    );
  }

  if (standaloneShoppingListWeekId) {
    const targetPlan = plans[standaloneShoppingListWeekId] || activeWeekPlan;
    return (
      <StandaloneShoppingListView
        currentWeekPlan={targetPlan}
        dishesMap={dishesMap}
        fruitsMap={fruitsMap}
        onGoToApp={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setStandaloneShoppingListWeekId(null);
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${
        currentTab === 'dashboard' ? 'lg:h-screen lg:overflow-hidden' : ''
      } bg-[#fcfbf9] text-[#2c3531] flex flex-col font-sans selection:bg-[#d8e6d8] selection:text-[#2d4730]`}
    >
      {/* Top Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenDataBackup={() => setIsBackupModalOpen(true)}
        onLockApp={handleLockApp}
        onOpenShoppingList={() => setIsShoppingListOpen(true)}
        onOpenMonthView={() => setIsMonthModalOpen(true)}
        onChangePin={handleChangePin}
      />

      {/* Main Content Area: Centered vertically on Dashboard between navbar and bottom */}
      <main
        className={`max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 pb-20 md:pb-8 ${
          currentTab === 'dashboard'
            ? 'flex-1 lg:min-h-0 py-2 sm:py-3 flex flex-col'
            : 'pt-4 sm:pt-6 flex-1'
        }`}
      >
        {currentTab === 'dashboard' && (
          <Dashboard
            currentWeekPlan={activeWeekPlan}
            dishesMap={dishesMap}
            fruitsMap={fruitsMap}
            onNavigateWeek={handleNavigateWeek}
            onResetToCurrentWeek={handleResetToCurrentWeek}
            onSelectDayForDetail={(idx) => setDetailDayIdx(idx)}
            onGoToPlanner={() => handleSelectTab('planner')}
            onOpenMonthView={() => setIsMonthModalOpen(true)}
            onOpenShoppingList={() => setIsShoppingListOpen(true)}
          />
        )}

        <div className={currentTab === 'planner' ? 'block' : 'hidden'}>
          <Planner
            currentWeekPlan={activeWeekPlan}
            dishes={dishes}
            fruits={fruits}
            audit={audit}
            onUpdatePlan={handleUpdatePlan}
            onNavigateWeek={handleNavigateWeek}
            onResetToCurrentWeek={handleResetToCurrentWeek}
          />
        </div>

        <div className={currentTab === 'recipes' ? 'block' : 'hidden'}>
          <Recipes
            dishes={dishes}
            onAddDish={handleAddDish}
            onUpdateDish={handleUpdateDish}
            onDeleteDish={handleDeleteDish}
            fruits={fruits}
            onAddFruit={handleAddFruit}
            onUpdateFruit={handleUpdateFruit}
            onDeleteFruit={handleDeleteFruit}
          />
        </div>

        <div className={currentTab === 'library' ? 'block' : 'hidden'}>
          <Library />
        </div>
      </main>

      {/* Footer only on secondary tabs */}
      {currentTab !== 'dashboard' && (
        <footer className="border-t border-[#ede6d8] py-5 bg-[#faf8f4] text-center text-xs text-[#7e8c81]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span>Menú Semanal</span>
            <div>
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(true)}
                className="text-[#7e8c81] hover:text-[#425c42] hover:underline font-semibold cursor-pointer"
              >
                Copia de Seguridad y Datos
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Zoom In: Day Detail Modal (No scroll, at-a-glance view) */}
      {detailDayIdx !== null && activeWeekPlan.days[detailDayIdx] && (
        <DayDetailModal
          dayPlan={activeWeekPlan.days[detailDayIdx]}
          dayIndex={detailDayIdx}
          dishesMap={dishesMap}
          fruitsMap={fruitsMap}
          onClose={() => setDetailDayIdx(null)}
          onEditDayInPlanner={() => {
            setDetailDayIdx(null);
            handleSelectTab('planner');
          }}
        />
      )}

      {/* Zoom Out: Month Calendar Grid Modal */}
      {isMonthModalOpen && (
        <MonthViewModal
          currentWeekPlan={activeWeekPlan}
          allPlans={plans}
          dishesMap={dishesMap}
          fruitsMap={fruitsMap}
          onClose={() => setIsMonthModalOpen(false)}
          onSelectWeekAndDay={handleSelectWeekAndDayFromMonth}
        />
      )}

      {/* Shopping List Modal */}
      <ShoppingListModal
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        currentWeekPlan={activeWeekPlan}
        dishesMap={dishesMap}
        fruitsMap={fruitsMap}
        onGoToPlanner={() => {
          setIsShoppingListOpen(false);
          handleSelectTab('planner');
        }}
      />

      {/* Data Management & Backup Modal (GitHub Pages offline persistence) */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        dishes={dishes}
        fruits={fruits}
        plans={plans}
        onDataReloaded={handleDataReloaded}
        onChangePin={handleChangePin}
      />
    </div>
  );
}

export default App;
