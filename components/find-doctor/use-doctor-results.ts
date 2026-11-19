"use client";

import { useEffect, useState } from "react";
import { searchDoctors, type SearchResult } from "@/lib/find-doctor/mock-api";
import { parseQuery } from "@/lib/find-doctor/query";

type Settled = { key: string; result: SearchResult | null };

/**
 * Runs the mock search for a serialized query and exposes loading / error / result.
 * `loading` is derived — it is true whenever the latest settled response belongs to a
 * different request than the one now being asked for — so no state is set synchronously
 * inside the effect.
 */
export function useDoctorResults(queryString: string, simulate: string | null) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);
  const requestKey = `${queryString}|${simulate ?? ""}|${attempt}`;

  useEffect(() => {
    let cancelled = false;
    const query = parseQuery(new URLSearchParams(queryString));
    searchDoctors(query, { simulate }).then(
      (result) => {
        if (!cancelled) setSettled({ key: requestKey, result });
      },
      () => {
        if (!cancelled) setSettled({ key: requestKey, result: null });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [queryString, simulate, requestKey]);

  const loading = settled?.key !== requestKey;
  return {
    loading,
    result: loading ? null : settled.result,
    failed: !loading && settled.result === null,
    retry: () => setAttempt((n) => n + 1),
  };
}
