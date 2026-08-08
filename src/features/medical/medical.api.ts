import { apiClient } from '@/lib/http/apiClient';
import { ENDPOINTS } from '@/lib/http/endpoints';
import { medicalInfoSchema, medicalInfoPatchSchema } from './medical.schema';
import type {
  MedicalInfoOut,
  MedicalInfoIn,
  MedicalInfoPatchIn
} from './medical.types';

export async function getMedicalInfo(vehicleId: string): Promise<MedicalInfoOut> {
  const response = await apiClient.get<MedicalInfoOut>(ENDPOINTS.MEDICAL.BASE(vehicleId));
  return response.data;
}

export async function upsertMedicalInfo(vehicleId: string, payload: MedicalInfoIn): Promise<MedicalInfoOut> {
  const validated = medicalInfoSchema.parse(payload);
  const response = await apiClient.put<MedicalInfoOut>(ENDPOINTS.MEDICAL.BASE(vehicleId), validated);
  return response.data;
}

export async function patchMedicalInfo(vehicleId: string, payload: MedicalInfoPatchIn): Promise<MedicalInfoOut> {
  const validated = medicalInfoPatchSchema.parse(payload);
  const response = await apiClient.patch<MedicalInfoOut>(ENDPOINTS.MEDICAL.BASE(vehicleId), validated);
  return response.data;
}

export async function deleteMedicalInfo(vehicleId: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(ENDPOINTS.MEDICAL.BASE(vehicleId));
  return response.data;
}

export async function getAiSummary(vehicleId: string): Promise<{ summary: string }> {
  const response = await apiClient.get<{ summary: string }>(ENDPOINTS.MEDICAL.AI_SUMMARY(vehicleId));
  return response.data;
}
