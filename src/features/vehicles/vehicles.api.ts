import { apiClient } from '@/lib/http/apiClient';
import { ENDPOINTS } from '@/lib/http/endpoints';
import { vehicleCreateSchema, vehicleUpdateSchema } from './vehicles.schema';
import type {
  VehicleOut,
  VehicleDetailOut,
  VehicleCreateIn,
  VehicleUpdateIn,
  RegisterVehicleResult,
  ScanLogOut
} from './vehicles.types';

export async function listVehicles(params?: Record<string, unknown>): Promise<VehicleOut[]> {
  const response = await apiClient.get<VehicleOut[]>(ENDPOINTS.VEHICLES.BASE, { params });
  return response.data;
}

export async function getVehicle(id: string): Promise<VehicleDetailOut> {
  const response = await apiClient.get<VehicleDetailOut>(ENDPOINTS.VEHICLES.DETAIL(id));
  return response.data;
}

export async function createVehicle(payload: VehicleCreateIn): Promise<VehicleOut> {
  const validated = vehicleCreateSchema.parse(payload);
  const response = await apiClient.post<VehicleOut>(ENDPOINTS.VEHICLES.BASE, validated);
  return response.data;
}

export async function registerVehicle(payload: VehicleCreateIn): Promise<RegisterVehicleResult> {
  const validated = vehicleCreateSchema.parse(payload);
  const response = await apiClient.post<RegisterVehicleResult>(ENDPOINTS.VEHICLES.REGISTER, validated);
  return response.data;
}

export async function updateVehicle(id: string, payload: VehicleUpdateIn): Promise<VehicleOut> {
  const validated = vehicleUpdateSchema.parse(payload);
  const response = await apiClient.patch<VehicleOut>(ENDPOINTS.VEHICLES.DETAIL(id), validated);
  return response.data;
}

export async function deleteVehicle(id: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.VEHICLES.DETAIL(id));
  return response.data;
}

export async function getScanHistory(id: string, params?: Record<string, unknown>): Promise<ScanLogOut[]> {
  const response = await apiClient.get<ScanLogOut[]>(ENDPOINTS.VEHICLES.SCANS(id), { params });
  return response.data;
}

export async function getQrUrl(id: string): Promise<{ qr_url: string }> {
  const response = await apiClient.get<{ qr_url: string }>(ENDPOINTS.VEHICLES.QR(id));
  return response.data;
}

export async function renewSubscription(id: string): Promise<Record<string, unknown>> {
  const response = await apiClient.post<Record<string, unknown>>(ENDPOINTS.VEHICLES.RENEW(id));
  return response.data;
}

export async function getAlertHistory(id: string): Promise<Record<string, unknown>[]> {
  const response = await apiClient.get<Record<string, unknown>[]>(ENDPOINTS.VEHICLES.ALERT_HISTORY(id));
  return response.data;
}

export async function downloadVehicleCertificate(id: string, licensePlate: string = 'vehicle', download: boolean = true): Promise<void> {
  const response = await apiClient.get(ENDPOINTS.VEHICLES.CERTIFICATE(id), {
    params: { download },
    responseType: 'blob',
  });
  
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  
  if (!download) {
    window.open(url, '_blank');
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = `VaahanSafe_Certificate_${licensePlate}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function downloadVehicleSticker(id: string, licensePlate: string = 'vehicle', download: boolean = true): Promise<void> {
  const response = await apiClient.get(ENDPOINTS.VEHICLES.STICKER(id), {
    params: { download },
    responseType: 'blob',
  });
  
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  
  if (!download) {
    window.open(url, '_blank');
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = `VaahanSafe_Sticker_${licensePlate}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

