import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Search01Icon, 
  Calendar03Icon, 
  FilterHorizontalIcon, 
  RefreshIcon, 
  Download01Icon 
} from '@hugeicons/core-free-icons';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AdminFilterBarProps } from '@/types/admin';

export const AdminFilterBar: React.FC<AdminFilterBarProps> = React.memo(({
  search,
  status = 'all',
  dateRange,
  onSearchChange,
  onStatusChange,
  onDateChange,
  onReset,
  onRefresh,
  onExport,
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isLegacy = !!filters;

  // Resolve active states dynamically
  const activeSearch = isLegacy ? (filters?.search ?? '') : (search ?? '');
  const activeStatus = isLegacy ? (filters?.type ?? 'all') : (status ?? 'all');
  const activeResult = filters?.result ?? 'all';
  const activeVehicle = filters?.vehicle ?? '';
  const activeIpHash = filters?.ipHash ?? '';

  // Change callbacks handlers
  const handleSearchChange = (val: string) => {
    if (isLegacy && onFilterChange) {
      onFilterChange({ ...filters, search: val, page: 1 });
    } else if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleStatusChange = (val: string) => {
    if (isLegacy && onFilterChange) {
      onFilterChange({ ...filters, type: val, page: 1 });
    } else if (onStatusChange) {
      onStatusChange(val);
    }
  };

  const handleResultChange = (val: string) => {
    if (isLegacy && onFilterChange) {
      onFilterChange({ ...filters, result: val, page: 1 });
    }
  };

  const handleVehicleChange = (val: string) => {
    if (isLegacy && onFilterChange) {
      onFilterChange({ ...filters, vehicle: val, page: 1 });
    }
  };

  const handleIpHashChange = (val: string) => {
    if (isLegacy && onFilterChange) {
      onFilterChange({ ...filters, ipHash: val, page: 1 });
    }
  };

  const handleResetFilters = () => {
    if (isLegacy && onClearFilters) {
      onClearFilters();
    } else if (onReset) {
      onReset();
      setSearchParams(new URLSearchParams(), { replace: true });
    }
  };

  // Restore states from URL search params on mount (Non-legacy mode only)
  useEffect(() => {
    if (isLegacy) return;
    const q = searchParams.get('q') || '';
    const s = searchParams.get('status') || 'all';
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    if (q !== activeSearch && onSearchChange) onSearchChange(q);
    if (s !== activeStatus && onStatusChange) onStatusChange(s);

    const fromDate = fromStr ? new Date(fromStr) : undefined;
    const toDate = toStr ? new Date(toStr) : undefined;
    const validFrom = fromDate && !isNaN(fromDate.getTime()) ? fromDate : undefined;
    const validTo = toDate && !isNaN(toDate.getTime()) ? toDate : undefined;

    if ((validFrom !== dateRange?.from || validTo !== dateRange?.to) && onDateChange) {
      onDateChange({ from: validFrom, to: validTo });
    }
  }, [searchParams, isLegacy]);

  // Synchronize state changes back to URLSearchParams (Non-legacy mode only)
  useEffect(() => {
    if (isLegacy) return;
    const params = new URLSearchParams(searchParams);
    
    if (activeSearch.trim()) {
      params.set('q', activeSearch.trim());
    } else {
      params.delete('q');
    }

    if (activeStatus && activeStatus !== 'all') {
      params.set('status', activeStatus);
    } else {
      params.delete('status');
    }

    if (dateRange?.from) {
      params.set('from', dateRange.from.toISOString().split('T')[0]);
    } else {
      params.delete('from');
    }

    if (dateRange?.to) {
      params.set('to', dateRange.to.toISOString().split('T')[0]);
    } else {
      params.delete('to');
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [activeSearch, activeStatus, dateRange, setSearchParams, searchParams, isLegacy]);

  const hasActiveFilters = isLegacy
    ? (activeSearch.trim() !== '' || activeStatus !== 'all' || activeResult !== 'all' || activeVehicle.trim() !== '' || activeIpHash.trim() !== '')
    : (activeSearch.trim() !== '' || activeStatus !== 'all' || !!dateRange?.from || !!dateRange?.to);

  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-zinc-200 dark:border-zinc-900 bg-card rounded-lg select-none text-left">
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3.5 flex-1">
        {/* Search filter input */}
        <div className="relative w-full sm:max-w-xs text-left">
          <HugeiconsIcon 
            icon={Search01Icon} 
            className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-zinc-400 dark:text-zinc-550 pointer-events-none" 
          />
          <Input
            placeholder="Search records..."
            value={activeSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 sm:pl-9 h-8 sm:h-9.5 text-[11px] sm:text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-primary focus-visible:ring-1 outline-none w-full"
          />
        </div>

        {/* Status / Category Select Dropdown */}
        <div className="w-full sm:w-40 text-left">
          <Select value={activeStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full h-8 sm:h-9.5 text-[11px] sm:text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white px-3 focus-visible:ring-primary">
              <SelectValue placeholder={isLegacy ? "All Types" : "All Statuses"} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs">
              {isLegacy ? (
                <>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Outcomes Select Dropdown (Legacy Only) */}
        {isLegacy && (
          <div className="w-full sm:w-40 text-left">
            <Select value={activeResult} onValueChange={handleResultChange}>
              <SelectTrigger className="w-full h-8 sm:h-9.5 text-[11px] sm:text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white px-3 focus-visible:ring-primary">
                <SelectValue placeholder="All Outcomes" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs">
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Vehicle Plate input (Legacy Only) */}
        {isLegacy && (
          <div className="w-full sm:w-32 text-left">
            <Input
              placeholder="Plate..."
              value={activeVehicle}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="h-8 sm:h-9.5 text-[11px] sm:text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-primary focus-visible:ring-1 outline-none w-full animate-none"
            />
          </div>
        )}

        {/* IP Hash input (Legacy Only) */}
        {isLegacy && (
          <div className="w-full sm:w-32 text-left">
            <Input
              placeholder="IP Hash..."
              value={activeIpHash}
              onChange={(e) => handleIpHashChange(e.target.value)}
              className="h-8 sm:h-9.5 text-[11px] sm:text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white focus-visible:ring-primary focus-visible:ring-1 outline-none w-full animate-none"
            />
          </div>
        )}

        {/* Date range picker popover */}
        {!isLegacy && onDateChange && (
          <div className="w-full sm:w-auto flex flex-col text-left">
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className={cn(
                      "h-8 sm:h-9.5 text-[11px] sm:text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070708] text-zinc-900 dark:text-white px-3 flex justify-between items-center font-normal hover:bg-zinc-100 dark:hover:bg-zinc-900/40 cursor-pointer outline-none focus:border-brand w-full sm:w-60 gap-3",
                      !dateRange?.from && "text-zinc-500"
                    )}
                  />
                }
              >
                <span className="truncate">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`
                    ) : (
                      format(dateRange.from, "dd MMM yyyy")
                    )
                  ) : (
                    "Filter by date range"
                  )}
                </span>
                <HugeiconsIcon icon={Calendar03Icon} className="size-4 text-zinc-500 shrink-0" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-lg" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange?.from,
                    to: dateRange?.to
                  }}
                  onSelect={(range) => {
                    onDateChange({
                      from: range?.from,
                      to: range?.to
                    });
                  }}
                  numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-7 sm:h-8 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 gap-1 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"
          >
            <HugeiconsIcon icon={FilterHorizontalIcon} className="size-3.5" />
            <span className="hidden xs:inline">Reset</span>
          </Button>
        )}
      </div>

      {/* Auxiliary actions on the right */}
      <div className="flex items-center gap-2.5 shrink-0 justify-end">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-9 text-xs font-semibold px-3 gap-1.5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-450 hover:bg-secondary hover:text-foreground cursor-pointer flex items-center justify-center"
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
            className="h-9 text-xs font-semibold px-3 gap-1.5 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-450 hover:bg-secondary hover:text-foreground cursor-pointer flex items-center justify-center"
          >
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}
      </div>
    </div>
  );
});

AdminFilterBar.displayName = 'AdminFilterBar';
