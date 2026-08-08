import { cn } from "@/lib/utils"

export default function CameraCapture({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-muted-foreground", className)}
    >
      {/* Outer camera ring */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 3" />

      {/* Shutter Blades group with custom rotate animation */}
      <g className="animate-pulse" style={{ transformOrigin: '50px 50px', animationDuration: '3s' }}>
        {/* Blade 1 */}
        <path d="M 50 15 L 75 30 L 60 50 L 50 15 Z" fill="currentColor" className="opacity-75" />
        {/* Blade 2 */}
        <path d="M 85 50 L 70 75 L 50 60 L 85 50 Z" fill="currentColor" className="opacity-80" />
        {/* Blade 3 */}
        <path d="M 50 85 L 25 70 L 40 50 L 50 85 Z" fill="currentColor" className="opacity-75" />
        {/* Blade 4 */}
        <path d="M 15 50 L 30 25 L 50 40 L 15 50 Z" fill="currentColor" className="opacity-90" />
      </g>
      
      {/* Shutter center glass lens */}
      <circle cx="50" cy="50" r="12" fill="none" stroke="#FFFFFF" strokeWidth="2" className="opacity-85 animate-pulse" />
    </svg>
  )
}
