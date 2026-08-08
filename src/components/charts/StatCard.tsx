import React, { useId, useMemo } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { AnimatedCounter } from './AnimatedCounter';
import { ChartSkeleton } from './ChartSkeleton';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, ArrowDownRight01Icon } from '@hugeicons/core-free-icons';
import { formatNumber, trendColor, formatPercentage } from '@/lib/charts';
import type { StatCardProps } from '@/types/charts';
import { cn } from '@/lib/utils';

export const StatCard: React.FC<StatCardProps> = React.memo(({
  title,
  value,
  previousValue,
  trend,
  icon,
  sparklineData,
  loading = false,
  prefix = '',
  suffix = '',
}) => {
  const gradientId = useId();

  // Format sparkline data points into objects compatible with Recharts
  const chartData = useMemo(() => {
    return sparklineData.map((val: number, idx: number) => ({ id: idx, value: val }));
  }, [sparklineData]);

  // Determine accent color and indicators based on trend direction
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const colorClass = trendColor(trend);

  const sparklineColor = isPositive 
    ? '#10b981' // emerald-500
    : isNegative 
    ? '#ef4444' // red-500
    : '#a1a1aa'; // zinc-400

  if (loading) {
    return <ChartSkeleton type="card" />;
  }

  return (
    <Card className="relative flex flex-col justify-between overflow-hidden bg-card text-card-foreground border border-zinc-200 dark:border-zinc-900 rounded-lg p-5 shadow-xs select-none group transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-800">
      {/* Background Hover glow accent */}
      <div 
        className="absolute -right-12 -top-12 size-36 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: sparklineColor }}
      />

      <div className="flex justify-between items-start w-full gap-4">
        <div className="space-y-1 text-left">
          <CardTitle className="text-xs font-bold text-zinc-550 dark:text-zinc-500 uppercase tracking-wider">
            {title}
          </CardTitle>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
            </span>
            {previousValue !== undefined && (
              <span className="text-[10px] text-zinc-400 font-semibold font-sans">
                vs {formatNumber(previousValue)}
              </span>
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-secondary/50 border border-zinc-150/40 dark:border-zinc-900 text-zinc-650 dark:text-zinc-400 shrink-0">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 mt-5">
        {/* Trend Indicator Badge */}
        <div className="flex flex-col gap-1 text-left shrink-0">
          <div className={cn("flex items-center gap-1 text-xs font-extrabold", colorClass)}>
            {trend !== 0 && (
              <HugeiconsIcon 
                icon={isPositive ? ArrowUpRight01Icon : ArrowDownRight01Icon} 
                className="size-3.5" 
                strokeWidth={3}
              />
            )}
            <span>{formatPercentage(Math.abs(trend))}</span>
          </div>
          <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">
            Last 30 Days
          </span>
        </div>

        {/* Sparkline chart Area graph */}
        {chartData.length > 0 && (
          <div className="h-10 w-24 relative select-none">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sparklineColor} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={sparklineColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={sparklineColor}
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
});

StatCard.displayName = 'StatCard';
