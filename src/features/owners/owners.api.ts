import { apiClient } from '@/lib/http/apiClient';
import { ENDPOINTS } from '@/lib/http/endpoints';
import { updateOwnerProfileSchema } from './owners.schema';
import type {
  OwnerProfileOut,
  DashboardStatsOut,
  UpdateOwnerProfileIn,
  DeleteOwnerRequestOut
} from './owners.types';

import type { OwnerOut } from '../auth/auth.types';
import type { VehicleOut } from '../vehicles/vehicles.types';

import { useAuthStore } from '@/store/authStore';
import { useAuthStore as useFeatureAuthStore } from '@/features/auth/auth.store';

export async function getProfile(): Promise<OwnerProfileOut> {
  const response = await apiClient.get<OwnerProfileOut>(ENDPOINTS.OWNERS.PROFILE);
  const data = response.data;
  if (data?.owner) {
    useAuthStore.getState().setOwner(data.owner);
    useFeatureAuthStore.getState().setOwner(data.owner);
  }
  return data;
}

export async function updateProfile(payload: UpdateOwnerProfileIn): Promise<OwnerOut> {
  const validated = updateOwnerProfileSchema.parse(payload);
  const response = await apiClient.patch<OwnerOut>(ENDPOINTS.OWNERS.PROFILE, validated);
  const updated = response.data;
  if (updated) {
    useAuthStore.getState().setOwner(updated);
    useFeatureAuthStore.getState().setOwner(updated);
  }
  return updated;
}

export async function requestDeletion(): Promise<DeleteOwnerRequestOut> {
  const response = await apiClient.post<DeleteOwnerRequestOut>(ENDPOINTS.OWNERS.DELETE_REQUEST);
  return response.data;
}

export async function getDashboardStats(): Promise<DashboardStatsOut> {
  const response = await apiClient.get<DashboardStatsOut>(ENDPOINTS.OWNERS.DASHBOARD_STATS);
  return response.data;
}

export async function getOwnerVehicles(): Promise<VehicleOut[]> {
  const response = await apiClient.get<VehicleOut[]>(ENDPOINTS.OWNERS.VEHICLES);
  return response.data;
}

export async function suggestLocation(query: string): Promise<string[]> {
  const response = await apiClient.get<string[]>(ENDPOINTS.OWNERS.LOCATION_SUGGEST, {
    params: { q: query }
  });
  return response.data;
}

export async function reverseGeocodeLocation(latitude: number, longitude: number): Promise<{ address: string }> {
  const response = await apiClient.get<{ address: string }>(ENDPOINTS.OWNERS.LOCATION_REVERSE, {
    params: { latitude, longitude }
  });
  return response.data;
}

export async function getActiveSessions(): Promise<any[]> {
  const response = await apiClient.get<any[]>(ENDPOINTS.OWNERS.SESSIONS);
  return response.data;
}

export async function terminateAllSessions(): Promise<{ status: string; message: string }> {
  const response = await apiClient.post<{ status: string; message: string }>(ENDPOINTS.OWNERS.TERMINATE_SESSIONS);
  return response.data;
}

export async function getIpGeocode(): Promise<any> {
  const response = await apiClient.get<any>(ENDPOINTS.OWNERS.LOCATION_IP_GEOCODE);
  return response.data;
}

export async function getNotifications(): Promise<any[]> {
  const response = await apiClient.get<any[]>(ENDPOINTS.OWNERS.NOTIFICATIONS);
  return response.data;
}

export async function markNotificationRead(id: string): Promise<any> {
  const response = await apiClient.post<any>(ENDPOINTS.OWNERS.NOTIFICATIONS_READ(id));
  return response.data;
}

export async function markAllNotificationsRead(): Promise<any> {
  const response = await apiClient.post<any>(ENDPOINTS.OWNERS.NOTIFICATIONS_MARK_ALL_READ);
  return response.data;
}

export async function deleteNotification(id: string): Promise<any> {
  const response = await apiClient.delete<any>(ENDPOINTS.OWNERS.NOTIFICATIONS_DELETE(id));
  return response.data;
}

export async function clearAllNotifications(): Promise<any> {
  const response = await apiClient.delete<any>(ENDPOINTS.OWNERS.NOTIFICATIONS_CLEAR_ALL);
  return response.data;
}

