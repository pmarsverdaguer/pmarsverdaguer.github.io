export const PIN_STORAGE_KEY = 'menu_planificador_pin_hash_v1';
export const PIN_REMEMBER_KEY = 'menu_planificador_pin_remember_v1';
export const PIN_SESSION_KEY = 'menu_planificador_pin_session_unlocked_v1';

export async function hashPin(pin: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(`menu_planificador_salt_${pin}`);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fallback
  }
  // Fallback simple hash for non-crypto contexts
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = (Math.imul(31, h) + pin.charCodeAt(i)) | 0;
  }
  return `hash_fb_${h}`;
}

export function isPinUnlocked(): boolean {
  try {
    // La app solo está desbloqueada si la pestaña actual tiene la sesión activa verificada
    return sessionStorage.getItem(PIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function lockApp(): void {
  try {
    sessionStorage.removeItem(PIN_SESSION_KEY);
    localStorage.removeItem(PIN_REMEMBER_KEY);
  } catch {
    // fallback
  }
}

export function hasConfiguredPin(): boolean {
  try {
    return Boolean(localStorage.getItem(PIN_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function resetStoredPin(): void {
  try {
    localStorage.removeItem(PIN_STORAGE_KEY);
    localStorage.removeItem(PIN_REMEMBER_KEY);
    sessionStorage.removeItem(PIN_SESSION_KEY);
  } catch {
    // fallback
  }
}
