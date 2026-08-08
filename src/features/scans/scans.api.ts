import { apiClient, type CustomAxiosRequestConfig } from '@/lib/http/apiClient';
import { ENDPOINTS } from '@/lib/http/endpoints';
import { emergencyScanSchema, parkingScanSchema } from './scans.schema';
import type {
  EmergencyScanIn,
  ParkingScanIn,
  ScanStatusOut
} from './scans.types';

const publicConfig: CustomAxiosRequestConfig = {
  skipAuth: true,
  headers: {} as any,
};

export async function publicLookup(qrCode: string): Promise<Record<string, unknown>> {
  const response = await apiClient.get<Record<string, unknown>>(
    ENDPOINTS.SCANS.LOOKUP(qrCode),
    publicConfig as any
  );
  return response.data;
}

export async function submitEmergencyScan(qrCode: string, payload: EmergencyScanIn): Promise<Record<string, unknown>> {
  const validated = emergencyScanSchema.parse(payload);
  const response = await apiClient.post<Record<string, unknown>>(
    ENDPOINTS.SCANS.EMERGENCY(qrCode),
    validated,
    publicConfig as any
  );
  return response.data;
}

export async function submitParkingScan(qrCode: string, payload: ParkingScanIn): Promise<Record<string, unknown>> {
  const validated = parkingScanSchema.parse(payload);
  const response = await apiClient.post<Record<string, unknown>>(
    ENDPOINTS.SCANS.PARKING(qrCode),
    validated,
    publicConfig as any
  );
  return response.data;
}

export async function getPublicMedical(qrCode: string, medicalPin?: string): Promise<Record<string, unknown>> {
  const config: Record<string, unknown> = { ...publicConfig };
  if (medicalPin) {
    config.headers = { ...((publicConfig.headers as object) || {}), 'X-Medical-PIN': medicalPin };
  }
  const response = await apiClient.get<Record<string, unknown>>(
    ENDPOINTS.SCANS.PUBLIC_MEDICAL(qrCode),
    config as any
  );
  return response.data;
}

export async function getScanStatus(qrCode: string): Promise<ScanStatusOut> {
  const response = await apiClient.get<ScanStatusOut>(
    ENDPOINTS.SCANS.STATUS(qrCode),
    publicConfig as any
  );
  return response.data;
}

export async function fetchAdminScans(params?: any): Promise<{ data: any[]; total: number; page: number; totalPages: number }> {
  const response = await apiClient.get('/admin/scans', { params });
  return {
    data: Array.isArray(response.data) ? response.data : response.data?.items || [],
    total: response.data?.total || 0,
    page: response.data?.page || 1,
    totalPages: response.data?.totalPages || 1,
  };
}
