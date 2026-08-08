export type ScanResult = 'dispatched' | 'rate_limited' | 'vehicle_not_found' | 'error';

export interface ScanHistory {
  id: string;
  qrCode?: string;
  vehicleId?: string;
  scanType?: 'wrong_parking' | 'emergency' | 'general' | 'medical';
  result: ScanResult;
  timestamp: string; // ISO String
  date?: string;
  time?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  device?: string;
  reporter?: string;
  reporterPhone?: string;
}

export interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  manualAddress?: string;
}

export type DispatchStatusStep = 'report_received' | 'contacts_notified' | 'owner_called' | 'completed' | 'failed';

export interface DispatchStatus {
  qrCode: string;
  step: DispatchStatusStep;
  progressPercent: number; // 0 to 100
  reportReceivedAt?: string;
  contactsNotifiedAt?: string;
  ownerCalledAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface ScanTimelineItemProps {
  scan: ScanHistory;
  showConnector?: boolean;
  className?: string;
}

export interface ScanResultBadgeProps {
  result: ScanResult;
  className?: string;
}

export interface ScanMapPreviewProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  className?: string;
}

export interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onRemove?: () => void;
  loading?: boolean;
  disabled?: boolean;
  maxSizeBytes?: number; // Default 2MB
  className?: string;
}

export interface LocationCaptureCardProps {
  onLocation: (location: CapturedLocation) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface DispatchProgressProps {
  qrCode: string;
  initialStatus?: DispatchStatus;
  pollIntervalMs?: number; // Default 2500ms
  onComplete?: () => void;
  onFailed?: (error: string) => void;
  className?: string;
}
