export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface MedicalFormData {
  bloodGroup: BloodGroup | '';
  allergies: string[];
  medications: string[];
  medicalConditions?: string;
  additionalNotes?: string;
  consent: boolean;
}

export interface MedicalInfo extends MedicalFormData {
  id?: string;
  vehicleId?: string;
  consentAcceptedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalInfoFormProps {
  defaultValues?: Partial<MedicalFormData>;
  loading?: boolean;
  isFirstSubmission: boolean;
  consentAcceptedAt?: string | null;
  onSubmit: (data: MedicalFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface BloodGroupSelectProps {
  value?: BloodGroup | '';
  onChange: (value: BloodGroup) => void;
  disabled?: boolean;
  error?: string;
}

export interface AllergyTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

export interface MedicationListProps {
  value: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

export interface ConsentCheckboxProps {
  checked: boolean;
  acceptedAt?: string | null;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
}
