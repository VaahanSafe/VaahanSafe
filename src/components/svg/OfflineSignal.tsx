import { cn } from "@/lib/utils"

export default function OfflineSignal({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-muted-foreground", className)}
    >
      {/* Signal Tower / Antenna Grid */}
      <rect x="20" y="70" width="8" height="15" rx="1.5" fill="currentColor" />
      <rect x="34" y="55" width="8" height="30" rx="1.5" fill="currentColor" />
      <rect x="48" y="40" width="8" height="45" rx="1.5" fill="currentColor" />
      <rect x="62" y="25" width="8" height="60" rx="1.5" fill="currentColor" className="opacity-60" />
      
      {/* Flashing / broken bar (the last signal bar) */}
      <rect x="76" y="10" width="8" height="75" rx="1.5" fill="currentColor" className="text-red-500 animate-pulse" />
      
      {/* Diagonal Warning Cross (no signal) */}
      <line x1="68" y1="20" x2="92" y2="44" stroke="var(--emergency)" strokeWidth="4.5" strokeLinecap="round" className="animate-pulse" />
      <line x1="92" y1="20" x2="68" y2="44" stroke="var(--emergency)" strokeWidth="4.5" strokeLinecap="round" className="animate-pulse" />

      {/* Telephone handset outline below */}
      <path d="M 25 88 L 75 88" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="88" r="4" fill="currentColor" />
    </svg>
  )
}
