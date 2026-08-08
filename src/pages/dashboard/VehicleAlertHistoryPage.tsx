import { useOutletContext } from 'react-router-dom';
import { type Vehicle } from '@/services/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  AlertCircleIcon,
  SmartPhone01Icon,
  Message01Icon,
  Call02Icon,
  Calendar03Icon
} from '@hugeicons/core-free-icons';

interface VehicleOutletContext {
  vehicle: Vehicle;
}

interface AlertHistoryItem {
  id: string;
  time: string;
  channel: 'WhatsApp Alert' | 'SMS Backup' | 'Exotel Phone Mask';
  destination: string;
  status: 'Delivered' | 'Muted' | 'Failed' | 'Connected';
  details: string;
}

import { useVehicleAlertHistory } from '@/features/vehicles/vehicles.hooks';

export default function VehicleAlertHistoryPage() {
  const { vehicle } = useOutletContext<VehicleOutletContext>();
  const { data: rawAlerts, isLoading: loading } = useVehicleAlertHistory(vehicle.id);

  const alerts: AlertHistoryItem[] = (rawAlerts || []).map((a: any, idx: number) => ({
    id: a.id || `alert-${idx}`,
    time: a.created_at?.replace('T', ' ').substring(0, 19) || a.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
    channel: a.channel || (a.alert_type === 'whatsapp' ? 'WhatsApp Alert' : 'SMS Backup'),
    destination: a.destination || a.recipient || 'Emergency Recipient',
    status: a.delivery_status || a.status || 'Delivered',
    details: a.outcome_message || a.details || 'Dispatch attempt completed.'
  }));

  if (loading) {
    return (
      <div className="space-y-4 select-none animate-pulse text-left">
        <div className="h-40 bg-zinc-200 dark:bg-zinc-900/60 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-md">
        <CardHeader className="p-0 pb-4 border-b border-zinc-200 dark:border-zinc-900 mb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Notification Telemetry Logs</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Real-time outcome logs for dispatches routed via WhatsApp, SMS, and Exotel call masking.</CardDescription>
          </div>
          <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-brand" />
        </CardHeader>
        
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-lg bg-zinc-50 dark:bg-zinc-950/20">
              <HugeiconsIcon icon={SmartPhone01Icon} className="size-8 text-zinc-550 dark:text-zinc-600 mx-auto mb-2" />
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block">No Dispatches Generated</span>
              <p className="text-[10px] text-zinc-500 leading-normal max-w-xs mx-auto mt-1">
                Zero notifications have been dispatched for this vehicle sticker. Secure telemetry status is fully active.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-900">
              {alerts.map((item) => {
                const isDelivered = item.status === 'Delivered' || item.status === 'Connected';
                const isMuted = item.status === 'Muted';
                const isWa = item.channel === 'WhatsApp Alert';
                const isExotel = item.channel === 'Exotel Phone Mask';
                
                return (
                  <div key={item.id} className="relative pb-8 last:pb-1">
                    {/* Circle Node Indicator */}
                    <span className={`absolute -left-6 top-1.5 size-4 rounded-full border-4 border-zinc-50 dark:border-[#08080a] flex items-center justify-center shrink-0 ${
                      isDelivered 
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                        : isMuted 
                        ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        : 'bg-red-500'
                    }`} />
                    
                    <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                            <HugeiconsIcon 
                              icon={isWa ? Message01Icon : isExotel ? Call02Icon : SmartPhone01Icon} 
                              className={`size-4 ${isWa ? 'text-emerald-400' : isExotel ? 'text-blue-400' : 'text-zinc-500 dark:text-zinc-400'}`} 
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider block">{item.channel}</span>
                            <span className="text-[9.5px] text-zinc-500 font-mono">To: {item.destination}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-lg border ${
                            isDelivered 
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                              : isMuted
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                              : 'bg-red-500/15 text-red-400 border-red-500/25'
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                            <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                            {item.time}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">{item.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
