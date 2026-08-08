import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';
import { formatYAxis } from '@/lib/charts';
import type { DeliveryRateBarChartProps } from '@/types/charts';

export const DeliveryRateBarChart: React.FC<DeliveryRateBarChartProps> = React.memo(({
  data,
  loading = false,
  error = false,
  onRetry
}) => {
  // Calculate aggregate delivery metrics for the legend indicators
  const totals = useMemo(() => {
    return data.reduce((acc, curr) => ({
      success: acc.success + curr.success,
      failure: acc.failure + curr.failure,
      pending: acc.pending + curr.pending
    }), { success: 0, failure: 0, pending: 0 });
  }, [data]);

  const legendItems = useMemo(() => [
    { label: 'Delivered', value: totals.success, color: '#10b981' }, // emerald-500
    { label: 'Failed', value: totals.failure, color: '#ef4444' }, // red-500
    { label: 'Pending', value: totals.pending, color: '#f59e0b' } // amber-500
  ], [totals]);

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
            Dispatch Delivery Rates
          </CardTitle>
          <CardDescription className="text-xs text-zinc-550 dark:text-zinc-500">
            Success routing rates grouped by communication channel.
          </CardDescription>
        </div>
        <ChartLegend items={legendItems} className="shrink-0" />
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0 pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }} barGap={3}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor" 
              className="text-zinc-200/50 dark:text-zinc-900/60" 
              vertical={false} 
            />
            <XAxis
              dataKey="channel"
              stroke="currentColor"
              className="text-zinc-500 dark:text-zinc-550 text-[10px] font-bold"
              tickLine={false}
              axisLine={false}
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
                fill: 'currentColor', 
                className: 'text-zinc-100/50 dark:text-zinc-950/20' 
              }} 
            />
            <Bar 
              dataKey="success" 
              name="Delivered" 
              fill="#10b981" 
              radius={[3, 3, 0, 0]} 
              maxBarSize={32}
            />
            <Bar 
              dataKey="failure" 
              name="Failed" 
              fill="#ef4444" 
              radius={[3, 3, 0, 0]} 
              maxBarSize={32}
            />
            <Bar 
              dataKey="pending" 
              name="Pending" 
              fill="#f59e0b" 
              radius={[3, 3, 0, 0]} 
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

DeliveryRateBarChart.displayName = 'DeliveryRateBarChart';
