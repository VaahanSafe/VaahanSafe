import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import {
  getScans,
  getFlaggedScans,
  getScanDetail,
  getOwners,
  getOwnerDetail,
  overrideVehicleStatus,
  getMetrics,
  getAlertFailures,
  triggerAbuseScan,
  triggerRenewalsPush,
  getDeadLetter,
  retryDeadLetter
} from './admin.api';

export function useAdminScans(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.scans(params),
    queryFn: () => getScans(params),
    staleTime: 1000 * 30,
  });
}

export function useAdminFlaggedScans() {
  return useQuery({
    queryKey: queryKeys.admin.flaggedScans(),
    queryFn: () => getFlaggedScans(),
    staleTime: 1000 * 30,
  });
}

export function useAdminScanDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.scanDetail(id),
    queryFn: () => getScanDetail(id),
    enabled: Boolean(id),
  });
}

export function useAdminOwners(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.owners(params),
    queryFn: () => getOwners(params),
    staleTime: 1000 * 60,
  });
}

export function useAdminOwnerDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.ownerDetail(id),
    queryFn: () => getOwnerDetail(id),
    enabled: Boolean(id),
  });
}

export function useAdminOverrideVehicleStatus() {
  const queryClient = useQueryClient();

  return useMutation<Record<string, unknown>, Error, { vehicleId: string; status: string; reason: string }>({
    mutationFn: ({ vehicleId, status, reason }) => overrideVehicleStatus(vehicleId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: queryKeys.admin.metrics(),
    queryFn: getMetrics,
    staleTime: 1000 * 60,
  });
}

export function useAdminAlertFailures() {
  return useQuery({
    queryKey: queryKeys.admin.alertFailures(),
    queryFn: getAlertFailures,
    staleTime: 1000 * 30,
  });
}

export function useAdminTriggerAbuseScan() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (scanId) => triggerAbuseScan(scanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  });
}

export function useAdminTriggerRenewalsPush() {
  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => triggerRenewalsPush(),
  });
}

export function useAdminDeadLetter() {
  return useQuery({
    queryKey: queryKeys.admin.deadLetter(),
    queryFn: getDeadLetter,
    staleTime: 1000 * 30,
  });
}

export function useAdminRetryDeadLetter() {
  const queryClient = useQueryClient();

  return useMutation<{ status: string; message: string }, Error, string>({
    mutationFn: (taskId) => retryDeadLetter(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.deadLetter() });
    },
  });
}

export function useAdminAbuseReports() {
  return useQuery({
    queryKey: ['admin', 'abuse-reports'],
    queryFn: async () => [],
    staleTime: 1000 * 30,
  });
}
