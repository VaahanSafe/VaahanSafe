import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon,
  RefreshIcon,
  Calendar03Icon,
  Location01Icon,
  FingerPrintIcon,
  AlertCircleIcon,
  SmartPhone01Icon,
  SecurityLockIcon,
  Mail01Icon
} from '@hugeicons/core-free-icons';
import { useAdminOwnerDetail } from '@/features/owners/owners.hooks';
import { securityLogger } from '@/lib/security/securityLogger';
import { toast } from 'sonner';

export default function AdminOwnerDetailPage() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const navigate = useNavigate();
  const { owner, isLoading, error, refetch } = useAdminOwnerDetail(ownerId || '');

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (owner) {
      securityLogger.log(
        `Viewed Owner Profile & PII dossier for ${owner.name} (${owner.id})`,
        'medical_view',
        `Accessed contact number: ${owner.phone}, address: ${owner.address.slice(0, 30)}...`
      );
    }
  }, [owner]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Owner profile compliance logs updated');
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-zinc-400 font-mono animate-pulse text-xs">
        Syncing subscriber records from VaahanSafe vault...
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <HugeiconsIcon icon={AlertCircleIcon} className="size-12 text-red-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-sans">Owner Profile Unavailable</h3>
        <p className="text-xs text-zinc-500 max-w-sm">
          {error || `The requested subscriber ID "${ownerId}" does not exist in our active database.`}
        </p>
        <Button onClick={() => navigate('/admin/owners')} variant="outline" className="text-xs h-9">
          Return to Registry
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
            onClick={() => navigate('/admin/owners')}
            variant="outline"
            className="size-9 p-0 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-white dark:bg-zinc-900 shrink-0 cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </Button>
          <div className="text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white">
                Owner Compliance File
              </h1>
              <span className="font-mono text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 px-2 py-0.5 rounded">
                {owner.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider ${
                owner.status === 'Verified'
                  ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20'
                  : owner.status === 'Pending Medical'
                  ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20'
              }`}>
                {owner.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Deep compliance dossier, DPDP consent scopes, and auditor access history.
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
          <span>Sync dossier</span>
        </Button>
      </div>

      {/* ─── SYSTEM PRIVACY BARRIER BANNER ─── */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs">
        <HugeiconsIcon icon={SecurityLockIcon} className="size-5 shrink-0 text-brand" />
        <div className="space-y-1 text-left">
          <span className="font-bold uppercase tracking-wider text-[10px]">DPDP 2023 Enforcement Zone</span>
          <p className="text-zinc-600 dark:text-zinc-300">
            This account contains Personally Identifiable Information (PII) protected under the Digital Personal Data Protection Act. Every query to this file is cryptographically logged to the compliance registry.
          </p>
        </div>
      </div>

      {/* ─── GRID LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Account Details & Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Card */}
          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-sm text-left">
            <CardTitle className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider font-display border-b border-zinc-150 dark:border-zinc-800/60 pb-2">
              Subscriber Profile
            </CardTitle>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Full Name</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{owner.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Primary Mobile</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <HugeiconsIcon icon={SmartPhone01Icon} className="size-3.5 text-zinc-400" />
                  {owner.phone}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Secure Email</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <HugeiconsIcon icon={Mail01Icon} className="size-3.5 text-zinc-400" />
                  {owner.email}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Registered Date</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-3.5 text-zinc-400" />
                  {owner.registeredDate}
                </span>
              </div>

              <div className="flex flex-col gap-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-zinc-400" />
                  Registered Address
                </span>
                <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-normal pl-4.5">
                  {owner.address}
                </p>
              </div>
            </div>
          </Card>

          {/* DPDP Consent Telemetry */}
          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-sm text-left">
            <CardTitle className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider font-display border-b border-zinc-150 dark:border-zinc-800/60 pb-2">
              DPDP 2023 Consent Audit
            </CardTitle>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Consent State</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono uppercase tracking-wider">
                  {owner.dpdpConsent}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Logged Timestamp</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{owner.dpdpConsentTimestamp}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Signing IP Address</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <HugeiconsIcon icon={FingerPrintIcon} className="size-3 text-zinc-400" />
                  {owner.dpdpConsentIp}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/40">
                <span className="text-zinc-500 dark:text-zinc-400">Authorized Notification Scope</span>
                <div className="flex flex-wrap gap-1.5 pl-0.5 mt-1">
                  {owner.dpdpConsentScope.map((scope, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column: Fleet and Compliance Logs */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Linked Fleet */}
          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-sm text-left">
            <CardTitle className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider font-display border-b border-zinc-150 dark:border-zinc-800/60 pb-2">
              Sticker Fleet Registry
            </CardTitle>

            {owner.vehicles.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-400 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                No vehicles registered to this profile yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 rounded-lg">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 font-mono text-[9px] uppercase font-bold border-b border-zinc-200 dark:border-zinc-800/80">
                    <tr>
                      <th className="p-2.5">QR Sticker ID</th>
                      <th className="p-2.5">Plate Number</th>
                      <th className="p-2.5">Vehicle Type</th>
                      <th className="p-2.5">Linked Date</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 font-mono">
                    {owner.vehicles.map((veh, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="p-2.5 font-bold text-brand">{veh.qrCode}</td>
                        <td className="p-2.5 text-zinc-800 dark:text-zinc-200">{veh.plate}</td>
                        <td className="p-2.5 text-zinc-500 font-sans">{veh.type}</td>
                        <td className="p-2.5 text-zinc-400">{veh.activationDate}</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            veh.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                          }`}>
                            {veh.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Operator Audit Trail */}
          <Card className="border glass-panel border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/90 p-5 space-y-4 shadow-sm text-left">
            <div className="border-b border-zinc-150 dark:border-zinc-800/60 pb-2">
              <CardTitle className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider font-display">
                Operator Access Audit Trail
              </CardTitle>
              <span className="text-[10px] text-zinc-400 font-mono">Real-time DPDP query history logs</span>
            </div>

            <div className="space-y-3.5">
              {owner.auditLogs.map((log) => (
                <div key={log.id} className="relative flex gap-3 text-xs">
                  
                  {/* Icon Indicator */}
                  <div className="size-6 rounded-full flex items-center justify-center shrink-0 border bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400">
                    <HugeiconsIcon icon={FingerPrintIcon} className="size-3 text-brand" />
                  </div>

                  {/* Audit Row details */}
                  <div className="flex-1 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/50 rounded-lg p-3 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-[11px] text-zinc-800 dark:text-zinc-200">
                          {log.operatorEmail}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-brand/5 border border-brand/10 text-brand uppercase shrink-0">
                          {log.id}
                        </span>
                      </div>
                      <span className="font-mono text-[9.5px] text-zinc-400">{log.accessedAt}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px] text-zinc-500">
                      <span>Reason: <strong className="font-medium text-zinc-700 dark:text-zinc-300 font-sans">{log.reason}</strong></span>
                      <span className="font-mono text-[9px] bg-zinc-100 dark:bg-zinc-900 px-1 rounded flex items-center gap-0.5 shrink-0" title="Audited client IP">
                        IP: {log.ipAddress}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
