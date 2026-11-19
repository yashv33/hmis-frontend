"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False while the server HTML is being hydrated, true afterwards. Session-backed stores return
 * their empty server value during hydration, so guards must not act on that first render.
 */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
