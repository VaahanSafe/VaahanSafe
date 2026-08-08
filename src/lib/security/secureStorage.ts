/**
 * Enterprise Secure Storage Wrapper
 * Enforces a strict allow-list for browser localStorage usage.
 * Prevents accidental persistence of sensitive tokens, medical parameters, or PII.
 */

const ALLOWED_STORAGE_KEYS = new Set([
  'theme',
  'locale',
  'sidebarCollapsed',
  'vs_auth_session',
]);

function isKeyAllowed(key: string): boolean {
  return ALLOWED_STORAGE_KEYS.has(key);
}

export const secureStorage = {
  getItem(key: string): string | null {
    if (!isKeyAllowed(key)) {
      if (import.meta.env.DEV) {
        console.warn(`[SecureStorage Violation] Access to non-allowlisted key "${key}" was blocked.`);
      }
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    if (!isKeyAllowed(key)) {
      const errorMsg = `[SecureStorage Security Exception] Attempted to store non-allowlisted key "${key}". Sensitive tokens, medical parameters, and PII must never be written to localStorage.`;
      if (import.meta.env.DEV) {
        throw new Error(errorMsg);
      }
      console.error(errorMsg);
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  },

  removeItem(key: string): void {
    if (!isKeyAllowed(key)) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },

  clearAllowed(): void {
    ALLOWED_STORAGE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    });
  },
};

export default secureStorage;
