import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Download02Icon,
  Location01Icon,
  CheckmarkCircle02Icon,
  FingerPrintIcon
} from '@hugeicons/core-free-icons';
import { useAdminScans } from '@/features/scans/scans.hooks';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import type { ColumnDef } from '@/components/admin/AdminDataTable';
import type { AdminScanItem } from '@/features/scans/scans.types';
import { toast } from 'sonner';

export default function AdminScansPage() {
  const {
    scans,
    total,
    page,
    totalPages: _totalPages,
    isLoading,
    params,
    updateFilters
  } = useAdminScans();

  const handleExport = () => {
    toast.success(`Exporting ${total} scan audit logs to CSV`);
  };

  const columns: ColumnDef<AdminScanItem>[] = [
    {
      header: "Log ID",
      cell: ({ row }: any) => (
        <Link to={`/admin/scans/${row.original.id}`} className="font-mono font-bold text-brand hover:underline">
          {row.original.id}
        </Link>
      )
    },
    {
      header: "Sticker QR Code",
      cell: ({ row }: any) => <span className="font-mono font-bold text-brand">{row.original.qrCode}</span>
    },
    {
      header: "Vehicle Plate",
      cell: ({ row }: any) => <span className="font-semibold text-zinc-800 dark:text-zinc-200">{row.original.vehicle}</span>
    },
    {
      header: "Category",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
            item.type === 'accident'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : item.type === 'parking'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}>
            {item.type}
          </span>
        );
      }
    },
    {
      header: "Location",
      cell: ({ row }: any) => (
        <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
          <HugeiconsIcon icon={Location01Icon} className="size-3 text-zinc-400 shrink-0" />
          <span>{row.original.location}</span>
        </span>
      )
    },
    {
      header: "IP Hash",
      cell: ({ row }: any) => (
        <span className="font-mono text-[10px] text-zinc-500 flex items-center gap-1" title={`User Agent: ${row.original.userAgent}`}>
          <HugeiconsIcon icon={FingerPrintIcon} className="size-3 text-zinc-400 shrink-0" />
          <span>{row.original.ipHash}</span>
        </span>
      )
    },
    {
      header: "Scan Time",
      cell: ({ row }: any) => <span className="font-mono text-[11px] text-zinc-500">{row.original.time}</span>
    },
    {
      header: "Outcome",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
            item.result === 'Failed'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
            {item.result}
          </span>
        );
      }
    }
  ];

  const renderMobileCard = (item: AdminScanItem) => (
    <div className="p-4 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 rounded-lg space-y-3 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-xs">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Link to={`/admin/scans/${item.id}`} className="font-mono font-bold text-brand hover:underline truncate">
            {item.id}
          </Link>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wide shrink-0 ${
          item.type === 'accident'
            ? 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20'
            : item.type === 'parking'
            ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20'
            : 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20'
        }`}>
          {item.type}
        </span>
      </div>

      {/* Main Info: Vehicle & QR */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Vehicle</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded text-[11px]">
            {item.vehicle}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Sticker QR</span>
          <span className="font-mono font-bold text-brand text-[11px]">
            {item.qrCode}
          </span>
        </div>
      </div>

      {/* Status & Outcome */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px]">
        <span className="text-zinc-500 dark:text-zinc-400 font-medium">Outcome Status</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
          item.result === 'Failed'
            ? 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
        }`}>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
          {item.result}
        </span>
      </div>

      {/* Footer Info: Location, IP & Time */}
      <div className="pt-2 space-y-1.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 min-w-0 text-zinc-600 dark:text-zinc-400">
            <HugeiconsIcon icon={Location01Icon} className="size-3 text-zinc-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </span>
          <span className="shrink-0 text-zinc-400 dark:text-zinc-500">{item.time}</span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={FingerPrintIcon} className="size-3 text-zinc-400 shrink-0" />
            <span>IP: {item.ipHash}</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 text-zinc-950 dark:text-white font-sans w-full px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            Global QR Scan Feed
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Complete audit feed with real-time filters for date, type, result, vehicle plate, and IP hash.
          </p>
        </div>

        <Button
          onClick={handleExport}
          className="h-9 w-full sm:w-auto bg-brand hover:opacity-90 text-white text-xs font-extrabold gap-1.5 cursor-pointer border-none self-stretch sm:self-auto shrink-0 justify-center"
        >
          <HugeiconsIcon icon={Download02Icon} className="size-3.5" />
          <span>Export Scan Logs</span>
        </Button>
      </div>

      {/* Global Filter Bar */}
      <AdminFilterBar
        filters={params}
        onFilterChange={updateFilters}
        onClearFilters={() => updateFilters({ search: '', type: 'all', result: 'all', vehicle: '', ipHash: '', page: 1 })}
      />

      {/* Data Table Container */}
      <Card className="glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-3 sm:p-5 shadow-md overflow-hidden">
        <AdminDataTable<AdminScanItem>
          data={scans}
          columns={columns}
          keyExtractor={(item: AdminScanItem) => item.id}
          mobileCard={renderMobileCard}
          isLoading={isLoading}
          pagination={{
            pageIndex: page - 1,
            pageSize: 10,
          }}
        />
      </Card>
    </div>
  );
}
