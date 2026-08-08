import { z } from 'zod';

/**
 * Regex for Indian Vehicle Registration Numbers
 * Example: MH02AB1234, DL3CAZ9901, KA01MJ8821
 */
export const VEHICLE_NUMBER_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;

export const vehicleCreateSchema = z.object({
  vehicle_number: z
    .string()
    .min(1, 'Vehicle number is required')
    .transform((val) => val.trim().toUpperCase().replace(/[\s-]/g, ''))
    .refine((val) => VEHICLE_NUMBER_REGEX.test(val), {
      message: 'Invalid Indian vehicle registration number (e.g. MH02AB1234)',
    }),
  tier: z.string().default('free').optional(),
});

export const vehicleUpdateSchema = z.object({
  vehicle_number: z
    .string()
    .transform((val) => val.trim().toUpperCase().replace(/[\s-]/g, ''))
    .refine((val) => !val || VEHICLE_NUMBER_REGEX.test(val), {
      message: 'Invalid Indian vehicle registration number',
    })
    .optional(),
  sticker_note: z.string().max(250).optional(),
});

export type VehicleCreateFormValues = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateFormValues = z.infer<typeof vehicleUpdateSchema>;
