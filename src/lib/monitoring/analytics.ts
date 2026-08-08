import { env } from '@/config/env';

/**
 * Privacy-First Telemetry Analytics Wrapper
 * Tracks feature engagement without capturing PII, mobile numbers, vehicle license plates, or medical parameters.
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

class PrivacyAnalytics {
  private enabled: boolean;

  constructor() {
    this.enabled = Boolean(env.ENABLE_ANALYTICS);
  }

  /**
   * Safe event dispatcher
   */
  public track(event: AnalyticsEvent): void {
    if (!this.enabled) return;

    // Dispatches anonymous telemetry payload
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, event.properties);
    }
  }

  public trackPageView(path: string): void {
    this.track({
      name: 'page_view',
      properties: { page_path: path },
    });
  }

  public trackVehicleRegistered(tier: string): void {
    this.track({
      name: 'vehicle_registered',
      properties: { subscription_tier: tier },
    });
  }

  public trackPaymentSuccess(tier: string, amount: number): void {
    this.track({
      name: 'payment_success',
      properties: { subscription_tier: tier, value: amount },
    });
  }

  public trackScanSubmitted(type: 'wrong_parking' | 'emergency'): void {
    this.track({
      name: 'scan_submitted',
      properties: { scan_type: type },
    });
  }

  public trackContactAdded(totalContacts: number): void {
    this.track({
      name: 'emergency_contact_added',
      properties: { total_contacts_count: totalContacts },
    });
  }
}

export const analytics = new PrivacyAnalytics();

export function initAnalytics(): void {
  // Opt-in analytics initialization hook
}
