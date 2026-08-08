/**
 * Medical Info Domain Types
 */

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';

export interface MedicalInfoOut {
  id: string;
  vehicle_id: string;
  blood_group: string;
  allergies: string[];
  medical_notes?: string | null;
  organ_donor: boolean;
  emergency_medication: string[];
  consent_timestamp: string;
  consent_ip: string;
  created_at: string;
  updated_at: string;
  // UI aliases
  bloodGroup?: string;
  medications?: string[];
  emergencyNotes?: string | null;
}

export interface MedicalInfoIn {
  blood_group: string;
  allergies?: string[];
  medical_notes?: string | null;
  organ_donor: boolean;
  emergency_medication?: string[];
  consent_ip: string;
}

export interface MedicalInfoPatchIn {
  blood_group?: string;
  allergies?: string[];
  medical_notes?: string | null;
  organ_donor?: boolean;
  emergency_medication?: string[];
}
