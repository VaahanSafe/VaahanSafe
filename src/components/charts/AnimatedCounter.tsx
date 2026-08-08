import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import type { AnimatedCounterProps } from '@/types/charts';

export const AnimatedCounter: React.FC<AnimatedCounterProps> = React.memo(({
  value,
  duration = 1.0,
  decimals = 0,
  prefix = '',
  suffix = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate(latestValue) {
        node.textContent = prefix + latestValue.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + suffix;
      },
    });

    return () => controls.stop();
  }, [value, duration, decimals, prefix, suffix]);

  return (
    <span
      ref={ref}
      className="font-sans font-extrabold tabular-nums tracking-tight"
    >
      {prefix}
      {value.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';
