import axios, { type AxiosInstance } from 'axios';
import { env } from '@/config/env';
import { setupInterceptors, type CustomAxiosRequestConfig } from './interceptors';

/**
 * Enterprise Axios Instance
 * Single source of truth for HTTP network communication.
 * No feature or component may instantiate another Axios instance.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000, // 15 Seconds Enterprise Timeout
  withCredentials: true, // Send HttpOnly Refresh Token Cookies
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach Request & Response Interceptors (CSRF, Token Injection, 401 Silent Refresh, 429 RateLimitError)
setupInterceptors(apiClient);

export type { CustomAxiosRequestConfig };
export default apiClient;
