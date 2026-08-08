import { cn } from "@/lib/utils"

export default function ScanningBrackets({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-brand overflow-hidden relative", className)}
    >
      {/* Corner Brackets */}
      <path d="M 15 30 L 15 15 L 30 15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M 70 15 L 85 15 L 85 30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M 15 70 L 15 85 L 30 85" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M 70 85 L 85 85 L 85 70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      {/* Sweeping scan line */}
      <line x1="15" y1="20" x2="85" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-bounce" style={{ animationDuration: '3s' }} />
      
      {/* Laser glow overlay */}
      <polygon points="15,20 85,20 85,30 15,30" className="fill-brand/10 animate-pulse" />
    </svg>
  )
}
