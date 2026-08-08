import { apiClient } from '@/lib/http/apiClient';
import { ENDPOINTS } from '@/lib/http/endpoints';
import { requestOtpSchema, verifyOtpSchema } from './auth.schema';
import type {
  OwnerOut,
  RequestOtpOut,
  VerifyOtpOut,
  AccessTokenOut
} from './auth.types';

/**
 * Unit-testable, framework-agnostic Auth API functions.
 * No React hooks here. Uses apiClient & Zod pre-flight validation.
 */

export async function requestOtp(phone: string): Promise<RequestOtpOut> {
  const validated = requestOtpSchema.parse({ phone });
  const response = await apiClient.post<RequestOtpOut>(
    ENDPOINTS.AUTH.REQUEST_OTP,
    { phone: validated.phone },
    { skipAuth: true } as unknown as import('axios').AxiosRequestConfig
  );
  return response.data;
}

export async function verifyOtp(phone: string, otp: string, dpdpConsent: boolean = true): Promise<VerifyOtpOut> {
  const validated = verifyOtpSchema.parse({ phone, otp, dpdp_consent: dpdpConsent });
  const response = await apiClient.post<VerifyOtpOut>(
    ENDPOINTS.AUTH.VERIFY_OTP,
    { phone: validated.phone, otp: validated.otp, dpdp_consent: validated.dpdp_consent },
    { skipAuth: true } as unknown as import('axios').AxiosRequestConfig
  );
  return response.data;
}

export async function refreshToken(refreshTokenValue: string): Promise<AccessTokenOut> {
  const response = await apiClient.post<AccessTokenOut>(ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshTokenValue });
  return response.data;
}

export async function logout(): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  } catch {
    return { message: "Session logged out." };
  }
}

export async function getMe(): Promise<OwnerOut> {
  const response = await apiClient.get<OwnerOut>(ENDPOINTS.AUTH.ME);
  return response.data;
}
