/**
 * Owners Domain Types
 */

import type { OwnerOut } from '../auth/auth.types';
import type { VehicleOut } from '../vehicles/vehicles.types';

export interface DailyScanMetric {
  date: string;
  scans: number;
  emergency: number;
  parking: number;
}

export interface DeliveryChannelMetric {
  channel: string;
  success: number;
  failure: number;
  pending: number;
}

export interface HeatmapDayMetric {
  date: string;
  count: number;
}

export interface DashboardStatsOut {
  total_vehicles: number;
  active_vehicles: number;
  linked_stickers: number;
  protection_status_percentage: number;
  total_scans: number;
  scans_last_30d: number;
  alert_success_rate: number;
  expiring_soon_count: number;
  vehicles_trend?: number;
  stickers_trend?: number;
  alerts_trend?: number;
  protection_trend?: number;
  vehicles_prev?: number;
  stickers_prev?: number;
  alerts_prev?: number;
  daily_scans?: DailyScanMetric[];
  delivery_rates?: DeliveryChannelMetric[];
  heatmap_days?: HeatmapDayMetric[];
}

export type int = number;

export interface OwnerProfileOut {
  owner: OwnerOut;
  vehicles: VehicleOut[];
  stats: DashboardStatsOut;
}

export interface UpdateOwnerProfileIn {
  full_name?: string;
  email?: string;
  city?: string;
  whatsapp_login_alerts?: boolean;
  sticker_scan_alerts?: boolean;
  mask_phone_number?: boolean;
  restrict_emergency_contacts?: boolean;
  analytics_consent?: boolean;
  marketing_consent?: boolean;
}

export interface DeleteOwnerRequestOut {
  status: string;
  message: string;
}

export interface AdminOwnerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehiclesCount: number;
  emergencyContactsCount: number;
  status: 'Active' | 'Suspended' | 'Pending';
  joinedDate: string;
  lastActive: string;
}

export interface AdminOwnersFilterParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminOwnersResponse {
  data: AdminOwnerItem[];
  total: number;
  page: number;
  totalPages: number;
}
