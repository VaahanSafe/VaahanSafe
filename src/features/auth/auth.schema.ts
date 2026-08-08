import { z } from 'zod';

/**
 * Regex for Indian Phone Number Validation
 * Matches 10 digits starting with 6, 7, 8, 9 with optional +91 or 0 prefix
 */
export const INDIAN_PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => val.trim().replace(/[\s-]/g, ''))
  .refine((val) => INDIAN_PHONE_REGEX.test(val), {
    message: 'Please enter a valid 10-digit Indian mobile number',
  });

export const otpSchema = z
  .string()
  .min(1, 'OTP is required')
  .transform((val) => val.trim())
  .refine((val) => /^\d{6}$/.test(val), {
    message: 'OTP must be exactly 6 digits',
  });

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
  dpdp_consent: z.boolean().default(true).optional(),
});

export type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
