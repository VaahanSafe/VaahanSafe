import { z } from 'zod';

export const paymentOrderSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID UUID format'),
  tier: z.string().min(1, 'Tier is required'),
});

export const refundRequestSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)').max(500),
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
export type RefundRequestFormValues = z.infer<typeof refundRequestSchema>;
