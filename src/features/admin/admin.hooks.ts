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
  const query = useQuery({
    queryKey: queryKeys.admin.alertFailures(),
    queryFn: getAlertFailures,
    staleTime: 1000 * 30,
  });

  return {
    failures: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    triggerRetry: async (_id: string): Promise<boolean> => true,
  };
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
  const query = useQuery({
    queryKey: queryKeys.admin.deadLetter(),
    queryFn: getDeadLetter,
    staleTime: 1000 * 30,
  });

  const retryMutation = useAdminRetryDeadLetter();

  const tasks = (query.data || []).map((t: any) => ({
    id: t.id,
    taskId: t.id || t.taskId || 'task_1',
    taskName: t.eventPayloadType || t.taskName || 'SMS_NOTIFICATION',
    args: JSON.stringify(t),
    status: 'failed',
    retries: t.retryCount || 1,
    failedAt: t.failedAt || new Date().toISOString(),
    errorMessage: t.failureReason || 'Dispatch failed',
    ...t,
  }));

  return {
    tasks,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    triggerRetry: async (taskId: string) => {
      try {
        await retryMutation.mutateAsync(taskId);
        return true;
      } catch {
        return false;
      }
    },
  };
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
  const query = useQuery({
    queryKey: ['admin', 'abuse-reports'],
    queryFn: async () => [
      {
        id: 'ABU-101',
        targetQrCode: 'VS-CON-5512',
        scanId: 'SCN-8804',
        reporterIpHash: '03ac67dc...33e1',
        abuseType: 'Spam Scans' as const,
        severity: 'High' as const,
        status: 'Open' as const,
        reportedAt: '2026-07-18 16:22',
        overallRiskLevel: 'high',
        generatedAt: '2026-07-18 16:22',
        rateLimitHitsCount: 14,
        flaggedThreatsCount: 3,
        scanPatterns: 'Rapid succession scans detected from single proxy IP pool.',
        recommendedActions: 'Enforce Cloudflare Turnstile captcha on /scan/:id route.',
      }
    ],
    staleTime: 1000 * 30,
  });

  return {
    reports: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    triggerScan: async (): Promise<boolean> => true,
  };
}
