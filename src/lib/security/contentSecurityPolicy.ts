import { env } from '@/config/env';

/**
 * Enterprise Content Security Policy Generator
 * Generates header or meta directive strings for local preview and production deployments.
 */
export function generateCspHeader(): string {
  const apiHost = env.API_BASE_URL.replace(/\/api\/v1\/?$/, '');

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://challenges.cloudflare.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://*.vaahansafe.in https://*.razorpay.com`,
    `connect-src 'self' ${apiHost} wss://${apiHost.replace(/^https?:\/\//, '')} https://*.sentry.io https://api.razorpay.com https://challenges.cloudflare.com`,
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-src 'self' https://api.razorpay.com https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return cspDirectives.join('; ');
}

/**
 * Injects CSP meta tag dynamically in development if missing.
 */
export function injectCspMetaTag(): void {
  if (typeof document === 'undefined') return;

  let meta = document.querySelector<HTMLMetaElement>('meta[http-equiv="Content-Security-Policy"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    document.head.appendChild(meta);
  }
  meta.content = generateCspHeader();
}
