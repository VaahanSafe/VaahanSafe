import { create } from 'zustand';
import { useAuthStore as usePersistedStore } from '@/features/auth/auth.store';

export interface OwnerProfile {
  id: string;
  phone: string;
  name?: string;
  full_name?: string;
  email?: string;
  role: 'owner' | 'operator' | 'admin';
  tier?: string;
  createdAt?: string;
  whatsapp_login_alerts?: boolean;
  sticker_scan_alerts?: boolean;
  mask_phone_number?: boolean;
  restrict_emergency_contacts?: boolean;
  analytics_consent?: boolean;
  marketing_consent?: boolean;
}

export interface AuthState {
  accessToken: string | null;
  owner: OwnerProfile | null;
  isAuthenticated: boolean;
  
  // Actions
  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
  setOwner: (owner: OwnerProfile | null) => void;
  clearOwner: () => void;
  login: (phone: string, token: string, role?: 'owner' | 'operator' | 'admin', refreshToken?: string, owner?: OwnerProfile | null) => void;
  logout: () => void;
}

/**
 * Single source of truth for Authentication UI State.
 * Strictly Memory-Only: Tokens and user identities are NEVER stored in Web Storage (localStorage/sessionStorage).
 */
import { setAccessToken as setManagerToken, clearAccessToken as clearManagerToken } from '@/lib/security/tokenManager';

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  owner: null,
  isAuthenticated: false,

  setAccessToken: (token: string | null) => {
    setManagerToken(token);
    set(() => ({
      accessToken: token,
      isAuthenticated: Boolean(token),
    }));
  },

  clearAccessToken: () => {
    clearManagerToken();
    set(() => ({
      accessToken: null,
      isAuthenticated: false,
    }));
  },

  setOwner: (owner: OwnerProfile | null) =>
    set(() => ({
      owner,
    })),

  clearOwner: () =>
    set(() => ({
      owner: null,
    })),

  login: (phone: string, token: string, role: 'owner' | 'operator' | 'admin' = 'owner', _refreshToken?: string, owner?: OwnerProfile | null) => {
    setManagerToken(token);
    set(() => ({
      accessToken: token,
      isAuthenticated: true,
      owner: owner || {
        id: owner?.id || `owner_${Date.now()}`,
        phone,
        role,
      },
    }));
  },

  logout: () => {
    clearManagerToken();
    set(() => ({
      accessToken: null,
      owner: null,
      isAuthenticated: false,
    }));
    usePersistedStore.getState().logoutStore();
  },
}));

// Derived Selectors
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectOwner = (state: AuthState) => state.owner;
export const selectHasOwner = (state: AuthState) => Boolean(state.owner);

export const authStore = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  getOwner: () => useAuthStore.getState().owner,
  isAuthenticated: () => useAuthStore.getState().isAuthenticated,
  setAccessToken: (token: string | null) => useAuthStore.getState().setAccessToken(token),
  setOwner: (owner: OwnerProfile | null) => useAuthStore.getState().setOwner(owner),
  login: (phone: string, token: string, role: 'owner' | 'operator' | 'admin' = 'owner', refreshToken?: string, owner?: OwnerProfile | null) =>
    useAuthStore.getState().login(phone, token, role, refreshToken, owner),
  logout: () => useAuthStore.getState().logout(),
  clearAccessToken: () => useAuthStore.getState().clearAccessToken(),
  clearOwner: () => useAuthStore.getState().clearOwner(),
};
