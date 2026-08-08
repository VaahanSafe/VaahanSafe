/**
 * Vehicles Domain Types
 */

import type { EmergencyContactOut } from '../contacts/contacts.types';
import type { MedicalInfoOut } from '../medical/medical.types';

export type SubscriptionStatus = 'Active' | 'Suspended' | 'Expired' | 'Pending' | 'active' | 'suspended' | 'expired' | 'pending';

export interface VehicleOut {
  id: string;
  owner_id: string;
  vehicle_number: string;
  qr_code_id: string;
  qr_image_url?: string | null;
  tier: string;
  subscription_status: SubscriptionStatus | string;
  renewal_date?: string | null;
  sticker_dispatched_at?: string | null;
  created_at: string;
  updated_at: string;
  // UI aliases
  licensePlate?: string;
  expiryDate?: string;
  status?: string;
  activeAlertsPaused?: boolean;
}

export interface VehicleDetailOut extends VehicleOut {
  emergency_contacts: EmergencyContactOut[];
  medical_info?: MedicalInfoOut | null;
}

export interface VehicleCreateIn {
  vehicle_number: string;
  tier?: string;
}

export interface VehicleUpdateIn {
  vehicle_number?: string;
  sticker_note?: string;
}

export interface RegisterVehicleResult {
  vehicle: VehicleOut;
  payment_order: Record<string, unknown>;
}

export interface ScanLogOut {
  id: string;
  vehicle_id: string;
  scan_type: string;
  scan_result: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  photo_url?: string | null;
  scanner_ip_hash?: string | null;
  scanner_note?: string | null;
  ai_summary?: string | null;
  dispatched_at?: string | null;
  created_at: string;
}

export interface AdminVehicleItem {
  id: string;
  plate: string;
  qrCode: string;
  ownerName: string;
  ownerId: string;
  type: string;
  status: SubscriptionStatus;
  registeredDate: string;
  lastScanDate: string;
}

export interface AdminVehicleFilterParams {
  search?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export interface AdminVehiclesResponse {
  data: AdminVehicleItem[];
  total: number;
  page: number;
  totalPages: number;
}
