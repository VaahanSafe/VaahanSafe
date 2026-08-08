import { z } from 'zod';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const;

export const medicalInfoSchema = z.object({
  blood_group: z.string().min(1, 'Please select a valid blood group'),
  allergies: z.array(z.string()).default([]),
  medical_notes: z.string().max(500, 'Emergency notes must be under 500 characters').nullable().optional(),
  organ_donor: z.boolean().default(false),
  emergency_medication: z.array(z.string()).default([]),
  consent_ip: z.string().default('127.0.0.1'),
});

export const medicalInfoPatchSchema = medicalInfoSchema.partial();

export type MedicalInfoFormValues = z.infer<typeof medicalInfoSchema>;
