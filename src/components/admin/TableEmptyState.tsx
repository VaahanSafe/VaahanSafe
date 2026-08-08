import React from 'react';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

interface TableEmptyStateProps {
  message?: string;
  description?: string;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = React.memo(({
  message,
  description,
  isError = false,
  onRetry,
  className
}) => {
  const heading = message || (isError ? 'Unable to fetch records' : 'No records found');
  const details = description || (isError 
    ? 'A connection timeout or API issue prevented loading the table. Please try again.'
    : 'No items match your active filters or database registry.');

  return (
    <div className={cn(
      "w-full py-16 px-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center gap-4 bg-zinc-50 dark:bg-zinc-950/20 select-none",
      className
    )}>
      <div className={cn(
        "size-11 rounded-full flex items-center justify-center shrink-0 shadow-xs",
        isError ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
      )}>
        <HugeiconsIcon 
          icon={isError ? Alert02Icon : Search01Icon} 
          className="size-5" 
        />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
          {heading}
        </h4>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium">
          {details}
        </p>
      </div>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="h-8 text-xs font-semibold px-4 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-secondary transition-colors"
        >
          {isError ? 'Retry Connection' : 'Refresh Feed'}
        </Button>
      )}
    </div>
  );
});

TableEmptyState.displayName = 'TableEmptyState';
