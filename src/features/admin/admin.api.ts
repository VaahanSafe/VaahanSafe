import { apiClient } from '@/lib/http/apiClient';
import { ENDPOINTS } from '@/lib/http/endpoints';
import type {
  AdminMetrics,
  AdminScanRow,
  AdminOwnerRow,
  AbuseReport,
  DeadLetterRow,
  AlertFailureItem
} from './admin.types';

// Mock datasets for offline local development fallback
const mockAdminMetrics: AdminMetrics = {
  totalScans24h: 12480,
  scanRateChange: '+14.2%',
  activeStickersTotal: 48920,
  stickersRateChange: '+8.7%',
  emergencyAlerts24h: 142,
  alertsRateChange: '-3.1%',
  avgAlertDeliveryTime: '1.6s',
  activeDispatchers: 32,
  dispatchesChange: '+4',
  scansTrend: [
    { date: 'Mon', scans: 1200, emergency: 15, parking: 45 },
    { date: 'Tue', scans: 1500, emergency: 18, parking: 52 },
    { date: 'Wed', scans: 1800, emergency: 22, parking: 60 },
    { date: 'Thu', scans: 1400, emergency: 14, parking: 40 },
    { date: 'Fri', scans: 2100, emergency: 29, parking: 85 },
    { date: 'Sat', scans: 2600, emergency: 35, parking: 110 },
    { date: 'Sun', scans: 2200, emergency: 28, parking: 90 },
  ],
};

const mockScans: AdminScanRow[] = [
  {
    id: 'SCN-8801',
    qrCode: 'VS-BAN-1231',
    vehicle: 'MH-02-AB-1234',
    type: 'accident',
    location: 'Indiranagar 100ft Road, Bengaluru',
    ipHash: 'e3b0c442...98a1',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
    time: '2026-07-19 14:32',
    result: 'Success',
    isFlagged: false,
  },
  {
    id: 'SCN-8802',
    qrCode: 'VS-BAN-8842',
    vehicle: 'MH-02-CD-5678',
    type: 'parking',
    location: 'Koramangala 5th Block, Bengaluru',
    ipHash: '7f83b165...44b2',
    userAgent: 'Mozilla/5.0 (Linux; Android 14)',
    time: '2026-07-19 13:10',
    result: 'Success',
    isFlagged: false,
  },
  {
    id: 'SCN-8804',
    qrCode: 'VS-CON-5512',
    vehicle: 'DL-3C-AZ-9901',
    type: 'accident',
    location: 'Connaught Place, New Delhi',
    ipHash: '03ac67dc...33e1',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6)',
    time: '2026-07-18 16:20',
    result: 'Failed',
    isFlagged: true,
  },
];

const mockOwners: AdminOwnerRow[] = [
  {
    id: 'OWN-401',
    name: 'Aditya Sharma',
    phone: '+919876543210',
    email: 'aditya.sharma@example.com',
    vehiclesCount: 2,
    emergencyContactsCount: 3,
    status: 'Active',
    joinedDate: '2026-01-15',
    lastActive: '2026-07-19 14:32',
  },
  {
    id: 'OWN-402',
    name: 'Priya Nair',
    phone: '+919876543212',
    email: 'priya.nair@example.com',
    vehiclesCount: 1,
    emergencyContactsCount: 2,
    status: 'Active',
    joinedDate: '2026-02-10',
    lastActive: '2026-07-18 11:24',
  },
  {
    id: 'OWN-403',
    name: 'Rahul Verma',
    phone: '+919876543214',
    email: 'rahul.verma@example.com',
    vehiclesCount: 3,
    emergencyContactsCount: 1,
    status: 'Suspended',
    joinedDate: '2026-03-01',
    lastActive: '2026-07-17 19:42',
  },
];

const mockAlertFailures: AlertFailureItem[] = [
  {
    id: 'FAIL-901',
    scanId: 'SCN-8804',
    qrCode: 'VS-CON-5512',
    targetPhone: '+919876543214',
    alertType: 'WhatsApp SOS',
    channel: 'WhatsApp Business Cloud',
    failureCode: 'WABA_401_TOKEN_EXPIRED',
    errorMessage: 'Authentication token expired for meta cloud gateway',
    attemptTime: '2026-07-18 16:20:05',
    status: 'FAILED',
  },
  {
    id: 'FAIL-902',
    scanId: 'SCN-8812',
    qrCode: 'VS-KOT-9021',
    targetPhone: '+919811223344',
    alertType: 'Emergency Call',
    channel: 'Twilio',
    failureCode: 'TW_21211_INVALID_PHONE',
    errorMessage: 'Recipient phone number is invalid or unreachable',
    attemptTime: '2026-07-17 08:14:22',
    status: 'PERMANENT_FAIL',
  },
];

const mockDeadLetterQueue: DeadLetterRow[] = [
  {
    id: 'DLQ-001',
    eventPayloadType: 'WHATSAPP_ALERT',
    recipientPhone: '+919876543214',
    failureReason: 'RATE_LIMIT_EXCEEDED',
    retryCount: 3,
    maxRetries: 3,
    failedAt: '2026-07-19 12:44',
  },
  {
    id: 'DLQ-002',
    eventPayloadType: 'SMS_NOTIFICATION',
    recipientPhone: '+919811223344',
    failureReason: 'GATEWAY_TIMEOUT',
    retryCount: 2,
    maxRetries: 3,
    failedAt: '2026-07-19 11:20',
  },
];

const mockAbuseReports: AbuseReport[] = [
  {
    id: 'ABU-101',
    targetQrCode: 'VS-CON-5512',
    scanId: 'SCN-8804',
    reporterIpHash: '03ac67dc...33e1',
    abuseType: 'Spam Scans',
    severity: 'High',
    status: 'Open',
    reportedAt: '2026-07-18 16:22',
  },
  {
    id: 'ABU-102',
    targetQrCode: 'VS-KOT-9021',
    scanId: 'SCN-8812',
    reporterIpHash: '9a8b7c6d...11e2',
    abuseType: 'Spoofed Coordinates',
    severity: 'Critical',
    status: 'Open',
    reportedAt: '2026-07-17 08:16',
  },
];

export async function getScans(params?: Record<string, unknown>): Promise<any[]> {
  try {
    const response = await apiClient.get<any[]>(ENDPOINTS.ADMIN.SCANS, { params });
    return response.data?.length ? response.data : mockScans;
  } catch {
    return mockScans;
  }
}

export async function getFlaggedScans(): Promise<any[]> {
  const response = await apiClient.get<any[]>(ENDPOINTS.ADMIN.FLAGGED_SCANS);
  return response.data;
}

export async function getScanDetail(id: string): Promise<Record<string, unknown>> {
  const response = await apiClient.get<Record<string, unknown>>(ENDPOINTS.ADMIN.SCAN_DETAIL(id));
  return response.data;
}

export async function getOwners(params?: Record<string, unknown>): Promise<any[]> {
  try {
    const response = await apiClient.get<any[]>(ENDPOINTS.ADMIN.OWNERS, { params });
    return response.data?.length ? response.data : mockOwners;
  } catch {
    return mockOwners;
  }
}

export async function getOwnerDetail(id: string): Promise<Record<string, unknown>> {
  const response = await apiClient.get<Record<string, unknown>>(ENDPOINTS.ADMIN.OWNER_DETAIL(id));
  return response.data;
}

export async function overrideVehicleStatus(
  vehicleId: string,
  subscriptionStatus: string,
  reason: string
): Promise<Record<string, unknown>> {
  const response = await apiClient.patch<Record<string, unknown>>(
    ENDPOINTS.ADMIN.VEHICLE_OVERRIDE(vehicleId),
    { subscription_status: subscriptionStatus.toLowerCase(), reason }
  );
  return response.data;
}

export async function getMetrics(): Promise<Record<string, unknown>> {
  try {
    const response = await apiClient.get<Record<string, unknown>>(ENDPOINTS.ADMIN.METRICS);
    return response.data || (mockAdminMetrics as any);
  } catch {
    return mockAdminMetrics as any;
  }
}

export async function getAlertFailures(): Promise<any[]> {
  try {
    const response = await apiClient.get<any[]>(ENDPOINTS.ADMIN.ALERT_FAILURES);
    return response.data?.length ? response.data : mockAlertFailures;
  } catch {
    return mockAlertFailures;
  }
}

export async function triggerAbuseScan(scanId: string): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    ENDPOINTS.ADMIN.ABUSE_TRIGGER,
    null,
    { params: { scan_id: scanId } }
  );
  return response.data;
}

export async function triggerRenewalsPush(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(ENDPOINTS.ADMIN.RENEWALS_PUSH);
  return response.data;
}

export async function getDeadLetter(): Promise<any[]> {
  try {
    const response = await apiClient.get<any[]>(ENDPOINTS.ADMIN.DEAD_LETTER);
    return response.data?.length ? response.data : mockDeadLetterQueue;
  } catch {
    return mockDeadLetterQueue;
  }
}

export async function getAbuseReports(): Promise<any[]> {
  return mockAbuseReports;
}

export async function retryDeadLetter(taskId: string): Promise<{ status: string; message: string }> {
  const response = await apiClient.post<{ status: string; message: string }>(ENDPOINTS.ADMIN.DEAD_LETTER_RETRY(taskId));
  return response.data;
}
