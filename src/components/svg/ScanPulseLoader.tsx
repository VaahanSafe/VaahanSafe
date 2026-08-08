import { cn } from "@/lib/utils"

export default function ScanPulseLoader({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-brand", className)}
    >
      {/* Corner Brackets */}
      <path d="M 15 30 L 15 15 L 30 15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M 70 15 L 85 15 L 85 30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M 15 70 L 15 85 L 30 85" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M 70 85 L 85 85 L 85 70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      {/* Concentric Radar Ripples */}
      <circle cx="50" cy="50" r="10" className="animate-ping fill-brand/10 stroke-brand" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="20" className="animate-pulse fill-brand/5 stroke-brand/60" strokeWidth="1.5" style={{ animationDelay: '0.2s' }} />
      <circle cx="50" cy="50" r="30" className="animate-pulse fill-transparent stroke-brand/30" strokeWidth="1" style={{ animationDelay: '0.4s' }} />
      
      {/* Center dot */}
      <circle cx="50" cy="50" r="4" className="fill-brand" />
    </svg>
  )
}
