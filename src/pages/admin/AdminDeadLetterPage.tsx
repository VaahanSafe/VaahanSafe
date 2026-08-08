import { useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  RefreshIcon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Calendar03Icon
} from '@hugeicons/core-free-icons';
import { useAdminDeadLetter } from '@/features/admin/admin.hooks';
import type { AdminDeadLetterItem } from '@/features/admin/admin.types';
import { securityLogger } from '@/lib/security/securityLogger';
import { toast } from 'sonner';

export default function AdminDeadLetterPage() {
  const { tasks, isLoading, triggerRetry, refetch } = useAdminDeadLetter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Celery dead-letter queue synchronized');
    }, 500);
  };

  const handleRetry = async (task: AdminDeadLetterItem) => {
    const success = await triggerRetry(task.taskId || task.id || '');
    if (success) {
      securityLogger.log(
        `Retried Celery Dead Letter task ${task.taskId}`,
        'dead_letter_retry',
        `Task: ${task.taskName}, arguments: ${task.args}`
      );
      toast.success(`Manual retry signal for Celery task dispatched`);
    } else {
      toast.error(`Retry execution failed for Celery task`);
    }
  };

  const renderMobileCard = (task: AdminDeadLetterItem) => (
    <div key={task.taskId} className="p-4 bg-white dark:bg-[#0c0c0f]/90 border border-zinc-200 dark:border-zinc-800/80 rounded-lg space-y-3 shadow-sm text-xs text-left">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">TASK NAME</span>
          <span className="font-bold text-zinc-900 dark:text-white truncate text-sm">{task.taskName}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
          task.status === 'retried_success'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {task.status}
        </span>
      </div>

      <div className="space-y-1.5 font-sans">
        <div className="flex justify-between text-zinc-500">
          <span>Celery Task ID:</span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300 select-all">{task.taskId}</span>
        </div>

        <div className="flex justify-between text-zinc-500">
          <span>Failed At:</span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">{task.failedAt}</span>
        </div>

        <div className="flex justify-between text-zinc-500">
          <span>Executed Retries:</span>
          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{task.retries} attempts</span>
        </div>

        {/* Arguments Payload */}
        <div className="space-y-1 mt-2">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Task Args Payload</span>
          <pre className="p-2 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-[10.5px] font-mono text-zinc-750 dark:text-zinc-350 rounded-lg overflow-x-auto select-all leading-normal whitespace-pre-wrap break-all">
            {task.args}
          </pre>
        </div>

        {/* Error diagnosis */}
        <div className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-550 dark:text-red-450 rounded-lg flex items-start gap-1.5 leading-normal text-[11px] font-mono mt-2">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 mt-0.5 shrink-0" />
          <span>{task.errorMessage}</span>
        </div>

        {task.status === 'failed' && (
          <div className="border-t border-zinc-100 dark:border-zinc-800/40 pt-2.5 mt-2.5 flex justify-end">
            <Button
              onClick={() => handleRetry(task)}
              variant="outline"
              className="h-8 text-[11px] font-extrabold uppercase border-zinc-200 dark:border-zinc-800 hover:border-brand hover:text-brand bg-white dark:bg-zinc-900 cursor-pointer"
            >
              Retry Task
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
            Celery Dead Letter Queue
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review tasks that exhausted execution retries in Redis and retry them manually after debugging downstream services.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          variant="outline"
          className="h-9 w-full sm:w-auto border-zinc-200 dark:border-zinc-800 text-xs font-bold gap-1.5 cursor-pointer shrink-0 justify-center"
        >
          <HugeiconsIcon icon={RefreshIcon} className={`size-3.5 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
          <span>Sync DLQ</span>
        </Button>
      </div>

      {/* ─── QUEUE CONTAINER CARD ─── */}
      <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-md">
        <div className="text-left">
          <CardTitle className="text-base font-black text-zinc-900 dark:text-white font-display">
            Dead Letter Queue Viewer ({tasks.length})
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            View raw argument payloads and diagnose Celery backplane errors.
          </CardDescription>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-zinc-400 font-mono animate-pulse">
            Syncing Celery backplane status...
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            Dead letter queue is empty
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 rounded-lg">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase font-bold border-b border-zinc-200 dark:border-zinc-800/80">
                  <tr>
                    <th className="p-3">Task ID</th>
                    <th className="p-3">Task Function</th>
                    <th className="p-3">Payload (Args)</th>
                    <th className="p-3">Retries</th>
                    <th className="p-3">Error Message</th>
                    <th className="p-3">Failed At</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                  {tasks.map((task: AdminDeadLetterItem) => (
                    <tr key={task.taskId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 font-mono text-zinc-400 select-all truncate max-w-[120px]">{task.taskId}</td>
                      <td className="p-3 font-bold text-zinc-900 dark:text-white font-mono text-[11px]">{task.taskName}</td>
                      <td className="p-3 font-mono text-[10px] text-zinc-600 dark:text-zinc-350 max-w-[200px] truncate select-all" title={task.args}>
                        {task.args}
                      </td>
                      <td className="p-3 font-mono text-zinc-800 dark:text-zinc-205">{task.retries}</td>
                      <td className="p-3 text-red-500 font-mono text-[10.5px] max-w-[200px] truncate" title={task.errorMessage}>
                        {task.errorMessage}
                      </td>
                      <td className="p-3 font-mono text-zinc-500 text-[11px] flex items-center gap-1.5 whitespace-nowrap">
                        <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 text-zinc-450 shrink-0" />
                        <span>{task.failedAt}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          task.status === 'retried_success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {task.status === 'failed' ? (
                          <Button
                            onClick={() => handleRetry(task)}
                            variant="outline"
                            className="h-7 text-[10px] font-extrabold uppercase border-zinc-200 dark:border-zinc-800 hover:border-brand hover:text-brand bg-white dark:bg-zinc-900 cursor-pointer"
                          >
                            Retry Task
                          </Button>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-500 inline-flex items-center gap-0.5 font-bold uppercase">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                            retried
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
              {tasks.map(renderMobileCard)}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
