import { format, formatDistanceToNow } from 'date-fns';

/**
 * Formats and masks Indian phone numbers for privacy protection.
 * Input: "+919876543210" or "9876543210"
 * Output: "+91 98*** **210"
 */
export function formatPhone(phone?: string | null): string {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length >= 10) {
    const main10 = cleaned.slice(-10);
    const countryCode = cleaned.length > 10 ? `+${cleaned.slice(0, -10)} ` : '+91 ';
    return `${countryCode}${main10.slice(0, 2)}*** ***${main10.slice(-3)}`;
  }

  return phone;
}

/**
 * Formats dates into Indian Standard Time (IST / Asia/Kolkata) readable string.
 * Example: "06 Jul 2026, 02:30 PM"
 */
export function formatDateIst(dateInput?: string | Date | null): string {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '—';
    return format(date, 'dd MMM yyyy, hh:mm a');
  } catch {
    return '—';
  }
}

/**
 * Formats numbers into Indian Rupee currency formatting.
 * Example: 499 -> "₹499"
 */
export function formatCurrencyInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats relative time elapsed from now.
 * Example: "5 minutes ago"
 */
export function formatRelativeTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '—';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '—';
  }
}
