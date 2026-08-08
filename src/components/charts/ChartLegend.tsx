import React from 'react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/charts';

interface LegendItem {
  label: string;
  value?: number;
  color: string;
  valueSuffix?: string;
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
}

export const ChartLegend: React.FC<ChartLegendProps> = React.memo(({
  items,
  className
}) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 select-none font-sans", className)}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span 
            className="size-2 rounded-xs shrink-0" 
            style={{ backgroundColor: item.color }}
          />
          <span className="font-semibold">{item.label}</span>
          {item.value !== undefined && (
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200 font-mono">
              ({formatNumber(item.value)}{item.valueSuffix || ''})
            </span>
          )}
        </div>
      ))}
    </div>
  );
});

ChartLegend.displayName = 'ChartLegend';
