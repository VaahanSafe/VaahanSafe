import { cn } from "@/lib/utils"

export default function NotFound404({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-brand-dark overflow-visible", className)}
    >
      {/* Post pole */}
      <rect x="47" y="50" width="6" height="45" fill="currentColor" />
      
      {/* Bent road sign board (hazard styling) */}
      <g className="animate-pulse" style={{ transformOrigin: '50px 35px' }}>
        {/* Yellow caution background with black stencils */}
        <polygon points="20,15 80,15 75,45 15,45" fill="var(--accent)" stroke="currentColor" strokeWidth="2.5" />
        
        {/* Safety sign diagonal stripes */}
        <line x1="25" y1="15" x2="35" y2="45" stroke="currentColor" strokeWidth="3" />
        <line x1="45" y1="15" x2="55" y2="45" stroke="currentColor" strokeWidth="3" />
        <line x1="65" y1="15" x2="75" y2="45" stroke="currentColor" strokeWidth="3" />
        
        {/* Bent corner crease */}
        <path d="M 15 45 L 25 35 L 25 45 Z" fill="currentColor" opacity="0.3" />
      </g>

      {/* Warning light on top */}
      <circle cx="50" cy="10" r="6" className="fill-emergency animate-ping" />
      <circle cx="50" cy="10" r="4" className="fill-emergency" />
    </svg>
  )
}
