import React from 'react';
import { chartTooltipLabel, formatNumber } from '@/lib/charts';

interface TooltipItem {
  name: string;
  value: number;
  color?: string;
  fill?: string;
  stroke?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = React.memo(({
  active,
  payload,
  label,
  valuePrefix = '',
  valueSuffix = ''
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedLabel = label ? chartTooltipLabel(label) : '';

  return (
    <div className="bg-white/95 dark:bg-[#0c0c0e]/95 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xl rounded-lg p-3 space-y-1.5 text-xs text-left min-w-[140px] select-none font-sans">
      {formattedLabel && (
        <p className="font-bold text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-zinc-900/50 pb-1.5 text-[11px] uppercase tracking-wider font-mono">
          {formattedLabel}
        </p>
      )}
      <div className="space-y-1 mt-1 text-[11px] font-medium text-zinc-650 dark:text-zinc-400">
        {payload.map((item, idx) => {
          const color = item.color || item.stroke || item.fill || 'var(--color-primary)';
          return (
            <div key={idx} className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5 font-sans">
                <span 
                  className="size-1.5 rounded-full shrink-0" 
                  style={{ backgroundColor: color }}
                />
                {item.name}:
              </span>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">
                {valuePrefix}
                {formatNumber(item.value)}
                {valueSuffix}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ChartTooltip.displayName = 'ChartTooltip';
