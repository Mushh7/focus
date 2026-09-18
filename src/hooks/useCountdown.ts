import { useCallback, useEffect, useRef, useState } from "react";

interface CountdownOptions {
  /** Session length in minutes. Changing it rewinds the timer. */
  minutes: number;
  onComplete?: (elapsedMinutes: number) => void;
}

interface Countdown {
  remaining: number;
  total: number;
  isRunning: boolean;
  hasStarted: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Wall-clock driven countdown: the deadline is stored as a timestamp so the
 * readout stays accurate even if the interval fires late.
 */
export function useCountdown({ minutes, onComplete }: CountdownOptions): Countdown {
  const total = minutes * 60;
  const [remaining, setRemaining] = useState(total);
  const [isRunning, setIsRunning] = useState(false);
  const deadlineRef = useRef<number | null>(null);
  const remainingRef = useRef(total);
  const completeRef = useRef(onComplete);

  completeRef.current = onComplete;
  remainingRef.current = remaining;

  useEffect(() => {
    setIsRunning(false);
    deadlineRef.current = null;
    setRemaining(total);
  }, [total]);

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0) {
        setIsRunning(false);
        deadlineRef.current = null;
        remainingRef.current = 0;
        completeRef.current?.(total / 60);
      }
    };

    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isRunning, total]);

  const start = useCallback(() => {
    setRemaining((current) => {
      const left = current > 0 ? current : total;
      deadlineRef.current = Date.now() + left * 1000;
      return left;
    });
    setIsRunning(true);
  }, [total]);

  const pause = useCallback(() => {
    setIsRunning(false);
    deadlineRef.current = null;
  }, []);

  /** Stops the clock and reports elapsed minutes without rewinding. */
  const stop = useCallback(() => {
    setIsRunning(false);
    deadlineRef.current = null;
    const elapsedMinutes = Math.max(0, (total - remainingRef.current) / 60);
    completeRef.current?.(elapsedMinutes);
  }, [total]);

  const reset = useCallback(() => {
    setIsRunning(false);
    deadlineRef.current = null;
    setRemaining(total);
  }, [total]);

  return {
    remaining,
    total,
    isRunning,
    hasStarted: remaining < total,
    progress: total === 0 ? 0 : (total - remaining) / total,
    start,
    pause,
    stop,
    reset,
  };
}
