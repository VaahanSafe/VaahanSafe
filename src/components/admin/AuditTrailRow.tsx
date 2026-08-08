import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowRight01Icon, 
  ArrowDown01Icon, 
  ArrowUp01Icon, 
  ComputerIcon, 
  GlobalIcon, 
  Time02Icon 
} from '@hugeicons/core-free-icons';
import { formatAuditDate, auditActionColor } from '@/lib/admin';
import type { AuditTrailRowProps } from '@/types/admin';
import { cn } from '@/lib/utils';

export const AuditTrailRow: React.FC<AuditTrailRowProps> = React.memo(({
  entry,
  expandable = true
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const hasDiff = entry.oldValue !== undefined || entry.newValue !== undefined;
  const canExpand = expandable && hasDiff;

  const toggleExpand = () => {
    if (canExpand) {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-900/60 bg-card hover:bg-secondary/20 transition-colors select-none font-sans text-xs">
      {/* Row Header Grid */}
      <div 
        onClick={toggleExpand}
        className={cn(
          "grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-4 p-3 sm:p-4 items-start md:items-center text-left",
          canExpand && "cursor-pointer"
        )}
      >
        {/* Expand Chevron + Actor details */}
        <div className="md:col-span-3 flex items-center gap-2 sm:gap-2.5 min-w-0">
          {canExpand && (
            <span className="text-zinc-400 dark:text-zinc-500 shrink-0">
              <HugeiconsIcon 
                icon={expanded ? ArrowUp01Icon : ArrowDown01Icon} 
                className="size-3 sm:size-3.5" 
              />
            </span>
          )}
          <div className="min-w-0 leading-tight">
            <h5 className="font-extrabold text-zinc-900 dark:text-white truncate text-[11px] sm:text-xs">
              {entry.actor}
            </h5>
            <span className="text-[9px] sm:text-[10px] text-zinc-450 dark:text-zinc-550 font-mono font-semibold flex items-center gap-1 mt-0.5">
              <HugeiconsIcon icon={Time02Icon} className="size-2.5 sm:size-3" />
              {formatAuditDate(entry.timestamp)}
            </span>
          </div>
        </div>

        {/* Action + Target Details */}
        <div className="md:col-span-5 leading-tight">
          <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono text-[10px] sm:text-[11px] uppercase tracking-wide">
            {entry.action}
          </span>
          <p className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">
            Target: <span className="font-mono text-zinc-900 dark:text-white">{entry.target}</span>
          </p>
        </div>

        {/* Metadata: Device / IP address */}
        <div className="md:col-span-2 flex flex-row md:flex-col gap-2 md:gap-0.5 text-[9px] sm:text-[10px] text-zinc-500 font-mono font-medium leading-tight">
          {entry.ipAddress && (
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={GlobalIcon} className="size-2.5 sm:size-3 text-zinc-450 shrink-0" />
              {entry.ipAddress}
            </span>
          )}
          {entry.device && (
            <span className="flex items-center gap-1 truncate">
              <HugeiconsIcon icon={ComputerIcon} className="size-2.5 sm:size-3 text-zinc-450 shrink-0" />
              {entry.device}
            </span>
          )}
        </div>

        {/* Outcome Badge */}
        <div className="md:col-span-2 flex justify-start md:justify-end shrink-0">
          <Badge className={cn("text-[8px] sm:text-[9px] uppercase font-black px-1.5 sm:px-2 py-0.5 rounded-lg", auditActionColor(entry.status))}>
            {entry.status}
          </Badge>
        </div>
      </div>

      {/* Expandable Diff view */}
      <AnimatePresence initial={false}>
        {expanded && canExpand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden bg-secondary/15 dark:bg-[#070708]/30 border-t border-zinc-200/50 dark:border-zinc-900/40"
          >
            <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono text-[11px]">
              {/* Old value panel */}
              <div className="flex-1 p-3.5 bg-red-500/5 border border-red-500/10 rounded-lg text-left">
                <span className="text-[9px] uppercase font-bold text-red-550 block mb-1">Old State</span>
                <pre className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-sans text-xs">
                  {entry.oldValue || '—'}
                </pre>
              </div>

              {/* Transfer arrow */}
              <div className="flex items-center justify-center shrink-0 text-zinc-400 dark:text-zinc-650">
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-5 rotate-90 sm:rotate-0" />
              </div>

              {/* New value panel */}
              <div className="flex-1 p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-left">
                <span className="text-[9px] uppercase font-bold text-emerald-550 block mb-1">New State</span>
                <pre className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-sans text-xs">
                  {entry.newValue || '—'}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

AuditTrailRow.displayName = 'AuditTrailRow';
