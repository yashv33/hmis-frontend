"use client";

import { useEffect } from "react";

// Counts overlays so the mobile menu and the logout sheet can be open at once:
// the page unlocks only when the last one closes.
let locks = 0;
let previous: { overflow: string; paddingRight: string } | null = null;

/** Prevents the page behind an overlay from scrolling while `active`. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;
    if (locks === 0) {
      previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
      // Keep the layout from shifting when the scrollbar disappears.
      const scrollbar = window.innerWidth - documentElement.clientWidth;
      body.style.overflow = "hidden";
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0 && previous) {
        body.style.overflow = previous.overflow;
        body.style.paddingRight = previous.paddingRight;
        previous = null;
      }
    };
  }, [active]);
}
