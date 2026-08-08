import { z } from 'zod';
import { INDIAN_PHONE_REGEX } from '@/features/auth/auth.schema';

/**
 * E.164 International Phone Regex or Indian Local Number
 */
export const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

export const contactPhoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => val.trim().replace(/[\s-]/g, ''))
  .refine(
    (val) => E164_PHONE_REGEX.test(val) || INDIAN_PHONE_REGEX.test(val),
    { message: 'Please enter a valid phone number (e.g. +919876543210 or 9876543210)' }
  );

export const contactSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name is too long'),
  relationship: z.string().min(2, 'Relationship is required').max(60, 'Relationship is too long'),
  phone: contactPhoneSchema,
  priority_order: z.number().int().min(1, 'Priority must be between 1 and 5').max(5, 'Priority must be between 1 and 5'),
  whatsapp_opt_in: z.boolean().default(true).optional(),
});

export const contactUpdateSchema = contactSchema.partial();

export type ContactFormValues = z.infer<typeof contactSchema>;
