import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getProfile } from '@/features/owners/owners.api';
import type { DashboardStatsOut } from '@/features/owners/owners.types';

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  linkedStickers: number;
  protectionStatusPercentage: number;
  totalScans: number;
  scansLast30d: number;
  alertSuccessRate: number;
  expiringSoonCount: number;
  vehiclesTrend: number;
  stickersTrend: number;
  alertsTrend: number;
  protectionTrend: number;
  vehiclesPrev: number;
  stickersPrev: number;
  alertsPrev: number;
  dailyScans: { date: string; scans: number; emergency: number; parking: number }[];
  deliveryRates: { channel: 'WhatsApp' | 'Masked Call' | 'SMS'; success: number; failure: number; pending: number }[];
  heatmapDays: { date: string; count: number }[];
  vehicles: any[];
}

export function useDashboardStats(_ownerPhone?: string) {
  const profileQuery = useQuery({
    queryKey: ['owner', 'profile'],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 2,
  });

  const statsQuery = useQuery<DashboardStatsOut>({
    queryKey: ['owner', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 2,
  });

  const isLoading = profileQuery.isLoading || statsQuery.isLoading;
  const isRefetching = profileQuery.isRefetching || statsQuery.isRefetching;
  const error = profileQuery.error ? String(profileQuery.error) : statsQuery.error ? String(statsQuery.error) : null;

  const profile = profileQuery.data;
  const rawStats = statsQuery.data;

  const totalVehicles = rawStats?.total_vehicles ?? profile?.vehicles?.length ?? 0;
  const activeVehicles = rawStats?.active_vehicles ?? 0;
  const linkedStickers = rawStats?.linked_stickers ?? profile?.vehicles?.filter(v => v.qr_code_id).length ?? 0;
  const protectionStatusPercentage = rawStats?.protection_status_percentage ?? (totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0);

  const data: DashboardStats = {
    totalVehicles,
    activeVehicles,
    linkedStickers,
    protectionStatusPercentage,
    totalScans: rawStats?.total_scans ?? 0,
    scansLast30d: rawStats?.scans_last_30d ?? 0,
    alertSuccessRate: rawStats?.alert_success_rate ?? 100.0,
    expiringSoonCount: rawStats?.expiring_soon_count ?? 0,
    vehiclesTrend: rawStats?.vehicles_trend ?? 0,
    stickersTrend: rawStats?.stickers_trend ?? 0,
    alertsTrend: rawStats?.alerts_trend ?? 0,
    protectionTrend: rawStats?.protection_trend ?? 0,
    vehiclesPrev: rawStats?.vehicles_prev ?? Math.max(0, totalVehicles - 1),
    stickersPrev: rawStats?.stickers_prev ?? Math.max(0, linkedStickers - 1),
    alertsPrev: rawStats?.alerts_prev ?? 0,
    dailyScans: rawStats?.daily_scans ?? [],
    deliveryRates: (rawStats?.delivery_rates as any) ?? [
      { channel: 'WhatsApp', success: 0, failure: 0, pending: 0 },
      { channel: 'Masked Call', success: 0, failure: 0, pending: 0 },
      { channel: 'SMS', success: 0, failure: 0, pending: 0 }
    ],
    heatmapDays: rawStats?.heatmap_days ?? [],
    vehicles: profile?.vehicles ?? []
  };

  const refetch = () => {
    profileQuery.refetch();
    statsQuery.refetch();
  };

  return { data, rawStats, isLoading, isRefetching, error, refetch };
}
