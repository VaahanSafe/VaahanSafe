export interface ScanMetric {
  date: string; // ISO date "YYYY-MM-DD"
  scans: number;
  emergency: number;
  parking: number;
}

export interface DeliveryMetric {
  channel: 'WhatsApp' | 'Masked Call' | 'SMS';
  success: number;
  failure: number;
  pending: number;
}

export interface HeatmapDay {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  trend: number;
  icon: React.ReactNode;
  sparklineData: number[];
  loading?: boolean;
  prefix?: string;
  suffix?: string;
}

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export interface ScansLineChartProps {
  data: ScanMetric[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export interface DeliveryRateBarChartProps {
  data: DeliveryMetric[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export interface HeatmapCalendarProps {
  data: HeatmapDay[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}
