/**
 * Client-side Rate Limit Guard UX Helper
 * Mirrors backend rate limits to provide instant UX feedback and countdown timers.
 * Note: Purely for user experience — backend remains authoritative.
 */

const lockStore: Map<string, number> = new Map();

export const rateLimitGuard = {
  /**
   * Checks whether the specified action is currently rate-limited on the client.
   */
  isBlocked(action: string): boolean {
    const expiresAt = lockStore.get(action);
    if (!expiresAt) return false;
    if (Date.now() >= expiresAt) {
      lockStore.delete(action);
      return false;
    }
    return true;
  },

  /**
   * Returns remaining cooldown time in seconds for the specified action.
   */
  remaining(action: string): number {
    const expiresAt = lockStore.get(action);
    if (!expiresAt) return 0;
    const diff = Math.ceil((expiresAt - Date.now()) / 1000);
    if (diff <= 0) {
      lockStore.delete(action);
      return 0;
    }
    return diff;
  },

  /**
   * Initiates a client-side cooldown timer for an action (durationMs default: 60000ms).
   */
  start(action: string, durationMs: number = 60000): void {
    lockStore.set(action, Date.now() + durationMs);
  },

  /**
   * Clears the active rate-limit lock for an action.
   */
  clear(action: string): void {
    lockStore.delete(action);
  },
};

export default rateLimitGuard;
