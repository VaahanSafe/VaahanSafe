/**
 * Admin Domain Types
 */

export interface AdminMetrics {
  totalScans24h: number;
  scanRateChange: string; // e.g. "+12.4%"
  activeStickersTotal: number;
  stickersRateChange: string;
  emergencyAlerts24h: number;
  alertsRateChange: string;
  avgAlertDeliveryTime: string; // e.g. "1.8s"
  activeDispatchers: number;
  dispatchesChange: string;
  scansTrend: Array<{ date: string; scans: number; emergency: number; parking: number }>;
}

export interface AdminScanRow {
  id: string;
  qrCode: string;
  vehicle: string;
  type: 'accident' | 'parking' | 'general';
  location: string;
  ipHash: string;
  userAgent?: string;
  time: string;
  result: 'Success' | 'Failed';
  isFlagged?: boolean;
}

export interface AdminOwnerRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehiclesCount: number;
  emergencyContactsCount: number;
  status: 'Active' | 'Suspended' | 'Pending';
  joinedDate: string;
  lastActive: string;
}

export interface AbuseReport {
  id: string;
  targetQrCode: string;
  scanId: string;
  reporterIpHash: string;
  abuseType: 'Spam Scans' | 'Spoofed Coordinates' | 'Bot Pattern' | 'Harassment';
  severity: 'High' | 'Medium' | 'Critical';
  status: 'Open' | 'Mitigated' | 'Dismissed';
  reportedAt: string;
  overallRiskLevel?: string;
  generatedAt?: string;
  rateLimitHitsCount?: number;
  flaggedThreatsCount?: number;
  scanPatterns?: string;
  recommendedActions?: string;
}

export interface DeadLetterRow {
  id: string;
  eventPayloadType: 'SMS_NOTIFICATION' | 'WHATSAPP_ALERT' | 'WEBHOOK_DISPATCH';
  recipientPhone: string;
  failureReason: 'GATEWAY_TIMEOUT' | 'INVALID_NUMBER' | 'RATE_LIMIT_EXCEEDED';
  retryCount: number;
  maxRetries: number;
  failedAt: string;
  taskId?: string;
  taskName?: string;
  args?: string;
  status?: string;
  retries?: number;
  errorMessage?: string;
}

export interface AlertFailureItem {
  id: string;
  scanId: string;
  qrCode: string;
  targetPhone: string;
  alertType: 'Emergency Call' | 'WhatsApp SOS' | 'SMS Dispatch';
  channel: 'Twilio' | 'Infobip' | 'WhatsApp Business Cloud';
  failureCode: string;
  errorMessage: string;
  attemptTime: string;
  status: 'FAILED' | 'RETRIED' | 'PERMANENT_FAIL' | 'Resolved' | 'Retried' | 'Pending Action';
  ownerName?: string;
  phone?: string;
  timestamp?: string;
}

export type AdminAbuseReport = AbuseReport;
export type AdminDeadLetterItem = DeadLetterRow;
export type AdminAlertFailureItem = AlertFailureItem;
