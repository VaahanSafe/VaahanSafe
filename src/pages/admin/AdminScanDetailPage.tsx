import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon,
  RefreshIcon,
  Location01Icon,
  CheckmarkCircle02Icon,
  FingerPrintIcon,
  AlertCircleIcon,
  Calendar03Icon,
  UserGroupIcon,
  SmartPhone01Icon,
  SecurityLockIcon
} from '@hugeicons/core-free-icons';
import { useAdminScanDetail } from '@/features/scans/scans.hooks';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminScanDetailPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const { data: scan, isLoading, error, refetch } = useAdminScanDetail(scanId || '');
  const [showRawJson, setShowRawJson] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Telemetry event logs synchronized');
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 font-sans text-zinc-500">
        <HugeiconsIcon icon={RefreshIcon} className="size-8 animate-spin text-brand" />
        <p className="text-xs font-mono">Loading telemetry audit logs for {scanId}...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center font-sans max-w-md mx-auto">
        <HugeiconsIcon icon={AlertCircleIcon} className="size-12 text-red-500" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-white font-display">Log Fetch Failed</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          The requested audit log could not be synchronized with the backend. It may have expired or been pruned from operator history.
        </p>
        <Button onClick={() => navigate('/admin/scans')} className="bg-brand text-white text-xs h-9">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
          <span>Back to Global Feed</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-zinc-950 dark:text-white font-sans w-full px-4 sm:px-6">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/admin/scans')}
            variant="outline"
            className="size-9 p-0 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-white dark:bg-zinc-900 shrink-0 cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </Button>
          <div className="text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
                Scan Audit Event
              </h1>
              <span className="font-mono text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 px-2 py-0.5 rounded">
                {scan.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider ${
                scan.type === 'accident'
                  ? 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20'
                  : scan.type === 'parking'
                  ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20'
              }`}>
                {scan.type}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Deep diagnostic audit and real-time dispatcher telemetry.
            </p>
          </div>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="h-9 gap-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shrink-0"
        >
          <HugeiconsIcon icon={RefreshIcon} className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Diagnostics</span>
        </Button>
      </div>

      {/* ─── ALERT BANNER FOR FLAGGED LOGS ─── */}
      {scan.flagReason && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Flagged Scan Activity Anomaly</span>
            <p className="text-zinc-600 dark:text-zinc-300">
              {scan.flagReason} (Severity: <span className="font-bold">{scan.flagSeverity}</span>)
            </p>
          </div>
        </div>
      )}

      {/* ─── GRID LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* left column: general telemetry */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-sm text-left">
            <CardTitle className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider font-display border-b border-zinc-150 dark:border-zinc-800/60 pb-2">
              Event Details
            </CardTitle>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">QR Sticker Code</span>
                <span className="font-mono font-bold text-brand bg-brand/5 px-2 py-0.5 rounded border border-brand/10">
                  {scan.qrCode}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Vehicle Plate</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                  {scan.vehicle}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Scan Timestamp</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 text-zinc-400" />
                  {scan.time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Scan Location</span>
                <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-zinc-400" />
                  {scan.location}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">IP Hash Address</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <HugeiconsIcon icon={FingerPrintIcon} className="size-3.5 text-zinc-400" />
                  {scan.ipHash}
                </span>
              </div>
            </div>
          </Card>

          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-sm text-left">
            <CardTitle className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider font-display border-b border-zinc-150 dark:border-zinc-800/60 pb-2">
              User Agent Telemetry
            </CardTitle>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={SmartPhone01Icon} className="size-5 text-zinc-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">Client Agent String</span>
                  <p className="font-mono text-[10px] text-zinc-500 break-all leading-normal">
                    {scan.userAgent}
                  </p>
                </div>
              </div>
              
              <div className="h-px bg-zinc-200 dark:bg-zinc-800/40 my-3" />

              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">Device: iPhone</span>
                <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">OS: iOS 17.4</span>
                <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">Safari Mobile</span>
              </div>
            </div>
          </Card>
        </div>

        {/* right column: dispatcher outcomes pipeline */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-sm text-left">
            <CardTitle className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider font-display border-b border-zinc-150 dark:border-zinc-800/60 pb-2">
              Alert Dispatch pipeline Outcomes
            </CardTitle>

            <div className="space-y-4">
              {(scan?.dispatches || []).map((disp: any, idx: number) => (
                <div key={idx} className="relative flex gap-4 text-xs">
                  {/* Pipeline connecting lines */}
                  {idx < scan.dispatches.length - 1 && (
                    <span className="absolute left-4 top-8 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800" />
                  )}

                  {/* Icon Indicator */}
                  <div className={`size-8 rounded-full flex items-center justify-center shrink-0 border ${
                    disp.status === 'Failed' 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400' 
                      : (disp.status === 'Connected' || disp.status === 'Delivered')
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                      : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}>
                    {disp.channel === 'call' ? (
                      <HugeiconsIcon icon={UserGroupIcon} className="size-4" />
                    ) : (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                    )}
                  </div>

                  {/* Dispatch Card Details */}
                  <div className="flex-1 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/50 rounded-lg p-3.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{disp.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                          {disp.role}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400">{disp.timestamp}</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-zinc-500">
                      <span>Channel: <strong className="uppercase text-zinc-700 dark:text-zinc-300">{disp.channel}</strong> ({disp.phone})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        disp.status === 'Failed'
                          ? 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20'
                          : (disp.status === 'Connected' || disp.status === 'Delivered' || disp.status === 'Notified')
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
                      }`}>
                        {disp.status}
                      </span>
                    </div>

                    {disp.errorMessage && (
                      <div className="text-[10px] p-2 bg-red-500/5 border border-red-500/10 text-red-500 dark:text-red-400 rounded-lg flex items-start gap-1.5 font-mono">
                        <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 mt-0.5 shrink-0" />
                        <span>{disp.errorMessage}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Compliance Card */}
          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-3.5 shadow-sm text-left">
            <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white font-bold text-sm">
              <HugeiconsIcon icon={SecurityLockIcon} className="size-4.5 text-brand" />
              <span>DPDP 2023 Compliance & Data Protection Policy</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              No personally identifiable subscriber information was exposed to the bystander client during scan dispatch. The exotel bridge masked caller ID logs and WhatsApp SOS alert channels are processed completely sandboxed within VaahanSafe anonymizers.
            </p>
          </Card>
        </div>
      </div>

      {/* ─── DIAGNOSTICS PAYLOAD TREE VIEWER ─── */}
          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-4 shadow-sm text-left">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/60 pb-3">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white font-mono uppercase tracking-wider">Raw Event Payload</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">JSON diagnostics metadata for Sentry operator validation.</p>
          </div>
          <Button
            onClick={() => setShowRawJson(!showRawJson)}
            variant="outline"
            className="h-8 text-[11px] font-mono font-bold"
          >
            {showRawJson ? 'Hide Metadata' : 'Expose JSON'}
          </Button>
        </div>

        {showRawJson && (
          <div className="mt-3.5 p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg overflow-x-auto">
            <pre className="text-[10.5px] font-mono text-zinc-600 dark:text-zinc-400 leading-normal">
              {JSON.stringify(scan, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}
