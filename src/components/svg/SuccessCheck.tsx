import { cn } from "@/lib/utils"

export default function SuccessCheck({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-green-500 overflow-visible", className)}
    >
      {/* Expanding outer success circle ring */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-ping opacity-35" />
      
      {/* Main outer circle */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4" className="animate-pulse" />

      {/* Animated Checkmark line */}
      <path
        d="M 30 52 L 45 65 L 72 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-1000 ease-out"
        strokeDasharray="100"
        strokeDashoffset="0"
      />
    </svg>
  )
}
