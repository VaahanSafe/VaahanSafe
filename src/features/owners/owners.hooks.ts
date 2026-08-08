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
    queryFn: () => getProfile(),
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
