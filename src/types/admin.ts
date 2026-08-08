import type { ColumnDef, SortingState, PaginationState, RowSelectionState } from '@tanstack/react-table';

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string; // ISO format string
  ipAddress?: string;
  device?: string;
  status: 'success' | 'warning' | 'failed';
  oldValue?: string;
  newValue?: string;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface FilterState {
  search: string;
  status?: string;
  dateRange?: DateRange;
}

export interface MetricTileProps {
  title: string;
  value: number | string;
  trend?: number; // positive/negative percentage
  icon: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
}

export interface AuditTrailRowProps {
  entry: AuditLog;
  expandable?: boolean;
}

export interface AdminDataTableProps<TData> {
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
}

export interface AdminFilterBarProps {
  search?: string;
  status?: string;
  dateRange?: DateRange;
  onSearchChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onDateChange?: (range: DateRange) => void;
  onReset?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  
  // Legacy / Scans feed support
  filters?: {
    search?: string;
    type?: string;
    result?: string;
    vehicle?: string;
    ipHash?: string;
    page?: number;
  };
  onFilterChange?: (filters: any) => void;
  onClearFilters?: () => void;
}
