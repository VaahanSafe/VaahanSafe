import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface TableLoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableLoadingSkeleton: React.FC<TableLoadingSkeletonProps> = React.memo(({
  rows = 5,
  columns = 5
}) => {
  return (
    <div className="w-full select-none border border-zinc-200 dark:border-zinc-900 bg-card rounded-lg overflow-hidden animate-pulse">
      <Table>
        <TableHeader className="bg-secondary/40 border-b border-zinc-200 dark:border-zinc-900">
          <TableRow>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <TableHead key={colIdx} className="h-10 px-4 align-middle">
                <Skeleton className="h-3.5 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx} className="border-b border-zinc-200 dark:border-zinc-900/50">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <TableCell key={colIdx} className="p-4 align-middle">
                  <Skeleton className="h-3 w-24 rounded-lg bg-zinc-150 dark:bg-zinc-900/80" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

TableLoadingSkeleton.displayName = 'TableLoadingSkeleton';
