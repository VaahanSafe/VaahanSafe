import axios from 'axios';
import { env } from '@/config/env';
import { ENDPOINTS } from '@/lib/http/endpoints';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAuthStore as useMemoryAuthStore } from '@/store/authStore';

/**
 * Enterprise Token Manager
 * The ONLY module allowed to read, set, or mutate in-memory access tokens.
 * Access tokens are stored purely in-memory and never written to localStorage, sessionStorage, or IndexedDB.
 * Refresh tokens are stored exclusively in secure, HttpOnly, SameSite cookies.
 */

let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function onTokenRefreshed(newToken: string | null) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Retrieves the active in-memory access token.
 */
export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

/**
 * Sets the active in-memory access token.
 */
export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

/**
 * Clears the active access token from memory.
 */
export function clearAccessToken(): void {
  inMemoryAccessToken = null;
}

/**
 * Performs a silent token refresh via HttpOnly Cookie (`POST /auth/token/refresh`).
 * Prevents concurrent refresh storms using subscriber queueing.
 */
export async function silentRefresh(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      addRefreshSubscriber((newToken) => {
        resolve(newToken);
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      clearAccessToken();
      onTokenRefreshed(null);
      return null;
    }

    const response = await axios.post<{ access_token: string; refresh_token: string; owner: any }>(
      `${env.API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
      { refresh_token: refreshToken },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      }
    );

    const newToken = response.data?.access_token || null;
    const newRefreshToken = response.data?.refresh_token || null;
    const owner = response.data?.owner || null;

    if (newToken) {
      setAccessToken(newToken);
      useAuthStore.getState().setAuthSession(newToken, newRefreshToken, owner);
      
      // Update memory store so dashboard components populate real name/email details on reload
      if (owner) {
        useMemoryAuthStore.getState().login(
          owner.phone,
          newToken,
          owner.role === 'operator' ? 'operator' : 'owner',
          newRefreshToken || undefined,
          {
            id: owner.id,
            phone: owner.phone,
            full_name: owner.full_name,
            name: owner.full_name,
            email: owner.email || undefined,
            role: owner.role === 'operator' ? 'operator' : 'owner',
            tier: owner.tier || undefined,
            createdAt: owner.created_at || undefined,
            whatsapp_login_alerts: owner.whatsapp_login_alerts,
            sticker_scan_alerts: owner.sticker_scan_alerts,
            mask_phone_number: owner.mask_phone_number,
            restrict_emergency_contacts: owner.restrict_emergency_contacts,
            analytics_consent: owner.analytics_consent,
            marketing_consent: owner.marketing_consent
          }
        );
      }
    }
    onTokenRefreshed(newToken);
    return newToken;
  } catch (error) {
    clearAccessToken();
    onTokenRefreshed(null);
    return null;
  } finally {
    isRefreshing = false;
  }
}
