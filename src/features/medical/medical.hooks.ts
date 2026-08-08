import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import {
  getMedicalInfo,
  upsertMedicalInfo,
  patchMedicalInfo,
  deleteMedicalInfo,
  getAiSummary
} from './medical.api';
import type {
  MedicalInfoOut,
  MedicalInfoIn,
  MedicalInfoPatchIn
} from './medical.types';

export function useMedicalInfo(vehicleId: string) {
  return useQuery<MedicalInfoOut, Error>({
    queryKey: queryKeys.medical.info(vehicleId),
    queryFn: () => getMedicalInfo(vehicleId),
    enabled: Boolean(vehicleId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveMedicalInfo() {
  const queryClient = useQueryClient();

  return useMutation<MedicalInfoOut, Error, { vehicleId: string; payload: MedicalInfoIn }>({
    mutationFn: ({ vehicleId, payload }) => upsertMedicalInfo(vehicleId, payload),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medical.info(vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
    },
  });
}

export function usePatchMedicalInfo() {
  const queryClient = useQueryClient();

  return useMutation<MedicalInfoOut, Error, { vehicleId: string; payload: MedicalInfoPatchIn }>({
    mutationFn: ({ vehicleId, payload }) => patchMedicalInfo(vehicleId, payload),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medical.info(vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
    },
  });
}

export function useDeleteMedicalInfo() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (vehicleId) => deleteMedicalInfo(vehicleId),
    onSuccess: (_, vehicleId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medical.info(vehicleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
    },
  });
}

export function useMedicalAiSummary(vehicleId: string, enabled = true) {
  return useQuery<{ summary: string }, Error>({
    queryKey: ['medical', vehicleId, 'ai-summary'],
    queryFn: () => getAiSummary(vehicleId),
    enabled: Boolean(vehicleId) && enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
}
