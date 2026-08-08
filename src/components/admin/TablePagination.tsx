import React from 'react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface TablePaginationProps<TData> {
  table: Table<TData>;
}

export function TablePagination<TData>({
  table
}: TablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const selectedCount = Object.keys(table.getState().rowSelection).length;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-1 py-1 text-xs select-none font-sans text-zinc-500 dark:text-zinc-400 w-full">
      {/* Row Selection details */}
      <div className="text-center lg:text-left text-[11px] font-medium leading-normal w-full lg:w-auto">
        {totalRows > 0 ? (
          <span>
            {selectedCount} of {totalRows} row(s) selected.
          </span>
        ) : (
          <span>No rows selected.</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 w-full lg:w-auto">
        {/* Controls grouping (Inputs + indicators) */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Page size settings */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[11px]">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => table.setPageSize(Number(val))}
            >
              <SelectTrigger className="w-18 !h-7 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white px-2">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs">
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current page index indicator */}
          <div className="flex items-center text-[11px] font-semibold">
            Page {pageCount > 0 ? pageIndex + 1 : 0} of {pageCount}
          </div>

          {/* Custom page jump input */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[11px]">Go to:</span>
            <Input
              type="number"
              min={1}
              max={pageCount || 1}
              value={pageCount > 0 ? pageIndex + 1 : ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) - 1 : 0;
                if (val >= 0 && val < pageCount) {
                  table.setPageIndex(val);
                }
              }}
              className="w-12 !h-7 text-center text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white p-1 focus-visible:ring-primary focus-visible:ring-1 outline-none"
            />
          </div>
        </div>

        {/* Next / Prev buttons grouping */}
        <div className="flex items-center justify-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-7 text-[10px] font-semibold px-2 rounded-lg border border-zinc-200 dark:border-zinc-855 hover:bg-secondary text-zinc-550 dark:text-zinc-400 cursor-pointer"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-7 text-[10px] font-semibold px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 hover:bg-secondary text-zinc-550 dark:text-zinc-400 cursor-pointer"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-7 text-[10px] font-semibold px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-855 hover:bg-secondary text-zinc-555 dark:text-zinc-400 cursor-pointer"
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="h-7 text-[10px] font-semibold px-2 rounded-lg border border-zinc-200 dark:border-zinc-855 hover:bg-secondary text-zinc-555 dark:text-zinc-400 cursor-pointer"
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
