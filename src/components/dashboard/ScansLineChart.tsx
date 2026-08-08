import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface ChartDataPoint {
  date: string;
  scans: number;
  emergency: number;
  parking: number;
}

interface ScansLineChartProps {
  data7Days: ChartDataPoint[];
  data30Days: ChartDataPoint[];
  isLoading?: boolean;
}

export default function ScansLineChart({
  data7Days,
  data30Days,
  isLoading = false
}: ScansLineChartProps) {
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const activeData = range === '7d' ? data7Days : data30Days;

  // Custom tooltips with glassmorphic elements matching layout themes
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-[#0c0c0e]/95 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xl rounded-lg p-3.5 space-y-1.5 text-xs text-left min-w-[140px] select-none font-mono">
          <p className="font-bold text-zinc-900 dark:text-white font-sans text-xs border-b border-zinc-100 dark:border-zinc-900/50 pb-1.5">{label}</p>
          <div className="space-y-1 mt-1 text-[11px]">
            <div className="flex justify-between items-center gap-4">
              <span className="text-zinc-500 flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                Wrong Parking:
              </span>
              <span className="font-extrabold text-brand">{payload[0]?.value || 0}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-zinc-500 flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Emergency:
              </span>
              <span className="font-extrabold text-rose-500">{payload[1]?.value || 0}</span>
            </div>
            <div className="flex justify-between items-center gap-4 pt-1 border-t border-dashed border-zinc-100 dark:border-zinc-900/30">
              <span className="text-zinc-900 dark:text-zinc-300 font-sans">Total Scans:</span>
              <span className="font-black text-zinc-900 dark:text-white">
                {(payload[0]?.value || 0) + (payload[1]?.value || 0)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-900/60 backdrop-blur-md p-6 flex flex-col justify-between h-[360px] relative overflow-hidden shadow-sm">
      <CardHeader className="p-0 flex flex-row items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="font-extrabold text-base text-zinc-900 dark:text-white">Scanner Activity Logs</CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Wrong parking checkins &amp; SOS notifications
          </CardDescription>
        </div>
        
        <div className="flex bg-zinc-100/80 dark:bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 scale-90 origin-right shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRange('7d')}
            className={`h-7 px-3 text-[10px] font-bold rounded-lg font-mono ${
              range === '7d'
                ? 'bg-white dark:bg-[#0c0c0f] text-brand shadow-sm font-black border border-zinc-200/50 dark:border-zinc-800/50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            7 Days
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRange('30d')}
            className={`h-7 px-3 text-[10px] font-bold rounded-lg font-mono ${
              range === '30d'
                ? 'bg-white dark:bg-[#0c0c0f] text-brand shadow-sm font-black border border-zinc-200/50 dark:border-zinc-800/50'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            30 Days
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/20 rounded-lg animate-pulse border border-zinc-100 dark:border-zinc-900">
            <span className="text-xs font-mono text-zinc-400">Loading chart analytics...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorParking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-brand, #ff6b00)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--color-brand, #ff6b00)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200/50 dark:text-zinc-800/40" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="currentColor"
                className="text-zinc-400 dark:text-zinc-600 text-[9px] font-mono"
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="currentColor"
                className="text-zinc-400 dark:text-zinc-600 text-[9px] font-mono"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '4 4', className: 'text-zinc-200 dark:text-zinc-800' }} />
              
              <Area
                type="monotone"
                dataKey="parking"
                name="Wrong Parking"
                stroke="var(--color-brand, #ff6b00)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorParking)"
                activeDot={{ r: 4, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="emergency"
                name="Emergency SOS"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEmergency)"
                activeDot={{ r: 4, strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
