import React from 'react';
import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ColumnVisibilityMenu } from './ColumnVisibilityMenu';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Download01Icon, RefreshIcon } from '@hugeicons/core-free-icons';

interface TableToolbarProps<TData> {
  table: Table<TData>;
  tableKey: string;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  bulkActions?: React.ReactNode;
}

export function TableToolbar<TData>({
  table,
  tableKey,
  globalFilter,
  onGlobalFilterChange,
  onRefresh,
  onExport,
  bulkActions
}: TableToolbarProps<TData>) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 px-1 py-1 select-none font-sans text-xs">
      {/* Search Input on the left */}
      <div className="relative w-full sm:max-w-xs shrink-0 text-left">
        <HugeiconsIcon 
          icon={Search01Icon} 
          className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-zinc-400 dark:text-zinc-550 pointer-events-none" 
        />
        <Input
          placeholder="Global search logs..."
          value={globalFilter ?? ''}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="pl-8 sm:pl-9 h-7 sm:h-8 text-[11px] sm:text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-primary focus-visible:ring-1 outline-none w-full"
        />
      </div>

      {/* Action buttons on the right */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-end">
        {/* Bulk actions slot */}
        {bulkActions && (
          <div className="flex items-center gap-1.5 border-r border-border pr-2 sm:pr-2.5 mr-0.5">
            {bulkActions}
          </div>
        )}

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-7 sm:h-8 text-[11px] sm:text-xs font-semibold px-2 sm:px-3 gap-1.5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-450 hover:bg-secondary hover:text-foreground cursor-pointer flex items-center justify-center"
            aria-label="Refresh grid entries"
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-7 sm:h-8 text-[11px] sm:text-xs font-semibold px-2 sm:px-3 gap-1.5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-450 hover:bg-secondary hover:text-foreground cursor-pointer flex items-center justify-center"
            aria-label="Export grid entries to CSV"
          >
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        <ColumnVisibilityMenu table={table} tableKey={tableKey} />
      </div>
    </div>
  );
}
