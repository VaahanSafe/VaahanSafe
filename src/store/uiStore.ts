import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface UIState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  idleModalOpen: boolean;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setIdleModalOpen: (open: boolean) => void;
}

/**
 * Applies the selected theme mode to document.documentElement (<html>)
 */
export function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(systemDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
}

/**
 * Global UI Preference Store
 * Safely persists theme mode and sidebar collapse state to localStorage.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      idleModalOpen: false,

      setTheme: (theme: ThemeMode) => {
        set({ theme });
        applyThemeToDocument(theme);
      },

      toggleTheme: () => {
        const current = get().theme;
        const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      openCommandPalette: () => set({ commandPaletteOpen: true }),

      closeCommandPalette: () => set({ commandPaletteOpen: false }),

      setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),

      setIdleModalOpen: (open: boolean) => set({ idleModalOpen: open }),
    }),
    {
      name: 'vs_ui_preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeToDocument(state.theme);
        }
      },
    }
  )
);

export const uiStore = {
  getTheme: () => useUIStore.getState().theme,
  isSidebarCollapsed: () => useUIStore.getState().sidebarCollapsed,
  isCommandPaletteOpen: () => useUIStore.getState().commandPaletteOpen,
  getIsIdleModalOpen: () => useUIStore.getState().idleModalOpen,
  setTheme: (theme: ThemeMode) => useUIStore.getState().setTheme(theme),
  toggleTheme: () => useUIStore.getState().toggleTheme(),
  setSidebarCollapsed: (collapsed: boolean) => useUIStore.getState().setSidebarCollapsed(collapsed),
  toggleSidebar: () => useUIStore.getState().toggleSidebar(),
  openCommandPalette: () => useUIStore.getState().openCommandPalette(),
  closeCommandPalette: () => useUIStore.getState().closeCommandPalette(),
  setIdleModalOpen: (open: boolean) => useUIStore.getState().setIdleModalOpen(open),
  subscribe: (listener: () => void) => useUIStore.subscribe(listener),
};

export function useUITheme() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  return { theme, setTheme, toggleTheme };
}
