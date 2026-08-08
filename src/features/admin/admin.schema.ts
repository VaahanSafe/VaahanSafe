import { z } from 'zod';

export const overrideVehicleStatusSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  status: z.enum(['Active', 'Suspended', 'Expired', 'Pending']),
  reason: z.string().min(5, 'Override reason is required (at least 5 characters)'),
});

export const adminSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

export type OverrideVehicleStatusFormValues = z.infer<typeof overrideVehicleStatusSchema>;
