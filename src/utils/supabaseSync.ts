import type { Dish, Fruit, WeekPlan } from '../types';
import { hashPin } from './pinAuth';
import { getStoredDishes, getStoredFruits, getStoredPlans } from './storage';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://wuswtfqeeomhjygllbya.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fYKRK771AUBdeYT6o3MzsQ_QMrkBofr';

const ROW_ID = 'family_menu';

export interface RemoteSharedPayload {
  pinHash: string;
  dishes: Dish[];
  fruits: Fruit[];
  plans: Record<string, WeekPlan>;
  shoppingStates: Record<string, unknown>;
  updatedAt: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

type StatusListener = (status: SyncStatus) => void;
const listeners = new Set<StatusListener>();
let currentStatus: SyncStatus = 'synced';

function setSyncStatus(status: SyncStatus) {
  currentStatus = status;
  listeners.forEach((l) => l(status));
}

export function subscribeSyncStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => listeners.delete(listener);
}

function getAuthHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Consulta la base de datos remota para obtener el registro familiar compartido.
 */
export async function fetchRemoteSharedData(): Promise<RemoteSharedPayload | null> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/menu_shared_data?id=eq.${ROW_ID}&select=*`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      console.warn('Error fetching Supabase data:', res.status, res.statusText);
      setSyncStatus('error');
      return null;
    }

    const rows = (await res.json()) as Array<{ id: string; data: RemoteSharedPayload; updated_at: string }>;
    if (!rows || rows.length === 0 || !rows[0].data) {
      return null;
    }

    setSyncStatus('synced');
    return rows[0].data;
  } catch (err) {
    console.warn('Network offline / error connecting to Supabase:', err);
    setSyncStatus('offline');
    return null;
  }
}

/**
 * Guarda o actualiza los datos en Supabase con resolución por reemplazo (upsert).
 */
export async function pushRemoteSharedData(
  payload: Partial<RemoteSharedPayload> & { pinHash?: string }
): Promise<boolean> {
  try {
    setSyncStatus('syncing');

    // Cargar shopping states actuales de localStorage
    const shoppingStates: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('menu_shopping_state_')) {
        try {
          const val = localStorage.getItem(key);
          if (val) shoppingStates[key] = JSON.parse(val);
        } catch {
          // ignore
        }
      }
    }

    // Datos a enviar
    const fullPayload: RemoteSharedPayload = {
      pinHash: payload.pinHash || localStorage.getItem('menu_planificador_pin_hash_v1') || '',
      dishes: payload.dishes || getStoredDishes(),
      fruits: payload.fruits || getStoredFruits(),
      plans: payload.plans || getStoredPlans(),
      shoppingStates: payload.shoppingStates || shoppingStates,
      updatedAt: new Date().toISOString(),
    };

    const url = `${SUPABASE_URL}/rest/v1/menu_shared_data`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: ROW_ID,
        data: fullPayload,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.error('Failed to push to Supabase:', res.status, await res.text());
      setSyncStatus('error');
      return false;
    }

    setSyncStatus('synced');
    return true;
  } catch (err) {
    console.warn('Failed to push to Supabase (offline):', err);
    setSyncStatus('offline');
    return false;
  }
}

// Debounce helper para sincronización automática
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
export function triggerDebouncedCloudSync(
  payload?: Partial<RemoteSharedPayload>
): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  setSyncStatus('syncing');
  syncTimeout = setTimeout(() => {
    pushRemoteSharedData(payload || {});
  }, 600);
}

/**
 * Comprueba el PIN contra la nube o inicializa el PIN compartido.
 */
export async function verifyOrSetupRemotePin(
  enteredPin: string
): Promise<{ success: boolean; isFirstTime: boolean; remoteData?: RemoteSharedPayload }> {
  const enteredHash = await hashPin(enteredPin);
  const remote = await fetchRemoteSharedData();

  if (!remote || !remote.pinHash) {
    // Es la primera vez que se configura el PIN en la nube
    const localDishes = getStoredDishes();
    const localFruits = getStoredFruits();
    const localPlans = getStoredPlans();

    await pushRemoteSharedData({
      pinHash: enteredHash,
      dishes: localDishes,
      fruits: localFruits,
      plans: localPlans,
    });

    localStorage.setItem('menu_planificador_pin_hash_v1', enteredHash);
    return { success: true, isFirstTime: true };
  }

  // Ya existe un PIN configurado en la nube
  if (remote.pinHash === enteredHash) {
    localStorage.setItem('menu_planificador_pin_hash_v1', enteredHash);
    return { success: true, isFirstTime: false, remoteData: remote };
  }

  return { success: false, isFirstTime: false };
}
