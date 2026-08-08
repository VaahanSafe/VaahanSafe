import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import {
  getProfile,
  updateProfile,
  requestDeletion,
  getDashboardStats,
  getOwnerVehicles,
  getNotifications
} from './owners.api';
import type {
  OwnerProfileOut,
  DashboardStatsOut,
  UpdateOwnerProfileIn,
  DeleteOwnerRequestOut
} from './owners.types';
import type { OwnerOut } from '../auth/auth.types';
import type { VehicleOut } from '../vehicles/vehicles.types';

export function useOwnerProfile() {
  return useQuery<OwnerProfileOut, Error>({
    queryKey: queryKeys.owner.profile(),
    queryFn: getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<OwnerOut, Error, UpdateOwnerProfileIn>({
    mutationFn: (payload) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useDashboardStats() {
  return useQuery<DashboardStatsOut, Error>({
    queryKey: queryKeys.owner.stats(),
    queryFn: getDashboardStats,
    staleTime: 5 * 60_000, // 5 minutes to mirror Redis cache
  });
}

export function useOwnerVehicles() {
  return useQuery<VehicleOut[], Error>({
    queryKey: queryKeys.vehicles.list(),
    queryFn: getOwnerVehicles,
  });
}

export function useRequestDeletion() {
  return useMutation<DeleteOwnerRequestOut, Error, void>({
    mutationFn: () => requestDeletion(),
  });
}

export function useAdminOwnerDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'owner', id],
    queryFn: async () => ({
      id,
      name: 'Aditya Sharma',
      phone: '+919876543210',
      email: 'aditya.sharma@example.com',
      address: 'Indiranagar, 100ft Road, Bengaluru, Karnataka 560038',
      joinedDate: '2024-11-12',
      registeredDate: '2024-11-12',
      status: 'Active',
      tier: 'Shield',
      scansCount: 42,
      dpdpConsent: 'GRANTED',
      dpdpConsentTimestamp: '2024-11-12 10:30:00',
      dpdpConsentIp: '157.48.21.90',
      alertPreferences: {
        sms: true,
        whatsapp: true,
        voiceCall: false,
      },
      scopes: ['VEHICLE_READ', 'EMERGENCY_DISPATCH', 'ICE_MEDICAL_ACCESS'],
      dpdpConsentScope: ['VEHICLE_READ', 'EMERGENCY_DISPATCH', 'ICE_MEDICAL_ACCESS'],
      vehicles: [
        { id: 'v1', qrCode: 'QR-1001', plate: 'KA-01-AB-1234', type: 'Car (SUV)', activationDate: '2024-11-12', status: 'Active' }
      ],
      scanHistory: [
        { id: 'scan_101', type: 'parking', time: '2025-02-10 14:22:00', location: 'Koramangala 5th Block' }
      ],
      auditLogs: [
        { id: 'audit_1', action: 'Accessed dossier', operator: 'op_admin', time: '2025-02-10 14:00' }
      ]
    }),
    enabled: Boolean(id),
  });
}

export function useOwnerNotifications() {
  return useQuery({
    queryKey: ['owner', 'notifications'],
    queryFn: getNotifications,
    staleTime: 1000 * 30, // 30 seconds
  });
}

import { useState } from 'react';
import type { AdminOwnerItem } from './owners.types';

export function useAdminOwners() {
  const [params, setParams] = useState<Record<string, any>>({
    search: '',
    status: 'all',
    page: 1,
    limit: 10,
  });

  const query = useQuery({
    queryKey: ['admin', 'owners', params],
    queryFn: async () => [],
  });

  const updateFilters = (newParams: Record<string, any>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return {
    owners: (query.data || []) as AdminOwnerItem[],
    total: 0,
    page: params.page || 1,
    totalPages: 1,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    params,
    updateFilters,
    refetch: query.refetch,
  };
}
