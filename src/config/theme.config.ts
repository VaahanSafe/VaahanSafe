/**
 * Programmatic Design Tokens & Palette Config
 * Synchronized with Tailwind CSS theme for chart libraries (Recharts, Canvas) requiring raw hex/rgb values.
 */

export const themeConfig = {
  dark: {
    background: '#09090b',
    card: '#0c0c0f',
    border: '#27272a',
    primary: '#fa8816', // VaahanSafe Amber
    secondary: '#3f3f46',
    accent: '#f2603f',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    text: '#f4f4f5',
    muted: '#a1a1aa',
  },
  light: {
    background: '#ffffff',
    card: '#f8fafc',
    border: '#e2e8f0',
    primary: '#fa8816',
    secondary: '#e2e8f0',
    accent: '#f2603f',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    text: '#0f172a',
    muted: '#64748b',
  },
  chartColors: {
    primary: '#fa8816',
    secondary: '#f2603f',
    accent: '#e14760',
    emerald: '#10b981',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    series: ['#fa8816', '#f2603f', '#e14760', '#10b981', '#3b82f6', '#8b5cf6'],
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    glow: '0 0 24px -4px rgba(250, 136, 22, 0.4)',
  },
} as const;

export default themeConfig;
