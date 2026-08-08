import { useState, useEffect, useMemo } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  RefreshIcon,
  Delete02Icon
} from '@hugeicons/core-free-icons';
import { securityLogger, type AuditLogEntry } from '@/lib/security/securityLogger';
import { toast } from 'sonner';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AuditTrailRow } from '@/components/admin/AuditTrailRow';
import type { AuditLog, DateRange } from '@/types/admin';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

// Helper converter to map securityLogger entries to general AuditLog types
function mapLogToAuditLog(log: AuditLogEntry): AuditLog {
  const isDiff = log.details.includes('->');
  const detailsParts = isDiff ? log.details.split('->') : [];
  
  return {
    id: log.id,
    actor: log.operatorEmail,
    action: log.action,
    target: log.category.replace('_', ' ').toUpperCase(),
    timestamp: log.timestamp,
    ipAddress: log.ipAddress,
    device: 'Admin Console',
    status: log.category === 'medical_view' ? 'warning' : 'success',
    oldValue: isDiff ? detailsParts[0].trim() : undefined,
    newValue: isDiff ? detailsParts[1].trim() : log.details
  };
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [viewMode, setViewMode] = useState<'feed' | 'table'>('feed');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const loadLogs = () => {
    const list = securityLogger.getLogs();
    setLogs(list);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleRefresh = () => {
    loadLogs();
    toast.success('Security audit trail re-synchronized');
  };

  const handleClearLogs = () => {
    localStorage.removeItem('vs_admin_audit_logs');
    loadLogs();
    toast.success('Audit trail history reset');
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
    if (selectedIds.length === 0) return;
    
    // Read current raw logs, filter out selected ones, and write back
    const current = securityLogger.getLogs();
    const updated = current.filter(l => !selectedIds.includes(l.id));
    localStorage.setItem('vs_admin_audit_logs', JSON.stringify(updated));
    setRowSelection({});
    loadLogs();
    toast.success(`Deleted ${selectedIds.length} security audit entries`);
  };

  // Filter calculations
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !search ||
        log.id.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.operatorEmail.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === 'all' || log.category === category;

      let matchesDate = true;
      if (dateRange?.from) {
        const logDate = new Date(log.timestamp);
        matchesDate = logDate >= dateRange.from;
      }
      if (dateRange?.to && matchesDate) {
        const logDate = new Date(log.timestamp);
        const endCompare = new Date(dateRange.to);
        endCompare.setHours(23, 59, 59, 999);
        matchesDate = logDate <= endCompare;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [logs, search, category, dateRange]);

  const tableData = useMemo<AuditLog[]>(() => {
    return filteredLogs.map(mapLogToAuditLog);
  }, [filteredLogs]);

  const selectedCount = useMemo(() => {
    return Object.keys(rowSelection).filter(k => rowSelection[k]).length;
  }, [rowSelection]);

  const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40
    },
    {
      accessorKey: 'id',
      header: 'Log ID',
      cell: ({ row }) => (
        <span className="font-mono text-zinc-500 select-all font-bold">
          {row.original.id.substring(0, 8)}
        </span>
      ),
      size: 90
    },
    {
      accessorKey: 'actor',
      header: 'Operator',
      cell: ({ row }) => (
        <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">
          {row.original.actor}
        </span>
      )
    },
    {
      accessorKey: 'action',
      header: 'Action Description',
      cell: ({ row }) => (
        <span className="font-bold text-zinc-900 dark:text-white font-sans">
          {row.original.action}
        </span>
      )
    },
    {
      accessorKey: 'target',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-[10px] font-mono font-bold tracking-wider">
          {row.original.target}
        </span>
      )
    },
    {
      accessorKey: 'ipAddress',
      header: 'Terminal IP',
      cell: ({ row }) => (
        <span className="font-mono text-zinc-500">
          {row.original.ipAddress || '—'}
        </span>
      )
    },
    {
      accessorKey: 'timestamp',
      header: 'Logged At',
      cell: ({ row }) => (
        <span className="font-mono text-zinc-500 text-[11px]">
          {row.original.timestamp}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Outcome',
      cell: ({ row }) => (
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase",
          row.original.status === 'success' 
            ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/15'
            : 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/15'
        )}>
          {row.original.status}
        </span>
      )
    }
  ], []);

  return (
    <div className="space-y-4 sm:space-y-6 text-zinc-950 dark:text-white font-sans w-full px-3 sm:px-6">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-lg sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            Security audit logs
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Searchable log of sensitive administrator compliance actions including status overrides, dead-letter retries, and private owner PII accesses.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex-1 sm:flex-initial h-8 sm:h-9 border-zinc-200 dark:border-zinc-800 text-[11px] sm:text-xs font-bold gap-1.5 cursor-pointer justify-center"
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
            <span className="hidden xs:inline">Sync logs</span>
          </Button>

          <Button
            onClick={handleClearLogs}
            variant="destructive"
            className="flex-1 sm:flex-initial h-8 sm:h-9 text-[11px] sm:text-xs font-extrabold cursor-pointer uppercase tracking-wider justify-center"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* ─── FILTER TOOLBAR ─── */}
      <AdminFilterBar
        search={search}
        status={category}
        dateRange={dateRange}
        onSearchChange={setSearch}
        onStatusChange={setCategory}
        onDateChange={setDateRange}
        onReset={() => {
          setSearch('');
          setCategory('all');
          setDateRange({ from: undefined, to: undefined });
        }}
      />

      {/* ─── CONTROLS CARD ─── */}
      <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0c0c0f]/90 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="text-left">
            <CardTitle className="text-sm sm:text-base font-black text-zinc-900 dark:text-white font-display">
              Audit Trail Logs ({filteredLogs.length})
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-zinc-555 dark:text-zinc-500 mt-0.5 leading-relaxed">
              Real-time security event audit trail. Toggle between Clerk-style Feed View or Datagrid Table View.
            </CardDescription>
          </div>

          {/* Toggle View mode */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-secondary/60 dark:bg-zinc-950 p-0.5 sm:p-1 border border-zinc-250 dark:border-zinc-850 rounded-lg self-start shrink-0 select-none">
            <button
              onClick={() => setViewMode('feed')}
              className={cn(
                "px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                viewMode === 'feed' 
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-800" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              )}
            >
              Feed
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                viewMode === 'table' 
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-800" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              )}
            >
              Table
            </button>
          </div>
        </div>

        {/* ─── RENDER CONTENT ─── */}
        {filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-450 font-mono border border-dashed border-zinc-200 dark:border-zinc-900 rounded-lg bg-zinc-50 dark:bg-zinc-950/20">
            No matching security logs found matching filters
          </div>
        ) : viewMode === 'feed' ? (
          /* Expandable Feed View */
          <div className="border border-zinc-200 dark:border-zinc-900 bg-card rounded-lg overflow-hidden divide-y dark:divide-zinc-900/60 shadow-xs">
            {filteredLogs.map((log) => (
              <AuditTrailRow 
                key={log.id} 
                entry={mapLogToAuditLog(log)} 
              />
            ))}
          </div>
        ) : (
          /* Datagrid Table View */
          <AdminDataTable<AuditLog>
            data={tableData}
            columns={columns}
            tableKey="security_audit_logs"
            emptyMessage="No security logs matching search criteria"
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onRetry={handleRefresh}
            bulkActions={
              selectedCount > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-8 text-xs font-bold px-3 gap-1 rounded-lg uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                  <span>Delete Selected ({selectedCount})</span>
                </Button>
              )
            }
          />
        )}
      </Card>
    </div>
  );
}
