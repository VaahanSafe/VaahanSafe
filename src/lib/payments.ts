import type { Invoice, InvoiceStatus, RazorpayOrder, RazorpayResponse } from '@/types/payments';

/**
 * Formats a currency value to a localized string.
 * @param amount - Amount in primary currency unit (Rupees).
 * @param currency - The 3-letter currency code (defaults to 'INR').
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Normalizes and formats invoice numbers.
 */
export function formatInvoiceNumber(invoiceNum: string): string {
  const sanitized = invoiceNum.trim().toUpperCase();
  if (sanitized.startsWith('INV-')) {
    return sanitized;
  }
  return `INV-${sanitized}`;
}

/**
 * Formats a ISO date string into a readable representation.
 */
export function formatInvoiceDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Returns Tailwind CSS class names tailored for InvoiceStatus badges.
 */
export function invoiceStatusColor(status: InvoiceStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 shadow-xs';
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40 shadow-xs';
    case 'failed':
      return 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40 shadow-xs';
    case 'refunded':
      return 'bg-zinc-500/10 text-zinc-600 border-zinc-500/30 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700 shadow-xs';
    default:
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400';
  }
}

/**
 * Returns a human-friendly label for invoice statuses.
 */
export function invoiceStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
}

/**
 * Returns plan badge label, returning 'Popular' or custom label.
 */
export function planBadgeLabel(plan: { popular: boolean; badgeLabel?: string }): string {
  if (plan.badgeLabel) return plan.badgeLabel;
  if (plan.popular) return 'Popular';
  return '';
}

/**
 * Asynchronously checks eligibility for refunds.
 */
export function isRefundEligible(invoice: Invoice): boolean {
  if (invoice.status !== 'paid') return false;
  if (!invoice.refundEligibleUntil) return false;
  const eligibleUntilDate = new Date(invoice.refundEligibleUntil);
  if (isNaN(eligibleUntilDate.getTime())) return false;
  return new Date() < eligibleUntilDate;
}

/**
 * Returns readable refund deadline message or expiration information.
 */
export function refundDeadline(invoice: Invoice): string {
  if (!invoice.refundEligibleUntil) {
    return 'Not eligible for refund';
  }
  const eligibleUntilDate = new Date(invoice.refundEligibleUntil);
  if (isNaN(eligibleUntilDate.getTime())) {
    return 'Invalid deadline';
  }
  const formattedDate = formatInvoiceDate(invoice.refundEligibleUntil);
  if (new Date() < eligibleUntilDate) {
    return `Eligible for refund until ${formattedDate}`;
  }
  return `Refund window expired on ${formattedDate}`;
}

/**
 * Extracts base amount and GST amount assuming a standard inclusive rate.
 * @param amount - Inclusive amount
 * @param gstRatePercent - Tax rate percentage (e.g. 18%)
 */
export function calculateGST(amount: number, gstRatePercent: number = 18): { baseAmount: number; gstAmount: number } {
  const divisor = 1 + gstRatePercent / 100;
  const baseAmount = amount / divisor;
  const gstAmount = amount - baseAmount;
  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
  };
}

let scriptPromise: Promise<boolean> | null = null;

/**
 * Dynamically loads the Razorpay checkout script on interaction to boost page load speed.
 * Resolves to true when script loads successfully, and false on errors.
 */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  
  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    // Add Subresource Integrity if applicable, though Razorpay frequently updates script.
    // For standard load safety:
    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      scriptPromise = null; // Clear cached promise on failure to allow re-trigger
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Prepares the parameter configuration mapping needed to spawn Razorpay checkout widget.
 */
export function buildRazorpayOptions(
  order: RazorpayOrder,
  responseHandler: (response: RazorpayResponse) => void,
  prefill: { name?: string; email?: string; contact?: string } = {},
  themeColor: string = '#fa8816'
) {
  return {
    key: order.key,
    amount: order.amount,
    currency: order.currency,
    name: 'VaahanSafe',
    description: 'SaaS Subscription Plan',
    order_id: order.order_id,
    handler: responseHandler,
    prefill: {
      name: prefill.name || '',
      email: prefill.email || '',
      contact: prefill.contact || '',
    },
    theme: {
      color: themeColor,
    },
  };
}
