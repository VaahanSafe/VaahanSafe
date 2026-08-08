import type { HeatmapDay } from '@/types/charts';

/**
 * Formats values into user-friendly standard numbers or compact labels (e.g. 1.2k)
 */
export function formatNumber(value: number, type: 'compact' | 'standard' = 'standard'): string {
  if (type === 'compact') {
    return new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-IN').format(value);
}

/**
 * Formats trend numbers into sign-aware percentages (e.g., +18%)
 */
export function formatPercentage(value: number): string {
  const sign = value > 0 ? '↑ ' : value < 0 ? '↓ ' : '';
  const prefix = value > 0 ? '+' : '';
  return `${sign}${prefix}${value}%`;
}

/**
 * Resolves check-in growth directions
 */
export function trendDirection(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

/**
 * Returns growth-direction status colors matching the design system
 */
export function trendColor(value: number): string {
  if (value > 0) return 'text-emerald-500';
  if (value < 0) return 'text-red-500';
  return 'text-zinc-400 dark:text-zinc-550';
}

/**
 * Returns min/max bounds for sparkline charts to optimize line ranges
 */
export function sparklineDomain(data: number[]): [number, number] {
  if (!data || data.length === 0) return [0, 0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = (max - min) * 0.1 || 1;
  return [Math.max(0, min - padding), max + padding];
}

/**
 * Returns matching zinc-to-emerald status colors for contribution squares
 */
export function heatmapColorClass(count: number): string {
  if (count <= 0) {
    return 'bg-zinc-150 dark:bg-zinc-900/60 text-zinc-350 dark:text-zinc-800 hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-700';
  }
  if (count <= 3) {
    return 'bg-orange-500/20 dark:bg-orange-500/10 text-orange-500/30 hover:ring-1 hover:ring-orange-400/40';
  }
  if (count <= 8) {
    return 'bg-orange-500/60 dark:bg-orange-500/30 text-orange-500/60 hover:ring-1 hover:ring-orange-400';
  }
  if (count <= 15) {
    return 'bg-amber-500 dark:bg-amber-500/70 text-amber-500 hover:ring-1 hover:ring-amber-400';
  }
  return 'bg-emerald-500 dark:bg-emerald-400 text-emerald-600 dark:text-emerald-400 hover:ring-1 hover:ring-emerald-300';
}

/**
 * Returns the raw background color style value for a heatmap square
 */
export function heatmapColorStyle(count: number, isDark: boolean): string {
  if (count <= 0) return isDark ? '#18181b' : '#f4f4f5'; // zinc-900 vs zinc-100
  if (count <= 3) return isDark ? '#431407' : '#ffedd5'; // deep orange-950 vs orange-100
  if (count <= 8) return isDark ? '#7c2d12' : '#fed7aa'; // orange-900 vs orange-200
  if (count <= 15) return isDark ? '#b45309' : '#fde68a'; // amber-700 vs amber-200
  return isDark ? '#047857' : '#a7f3d0'; // emerald-700 vs emerald-200
}

/**
 * Fills missing calendar data for the past 12 months (365 days) aligned to starting weekdays
 */
export function generateHeatmap(data: HeatmapDay[]): HeatmapDay[] {
  const map = new Map<string, number>();
  data.forEach((d) => map.set(d.date, d.count));

  const result: HeatmapDay[] = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 364);

  // Normalize start to the beginning of its week (Sunday)
  const startDay = start.getDay();
  start.setDate(start.getDate() - startDay);

  // Normalize end to the end of its week (Saturday)
  const endDay = end.getDay();
  end.setDate(end.getDate() + (6 - endDay));

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: map.get(dateStr) || 0,
    });
    current.setDate(current.getDate() + 1);
  }
  return result;
}

/**
 * Formats X-Axis tickers nicely
 */
export function formatXAxis(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Formats Y-Axis compact ticks
 */
export function formatYAxis(value: number): string {
  return formatNumber(value, 'compact');
}

/**
 * Formats labels inside tooltips
 */
export function chartTooltipLabel(label: string): string {
  try {
    const date = new Date(label);
    return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return label;
  }
}
