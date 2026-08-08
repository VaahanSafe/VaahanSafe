import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartEmptyState } from './ChartEmptyState';
import { generateHeatmap, heatmapColorClass, chartTooltipLabel } from '@/lib/charts';
import type { HeatmapCalendarProps, HeatmapDay } from '@/types/charts';
import { cn } from '@/lib/utils';

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = React.memo(({
  data,
  loading = false,
  error = false,
  onRetry
}) => {
  // Pad and normalize data into weeks
  const calendarGrid = useMemo(() => {
    if (!data || data.length === 0) return [];
    const padded = generateHeatmap(data);
    const weeks: HeatmapDay[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
    return weeks;
  }, [data]);

  // Compute month positions across the weeks
  const monthLabels = useMemo(() => {
    if (calendarGrid.length === 0) return [];
    const labels: { text: string; colIndex: number }[] = [];
    let lastMonth = -1;
    calendarGrid.forEach((week, colIdx) => {
      const dayForMonth = week[3] || week[0];
      if (!dayForMonth) return;
      const midDay = new Date(dayForMonth.date);
      const month = midDay.getMonth();
      if (month !== lastMonth) {
        labels.push({
          text: midDay.toLocaleDateString('en-IN', { month: 'short' }),
          colIndex: colIdx
        });
        lastMonth = month;
      }
    });
    return labels;
  }, [calendarGrid]);

  const totalScans = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  if (loading) {
    return <ChartSkeleton type="heatmap" />;
  }

  if (error) {
    return <ChartEmptyState isError={true} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return <ChartEmptyState isError={false} onRetry={onRetry} />;
  }

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <TooltipProvider>
      <Card className="relative flex flex-col justify-between overflow-hidden bg-card text-card-foreground border border-zinc-200 dark:border-zinc-900 rounded-lg p-6 shadow-xs select-none">
        <CardHeader className="p-0 pb-5 border-b border-zinc-150/40 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left space-y-0.5">
            <CardTitle className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Sticker Scan Contributions
            </CardTitle>
            <CardDescription className="text-xs text-zinc-555 dark:text-zinc-500">
              Daily wrong parking &amp; emergency checkins over the past 12 months.
            </CardDescription>
          </div>
          <div className="shrink-0 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
            Total Scans: <span className="font-extrabold text-primary">{totalScans.toLocaleString('en-IN')}</span>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-6 flex flex-col gap-4 overflow-hidden">
          {/* Fixed Non-Scrollable Heatmap Wrap */}
          <div className="w-full overflow-hidden pb-1">
            <div className="flex gap-2 sm:gap-3 w-full justify-between pl-0.5 pt-1 select-none">
              {/* Weekday Row Labels */}
              <div className="flex flex-col justify-between text-[9px] text-zinc-400 font-extrabold pr-1 shrink-0 h-[96px] pt-6">
                <span>{weekdayLabels[1]}</span>
                <span>{weekdayLabels[3]}</span>
                <span>{weekdayLabels[5]}</span>
              </div>

              {/* Grid Column rendering (Weeks) */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Months Row Header */}
                <div className="relative h-5 text-[9px] text-zinc-450 dark:text-zinc-550 font-bold uppercase tracking-wider select-none mb-1">
                  {monthLabels.map((lbl, idx) => (
                    <span 
                      key={idx} 
                      className="absolute truncate max-w-[30px]"
                      style={{ left: `${(lbl.colIndex / (calendarGrid.length || 1)) * 100}%` }}
                    >
                      {lbl.text}
                    </span>
                  ))}
                </div>

                {/* Contribution cells */}
                <div className="flex justify-between items-center gap-0.5 sm:gap-1 w-full">
                  {calendarGrid.map((week, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-0.5 sm:gap-1 flex-1 min-w-0">
                      {week.map((day) => (
                        <Tooltip key={day.date}>
                          <TooltipTrigger asChild>
                            <div
                              role="gridcell"
                              aria-label={`${day.count} scans on ${day.date}`}
                              tabIndex={0}
                              className={cn(
                                "w-full aspect-square max-w-[10px] rounded-xs transition-all duration-150 cursor-pointer outline-hidden focus:ring-2 focus:ring-primary focus:scale-110",
                                heatmapColorClass(day.count)
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="text-[10px] p-2 bg-zinc-950 text-white border border-zinc-800 rounded-lg shadow-lg">
                            <span className="font-bold block">{chartTooltipLabel(day.date)}</span>
                            <span className="text-zinc-400 block mt-0.5">{day.count} wrong parking &amp; SOS checkins</span>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Legend scale */}
          <div className="flex items-center justify-end w-full gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold pr-1 select-none">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 2, 6, 12, 20].map((count, idx) => (
                <div 
                  key={idx} 
                  className={cn("size-2.5 rounded-xs", heatmapColorClass(count))}
                  title={`Level ${idx}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});

HeatmapCalendar.displayName = 'HeatmapCalendar';
