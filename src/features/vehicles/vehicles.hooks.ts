import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import {
  listVehicles,
  getVehicle,
  createVehicle,
  registerVehicle,
  updateVehicle,
  deleteVehicle,
  getScanHistory,
  getQrUrl,
  renewSubscription,
  getAlertHistory
} from './vehicles.api';
import type {
  VehicleOut,
  VehicleDetailOut,
  VehicleCreateIn,
  VehicleUpdateIn,
  RegisterVehicleResult,
  ScanLogOut
} from './vehicles.types';

export function useVehicles(params?: Record<string, unknown>) {
  return useQuery<VehicleOut[], Error>({
    queryKey: queryKeys.vehicles.list(params),
    queryFn: () => listVehicles(params),
    staleTime: 1000 * 60 * 3,
  });
}

export function useVehicle(id: string) {
  return useQuery<VehicleDetailOut, Error>({
    queryKey: queryKeys.vehicles.detail(id),
    queryFn: () => getVehicle(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation<VehicleOut, Error, VehicleCreateIn>({
    mutationFn: (payload) => createVehicle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.all });
    },
  });
}

export function useRegisterVehicle() {
  const queryClient = useQueryClient();

  return useMutation<RegisterVehicleResult, Error, VehicleCreateIn>({
    mutationFn: (payload) => registerVehicle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.all });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation<VehicleOut, Error, { id: string; payload: VehicleUpdateIn }>({
    mutationFn: ({ id, payload }) => updateVehicle(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(id) });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: (_: unknown, id: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      queryClient.removeQueries({ queryKey: queryKeys.vehicles.detail(id) });
    },
  });
}

export function useVehicleScanHistory(id: string, params?: Record<string, unknown>) {
  return useQuery<ScanLogOut[], Error>({
    queryKey: queryKeys.vehicles.scans(id, params),
    queryFn: () => getScanHistory(id, params),
    enabled: Boolean(id),
  });
}

export function useVehicleQrImage(id: string) {
  return useQuery<{ qr_url: string }, Error>({
    queryKey: ['vehicles', id, 'qr-image'],
    queryFn: () => getQrUrl(id),
    enabled: Boolean(id),
  });
}

export function useRenewVehicle() {
  const queryClient = useQueryClient();

  return useMutation<Record<string, unknown>, Error, string>({
    mutationFn: (vehicleId: string) => renewSubscription(vehicleId),
    onSuccess: (_: unknown, vehicleId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
    },
  });
}

export function useVehicleAlertHistory(id: string) {
  return useQuery<Record<string, unknown>[], Error>({
    queryKey: ['vehicles', id, 'alert-history'],
    queryFn: () => getAlertHistory(id),
    enabled: Boolean(id),
  });
}

export function useAdminVehicles() {
  const [params, setParams] = useState<Record<string, any>>({
    search: '',
    status: 'all',
    tier: 'all',
    page: 1,
    limit: 10,
  });

  const query = useVehicles(params);

  const updateFilters = (newParams: Record<string, any>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return {
    vehicles: query.data || [],
    total: (query.data || []).length,
    page: params.page || 1,
    totalPages: Math.ceil(((query.data || []).length || 1) / (params.limit || 10)),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    params,
    updateFilters,
    overrideStatus: async (_vehicleId: string, _status: string, _reason: string) => {},
    refetch: query.refetch,
  };
}
