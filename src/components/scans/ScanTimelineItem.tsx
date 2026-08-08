import { memo } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Clock01Icon, 
  Location01Icon, 
  SmartPhone01Icon, 
  User03Icon, 
  QrCodeIcon 
} from '@hugeicons/core-free-icons';

import { Card, CardContent } from '@/components/ui/card';
import type { ScanTimelineItemProps } from '@/types/scan';
import { ScanResultBadge } from './ScanResultBadge';
import { formatScanDate } from '@/lib/scan';
import { cn } from '@/lib/utils';

export const ScanTimelineItem = memo(function ScanTimelineItem({
  scan,
  showConnector = true,
  className = '',
}: ScanTimelineItemProps) {
  const { full: formattedTime } = formatScanDate(scan.timestamp);
  const scanTypeLabel = (scan.scanType || 'general').replace('_', ' ').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn('relative flex gap-4 text-left font-sans select-none', className)}
    >
      {/* Vertical Timeline Dot & Line Connector */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-500 flex items-center justify-center font-mono font-bold text-xs shadow-xs shrink-0">
          <HugeiconsIcon icon={QrCodeIcon} className="size-4" />
        </div>
        {showConnector && (
          <div className="w-0.5 flex-1 bg-zinc-200 dark:bg-zinc-800/80 my-1 rounded-full min-h-8" />
        )}
      </div>

      {/* Timeline Event Card Content */}
      <Card className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm hover:shadow-md dark:hover:border-zinc-700 transition-all overflow-hidden mb-3">
        <CardContent className="p-0 space-y-3">
          
          {/* Header Row: Result Badge & Scan Type */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <ScanResultBadge result={scan.result} />
              <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {scanTypeLabel}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-zinc-500 dark:text-zinc-400">
              <HugeiconsIcon icon={Clock01Icon} className="size-3.5 shrink-0" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Body Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-700 dark:text-zinc-300">
            {scan.address && (
              <div className="flex items-start gap-1.5 sm:col-span-2">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-normal truncate">
                  {scan.address}
                </span>
              </div>
            )}

            {scan.reporter && (
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <HugeiconsIcon icon={User03Icon} className="size-3.5 shrink-0" />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Reporter: {scan.reporter}
                </span>
              </div>
            )}

            {scan.device && (
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <HugeiconsIcon icon={SmartPhone01Icon} className="size-3.5 shrink-0" />
                <span className="font-mono text-[11px]">
                  Device: {scan.device}
                </span>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
});
