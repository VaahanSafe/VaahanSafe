import { cn } from "@/lib/utils"

export default function EmptyState({ size = 120, className }: { size?: number, className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-muted-foreground", className)}
    >
      {/* Clipboard board */}
      <rect x="25" y="25" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
      
      {/* Clip at the top */}
      <path d="M 40 25 C 40 20, 60 20, 60 25 Z" fill="currentColor" stroke="var(--border)" strokeWidth="1" />
      
      {/* Empty list outline lines */}
      <line x1="35" y1="42" x2="65" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-45" />
      <line x1="35" y1="56" x2="55" y2="56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-40" />
      <line x1="35" y1="70" x2="60" y2="70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-30" />

      {/* Floating dash pointer */}
      <circle cx="65" cy="56" r="3.5" className="fill-brand animate-bounce" style={{ animationDuration: '2.5s' }} />
    </svg>
  )
}
