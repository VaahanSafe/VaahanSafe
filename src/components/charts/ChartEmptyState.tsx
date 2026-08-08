import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, Analytics01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

interface ChartEmptyStateProps {
  title?: string;
  description?: string;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = React.memo(({
  title,
  description,
  isError = false,
  onRetry,
  className
}) => {
  const heading = title || (isError ? 'Unable to load analytics' : 'No data available');
  const details = description || (isError 
    ? 'An error occurred while fetching your metric history. Please verify your connection.'
    : 'We don\'t have any checkin records to plot for this time range yet.');

  return (
    <Card className={cn(
      "w-full p-8 border border-zinc-200 dark:border-zinc-900 bg-card rounded-lg flex flex-col items-center justify-center text-center gap-4 shadow-xs select-none",
      className
    )}>
      {/* Visual illustration slot */}
      <div className={cn(
        "size-12 rounded-full flex items-center justify-center shrink-0 shadow-inner",
        isError ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
      )}>
        <HugeiconsIcon 
          icon={isError ? Alert02Icon : Analytics01Icon} 
          className="size-5" 
        />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
          {heading}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal font-medium">
          {details}
        </p>
      </div>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="h-8 text-xs font-semibold px-4 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-secondary transition-colors"
        >
          {isError ? 'Retry Connection' : 'Refresh Metrics'}
        </Button>
      )}
    </Card>
  );
});

ChartEmptyState.displayName = 'ChartEmptyState';
