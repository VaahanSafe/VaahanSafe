import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  RefreshIcon,
  AlertCircleIcon,
  Calendar03Icon,
  SecurityLockIcon
} from '@hugeicons/core-free-icons';
import { useAdminAbuseReports } from '@/features/admin/admin.hooks';
import type { AdminAbuseReport } from '@/features/admin/admin.types';
import { securityLogger } from '@/lib/security/securityLogger';
import { toast } from 'sonner';

export default function AdminAbuseReportsPage() {
  const { reports, isLoading, triggerScan, refetch } = useAdminAbuseReports();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Abuse reports updated');
    }, 500);
  };

  const handleTriggerScan = async () => {
    const success = await triggerScan();
    if (success) {
      securityLogger.log(
        "Manually triggered AI security scanning sweep",
        "general_audit",
        "Initiated compliance check for rate limit anomalies and proxy signatures"
      );
      toast.success("AI Security scan execution completed");
    } else {
      toast.error("Security scan trigger failed");
    }
  };

  const renderReportCard = (report: AdminAbuseReport) => {
    const isHigh = report.overallRiskLevel === 'high' || report.overallRiskLevel === 'critical';

    return (
      <div key={report.id} className="p-5 bg-white dark:bg-[#0c0c0f]/90 border border-zinc-200 dark:border-zinc-800/80 rounded-lg space-y-4 shadow-sm text-xs text-left">
        
        {/* Card Header metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">REPORT ID</span>
            <div className="font-mono font-bold text-zinc-900 dark:text-white select-all text-sm">{report.id}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-500 flex items-center gap-1">
              <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
              {report.generatedAt}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
              isHigh
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {report.overallRiskLevel} Risk
            </span>
          </div>
        </div>

        {/* Operational Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Rate Limit Hits</div>
            <div className="text-xl font-bold font-mono text-zinc-850 dark:text-zinc-150 mt-1">{report.rateLimitHitsCount} events</div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Flagged Threats</div>
            <div className="text-xl font-bold font-mono text-zinc-850 dark:text-zinc-150 mt-1">{report.flaggedThreatsCount} anomalies</div>
          </div>
        </div>

        {/* Scan Patterns description */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">AI Threat Diagnosis</h4>
          <p className="p-3.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-300 leading-relaxed font-sans text-xs">
            {report.scanPatterns}
          </p>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold text-zinc-550 dark:text-zinc-350 uppercase tracking-wider flex items-center gap-1.5">
            <HugeiconsIcon icon={SecurityLockIcon} className="size-3.5 text-zinc-400" />
            Recommended Firewall & Security Rules
          </h4>
          <p className="p-3.5 bg-brand/5 border border-brand/10 rounded-lg text-zinc-800 dark:text-zinc-300 leading-relaxed font-sans text-xs">
            {report.recommendedActions}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-zinc-950 dark:text-white font-sans w-full px-4 sm:px-6">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
            AI Abuse reports
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor nightly AI scanner models classifying scan patterns, risk levels, and auto-generated firewall guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            variant="outline"
            className="flex-1 sm:flex-initial h-9 border-zinc-200 dark:border-zinc-800 text-xs font-bold gap-1.5 cursor-pointer justify-center"
          >
            <HugeiconsIcon icon={RefreshIcon} className={`size-3.5 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
            <span>Update log</span>
          </Button>

          <Button
            onClick={handleTriggerScan}
            disabled={isLoading}
            className="flex-1 sm:flex-initial h-9 bg-brand hover:opacity-90 text-white text-xs font-extrabold gap-1.5 cursor-pointer border-none justify-center"
          >
            <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" />
            <span>Initiate Instant Scan</span>
          </Button>
        </div>
      </div>

      {/* ─── MAIN REPORT VIEW ─── */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-zinc-400 font-mono animate-pulse">
          Analyzing rate limit data feeds...
        </div>
      ) : reports.length === 0 ? (
        <div className="py-20 text-center text-xs text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          No nightly abuse reports found
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {reports.map(renderReportCard)}
        </div>
      )}

    </div>
  );
}
