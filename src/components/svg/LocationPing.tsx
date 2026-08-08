import { cn } from "@/lib/utils"

export default function LocationPing({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("overflow-visible text-brand", className)}
    >
      {/* Ground shadows ripple */}
      <ellipse cx="50" cy="85" rx="20" ry="6" fill="currentColor" className="opacity-15 animate-ping" />
      <ellipse cx="50" cy="85" rx="12" ry="4" fill="currentColor" className="opacity-30 animate-pulse" />

      {/* Dropping Pin */}
      <g className="animate-bounce" style={{ animationDuration: '1.8s' }}>
        {/* Outer path of map pin */}
        <path d="M 50 85 C 30 55, 30 35, 50 20 C 70 35, 70 55, 50 85 Z" fill="currentColor" stroke="var(--border)" strokeWidth="2" />
        
        {/* Inner white target circle */}
        <circle cx="50" cy="45" r="8" fill="#FFFFFF" />
      </g>
    </svg>
  )
}
