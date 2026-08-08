import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const ChartSkeleton: React.FC<{ className?: string; type?: 'card' | 'chart' | 'heatmap' }> = React.memo(({
  className,
  type = 'chart'
}) => {
  if (type === 'card') {
    return (
      <div className={cn("p-6 border border-zinc-200 dark:border-zinc-900 bg-card rounded-lg flex flex-col gap-3 shadow-xs animate-pulse", className)}>
        <div className="flex justify-between items-center w-full">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="size-6 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg mt-1" />
        <div className="flex items-center gap-2 mt-2 w-full">
          <Skeleton className="h-3 w-12 rounded-lg" />
          <Skeleton className="h-3 w-20 rounded-lg" />
        </div>
        <div className="w-full h-8 mt-2">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (type === 'heatmap') {
    return (
      <div className={cn("p-6 border border-zinc-200 dark:border-zinc-900 bg-card rounded-lg flex flex-col gap-4 shadow-xs animate-pulse", className)}>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-40 rounded-lg" />
          <Skeleton className="h-3.5 w-64 rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {Array.from({ length: 53 * 7 }).map((_, idx) => (
            <Skeleton key={idx} className="size-3.5 rounded-xs shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  // Standard line or bar chart skeleton
  return (
    <div className={cn("p-6 border border-zinc-200 dark:border-zinc-900 bg-card rounded-lg flex flex-col gap-6 shadow-xs animate-pulse", className)}>
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-44 rounded-lg" />
          <Skeleton className="h-3.5 w-64 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
      
      {/* Visual Chart Bars / Axes Mockups */}
      <div className="flex-1 w-full h-[180px] flex items-end gap-3.5 px-2 relative border-b border-l border-zinc-100 dark:border-zinc-900 pt-4">
        {Array.from({ length: 12 }).map((_, idx) => {
          const height = [25, 45, 60, 35, 75, 90, 50, 40, 65, 80, 55, 70][idx];
          return (
            <div key={idx} className="flex-1 flex flex-col justify-end h-full">
              <Skeleton 
                className="w-full rounded-t-xs" 
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between items-center w-full px-1 text-[10px]">
        <Skeleton className="h-3 w-12 rounded-lg" />
        <Skeleton className="h-3 w-12 rounded-lg" />
        <Skeleton className="h-3 w-12 rounded-lg" />
        <Skeleton className="h-3 w-12 rounded-lg" />
      </div>
    </div>
  );
});

ChartSkeleton.displayName = 'ChartSkeleton';
