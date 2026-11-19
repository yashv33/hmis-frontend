"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Replaces the current history entry with `href` once `when` is true (never during render). */
export function useRedirect(when: boolean, href: string) {
  const router = useRouter();
  useEffect(() => {
    if (when) router.replace(href);
  }, [when, href, router]);
}
