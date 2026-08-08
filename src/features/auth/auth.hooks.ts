import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import { useAuthStore } from './auth.store';
import {
  requestOtp,
  verifyOtp,
  logout,
  getMe
} from './auth.api';
import type { RequestOtpOut, VerifyOtpOut, OwnerOut } from './auth.types';

export function useRequestOtp() {
  return useMutation<RequestOtpOut, Error, { phone: string }>({
    mutationFn: ({ phone }) => requestOtp(phone),
  });
}

export function useVerifyOtp() {
  const setAuthSession = useAuthStore((s) => s.setAuthSession);

  return useMutation<VerifyOtpOut, Error, { phone: string; otp: string; dpdpConsent?: boolean }>({
    mutationFn: ({ phone, otp, dpdpConsent }) => verifyOtp(phone, otp, dpdpConsent),
    onSuccess: (data) => {
      setAuthSession(data.access_token, data.refresh_token, data.owner);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((s) => s.logoutStore);

  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => logout(),
    onSuccess: () => {
      logoutStore();
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.clear();
    },
  });
}

export function useCurrentOwner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<OwnerOut, Error>({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled: isAuthenticated,
    staleTime: Infinity, // Owner session remains fresh until explicit invalidation
  });
}
