import type { EmergencyContact, RelationshipType } from '@/types/contacts';

/**
 * Masks the middle digits of an Indian mobile number.
 * Input: "9876543210" or "+919876543210" or "98765 43210"
 * Output: "987*****10"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}*****${digits.slice(8)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 5)}*****${digits.slice(10)}`;
  }
  if (digits.length > 5) {
    const start = digits.slice(0, Math.min(3, digits.length - 2));
    const end = digits.slice(-2);
    return `${start}*****${end}`;
  }
  return phone;
}

/**
 * Formats a 10-digit Indian phone number with space separator for readability.
 * Input: "9876543210" -> Output: "98765 43210"
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Normalizes phone number to raw 10-digit string for backend storage.
 * Input: "98765 43210" or "+91 9876543210" -> Output: "9876543210"
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Validates Indian mobile number format (starts with 6-9, exactly 10 digits).
 */
export function validateIndianPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Calculates the next available priority for a new contact (1 to 5).
 */
export function nextAvailablePriority(contacts: EmergencyContact[]): number {
  if (!contacts || contacts.length === 0) return 1;
  const existingPriorities = new Set(contacts.map((c) => c.priority));
  for (let p = 1; p <= 5; p++) {
    if (!existingPriorities.has(p)) return p;
  }
  return Math.min(contacts.length + 1, 5);
}

/**
 * Sorts contacts strictly by priority ascending (1, 2, 3, 4, 5).
 */
export function sortContacts(contacts: EmergencyContact[]): EmergencyContact[] {
  return [...contacts].sort((a, b) => a.priority - b.priority);
}

/**
 * Provides human-friendly display label for relationship types.
 */
export function relationshipLabel(relationship: RelationshipType | string): string {
  switch (relationship) {
    case 'Spouse': return 'Spouse / Partner';
    case 'Parent': return 'Parent / Guardian';
    case 'Child': return 'Son / Daughter';
    case 'Sibling': return 'Brother / Sister';
    case 'Friend': return 'Friend';
    case 'Doctor': return 'Personal Doctor';
    case 'Driver': return 'Vehicle Driver';
    case 'Relative': return 'Relative';
    case 'Colleague': return 'Colleague';
    case 'Other': return 'Other Contact';
    default: return relationship;
  }
}
