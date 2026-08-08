/**
 * Public & Emergency Scans Domain Types
 */

export interface PublicVehicleOut {
  qrCode: string;
  vehiclePlate: string;
  vehicleType: string;
  vehicleMake?: string;
  vehicleModel?: string;
  ownerNameMasked: string; // e.g. "A***** S*****"
  hasEmergencyContacts: boolean;
  hasMedicalInfo: boolean;
}

export interface EmergencyScanIn {
  photo_base64?: string;
  latitude?: number;
  longitude?: number;
  scanner_note?: string;
}

export interface ParkingScanIn {
  photo_base64?: string;
  latitude?: number;
  longitude?: number;
}

export interface ScanStatusOut {
  scan_id: string;
  status: string;
  dispatched_at?: string | null;
}

export interface PublicMedicalOut {
  qrCode: string;
  bloodGroup: string;
  allergies?: string[];
  medications?: string[];
  organDonor: boolean;
  emergencyNotes?: string | null;
  consentRequired: boolean;
}

export interface AdminScanItem {
  id: string;
  qrCode: string;
  vehicle: string;
  type: 'accident' | 'parking' | 'general';
  location: string;
  ipHash: string;
  userAgent?: string;
  time: string;
  result: 'Success' | 'Failed';
}

export interface AdminScansFilterParams {
  search?: string;
  type?: string;
  result?: string;
  vehicle?: string;
  ipHash?: string;
  page?: number;
  limit?: number;
}

export interface AdminScansResponse {
  data: AdminScanItem[];
  total: number;
  page: number;
  totalPages: number;
}
