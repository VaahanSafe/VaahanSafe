import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { formatCounter } from '@/lib/shared';
import type { AnimatedCounterProps } from '@/types/shared';

export const AnimatedCounter: React.FC<AnimatedCounterProps> = React.memo(({
  value,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(shouldReduceMotion ? value : 0);
  
  const springVal = useSpring(motionVal, {
    damping: 25,
    stiffness: 75,
    restDelta: 0.001
  });

  useEffect(() => {
    motionVal.set(value);
    if (shouldReduceMotion && ref.current) {
      ref.current.textContent = formatCounter(value, decimals);
    }
  }, [value, shouldReduceMotion, decimals, motionVal]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    
    if (ref.current) {
      ref.current.textContent = formatCounter(motionVal.get(), decimals);
    }

    const unsubscribe = springVal.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = formatCounter(latest, decimals);
      }
    });
    
    return () => unsubscribe();
  }, [springVal, decimals, shouldReduceMotion, motionVal]);

  return (
    <span className="font-sans inline-flex items-center">
      {prefix && <span className="mr-0.5 select-none">{prefix}</span>}
      <span ref={ref}>
        {formatCounter(shouldReduceMotion ? value : 0, decimals)}
      </span>
      {suffix && <span className="ml-0.5 select-none">{suffix}</span>}
    </span>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';
