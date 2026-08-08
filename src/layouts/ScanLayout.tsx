import { Outlet } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import AmbientBackground from '@/components/shared/AmbientBackground';

export default function ScanLayout() {
  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans select-none overflow-x-hidden relative">
      
      {/* Reusable Multi-Layer Glowing Ambient Background */}
      <AmbientBackground />

      {/* Persistent safety notice above the fold */}
      <div className="relative z-20">
        <div className="bg-orange-950/60 backdrop-blur-xl border-b border-orange-500/35 p-3 text-orange-200 text-xs font-bold text-center flex items-center justify-center gap-2.5 shadow-[0_4px_30px_rgba(255,122,0,0.2)]">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0 text-orange-400 animate-pulse" />
          <span className="leading-snug tracking-wide">
            IMPORTANT: This dashboard is not a replacement for calling local emergency services (112 / 100).
          </span>
        </div>
      </div>

      {/* Main distraction-free viewport with glowing ambient frame */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 relative z-10 w-full max-w-md mx-auto">
        <div className="w-full relative">
          {/* Subtle ambient aura ring around central card */}
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-orange-600/20 blur-xl opacity-70 pointer-events-none" />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
