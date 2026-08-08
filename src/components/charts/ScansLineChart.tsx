import React, { useId, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';
import { formatXAxis, formatYAxis } from '@/lib/charts';
import type { ScansLineChartProps } from '@/types/charts';

export const ScansLineChart: React.FC<ScansLineChartProps> = React.memo(({
  data,
  loading = false,
  error = false,
  onRetry
}) => {
  const gradientId = useId();

  // Compute overall total for the legend display
  const totalScans = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.scans, 0);
  }, [data]);

  const legendItems = useMemo(() => [
    { label: 'Total QR Scans', value: totalScans, color: '#f97316' } // orange-500
  ], [totalScans]);

  if (loading) {
    return <ChartSkeleton type="chart" />;
  }

  if (error) {
    return <ChartEmptyState isError={true} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return <ChartEmptyState isError={false} onRetry={onRetry} />;
  }

  return (
    <Card className="relative flex flex-col justify-between overflow-hidden bg-card text-card-foreground border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-xs select-none h-[360px]">
      <CardHeader className="p-0 pb-4 border-b border-zinc-150/40 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left space-y-0.5">
          <CardTitle className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Scanner Checkins & Activity
          </CardTitle>
          <CardDescription className="text-xs text-zinc-550 dark:text-zinc-500">
            Windshield QR code scans and emergency alerts routed over time.
          </CardDescription>
        </div>
        <ChartLegend items={legendItems} className="shrink-0" />
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0 pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/> {/* amber-500 */}
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor" 
              className="text-zinc-200/50 dark:text-zinc-900/60" 
              vertical={false} 
            />
            <XAxis
              dataKey="date"
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-650 text-[9px] font-semibold font-mono"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatXAxis}
              dy={8}
            />
            <YAxis
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-650 text-[9px] font-semibold font-mono"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              allowDecimals={false}
            />
            <Tooltip 
              content={<ChartTooltip />} 
              cursor={{ 
                stroke: 'currentColor', 
                strokeWidth: 1, 
                strokeDasharray: '4 4', 
                className: 'text-zinc-200 dark:text-zinc-900/50' 
              }} 
            />
            <Area
              type="monotone"
              dataKey="scans"
              name="Total Scans"
              stroke="#f97316" // orange-500
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

ScansLineChart.displayName = 'ScansLineChart';
