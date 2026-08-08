import type { Breadcrumb } from '@/types/shared';

/**
 * Copies a given string to the user clipboard.
 * Falls back to legacy text area selection if navigator.clipboard is unavailable.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[Clipboard] Native copy failed, falling back to legacy command...', err);
    }
  }

  // Fallback implementation
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[Clipboard] Fallback copy failed:', err);
    document.body.removeChild(textArea);
    return false;
  }
}

/**
 * Scrubs personally identifiable information (PII) from strings
 * to protect user privacy in telemetry.
 */
export function scrubPII(input: string): string {
  if (!input) return '';

  let scrubbed = input;

  // 1. Email pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  scrubbed = scrubbed.replace(emailRegex, '[EMAIL_REDACTED]');

  // 2. Phone numbers (Indian & general 10-15 digit formats)
  const phoneRegex = /(?:\+?91[ -]?)?[6-9]\d{9}\b|\b(?:\+?\d{1,3}[- ]?)?\(?\d{3,4}\)?[- ]?\d{3,4}[- ]?\d{4}\b/g;
  scrubbed = scrubbed.replace(phoneRegex, '[PHONE_REDACTED]');

  // 3. Indian vehicle registration plates (e.g., MH-12-AB-1234 or DL12C1234)
  const licensePlateRegex = /\b[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{1,3}[ -]?\d{4}\b/gi;
  scrubbed = scrubbed.replace(licensePlateRegex, '[VEHICLE_REDACTED]');

  return scrubbed;
}

/**
 * Formats a numeric value with decimal precision and standard locale parameters.
 */
export function formatCounter(val: number, decimals: number = 0): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val);
  } catch (e) {
    return val.toFixed(decimals);
  }
}

/**
 * Checks if the client has enabled OS-level reduced-motion preferences.
 */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Translates URL path segments into an array of breadcrumb objects.
 */
export function buildBreadcrumbs(pathname: string): Breadcrumb[] {
  if (!pathname || pathname === '/') return [];

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [];

  let currentPath = '';
  
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    
    // Convert slug (e.g. "audit-logs") to Title Case ("Audit Logs")
    const label = segment
      .replace(/-|_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}
