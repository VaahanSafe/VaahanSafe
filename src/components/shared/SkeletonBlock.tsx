import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import type { SkeletonBlockProps } from '@/types/shared';
import { cn } from '@/lib/utils';

export const SkeletonBlock: React.FC<SkeletonBlockProps> = React.memo(({
  variant = 'page',
  count = 3
}) => {
  switch (variant) {
    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {Array.from({ length: count }).map((_, i) => (
            <Card key={i} className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 rounded-lg shadow-xs select-none">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-3.5 w-1/3 rounded-lg" />
                  <Skeleton className="h-2.5 w-1/4 rounded-lg" />
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <Skeleton className="h-3 w-full rounded-lg" />
                <Skeleton className="h-3 w-5/6 rounded-lg" />
                <Skeleton className="h-3 w-2/3 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-lg overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-900 select-none">
          <div className="bg-secondary/40 h-10 px-4 flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-1/12 rounded-lg" />
            <Skeleton className="h-4 w-3/12 rounded-lg" />
            <Skeleton className="h-4 w-3/12 rounded-lg" />
            <Skeleton className="h-4 w-2/12 rounded-lg" />
            <Skeleton className="h-4 w-1/12 rounded-lg" />
          </div>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-12 px-4 flex items-center justify-between gap-4 bg-white dark:bg-[#0c0c0f]/90">
              <Skeleton className="h-3.5 w-1/12 rounded-lg" />
              <Skeleton className="h-3.5 w-3/12 rounded-lg" />
              <Skeleton className="h-3.5 w-3/12 rounded-lg" />
              <Skeleton className="h-3.5 w-2/12 rounded-lg" />
              <Skeleton className="h-3.5 w-1/12 rounded-lg" />
            </div>
          ))}
        </div>
      );

    case 'avatar':
      return (
        <div className="flex items-center gap-3 select-none">
          <Skeleton className="size-9 rounded-full shrink-0" />
          <div className="space-y-1.5 min-w-0">
            <Skeleton className="h-3 w-20 rounded-lg" />
            <Skeleton className="h-2.5 w-14 rounded-lg" />
          </div>
        </div>
      );

    case 'list':
      return (
        <div className="space-y-3 w-full select-none">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 p-3.5 border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/80 rounded-lg">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-1/4 rounded-lg" />
                <Skeleton className="h-2.5 w-1/2 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-10 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      );

    case 'chart':
      return (
        <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-6 rounded-lg select-none">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-28 rounded-lg" />
              <Skeleton className="h-2.5 w-44 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
          </div>
          <div className="h-40 flex items-end gap-3.5 pt-4 border-b border-l border-zinc-150 dark:border-zinc-900/60 px-2.5">
            {Array.from({ length: 12 }).map((_, i) => {
              const heights = ['h-12', 'h-24', 'h-8', 'h-28', 'h-36', 'h-16', 'h-20', 'h-32', 'h-12', 'h-24', 'h-40', 'h-14'];
              return (
                <Skeleton 
                  key={i} 
                  className={cn("w-full rounded-t-lg shrink-0 opacity-45", heights[i % heights.length])} 
                />
              );
            })}
          </div>
        </Card>
      );

    case 'form':
      return (
        <div className="space-y-4 w-full select-none">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-lg" />
              <Skeleton className="h-8.5 w-full rounded-lg" />
            </div>
          ))}
        </div>
      );

    case 'page':
      return (
        <div className="space-y-6 w-full select-none">
          {/* Header Skeleton Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20 rounded-lg" />
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton className="h-8.5 w-20 rounded-lg" />
              <Skeleton className="h-8.5 w-20 rounded-lg" />
            </div>
          </div>
          
          {/* Main Grid Content Skeleton Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-56 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-44 w-full rounded-lg" />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
});

SkeletonBlock.displayName = 'SkeletonBlock';

export default SkeletonBlock;
