export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export type PaymentMethod = 'credit_card' | 'upi' | 'net_banking' | 'wallet' | 'razorpay';

export interface PlanFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: PlanFeature[];
  popular: boolean;
  badgeLabel?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  planName: string;
  amount: number; // Stored in base currency units (e.g. Rupees)
  gst: number; // GST amount
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  createdAt: string; // ISO timestamp
  date?: string;
  vehiclePlate?: string;
  refundEligibleUntil?: string; // ISO timestamp
}

export interface RazorpayOrder {
  order_id: string;
  amount: number; // in paise
  currency: string;
  key: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PlanCardProps {
  plan: SubscriptionPlan;
  selected?: boolean;
  current?: boolean;
  loading?: boolean;
  onSelect?: (plan: SubscriptionPlan) => void;
}

export interface InvoiceTableProps {
  data: Invoice[];
  loading?: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSort?: (field: string) => void;
}

export interface RazorpayCheckoutButtonProps {
  createOrder: () => Promise<RazorpayOrder>;
  verifyPayment: (payload: RazorpayResponse) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface RefundRequestDialogProps {
  invoice: Invoice;
  open: boolean;
  loading?: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const PAYMENTS_MODULE = true;

