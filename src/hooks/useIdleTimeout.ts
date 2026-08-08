import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseIdleTimeoutOptions {
  timeoutMs?: number; // Inactivity timeout in ms (default: 15 minutes = 900000ms)
  onIdle?: () => void;
  onActive?: () => void;
}

/**
 * Enterprise User Idle Timeout Hook
 * Detects user inactivity across mouse movement, keyboard typing, scrolling, and touch events.
 */
export function useIdleTimeout({
  timeoutMs = 15 * 60 * 1000,
  onIdle,
  onActive,
}: UseIdleTimeoutOptions = {}): { isIdle: boolean; reset: () => void } {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isIdle) {
      setIsIdle(false);
      onActive?.();
    }

    timerRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle?.();
    }, timeoutMs);
  }, [isIdle, onActive, onIdle, timeoutMs]);

  useEffect(() => {
    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];

    const handleActivity = () => {
      reset();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    reset();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [reset]);

  return { isIdle, reset };
}

export default useIdleTimeout;
