import { memo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  CheckmarkCircle02Icon, 
  Alert02Icon, 
  QrCodeIcon, 
  CancelCircleIcon 
} from '@hugeicons/core-free-icons';

import { Badge } from '@/components/ui/badge';
import type { ScanResultBadgeProps, ScanResult } from '@/types/scan';
import { scanResultColor, scanResultLabel } from '@/lib/scan';
import { cn } from '@/lib/utils';

function getResultIcon(result: ScanResult) {
  switch (result) {
    case 'dispatched':
      return CheckmarkCircle02Icon;
    case 'rate_limited':
      return Alert02Icon;
    case 'vehicle_not_found':
      return QrCodeIcon;
    case 'error':
      return CancelCircleIcon;
    default:
      return Alert02Icon;
  }
}

export const ScanResultBadge = memo(function ScanResultBadge({
  result,
  className = '',
}: ScanResultBadgeProps) {
  const IconComponent = getResultIcon(result);
  const colorClass = scanResultColor(result);
  const label = scanResultLabel(result);

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider font-mono shadow-2xs select-none border transition-colors',
        colorClass,
        className
      )}
    >
      <HugeiconsIcon icon={IconComponent} className="size-3.5 shrink-0" />
      <span>{label}</span>
    </Badge>
  );
});
