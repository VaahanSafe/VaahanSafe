import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  AlertCircleIcon, 
  Call02Icon, 
  ArrowLeft01Icon,
  QrCodeIcon,
  Mail01Icon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';

export default function ScanNotFoundPage() {
  const navigate = useNavigate();
  const [reported, setReported] = useState(false);

  const handleReportSticker = () => {
    setReported(true);
  };

  return (
    <div className="w-full flex items-center justify-center font-sans text-left">
      <Card className="bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-6 sm:p-8 max-w-md w-full text-center space-y-6 rounded-lg relative overflow-hidden z-10">
        
        {/* Subtle ambient card glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -z-10" />

        {/* Top Warning Icon */}
        <div className="flex justify-center">
          <div className="size-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-8 animate-pulse text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 block">
            VAAHANSAFE QR REGISTRY
          </span>
          <CardTitle className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-serif uppercase tracking-wider">
            Sticker Profile Not Found
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            This QR code is either unassigned, deactivated, or invalid. No vehicle details are attached to this code.
          </CardDescription>
        </div>

        {/* Emergency Advisory Panel */}
        <div className="p-5 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950/90 dark:to-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3.5 text-left backdrop-blur-md">
          <span className="text-[9px] font-mono font-black text-red-500 dark:text-red-400 uppercase tracking-widest block">
            EMERGENCY ADVISORY
          </span>
          <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-normal">
            If this vehicle is involved in a road accident or medical emergency, please contact national first responders directly:
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <a
              href="tel:112"
              className="h-10 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={Call02Icon} className="size-4" />
              <span>Call 112</span>
            </a>
            <a
              href="tel:103"
              className="h-10 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={Call02Icon} className="size-4" />
              <span>Traffic 103</span>
            </a>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Button
            onClick={() => navigate('/register')}
            className="w-full h-11 bg-brand hover:opacity-90 text-white text-xs font-black uppercase rounded-lg tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-brand/20 transition-all"
          >
            <HugeiconsIcon icon={QrCodeIcon} className="size-4" />
            <span>ACTIVATE THIS STICKER</span>
          </Button>

          {!reported ? (
            <Button
              onClick={handleReportSticker}
              variant="outline"
              className="w-full h-10 border border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-950 text-xs font-bold uppercase rounded-lg tracking-wider cursor-pointer flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={Mail01Icon} className="size-4 text-amber-500 dark:text-amber-400" />
              <span>REPORT STICKER TO SUPPORT</span>
            </Button>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
              <span>STICKER LOGGED FOR INSPECTION</span>
            </div>
          )}

          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full h-9 text-zinc-550 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            <span>RETURN TO HOMEPAGE</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
