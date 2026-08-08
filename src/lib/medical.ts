import type { BloodGroup } from '@/types/medical';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function bloodGroupOptions(): BloodGroup[] {
  return BLOOD_GROUPS;
}

export function normalizeTag(tag: string): string {
  if (!tag) return '';
  const trimmed = tag.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function uniqueTags(tags: string[]): string[] {
  if (!tags) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    const cleaned = normalizeTag(raw);
    if (!cleaned) continue;
    const lowerKey = cleaned.toLowerCase();
    if (!seen.has(lowerKey)) {
      seen.add(lowerKey);
      result.push(cleaned.slice(0, 50));
    }
    if (result.length >= 20) break;
  }

  return result;
}

export function normalizeMedication(med: string): string {
  if (!med) return '';
  return med.trim();
}

export function uniqueMedications(meds: string[]): string[] {
  if (!meds) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of meds) {
    const cleaned = normalizeMedication(raw);
    if (!cleaned) continue;
    const lowerKey = cleaned.toLowerCase();
    if (!seen.has(lowerKey)) {
      seen.add(lowerKey);
      result.push(cleaned.slice(0, 100));
    }
    if (result.length >= 20) break;
  }

  return result;
}

export function formatConsentDate(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);

    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return String(isoString);
  }
}

export function isConsentRequired(isFirstSubmission: boolean, consentAcceptedAt?: string | null): boolean {
  if (!isFirstSubmission && consentAcceptedAt) {
    return false;
  }
  return true;
}
