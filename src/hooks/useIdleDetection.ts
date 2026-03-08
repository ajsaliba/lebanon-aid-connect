/**
 * Idle detection hook.
 * Returns whether the tab is hidden or user has been idle for N ms.
 * Used for pausing live streams like World Monitor.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function useIdleDetection(idleTimeoutMs = 5 * 60 * 1000) {
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), idleTimeoutMs);
  }, [idleTimeoutMs]);

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabHidden(document.visibilityState === 'hidden');
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    for (const ev of events) window.addEventListener(ev, resetIdleTimer, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    resetIdleTimer();

    return () => {
      for (const ev of events) window.removeEventListener(ev, resetIdleTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetIdleTimer]);

  return { isTabHidden, isIdle, shouldPause: isTabHidden || isIdle };
}
