export type RelationshipType = 
  | 'Spouse'
  | 'Parent'
  | 'Child'
  | 'Sibling'
  | 'Friend'
  | 'Doctor'
  | 'Driver'
  | 'Relative'
  | 'Colleague'
  | 'Other';

export interface EmergencyContact {
  id: string;
  vehicleId: string;
  name: string;
  relationship: RelationshipType | string;
  phone: string;
  whatsappEnabled: boolean;
  priority: number; // 1, 2, 3, 4, 5
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactFormData {
  name: string;
  relationship: RelationshipType | string;
  phone: string;
  whatsappEnabled: boolean;
}

export interface ContactCardProps {
  contact: EmergencyContact;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleWhatsApp?: (enabled: boolean) => void;
}

export interface ContactFormProps {
  mode: 'create' | 'edit';
  defaultValues?: ContactFormData;
  loading?: boolean;
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface ContactPriorityListProps {
  vehicleId: string;
  contacts: EmergencyContact[];
  loading?: boolean;
  onReorder: (contacts: EmergencyContact[]) => Promise<void>;
  onEditContact?: (contact: EmergencyContact) => void;
  onDeleteContact?: (contactId: string) => void;
  onToggleWhatsApp?: (contactId: string, enabled: boolean) => void;
}

export interface ContactLimitBannerProps {
  currentCount: number;
  maxCount?: number;
}
