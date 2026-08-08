export type SubscriptionStatus = "pending" | "active" | "expired" | "suspended";

export interface Vehicle {
  id: string;
  licensePlate: string;
  status: SubscriptionStatus;
  renewalDate: string;
  note?: string;
  qrImageUrl: string;
  createdAt: string;
}

export interface VehicleFormData {
  licensePlate: string;
  note?: string;
}

export interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: () => void;
  onDelete?: () => void;
  onRenew?: () => void;
  onDownloadQR?: () => void;
  onView?: () => void;
  className?: string;
}

export interface VehicleStatusBadgeProps {
  status: SubscriptionStatus;
  className?: string;
}

export interface QRCodeDisplayProps {
  imageUrl: string;
  vehicleNumber: string;
  loading?: boolean;
  className?: string;
}

export interface QRCodeDownloadButtonProps {
  downloadUrl?: string;
  vehicleId?: string;
  licensePlate?: string;
  subscriptionStatus?: SubscriptionStatus | string;
  loading?: boolean;
  filename?: string;
  className?: string;
}

export interface RenewalCountdownProps {
  renewalDate: string;
  className?: string;
}
