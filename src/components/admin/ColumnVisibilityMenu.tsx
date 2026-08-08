import React, { useEffect } from 'react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import { LayoutThreeColumnIcon } from '@hugeicons/core-free-icons';
import { columnVisibilityStorage } from '@/lib/admin';

interface ColumnVisibilityMenuProps<TData> {
  table: Table<TData>;
  tableKey: string; // Key to persist visibility in localStorage
}

export function ColumnVisibilityMenu<TData>({
  table,
  tableKey
}: ColumnVisibilityMenuProps<TData>) {
  // Restore layout preferences from localStorage on mount
  useEffect(() => {
    const saved = columnVisibilityStorage.get(tableKey);
    if (saved) {
      table.setColumnVisibility(saved);
    }
  }, [table, tableKey]);

  // Handle caching state whenever column visibility updates
  const handleToggle = (colId: string, val: boolean) => {
    const col = table.getColumn(colId);
    if (col) {
      col.toggleVisibility(val);
      
      // Compute and cache the new visibility state object
      const current = table.getState().columnVisibility;
      const updated = { ...current, [colId]: val };
      columnVisibilityStorage.set(tableKey, updated);
    }
  };

  const visibleColumns = table
    .getAllColumns()
    .filter(column => typeof column.accessorFn !== 'undefined' && column.getCanHide());

  if (visibleColumns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold px-3 gap-1.5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-450 hover:bg-secondary hover:text-foreground cursor-pointer flex items-center justify-center"
            aria-label="Toggle column layout preferences"
          />
        }
      >
        <HugeiconsIcon icon={LayoutThreeColumnIcon} className="size-3.5" />
        <span className="hidden sm:inline">Columns</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-popover border border-border shadow-md rounded-lg p-1 text-xs select-none"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 font-black text-zinc-500 uppercase tracking-wider text-[9px]">
            Toggle Column Visibilities
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60" />
          <div className="max-h-52 overflow-y-auto py-0.5 scrollbar-thin">
            {visibleColumns.map(column => {
              const header = column.columnDef.header;
              // Format nice text label from headers
              const label = typeof header === 'string' 
                ? header 
                : column.id.replace(/([A-Z])/g, ' $1').trim();
                
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize cursor-pointer rounded-lg p-1.5 hover:bg-secondary flex items-center gap-2"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => handleToggle(column.id, !!value)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
