import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCounter } from '@/components/charts/AnimatedCounter';
import { HugeiconsIcon } from '@hugeicons/react';
import { metricTrendColor, metricTrendIcon } from '@/lib/admin';
import type { MetricTileProps } from '@/types/admin';
import { cn } from '@/lib/utils';

export const MetricTile: React.FC<MetricTileProps> = React.memo(({
  title,
  value,
  trend,
  icon,
  subtitle,
  loading = false
}) => {
  const isNumber = typeof value === 'number';
  
  if (loading) {
    return (
      <Card className="p-5 border border-zinc-200 dark:border-zinc-900 bg-card rounded-lg flex flex-col gap-3 shadow-xs animate-pulse select-none text-left">
        <div className="flex justify-between items-center w-full">
          <Skeleton className="h-3.5 w-24 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg mt-1" />
        <Skeleton className="h-3 w-36 rounded-lg mt-1" />
      </Card>
    );
  }

  const showTrend = trend !== undefined && trend !== 0;

  return (
    <Card className="relative flex flex-col justify-between overflow-hidden bg-card text-card-foreground border border-zinc-200 dark:border-zinc-900 rounded-lg p-5 shadow-xs select-none group transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-800 text-left">
      {/* Background Hover glow accent */}
      <div 
        className="absolute -right-12 -top-12 size-36 rounded-full blur-3xl opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none bg-primary"
      />

      <div className="flex justify-between items-start w-full gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xs font-bold text-zinc-550 dark:text-zinc-500 uppercase tracking-wider">
            {title}
          </CardTitle>
          <div className="flex items-baseline gap-2 mt-2.5">
            <span className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {isNumber ? (
                <AnimatedCounter value={value as number} />
              ) : (
                value
              )}
            </span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-secondary/50 border border-zinc-150/40 dark:border-zinc-900 text-zinc-650 dark:text-zinc-400 shrink-0">
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mt-5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium leading-normal text-zinc-500 dark:text-zinc-450">
          {showTrend && (
            <div className={cn("flex items-center gap-0.5 font-extrabold text-[10px]", metricTrendColor(trend))}>
              <HugeiconsIcon 
                icon={metricTrendIcon(trend)} 
                className="size-3 shrink-0" 
                strokeWidth={3}
              />
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
            </div>
          )}
          {subtitle && (
            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
});

MetricTile.displayName = 'MetricTile';
