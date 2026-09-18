import { useCallback, useEffect, useRef, useState } from "react";

export interface CountdownRestore {
  remainingSeconds: number;
  isRunning: boolean;
  deadlineMs: number | null;
}

export interface CountdownSnapshot {
  remainingSeconds: number;
  isRunning: boolean;
  deadlineMs: number | null;
}

interface CountdownOptions {
  minutes: number;
  /** Stable id of the active session, or null when idle. */
  restoreKey?: string | null;
  restore?: CountdownRestore | null;
  onComplete?: (elapsedMinutes: number) => void;
  /** Called on start/pause/resume/reset/stop — never on every tick. */
  onPersist?: (snapshot: CountdownSnapshot) => void;
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
 * Wall-clock countdown. Remaining time is derived from a deadline timestamp
 * so a reload can reconstruct the clock without writing every second.
 */
export function useCountdown({
  minutes,
  restoreKey = null,
  restore = null,
  onComplete,
  onPersist,
}: CountdownOptions): Countdown {
  const total = minutes * 60;
  const [remaining, setRemaining] = useState(() => restore?.remainingSeconds ?? total);
  const [isRunning, setIsRunning] = useState(() => restore?.isRunning ?? false);
  const deadlineRef = useRef<number | null>(restore?.deadlineMs ?? null);
  const remainingRef = useRef(restore?.remainingSeconds ?? total);
  const completeRef = useRef(onComplete);
  const persistRef = useRef(onPersist);
  const appliedKey = useRef<string | null | undefined>(undefined);

  completeRef.current = onComplete;
  persistRef.current = onPersist;
  remainingRef.current = remaining;

  useEffect(() => {
    if (restoreKey) {
      if (appliedKey.current === restoreKey) return;
      appliedKey.current = restoreKey;
      const nextRemaining = restore?.remainingSeconds ?? total;
      remainingRef.current = nextRemaining;
      setRemaining(nextRemaining);
      setIsRunning(!!restore?.isRunning);
      deadlineRef.current = restore?.deadlineMs ?? null;
      return;
    }

    appliedKey.current = null;
    setIsRunning(false);
    deadlineRef.current = null;
    remainingRef.current = total;
    setRemaining(total);
  }, [restoreKey, restore, total]);

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      remainingRef.current = left;
      setRemaining(left);

      if (left === 0) {
        setIsRunning(false);
        deadlineRef.current = null;
        completeRef.current?.(total / 60);
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isRunning, total]);

  const emit = (running: boolean, left: number, deadline: number | null) => {
    persistRef.current?.({
      remainingSeconds: left,
      isRunning: running,
      deadlineMs: deadline,
    });
  };

  const start = useCallback(() => {
    const left = remainingRef.current > 0 ? remainingRef.current : total;
    const deadline = Date.now() + left * 1000;
    deadlineRef.current = deadline;
    remainingRef.current = left;
    setRemaining(left);
    setIsRunning(true);
    emit(true, left, deadline);
  }, [total]);

  const pause = useCallback(() => {
    setIsRunning(false);
    deadlineRef.current = null;
    emit(false, remainingRef.current, null);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    deadlineRef.current = null;
    const elapsedMinutes = Math.max(0, (total - remainingRef.current) / 60);
    completeRef.current?.(elapsedMinutes);
  }, [total]);

  const reset = useCallback(() => {
    setIsRunning(false);
    deadlineRef.current = null;
    remainingRef.current = total;
    setRemaining(total);
    emit(false, total, null);
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
