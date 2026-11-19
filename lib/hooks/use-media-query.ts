"use client";

import { useSyncExternalStore } from "react";

/** Subscribes to a CSS media query. `false` on the server and during hydration. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** The layout breakpoint: `lg` (1024px) and up is the desktop layout. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
