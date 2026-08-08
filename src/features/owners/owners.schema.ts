import { z } from 'zod';

export const updateOwnerProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  city: z.string().max(50).optional(),
  whatsapp_login_alerts: z.boolean().optional(),
  sticker_scan_alerts: z.boolean().optional(),
  mask_phone_number: z.boolean().optional(),
  restrict_emergency_contacts: z.boolean().optional(),
  analytics_consent: z.boolean().optional(),
  marketing_consent: z.boolean().optional(),
});

export type UpdateOwnerProfileFormValues = z.infer<typeof updateOwnerProfileSchema>;
