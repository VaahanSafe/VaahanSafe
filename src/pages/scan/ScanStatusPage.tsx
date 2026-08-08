import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  CheckmarkCircle02Icon, 
  Call02Icon, 
  ArrowLeft01Icon,
  SmartPhone01Icon,
  Location01Icon,
  Camera01Icon,
  Shield01Icon
} from '@hugeicons/core-free-icons';

export default function ScanStatusPage() {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-center font-sans text-left">
      <Card className="bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-6 sm:p-8 w-full text-center space-y-6 rounded-lg relative overflow-hidden z-10">
        
        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

        {/* Top Success Badge */}
        <div className="flex justify-center">
          <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-8 text-emerald-400" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400 block">
            TELEMETRY DISPATCH CONFIRMED
          </span>
          <CardTitle className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-serif uppercase tracking-wider">
            Report Delivered
          </CardTitle>
          <CardDescription className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Your incident report, location link, and photo evidence have been successfully transmitted to the vehicle owner and registered emergency contacts.
          </CardDescription>
        </div>

        {/* Dispatch Outcome Logs Card */}
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2">
            <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 tracking-wider">
              DISPATCH REF: {(qrCodeId || 'VEHICLE-1').toUpperCase()}
            </span>
            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 font-mono">
              CONFIRMED ✓
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <HugeiconsIcon icon={SmartPhone01Icon} className="size-3.5 text-zinc-500" />
                WhatsApp Alerts:
              </span>
              <span className="text-emerald-500 dark:text-emerald-400 font-bold text-[11px]">Dispatched</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-zinc-500" />
                GPS Coordinates:
              </span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium text-[11px]">Google Maps Link</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <HugeiconsIcon icon={Camera01Icon} className="size-3.5 text-zinc-500" />
                Evidence Photo:
              </span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium text-[11px]">JPEG Attached</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <HugeiconsIcon icon={Shield01Icon} className="size-3.5 text-zinc-500" />
                Phone Anonymity:
              </span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium text-[11px]">Exotel Bridge Armed</span>
            </div>
          </div>
        </div>

        {/* Manual 112 Rescue Hotline */}
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-left space-y-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-900 dark:text-white block uppercase tracking-wider font-serif">
              Need Direct Emergency Assistance?
            </span>
            <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-normal">
              Safety alerts are sent directly to the owner's emergency contacts. If professional medical or rescue support is required, call public services:
            </p>
          </div>

          <a 
            href="tel:112"
            className="w-full h-11 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <HugeiconsIcon icon={Call02Icon} className="size-4" />
            <span>DIAL 112 NATIONAL EMERGENCY</span>
          </a>
        </div>

        {/* Action CTAs */}
        <div className="pt-2">
          <Button
            onClick={() => navigate(`/s/${qrCodeId || 'vehicle-1'}`)}
            variant="outline"
            className="w-full h-10 border border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-950 text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            <span>RETURN TO VEHICLE SUMMARY</span>
          </Button>
        </div>

      </Card>
    </div>
  );
}
