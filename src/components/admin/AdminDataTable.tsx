import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { TablePagination } from './TablePagination';
import { TableToolbar } from './TableToolbar';
import { TableLoadingSkeleton } from './TableLoadingSkeleton';
import { TableEmptyState } from './TableEmptyState';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sorting01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

interface AdminDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  pagination?: PaginationState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting?: SortingState;
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  tableKey?: string; // Cache identifier for columns visibility
}

export function AdminDataTable<TData>({
  columns,
  data,
  loading = false,
  error = false,
  onRetry,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  toolbar,
  emptyMessage,
  tableKey = 'admin_table'
}: AdminDataTableProps<TData>) {
  // Local states for client-side mode if no state bindings are passed from the parent
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [localRowSelection, setLocalRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});

  // Resolve active states
  const activePagination = pagination ?? localPagination;
  const activeOnPaginationChange = onPaginationChange ?? setLocalPagination;
  
  const activeSorting = sorting ?? localSorting;
  const activeOnSortingChange = onSortingChange ?? setLocalSorting;

  const activeRowSelection = rowSelection ?? localRowSelection;
  const activeOnRowSelectionChange = onRowSelectionChange ?? setLocalRowSelection;

  // Configure TanStack Table Instance
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: activePagination,
      sorting: activeSorting,
      rowSelection: activeRowSelection,
      globalFilter,
      columnVisibility,
    },
    onPaginationChange: activeOnPaginationChange,
    onSortingChange: activeOnSortingChange,
    onRowSelectionChange: activeOnRowSelectionChange,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: pagination !== undefined,
    manualSorting: sorting !== undefined,
  });

  const allRows = table.getRowModel().rows;

  return (
    <div className="w-full space-y-4 font-sans select-none text-left">
      {/* 1. Header toolbar */}
      <TableToolbar
        table={table}
        tableKey={tableKey}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onRefresh={onRetry}
        onExport={() => {
          // Flatten selected rows or fallback to all rows
          const selectedRows = table.getSelectedRowModel().rows;
          const targetRows = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;
          const rawData = targetRows.map(r => r.original);
          
          import('@/lib/admin').then(({ exportCSV }) => {
            exportCSV(rawData, `${tableKey}-export`);
          });
        }}
      />

      {/* 2. Loading Placeholder */}
      {loading ? (
        <TableLoadingSkeleton rows={activePagination.pageSize} columns={columns.length} />
      ) : error ? (
        <TableEmptyState isError={true} onRetry={onRetry} />
      ) : allRows.length === 0 ? (
        <TableEmptyState 
          isError={false} 
          message={emptyMessage} 
          onRetry={onRetry}
        />
      ) : (
        /* 3. Main Sticky Data Grid Wrapper */
        <div className="w-full border border-zinc-200 dark:border-zinc-900 bg-card rounded-lg overflow-x-auto relative -webkit-overflow-scrolling-touch">
          <Table className="min-w-[600px] border-collapse relative">
            <TableHeader className="bg-secondary/40 sticky top-0 z-20 backdrop-blur-xs">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-zinc-200 dark:border-zinc-900">
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    
                    return (
                      <TableHead 
                        key={header.id}
                        className="h-10 px-4 text-xs font-bold text-zinc-550 dark:text-zinc-500 uppercase tracking-wider align-middle select-none whitespace-nowrap"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div 
                            className={cn(
                              "flex items-center gap-1.5",
                              header.column.getCanSort() && "cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {header.column.getCanSort() && (
                              <HugeiconsIcon 
                                icon={Sorting01Icon} 
                                className={cn(
                                  "size-3 shrink-0 transition-colors",
                                  isSorted ? "text-primary" : "text-zinc-350 dark:text-zinc-650"
                                )}
                              />
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {allRows.map((row) => (
                <TableRow
                  key={row.id}
                  tabIndex={0}
                  className="border-b border-zinc-200 dark:border-zinc-900/50 hover:bg-secondary/15 transition-colors focus-visible:bg-secondary/20 outline-none"
                  data-state={row.getIsSelected() && "selected"}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      row.toggleSelected();
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="p-4 align-middle text-xs font-medium text-zinc-900 dark:text-zinc-200 whitespace-nowrap leading-relaxed"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 4. Footer Pagination controls */}
      {!loading && !error && allRows.length > 0 && (
        <TablePagination table={table} />
      )}
    </div>
  );
}
