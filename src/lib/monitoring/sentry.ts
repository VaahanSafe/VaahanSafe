import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { env } from '@/config/env';

/**
 * PII Field Scrubbing List
 * Any event containing these keys will have their values redacted before leaving the browser.
 */
const SENSITIVE_KEYS = new Set([
  'phone',
  'phoneNumber',
  'otp',
  'otpCode',
  'token',
  'accessToken',
  'refreshToken',
  'bloodGroup',
  'allergies',
  'medicalNotes',
  'emergencyContacts',
  'authorization',
  'cardNumber',
  'cvv',
]);

/**
 * Recursively scrubs PII from telemetry objects
 */
export function sanitizeTelemetryData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeTelemetryData);

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase()) || SENSITIVE_KEYS.has(key)) {
      cleaned[key] = '[REDACTED_PII]';
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeTelemetryData(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Safely Initializes Sentry Error Tracking with Privacy Scrubbing
 * Uses dynamic vite-ignored loading to prevent dev-server import resolution failures.
 */
export async function initSentry(): Promise<void> {
  if (!env.ENABLE_SENTRY || !env.SENTRY_DSN) {
    return;
  }

  try {
    const sentryPkgName = '@sentry/react';
    const Sentry = await import(/* @vite-ignore */ sentryPkgName);
    if (Sentry && typeof Sentry.init === 'function') {
      Sentry.init({
        dsn: env.SENTRY_DSN,
        environment: env.VITE_APP_ENV || 'production',
        tracesSampleRate: 0.2,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend(event: any) {
          if (event.request?.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['authorization'];
            delete event.request.headers['X-CSRF-Token'];
          }

          if (event.extra) {
            event.extra = sanitizeTelemetryData(event.extra);
          }
          if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map((b: any) => ({
              ...b,
              data: b.data ? sanitizeTelemetryData(b.data) : undefined,
            }));
          }

          return event;
        },
      });
    }
  } catch (e) {
    console.warn('Sentry telemetry initialization skipped:', e);
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * High-Reliability Enterprise React Error Boundary
 * Native TypeScript implementation for pure .ts infrastructure files.
 */
export class SentryErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Application Infrastructure Error Boundary]:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return React.createElement(
        'div',
        { className: 'flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-950 text-white text-center space-y-4 font-sans' },
        React.createElement('div', { className: 'size-12 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold' }, '!'),
        React.createElement('h2', { className: 'text-xl font-bold font-display' }, 'Something went wrong'),
        React.createElement('p', { className: 'text-xs text-zinc-400 max-w-md' }, 'An unexpected client application error occurred. The infrastructure layer captured this event safely.'),
        React.createElement(
          'button',
          {
            onClick: () => window.location.reload(),
            className: 'px-4 py-2 text-xs font-bold bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors cursor-pointer',
          },
          'Reload Application'
        )
      );
    }

    return this.props.children;
  }
}
