"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Whole-second countdown from `seconds` to 0, restartable. It is driven by a
 * deadline rather than by counting ticks, so it stays accurate in background tabs.
 */
export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    const deadline = Date.now() + seconds * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [seconds, epoch]);

  const restart = useCallback(() => {
    setRemaining(seconds);
    setEpoch((value) => value + 1);
  }, [seconds]);

  return { remaining, ready: remaining === 0, restart };
}

/** 30 → "00:30" */
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
