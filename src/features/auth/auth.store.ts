import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OwnerOut } from './auth.types';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  owner: OwnerOut | null;
  phone: string | null;
  role: 'owner' | 'operator';
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  setOwner: (owner: OwnerOut | null) => void;
  setAuthSession: (accessToken: string, refreshToken?: string | null, owner?: OwnerOut | null) => void;
  login: (phone: string, token: string, role?: 'owner' | 'operator', refreshToken?: string, owner?: OwnerOut | null) => void;
  logoutStore: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      owner: null,
      phone: null,
      role: 'owner',
      isAuthenticated: false,

      setAccessToken: (accessToken: string | null) =>
        set(() => ({
          accessToken,
          isAuthenticated: Boolean(accessToken),
        })),

      setOwner: (owner: OwnerOut | null) =>
        set(() => ({
          owner,
          role: owner?.role === 'operator' ? 'operator' : 'owner',
          phone: owner?.phone || get().phone,
        })),

      setAuthSession: (accessToken: string, refreshToken: string | null = null, owner: OwnerOut | null = null) =>
        set(() => ({
          accessToken,
          refreshToken: refreshToken || get().refreshToken,
          owner,
          phone: owner?.phone || get().phone,
          role: owner?.role === 'operator' ? 'operator' : 'owner',
          isAuthenticated: true,
        })),

      login: (phone: string, token: string, role: 'owner' | 'operator' = 'owner', refreshToken?: string, owner?: OwnerOut | null) =>
        set(() => ({
          accessToken: token,
          refreshToken: refreshToken || null,
          phone,
          role,
          owner: owner || null,
          isAuthenticated: true,
        })),

      logoutStore: () =>
        set(() => ({
          accessToken: null,
          refreshToken: null,
          owner: null,
          phone: null,
          role: 'owner',
          isAuthenticated: false,
        })),

      logout: () => {
        get().logoutStore();
      },
    }),
    {
      name: 'vs_auth_session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        owner: state.owner,
        phone: state.phone,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const authStore = {
  getAccessToken: () => useAuthStore.getState().accessToken,
  getPhone: () => useAuthStore.getState().phone,
  getRole: () => useAuthStore.getState().role,
  login: (phone: string, token: string, role: 'owner' | 'operator' = 'owner', refreshToken?: string, owner?: OwnerOut | null) =>
    useAuthStore.getState().login(phone, token, role, refreshToken, owner),
  logout: () => useAuthStore.getState().logoutStore(),
  setAccessToken: (token: string | null) => useAuthStore.getState().setAccessToken(token),
  subscribe: (listener: () => void) => useAuthStore.subscribe(listener),
};

export const getAuthToken = () => useAuthStore.getState().accessToken;

