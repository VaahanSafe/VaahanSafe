import { useAuthStore } from '@/store/authStore';
import { useAuthStore as useFeatureAuthStore } from '@/features/auth/auth.store';
import { useRequestOtp, useVerifyOtp } from '@/features/auth/auth.hooks';

/**
 * Global Convenience Auth Hook
 * Simplifies accessing user state, requesting/verifying OTPs, and triggering logout across components.
 */
export function useAuth() {
  const memoryAuth = useAuthStore();
  const featureAuth = useFeatureAuthStore();
  
  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const isAuthenticated = memoryAuth.isAuthenticated || featureAuth.isAuthenticated;
  const owner = memoryAuth.owner || (featureAuth.owner as any);

  const login = (phone: string, token: string, ownerData?: any) => {
    memoryAuth.setAccessToken(token);
    if (ownerData) {
      memoryAuth.setOwner(ownerData);
    }
    featureAuth.login(phone, token, 'owner', undefined, ownerData);
  };

  const logout = () => {
    memoryAuth.logout();
    featureAuth.logoutStore();
  };

  return {
    owner,
    isAuthenticated,
    login,
    logout,
    requestOtp: requestOtpMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isRequestingOtp: requestOtpMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
  };
}

export default useAuth;
