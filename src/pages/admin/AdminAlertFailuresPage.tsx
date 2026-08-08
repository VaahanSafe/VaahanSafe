import { useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  RefreshIcon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  SmartPhone01Icon,
  Calendar03Icon
} from '@hugeicons/core-free-icons';
import { useAdminAlertFailures } from '@/features/admin/admin.hooks';
import type { AdminAlertFailureItem } from '@/features/admin/admin.types';
import { securityLogger } from '@/lib/security/securityLogger';
import { toast } from 'sonner';

export default function AdminAlertFailuresPage() {
  const { failures, isLoading, triggerRetry, refetch } = useAdminAlertFailures();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Failed alerts database updated');
    }, 500);
  };

  const handleRetry = async (fail: AdminAlertFailureItem) => {
    const success = await triggerRetry(fail.id);
    if (success) {
      securityLogger.log(
        `Retried failed alert dispatch ${fail.id} for owner ${fail.ownerName}`,
        'general_audit',
        `Resubmitted alert via ${fail.channel} to target ${fail.phone}`
      );
      toast.success(`Retried dispatch sequence for ${fail.id}`);
    } else {
      toast.error(`Failed to retry dispatch sequence for ${fail.id}`);
    }
  };

  const renderMobileCard = (fail: AdminAlertFailureItem) => (
    <div key={fail.id} className="p-4 bg-white dark:bg-[#0c0c0f]/90 border border-zinc-200 dark:border-zinc-800/80 rounded-lg space-y-3 shadow-sm text-xs text-left">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">ID</span>
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 truncate">{fail.id}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
          fail.status === 'Resolved' || fail.status === 'Retried'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {fail.status}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="font-bold text-zinc-900 dark:text-white text-sm">{fail.ownerName}</div>
        
        <div className="flex justify-between text-zinc-500">
          <span>Target Phone:</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{fail.phone}</span>
        </div>

        <div className="flex justify-between text-zinc-500">
          <span>Dispatch Channel:</span>
          <span className="font-bold uppercase text-zinc-750 dark:text-zinc-200">{fail.channel}</span>
        </div>

        <div className="flex justify-between text-zinc-500">
          <span>Failure Timestamp:</span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">{fail.timestamp}</span>
        </div>

        <div className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-550 dark:text-red-450 rounded-lg flex items-start gap-1.5 leading-normal text-[11px] font-mono mt-2">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 mt-0.5 shrink-0" />
          <span>{fail.errorMessage}</span>
        </div>

        {fail.status === 'Pending Action' && (
          <div className="border-t border-zinc-100 dark:border-zinc-800/40 pt-2.5 mt-2.5 flex justify-end">
            <Button
              onClick={() => handleRetry(fail)}
              variant="outline"
              className="h-8 text-[11px] font-extrabold uppercase border-zinc-200 dark:border-zinc-800 hover:border-brand hover:text-brand bg-white dark:bg-zinc-900 cursor-pointer"
            >
              Retry Dispatch
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-zinc-950 dark:text-white font-sans w-full px-4 sm:px-6">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            Dispatch failures Directory
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Browse and retry outbound voice calls, WhatsApp, and SMS failures captured from Exotel, AiSensy, and Fast2SMS.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          variant="outline"
          className="h-9 w-full sm:w-auto border-zinc-200 dark:border-zinc-800 text-xs font-bold gap-1.5 cursor-pointer shrink-0 justify-center"
        >
          <HugeiconsIcon icon={RefreshIcon} className={`size-3.5 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
          <span>Sync failures</span>
        </Button>
      </div>

      {/* ─── MAIN LIST CONTAINER ─── */}
      <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-md">
        <div className="text-left">
          <CardTitle className="text-base font-black text-zinc-900 dark:text-white font-display">
            Outbound Alert failures ({failures.length})
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Audit dispatch channel drop logs and coordinate immediate manual retries.
          </CardDescription>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-zinc-400 font-mono animate-pulse">
            Syncing dispatch logs database...
          </div>
        ) : failures.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            No failed dispatch attempts captured
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 rounded-lg">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase font-bold border-b border-zinc-200 dark:border-zinc-800/80">
                  <tr>
                    <th className="p-3">Failure ID</th>
                    <th className="p-3">Subscriber Name</th>
                    <th className="p-3">Outbound Channel</th>
                    <th className="p-3">Target Phone</th>
                    <th className="p-3">Error Diagnosis</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                  {failures.map((fail) => (
                    <tr key={fail.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 font-mono text-zinc-500">{fail.id}</td>
                      <td className="p-3 font-bold text-zinc-900 dark:text-white">{fail.ownerName}</td>
                      <td className="p-3 font-semibold text-zinc-700 dark:text-zinc-300">
                        <span className="uppercase font-mono text-[10.5px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded">
                          {fail.channel}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={SmartPhone01Icon} className="size-3 text-zinc-400 shrink-0" />
                          <span>{fail.phone}</span>
                        </span>
                      </td>
                      <td className="p-3 max-w-xs truncate text-[11px] font-mono text-red-500" title={fail.errorMessage}>
                        {fail.errorMessage}
                      </td>
                      <td className="p-3 font-mono text-zinc-500 flex items-center gap-1.5">
                        <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 text-zinc-450 shrink-0" />
                        <span>{fail.timestamp}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          fail.status === 'Resolved' || fail.status === 'Retried'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {fail.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {fail.status === 'Pending Action' ? (
                          <Button
                            onClick={() => handleRetry(fail)}
                            variant="outline"
                            className="h-7 text-[10px] font-extrabold uppercase border-zinc-200 dark:border-zinc-800 hover:border-brand hover:text-brand bg-white dark:bg-zinc-900 cursor-pointer"
                          >
                            Retry
                          </Button>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-500 inline-flex items-center gap-0.5 font-bold uppercase">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-3">
              {failures.map(renderMobileCard)}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
