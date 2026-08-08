import type { SubscriptionStatus } from "@/types/vehicle";
import {
  Clock01Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  PauseIcon,
} from "@hugeicons/core-free-icons";

/**
 * Normalizes a license plate number by converting to uppercase and stripping spacing.
 */
export function normalizeVehicleNumber(plate: string): string {
  return plate.replace(/\s+/g, "").toUpperCase();
}

/**
 * Formats an Indian license plate with standard space breaks.
 * e.g., "MH02AB1234" -> "MH 02 AB 1234"
 */
export function formatVehicleNumber(plate: string): string {
  const normalized = normalizeVehicleNumber(plate);
  const match = normalized.match(/^([A-Z]{2})([0-9]{1,2})([A-Z]{1,3})([0-9]{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return normalized;
}

/**
 * Calculates remaining days until subscription renewal.
 */
export function daysUntilRenewal(renewalDate: string): number {
  if (!renewalDate) return 0;
  const end = new Date(renewalDate).getTime();
  const start = new Date().setHours(0, 0, 0, 0);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns true if subscription renewal date has passed.
 */
export function isVehicleExpired(renewalDate: string): boolean {
  return daysUntilRenewal(renewalDate) <= 0;
}

/**
 * Returns theme-compatible color codes for countdown labels.
 */
export function renewalStatusColor(days: number): string {
  if (days <= 0) return "text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-950/20"; // Expired
  if (days <= 14) return "text-red-500 bg-red-500/10 dark:text-red-400 dark:bg-red-950/20"; // Extreme risk
  if (days <= 30) return "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-950/20"; // Medium risk
  if (days <= 60) return "text-teal-600 bg-teal-500/10 dark:text-teal-400 dark:bg-teal-950/20"; // Low risk
  return "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-950/20"; // Fully active
}

/**
 * Formats raw subscription status keys to uppercase labels.
 */
export function statusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "pending":
      return "Pending Validation";
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    case "suspended":
      return "Suspended";
    default:
      return "Unknown";
  }
}

/**
 * Resolves subscription status keys to representative HugeIcons.
 */
export function statusIcon(status: SubscriptionStatus): any {
  switch (status) {
    case "pending":
      return Clock01Icon;
    case "active":
      return CheckmarkCircle02Icon;
    case "expired":
      return Alert02Icon;
    case "suspended":
      return PauseIcon;
    default:
      return Alert02Icon;
  }
}

/**
 * Initiates file download by fetching a URL blob and building anchor targets.
 */
export async function downloadSignedFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("File download failed:", error);
    throw error;
  }
}
