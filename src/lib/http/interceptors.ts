import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getAccessToken, silentRefresh, clearAccessToken } from '@/lib/security/tokenManager';
import { getCsrfToken } from '@/lib/security/csrf';
import { useAuthStore } from '@/features/auth/auth.store';

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  _retry?: boolean;
}

/**
 * Standardized Rate Limit Error for Client UX Countdown Timers
 */
export class RateLimitError extends Error {
  public readonly retryAfter: number;
  public readonly action: string;

  constructor(message: string, retryAfter: number = 60, action: string = 'request') {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.action = action;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Checks if a request URL matches public scan endpoints that bypass Bearer auth
 */
function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;
  return url.includes('/scan/') || url.includes('/scans/') || url.includes('/auth/otp/');
}

/**
 * Configures request and response interceptors on the single enterprise Axios instance.
 */
export function setupInterceptors(apiClient: AxiosInstance): void {
  // Request Interceptor
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const customConfig = config as CustomAxiosRequestConfig;

      // Attach CSRF Token for mutating HTTP methods
      const method = (config.method || 'GET').toUpperCase();
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken && config.headers) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      }

      // Skip Authorization header if explicitly set or matching public scan endpoints
      if (customConfig.skipAuth || isPublicEndpoint(config.url)) {
        return config;
      }

      // Attach Bearer Access Token if present in TokenManager
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: any) => Promise.reject(error)
  );

  // Response Interceptor
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig | undefined;
      const status = error.response?.status;

      // Handle 429 Too Many Requests
      if (status === 429) {
        const headers = error.response?.headers || {};
        const retryAfterHeader = headers['retry-after'] || headers['x-ratelimit-reset'];
        const retryAfter = retryAfterHeader ? parseInt(String(retryAfterHeader), 10) : 60;
        
        const responseData = error.response?.data as any;
        const message = responseData?.message || responseData?.detail || 'Too many requests. Please try again shortly.';
        const action = responseData?.action || 'action';

        return Promise.reject(new RateLimitError(message, retryAfter, action));
      }

      // Handle 401 Unauthorized with Single Silent Refresh
      if (status === 401 && originalRequest && !originalRequest._retry && !originalRequest.skipAuth && !isPublicEndpoint(originalRequest.url)) {
        originalRequest._retry = true;

        const newToken = await silentRefresh();

        if (newToken) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }

        // Silent refresh failed -> clear session and redirect to /login
        clearAccessToken();
        useAuthStore.getState().logoutStore();

        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }

      return Promise.reject(error);
    }
  );
}
