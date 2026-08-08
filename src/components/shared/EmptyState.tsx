import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { InboxIcon } from '@hugeicons/core-free-icons';
import { Card } from '@/components/ui/card';
import type { EmptyStateProps } from '@/types/shared';

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  icon,
  title,
  description,
  action
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full select-none font-sans text-center"
    >
      <Card className="w-full border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-lg p-8 sm:p-12 flex flex-col items-center justify-center space-y-4">
        {/* Render Icon container */}
        <div className="p-3.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800/80 text-zinc-400 dark:text-zinc-550 shrink-0">
          {icon ?? <HugeiconsIcon icon={InboxIcon} className="size-7 text-primary" />}
        </div>

        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-sm sm:text-base font-black font-display text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
            {description}
          </p>
        </div>

        {action && (
          <div className="pt-1.5">
            {action}
          </div>
        )}
      </Card>
    </motion.div>
  );
});

EmptyState.displayName = 'EmptyState';
