import { cn } from "@/lib/utils"

export default function EmergencySiren({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("overflow-visible", className)}
    >
      {/* Expanding signal waves (alternating red / amber) */}
      <circle cx="60" cy="60" r="45" fill="none" stroke="var(--emergency)" strokeWidth="1" className="animate-ping opacity-60" style={{ animationDuration: '2s' }} />
      <circle cx="60" cy="60" r="55" fill="none" stroke="var(--accent)" strokeWidth="1" className="animate-ping opacity-45" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
      
      {/* Siren Base */}
      <path d="M 30 90 L 90 90 L 85 80 L 35 80 Z" fill="#0B2027" stroke="var(--border)" strokeWidth="2" strokeLinejoin="round" />

      {/* Light Dome */}
      <path d="M 35 80 C 35 45, 85 45, 85 80 Z" className="fill-emergency/85 stroke-emergency animate-pulse" strokeWidth="2" />
      
      {/* Internal Rotating Flasher light beam */}
      <ellipse cx="60" cy="65" rx="10" ry="12" className="fill-accent/60 blur-[3px] animate-spin" style={{ transformOrigin: '60px 65px', animationDuration: '1.2s' }} />
    </svg>
  )
}
