import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  description: string;
  onClick?: () => void;
  isLoading?: boolean;
  colorType?: 'orange' | 'purple' | 'red' | 'green';
}

export default function StatCard({
  title,
  value,
  icon,
  description,
  onClick,
  isLoading = false,
  colorType = 'orange'
}: StatCardProps) {
  
  // Custom color configurations matching the screenshot
  const colorMap = {
    orange: {
      bg: 'bg-[#ff6b00]/10 border-[#ff6b00]/20 text-[#ff6b00]',
      hover: 'hover:border-[#ff6b00]/40'
    },
    purple: {
      bg: 'bg-[#8b5cf6]/10 border-[#8b5cf6]/20 text-[#8b5cf6]',
      hover: 'hover:border-[#8b5cf6]/40'
    },
    red: {
      bg: 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]',
      hover: 'hover:border-[#ef4444]/40'
    },
    green: {
      bg: 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]',
      hover: 'hover:border-[#10b981]/40'
    }
  };

  const activeColors = colorMap[colorType];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left group bg-white dark:bg-[#0c0c0e] hover:bg-zinc-100 dark:hover:bg-[#12131a] border border-zinc-200 dark:border-zinc-800/50 rounded-lg sm:rounded-lg p-3 sm:p-5 flex items-center gap-2.5 sm:gap-3.5 transition-all duration-200 cursor-pointer select-none ${activeColors.hover}`}
    >
      {/* Icon circle — matching the specific color theme */}
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-lg flex items-center justify-center shrink-0 border ${activeColors.bg}`}>
        <HugeiconsIcon icon={icon} className="size-4.5 sm:size-[22px]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {isLoading ? (
          <div className="h-6 w-12 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
        ) : (
          <h3 className="text-lg sm:text-[22px] font-extrabold text-zinc-900 dark:text-white leading-none tracking-tight">{value}</h3>
        )}
        <p className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-tight truncate">{title}</p>
        <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-600 leading-tight truncate">{description}</p>
      </div>

      {/* Arrow */}
      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 sm:size-4 text-zinc-400 dark:text-zinc-700 group-hover:text-zinc-600 dark:group-hover:text-zinc-500 transition-colors shrink-0" />
    </button>
  );
}
