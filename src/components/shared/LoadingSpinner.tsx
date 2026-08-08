import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading03Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import type { LoadingSpinnerProps } from '@/types/shared';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullscreen = false,
  label = 'Loading...'
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'size-5',
    md: 'size-8',
    lg: 'size-12'
  };

  const spinnerContent = (
    <div 
      className="flex flex-col items-center justify-center gap-3 select-none"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <motion.div
        animate={shouldReduceMotion ? {} : { rotate: 360 }}
        transition={
          shouldReduceMotion 
            ? {} 
            : { repeat: Infinity, duration: 1.2, ease: 'linear' }
        }
        className={cn(
          "text-primary shrink-0 flex items-center justify-center",
          sizeClasses[size]
        )}
      >
        <HugeiconsIcon icon={Loading03Icon} className="w-full h-full animate-none" />
      </motion.div>
      {label && size !== 'sm' && (
        <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
          {label}
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/85 backdrop-blur-xs animate-in fade-in-0 duration-200">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};
