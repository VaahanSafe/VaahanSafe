import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { MapsIcon, Location01Icon, Alert02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ScanMapPreviewProps } from '@/types/scan';
import { buildStaticMapUrl, openGoogleMaps } from '@/lib/scan';
import { cn } from '@/lib/utils';

export const ScanMapPreview = memo(function ScanMapPreview({
  latitude,
  longitude,
  address,
  zoom = 15,
  className = '',
}: ScanMapPreviewProps) {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const staticMapUrl = buildStaticMapUrl(latitude, longitude, zoom);

  const handleOpenMaps = () => {
    openGoogleMaps(latitude, longitude);
  };

  return (
    <Card className={cn('bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-md overflow-hidden text-left font-sans select-none', className)}>
      {/* Static Map Image Container */}
      <div className="relative aspect-[16/9] w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden flex items-center justify-center">
        {imgLoading && !imgError && (
          <Skeleton className="absolute inset-0 size-full bg-zinc-200 dark:bg-zinc-800/80 animate-pulse" />
        )}

        {imgError ? (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 text-zinc-500">
            <div className="size-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
              <HugeiconsIcon icon={Alert02Icon} className="size-5" />
            </div>
            <span className="text-xs font-bold font-mono">Map Preview Unavailable</span>
            <span className="text-[10px] font-mono text-zinc-400">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </span>
          </div>
        ) : (
          <motion.img
            src={staticMapUrl}
            alt={`Static location map at ${latitude}, ${longitude}`}
            loading="lazy"
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgLoading(false);
              setImgError(true);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: imgLoading ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'object-cover size-full rounded-t-lg transition-transform duration-500 hover:scale-105',
              imgLoading ? 'invisible' : 'visible'
            )}
          />
        )}

        {/* Location Pin Overlay Badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white font-mono text-[10px] font-bold flex items-center gap-1.5 shadow-md">
          <HugeiconsIcon icon={Location01Icon} className="size-3 text-orange-500" />
          <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
        </div>
      </div>

      {/* Footer Details & External Map Link */}
      <div className="p-3.5 bg-zinc-50/50 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-mono font-extrabold uppercase text-zinc-400 tracking-wider block">
            SCAN GPS LOCATION
          </span>
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenMaps}
          className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0 border-none shadow-xs"
        >
          <HugeiconsIcon icon={MapsIcon} className="size-3.5" />
          <span>Open Maps</span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
        </Button>
      </div>
    </Card>
  );
});
