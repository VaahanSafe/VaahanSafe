/**
 * Strict HTML Sanitizer
 * Cleans user-generated content before rendering to eliminate XSS vectors.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  return dirty
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Text-only sanitizer stripping all HTML tags completely.
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  return dirty.replace(/<[^>]*>?/gm, '');
}
