import { cn } from "@/lib/utils"

export default function ErrorState({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-emergency overflow-visible", className)}
    >
      {/* Pulsing signal background ring */}
      <polygon points="50,5 95,85 5,85" fill="none" stroke="currentColor" strokeWidth="1" className="animate-ping opacity-25" />
      
      {/* Outer Triangle Sign */}
      <polygon points="50,10 90,80 10,80" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      
      {/* Blinking Exclamation point */}
      <g className="animate-pulse" style={{ animationDuration: '1s' }}>
        <rect x="47" y="32" width="6" height="25" rx="1.5" fill="currentColor" />
        <circle cx="50" cy="68" r="4.5" fill="currentColor" />
      </g>
    </svg>
  )
}
