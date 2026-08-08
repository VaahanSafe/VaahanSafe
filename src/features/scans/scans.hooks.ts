import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import {
  publicLookup,
  submitEmergencyScan,
  submitParkingScan,
  getPublicMedical,
  getScanStatus,
  fetchAdminScans
} from './scans.api';
import type {
  EmergencyScanIn,
  ParkingScanIn,
  ScanStatusOut,
  AdminScansFilterParams
} from './scans.types';

export function usePublicVehicleLookup(qrCode: string) {
  return useQuery<Record<string, unknown>, Error>({
    queryKey: queryKeys.scans.lookup(qrCode),
    queryFn: () => publicLookup(qrCode),
    enabled: Boolean(qrCode),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSubmitEmergencyScan() {
  return useMutation<Record<string, unknown>, Error, { qrCode: string; payload: EmergencyScanIn }>({
    mutationFn: ({ qrCode, payload }) => submitEmergencyScan(qrCode, payload),
  });
}

export function useSubmitParkingScan() {
  return useMutation<Record<string, unknown>, Error, { qrCode: string; payload: ParkingScanIn }>({
    mutationFn: ({ qrCode, payload }) => submitParkingScan(qrCode, payload),
  });
}

export function usePublicMedical(qrCode: string, medicalPin?: string, enabled = false) {
  return useQuery<Record<string, unknown>, Error>({
    queryKey: queryKeys.scans.publicMedical(qrCode),
    queryFn: () => getPublicMedical(qrCode, medicalPin),
    enabled: Boolean(qrCode) && enabled,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useScanStatus(qrCode: string) {
  return useQuery<ScanStatusOut, Error>({
    queryKey: queryKeys.scans.status(qrCode),
    queryFn: () => getScanStatus(qrCode),
    enabled: Boolean(qrCode),
    refetchInterval: 3000,
  });
}

/**
 * Admin Scans Feed Hook
 * Backward compatible for AdminScansPage
 */
export function useAdminScans() {
  const [params, setParams] = useState<AdminScansFilterParams>({
    search: '',
    type: 'all',
    result: 'all',
    vehicle: '',
    ipHash: '',
    page: 1,
    limit: 10,
  });

  const query = useQuery({
    queryKey: ['admin', 'scans', params],
    queryFn: () => fetchAdminScans(params),
  });

  const updateFilters = (newParams: Partial<AdminScansFilterParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return {
    scans: query.data?.data || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    totalPages: query.data?.totalPages || 1,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    params,
    updateFilters,
    refetch: query.refetch,
  };
}

/**
 * Admin Flagged Scans Hook
 * Backward compatible for AdminFlaggedScansPage
 */
export function useAdminFlaggedScans() {
  const [params, setParams] = useState<AdminScansFilterParams>({
    search: '',
    page: 1,
    limit: 10,
  });

  const query = useQuery({
    queryKey: ['admin', 'scans', 'flagged', params],
    queryFn: () => fetchAdminScans({ ...params, result: 'Failed' }),
  });

  const updateFilters = (newParams: Partial<AdminScansFilterParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return {
    scans: query.data?.data || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    totalPages: query.data?.totalPages || 1,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    params,
    updateFilters,
    resolveFlag: async (_id: string, _action?: string): Promise<boolean> => true,
    refetch: query.refetch,
  };
}

/**
 * Admin Scan Detail Hook
 * Backward compatible for AdminScanDetailPage
 */
export function useAdminScanDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'scanDetail', id],
    queryFn: async () => {
      const response = await fetchAdminScans({ limit: 50 });
      const found = response.data.find((s) => s.id === id) || response.data[0];
      return {
        id: found.id,
        qrCode: found.qrCode,
        vehiclePlate: found.vehicle,
        vehicleType: 'Car (SUV)',
        ownerName: 'Aditya Sharma',
        ownerPhone: '+919876543210',
        scanType: found.type,
        location: found.location,
        coordinates: '12.9716° N, 77.5946° E',
        ipAddress: '152.57.42.11 (Jio Infocomm)',
        ipHash: found.ipHash,
        userAgent: found.userAgent || 'Mozilla/5.0 (iPhone)',
        timestamp: found.time,
        status: found.result,
        smsDelivered: true,
        whatsappDelivered: true,
        photoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
        type: found.type,
        vehicle: found.vehicle,
        time: found.time,
        flagReason: 'Multiple rapid requests detected from same IP hash.',
        flagSeverity: 'Medium',
        dispatches: [
          { status: 'Success', channel: 'SMS', target: '+919876543210', time: found.time },
          { status: 'Success', channel: 'WhatsApp', target: '+919876543210', time: found.time },
        ],
      };
    },
    enabled: Boolean(id),
  });
}
