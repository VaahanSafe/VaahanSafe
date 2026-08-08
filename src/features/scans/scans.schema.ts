import { z } from 'zod';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const coordinatesSchema = z
  .object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationName: z.string().max(250).optional(),
  })
  .optional();

export const emergencyScanSchema = z.object({
  photo_base64: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  scanner_note: z.string().max(500, 'Scanner note must not exceed 500 characters').optional(),
});

export const parkingScanSchema = z.object({
  photo_base64: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type EmergencyScanFormValues = z.infer<typeof emergencyScanSchema>;
export type ParkingScanFormValues = z.infer<typeof parkingScanSchema>;
