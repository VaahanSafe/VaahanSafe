/**
 * Payments Domain Types
 */

export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface PaymentOut {
  id: string;
  owner_id: string;
  vehicle_id?: string | null;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  razorpay_refund_id?: string | null;
  amount_paise: number;
  currency: string;
  tier: string;
  status: string;
  created_at: string;
  // UI compatibility aliases
  amount?: number;
  createdAt?: string;
  orderId?: string;
}

export interface PaymentOrderIn {
  vehicle_id: string;
  tier: string;
}

export interface RequestRefundIn {
  paymentId: string;
  reason: string;
}
