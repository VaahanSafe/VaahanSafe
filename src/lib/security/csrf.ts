/**
 * Enterprise Double-Submit CSRF Security Module
 * Manages CSRF tokens issued by backend GET /auth/me or set via custom headers.
 * Automatically attaches X-CSRF-Token to mutating HTTP requests (POST, PUT, PATCH, DELETE).
 */

let inMemoryCsrfToken: string | null = null;

/**
 * Retrieves the current in-memory CSRF token.
 */
export function getCsrfToken(): string | null {
  return inMemoryCsrfToken;
}

/**
 * Sets the active CSRF token.
 */
export function setCsrfToken(token: string | null): void {
  inMemoryCsrfToken = token;
}

/**
 * Attaches the X-CSRF-Token header to an outgoing headers dictionary if a token exists.
 */
export function attachCsrfHeader(headers: Record<string, any>): Record<string, any> {
  const token = getCsrfToken();
  if (token) {
    headers['X-CSRF-Token'] = token;
  }
  return headers;
}
