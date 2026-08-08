import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Search01Icon,
  RefreshIcon
} from '@hugeicons/core-free-icons';
import { useAdminFlaggedScans } from '@/features/scans/scans.hooks';
import { toast } from 'sonner';

export default function AdminFlaggedScansPage() {
  const {
    scans,
    params,
    isLoading,
    updateFilters,
    resolveFlag,
    refetch
  } = useAdminFlaggedScans();

  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Abuse database telemetry synchronized');
    }, 500);
  };

  const handleAction = async (scanId: string, action: 'dismiss' | 'block_ip') => {
    const success = await resolveFlag(scanId, action);
    if (success) {
      toast.success(action === 'dismiss' ? 'Scan log flag dismissed as safe' : 'IP address permanently restricted');
    } else {
      toast.error('Failed to update operator state');
    }
  };

  return (
    <div className="space-y-6 text-zinc-950 dark:text-white font-sans w-full px-4 sm:px-6">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            Security Abuse Review
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Anomalous scan payloads and rate-limit hits flagged for operator auditing.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="h-9 w-full sm:w-auto gap-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shrink-0 justify-center"
        >
          <HugeiconsIcon icon={RefreshIcon} className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Abuse Feed</span>
        </Button>
      </div>

      {/* ─── FILTERS ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 p-3 rounded-lg">
        <div className="relative flex-1">
          <HugeiconsIcon icon={Search01Icon} className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search flagged logs by plates, QR, IP, reason..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateFilters({ search: e.target.value });
            }}
            className="pl-8 text-xs h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 rounded-lg focus-visible:ring-1 focus-visible:ring-brand"
          />
        </div>

        <div className="flex items-center gap-1">
          {(['all', 'accident', 'parking', 'paramedic'] as const).map((t) => (
            <button
              key={t}
              onClick={() => updateFilters({ type: t })}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase font-mono transition-all cursor-pointer ${
                params.type === t
                  ? 'bg-brand text-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ─── DATA TABLE & CARDS ─── */}
      {isLoading ? (
        <div className="p-8 text-center text-xs font-mono text-zinc-500 animate-pulse border border-zinc-200 dark:border-zinc-800/80 rounded-lg">
          Analyzing flagged incident logs...
        </div>
      ) : scans.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-lg">
          No flagged security concerns in the queue.
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Mobile Card Grid */}
          <div className="block sm:hidden space-y-4">
            {scans.map((item) => (
              <div key={item.id} className="p-4 bg-white dark:bg-[#0c0c0f]/90 border border-zinc-200 dark:border-zinc-800/80 rounded-lg space-y-3.5 shadow-md text-xs text-left">
                
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
                  <Link to={`/admin/scans/${item.id}`} className="font-mono font-bold text-brand hover:underline text-sm">
                    {item.id}
                  </Link>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                    item.status === 'blocked_ip'
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                      : item.status === 'resolved_safe'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Card Body Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">QR Code:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{item.qrCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Vehicle Plate:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-[11px]">
                      {item.vehicle}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Threat Index:</span>
                    <span className="font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-[11px] font-mono border border-red-500/20">
                      {item.threatScore}% threat
                    </span>
                  </div>
                </div>

                {/* Flag Reason */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-900 rounded-lg text-[10.5px] leading-relaxed font-mono text-zinc-600 dark:text-zinc-400">
                  {item.reason}
                </div>

                {/* Auditor Actions */}
                {item.status === 'pending_review' && (
                  <div className="flex gap-2.5 pt-1">
                    <Button
                      onClick={() => handleAction(item.id, 'dismiss')}
                      className="flex-grow flex-1 h-9 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-[10.5px] font-extrabold uppercase rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-850 cursor-pointer"
                    >
                      Dismiss flag
                    </Button>
                    <Button
                      onClick={() => handleAction(item.id, 'block_ip')}
                      className="flex-grow flex-1 h-9 bg-red-600 hover:bg-red-700 text-white text-[10.5px] font-extrabold uppercase rounded-lg border-none cursor-pointer"
                    >
                      Block client IP
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 rounded-lg text-left">
            <table className="w-full text-xs font-sans">
              <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase font-bold border-b border-zinc-200 dark:border-zinc-800/80">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Sticker QR</th>
                  <th className="p-3">Vehicle Plate</th>
                  <th className="p-3">Origin IP Hash</th>
                  <th className="p-3">Threat Index</th>
                  <th className="p-3">Audit Alert Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Auditor Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                {scans.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3">
                      <Link to={`/admin/scans/${item.id}`} className="font-mono font-bold text-brand hover:underline">
                        {item.id}
                      </Link>
                    </td>
                    <td className="p-3 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                      {item.qrCode}
                    </td>
                    <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.vehicle}
                    </td>
                    <td className="p-3 font-mono text-zinc-500">
                      {item.ipHash}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        item.threatScore > 75 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {item.threatScore}%
                      </span>
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-mono text-[10.5px]">
                      {item.reason}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                        item.status === 'blocked_ip'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : item.status === 'resolved_safe'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {item.status === 'pending_review' ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            onClick={() => handleAction(item.id, 'dismiss')}
                            className="h-7 px-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-850 cursor-pointer"
                          >
                            Dismiss
                          </Button>
                          <Button
                            onClick={() => handleAction(item.id, 'block_ip')}
                            className="h-7 px-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded-lg border-none cursor-pointer"
                          >
                            Block IP
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-400">Audited</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
