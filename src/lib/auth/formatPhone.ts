/**
 * Formats a raw 10-digit Indian phone number with space groups.
 * e.g., "9876543210" -> "98765 43210"
 */
export function formatIndianPhone(phone: string): string {
  const sanitized = sanitizePhone(phone);
  if (sanitized.length <= 5) {
    return sanitized;
  }
  return `${sanitized.slice(0, 5)} ${sanitized.slice(5, 10)}`;
}

/**
 * Removes all formatting (whitespaces) from a formatted phone string.
 */
export function stripPhoneFormatting(phone: string): string {
  return phone.replace(/\s+/g, '');
}

/**
 * Retains only numeric characters.
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Removes "+91", "91" prefixes and whitespaces, returning the raw 10-digit number.
 */
export function normalizePhone(phone: string): string {
  let clean = stripPhoneFormatting(phone);
  if (clean.startsWith('+91')) {
    clean = clean.slice(3);
  } else if (clean.startsWith('91') && clean.length === 12) {
    clean = clean.slice(2);
  }
  return sanitizePhone(clean);
}

/**
 * Checks if the number is a valid 10-digit Indian phone number.
 * Must start with 6, 7, 8, or 9.
 */
export function isValidIndianPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}
