import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { ApiError } from '@/lib/http/apiError';

/**
 * Handles global HTTP errors from React Query cache execution
 */
function handleGlobalQueryError(error: unknown): void {
  const status = (error as ApiError)?.status;

  if (status === 403) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/403')) {
      window.location.href = '/403';
    }
  } else if (status === 500 || status === 502 || status === 503) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/500')) {
      window.location.href = '/500';
    }
  }
}

/**
 * Global Enterprise QueryClient Instance
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => handleGlobalQueryError(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleGlobalQueryError(error),
  }),
  defaultOptions: {
    queries: {
      retry: 1, // Single retry on network failure
      refetchOnWindowFocus: false, // Prevent background refetch storms
      staleTime: 1000 * 60 * 5, // 5 minutes default freshness
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
    },
    mutations: {
      retry: 0, // Never auto-retry mutating requests
    },
  },
});

export { QueryClient, QueryClientProvider, useQueryClient };
