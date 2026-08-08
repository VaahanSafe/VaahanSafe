import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { initSentry, SentryErrorBoundary, initAnalytics } from '@/lib/monitoring'
import { QueryClient, QueryClientProvider } from '@/lib/query/queryClient'
import { TooltipProvider } from '@/components/ui/tooltip'
import ToastProvider from '@/components/shared/ToastProvider'
import { env } from '@/config/env'
import './index.css'
import '@/styles/fonts.css'
import { router } from '@/router/index'

// Handle legacy hash route compatibility (e.g. /#/scan/xyz -> /scan/xyz)
if (window.location.hash.startsWith('#/scan/') || window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.replace('#/', '/');
  window.history.replaceState(null, '', cleanPath);
}

// Gated initialization of error reporting and monitoring systems
if (env.ENABLE_SENTRY) {
  initSentry();
}
if (env.ENABLE_ANALYTICS) {
  initAnalytics();
}

import { silentRefresh } from '@/lib/security/tokenManager'
import { useAuthStore } from '@/features/auth/auth.store'

const queryClient = new QueryClient();

// Silently refresh tokens on application bootstrap to avoid initial 401s on page reloads
silentRefresh()
  .then((token) => {
    const isPreviouslyAuthed = useAuthStore.getState().isAuthenticated;
    if (isPreviouslyAuthed && !token) {
      // Session has expired or been revoked; redirect to login without mounting the application
      useAuthStore.getState().logoutStore();
      window.location.href = '/login';
      return;
    }

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <SentryErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </SentryErrorBoundary>
      </StrictMode>,
    );
  })
  .catch(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <SentryErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </SentryErrorBoundary>
      </StrictMode>,
    );
  });
