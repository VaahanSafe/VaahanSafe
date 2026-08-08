/**
 * Emergency Contacts Domain Types
 */

export interface EmergencyContactOut {
  id: string;
  vehicle_id: string;
  full_name: string;
  phone: string;
  relationship: string;
  priority_order: number;
  whatsapp_opt_in: boolean;
  last_alert_sent_at?: string | null;
  created_at: string;
  updated_at: string;
  // UI compatibility aliases
  name?: string;
  priority?: number;
  whatsappEnabled?: boolean;
}

export type EmergencyContact = EmergencyContactOut;

export interface ContactCreateIn {
  full_name: string;
  phone: string;
  relationship: string;
  priority_order: number;
  whatsapp_opt_in?: boolean;
}

export interface ContactUpdateIn {
  full_name?: string;
  phone?: string;
  relationship?: string;
  priority_order?: number;
  whatsapp_opt_in?: boolean;
}

export interface ContactReorderIn {
  contact_id: string;
  priority_order: number;
}
