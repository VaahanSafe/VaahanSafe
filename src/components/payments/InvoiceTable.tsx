import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Download01Icon,
  Invoice02Icon,
  ReturnRequestIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  UnfoldMoreIcon,
  MoreVerticalIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Alert02Icon,
  ReceiptTextIcon,
} from '@hugeicons/core-free-icons';
import type { Invoice, InvoiceStatus, InvoiceTableProps } from '@/types/payments';
import {
  formatCurrency,
  formatInvoiceNumber,
  formatInvoiceDate,
  invoiceStatusColor,
  invoiceStatusLabel,
  isRefundEligible,
} from '@/lib/payments';
import { cn } from '@/lib/utils';

export const InvoiceTable: React.FC<InvoiceTableProps & {
  onDownload?: (invoice: Invoice) => void;
  onView?: (invoice: Invoice) => void;
  onRefundRequest?: (invoice: Invoice) => void;
}> = React.memo(({
  data,
  loading = false,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onSort,
  onDownload,
  onView,
  onRefundRequest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle local sorting trigger and callback
  const handleSort = (field: string) => {
    const nextDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(nextDirection);
    if (onSort) {
      onSort(field);
    }
  };

  // Filter local data based on invoice number or plan search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();
    return data.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.planName.toLowerCase().includes(query) ||
        invoice.id.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Sort indicator icon selector
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return UnfoldMoreIcon;
    }
    return sortDirection === 'asc' ? ArrowUp01Icon : ArrowDown01Icon;
  };

  // Status icon selector for the badges
  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return CheckmarkCircle02Icon;
      case 'pending':
        return Clock01Icon;
      case 'failed':
      case 'refunded':
      default:
        return Alert02Icon;
    }
  };

  // Render pagination items with ellipses support
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages);
      }
    }

    return pages.map((p, idx) => {
      if (p === 'ellipsis') {
        return (
          <PaginationItem key={`ellipsis-${idx}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      const pageNum = p as number;
      return (
        <PaginationItem key={pageNum}>
          <PaginationLink
            isActive={pageNum === page}
            onClick={() => onPageChange(pageNum)}
            className="cursor-pointer size-7"
          >
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <div className="space-y-4 w-full text-left font-sans select-none">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search by invoice ID or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 rounded-lg text-xs"
            disabled={loading}
          />
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/40 dark:bg-secondary/10">
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-secondary/50 transition-colors h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                onClick={() => handleSort('invoiceNumber')}
              >
                <div className="flex items-center gap-1">
                  Invoice ID
                  <HugeiconsIcon icon={getSortIcon('invoiceNumber')} className="size-3 text-muted-foreground/60" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-secondary/50 transition-colors h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                onClick={() => handleSort('planName')}
              >
                <div className="flex items-center gap-1">
                  Plan
                  <HugeiconsIcon icon={getSortIcon('planName')} className="size-3 text-muted-foreground/60" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-secondary/50 transition-colors h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <HugeiconsIcon icon={getSortIcon('createdAt')} className="size-3 text-muted-foreground/60" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-secondary/50 transition-colors h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  Amount
                  <HugeiconsIcon icon={getSortIcon('amount')} className="size-3 text-muted-foreground/60" />
                </div>
              </TableHead>
              <TableHead className="h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                GST
              </TableHead>
              <TableHead className="h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Method
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-secondary/50 transition-colors h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <HugeiconsIcon icon={getSortIcon('status')} className="size-3 text-muted-foreground/60" />
                </div>
              </TableHead>
              <TableHead className="h-9 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading Skeleton State
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="border-b border-border/40">
                  <TableCell className="p-3"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="p-3"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="p-3"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="p-3"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="p-3"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="p-3"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="p-3"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="p-3 text-right"><Skeleton className="h-6 w-8 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredData.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 py-6">
                    <div className="p-3 rounded-full bg-secondary/35 text-muted-foreground border border-border">
                      <HugeiconsIcon icon={ReceiptTextIcon} className="size-5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">No invoices found</span>
                    <span className="text-[10px] text-muted-foreground">
                      We couldn't find any payment history matching your request.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              filteredData.map((invoice) => {
                const isEligible = isRefundEligible(invoice);
                return (
                  <TableRow
                    key={invoice.id}
                    className="border-b border-border/40 hover:bg-secondary/15 dark:hover:bg-secondary/5 transition-colors"
                  >
                    <TableCell className="p-3 font-mono font-medium text-foreground text-xs">
                      {formatInvoiceNumber(invoice.invoiceNumber)}
                    </TableCell>
                    <TableCell className="p-3 font-medium text-foreground text-xs">
                      {invoice.planName}
                    </TableCell>
                    <TableCell className="p-3 text-muted-foreground text-xs">
                      {formatInvoiceDate(invoice.createdAt)}
                    </TableCell>
                    <TableCell className="p-3 font-semibold text-foreground text-xs">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className="p-3 text-muted-foreground text-xs">
                      {formatCurrency(invoice.gst)}
                    </TableCell>
                    <TableCell className="p-3 text-muted-foreground text-xs capitalize">
                      {invoice.paymentMethod.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="p-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'flex items-center gap-1 w-fit rounded-full px-2 py-0.5 border text-[10px] font-semibold uppercase tracking-wider',
                          invoiceStatusColor(invoice.status)
                        )}
                      >
                        <HugeiconsIcon icon={getStatusIcon(invoice.status)} className="size-2.5" />
                        {invoiceStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="h-6 w-6 rounded-lg hover:bg-secondary border border-transparent hover:border-border/50 text-muted-foreground hover:text-foreground transition-all"
                              aria-label={`Invoice actions for ${invoice.invoiceNumber}`}
                            />
                          }
                        >
                          <HugeiconsIcon icon={MoreVerticalIcon} className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border border-border shadow-md rounded-lg p-1 text-xs">
                          <DropdownMenuItem
                            onClick={() => onView?.(invoice)}
                            className="cursor-pointer gap-2 p-1.5 font-medium rounded-lg"
                          >
                            <HugeiconsIcon icon={Invoice02Icon} className="size-3.5 text-muted-foreground" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDownload?.(invoice)}
                            className="cursor-pointer gap-2 p-1.5 font-medium rounded-lg"
                          >
                            <HugeiconsIcon icon={Download01Icon} className="size-3.5 text-muted-foreground" />
                            Download PDF
                          </DropdownMenuItem>
                          {invoice.status === 'paid' && (
                            <>
                              <DropdownMenuSeparator className="bg-border/60" />
                              <DropdownMenuItem
                                onClick={() => onRefundRequest?.(invoice)}
                                disabled={!isEligible}
                                variant={isEligible ? 'destructive' : 'default'}
                                className={cn(
                                  'cursor-pointer gap-2 p-1.5 font-medium rounded-lg',
                                  !isEligible && 'opacity-50 pointer-events-none'
                                )}
                              >
                                <HugeiconsIcon icon={ReturnRequestIcon} className="size-3.5" />
                                Request Refund
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex justify-end">
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && onPageChange(page - 1)}
                    className={cn(
                      'h-7 px-2.5 rounded-lg text-xs gap-1 border border-border bg-card',
                      page <= 1 ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-secondary/40'
                    )}
                  />
                </PaginationItem>
                {renderPageNumbers()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages && onPageChange(page + 1)}
                    className={cn(
                      'h-7 px-2.5 rounded-lg text-xs gap-1 border border-border bg-card',
                      page >= totalPages ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-secondary/40'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
});

InvoiceTable.displayName = 'InvoiceTable';
