import { ArrowUpRight01Icon, ArrowDownRight01Icon } from '@hugeicons/core-free-icons';
import type { FilterState, AuditLog } from '@/types/admin';

/**
 * Builds URL search query string from filter state values
 */
export function buildSearchParams(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) {
    params.set('q', filters.search.trim());
  }
  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status);
  }
  if (filters.dateRange?.from) {
    params.set('from', filters.dateRange.from.toISOString().split('T')[0]);
  }
  if (filters.dateRange?.to) {
    params.set('to', filters.dateRange.to.toISOString().split('T')[0]);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * Extracts filter state from URL search params
 */
export function parseSearchParams(searchParams: URLSearchParams): FilterState {
  const search = searchParams.get('q') || '';
  const status = searchParams.get('status') || 'all';
  
  const fromStr = searchParams.get('from');
  const toStr = searchParams.get('to');
  
  const from = fromStr ? new Date(fromStr) : undefined;
  const to = toStr ? new Date(toStr) : undefined;
  
  // Safe validation check for Date parsing
  const fromValid = from && !isNaN(from.getTime()) ? from : undefined;
  const toValid = to && !isNaN(to.getTime()) ? to : undefined;

  return {
    search,
    status,
    dateRange: fromValid || toValid ? { from: fromValid, to: toValid } : undefined
  };
}

/**
 * Formats audit action logs timestamps
 */
export function formatAuditDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return dateStr;
  }
}

/**
 * Maps audit outcome status to system color classes
 */
export function auditActionColor(status: AuditLog['status']): string {
  if (status === 'success') return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/15';
  if (status === 'warning') return 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/15';
  return 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/15';
}

/**
 * Resolves metric value trend colors
 */
export function metricTrendColor(trend: number): string {
  if (trend > 0) return 'text-emerald-500';
  if (trend < 0) return 'text-red-500';
  return 'text-zinc-550';
}

/**
 * Resolves metric trend arrow free icons
 */
export function metricTrendIcon(trend: number) {
  return trend >= 0 ? ArrowUpRight01Icon : ArrowDownRight01Icon;
}

/**
 * Safe local storage column visibility preference cache
 */
export const columnVisibilityStorage = {
  get: (tableKey: string): Record<string, boolean> | null => {
    try {
      const data = localStorage.getItem(`vs_col_vis_${tableKey}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  set: (tableKey: string, state: Record<string, boolean>): void => {
    try {
      localStorage.setItem(`vs_col_vis_${tableKey}`, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to cache column preference layout', e);
    }
  }
};

/**
 * Formats value for CSV escaping quotes and nesting
 */
function cleanCSVCell(val: any): string {
  if (val === null || val === undefined) return '';
  let strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
  // Escape double quotes by doubling them
  strVal = strVal.replace(/"/g, '""');
  // Wrap cell in quotes if it contains separator, newline, or quotes
  if (strVal.includes(',') || strVal.includes('\n') || strVal.includes('"')) {
    return `"${strVal}"`;
  }
  return strVal;
}

/**
 * Prepares CSV structures and triggers direct browser download
 */
export function exportCSV(data: any[], filename = 'admin-export'): void {
  if (!data || data.length === 0) return;

  // Flatten / retrieve headers from data items keys
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Append headers row
  csvRows.push(headers.join(','));

  // Append values
  for (const row of data) {
    const values = headers.map(h => cleanCSVCell(row[h]));
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
