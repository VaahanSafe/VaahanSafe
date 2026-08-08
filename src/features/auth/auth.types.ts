/**
 * Auth Domain TypeScript Models
 * Mirror Backend Pydantic / FastAPI DTOs
 */

export interface OwnerOut {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  tier: string;
  role: string;
  phone_verified_at?: string | null;
  whatsapp_login_alerts?: boolean;
  sticker_scan_alerts?: boolean;
  mask_phone_number?: boolean;
  restrict_emergency_contacts?: boolean;
  analytics_consent?: boolean;
  marketing_consent?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AccessTokenOut {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthTokensOut extends AccessTokenOut {
  refresh_token: string;
  owner: OwnerOut;
}

export interface RequestOtpIn {
  phone: string;
}

export interface RequestOtpOut {
  message: string;
  expires_in?: number;
  sandbox_code?: string | null;
}

export interface VerifyOtpIn {
  phone: string;
  otp: string;
  dpdp_consent?: boolean;
}

export type VerifyOtpOut = AuthTokensOut;

