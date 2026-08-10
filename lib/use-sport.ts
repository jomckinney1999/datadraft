"use client";

import { useCallback, useEffect, useState } from "react";
import type { SportId } from "./sports";

export const SPORT_STORAGE_KEY = "sqlsports-sport";

/**
 * Fired on every write so that multiple pickers on a page (and the /learn
 * dashboard) stay in agreement without threading a provider through the tree.
 * `storage` alone wouldn't do it — it only fires in *other* tabs.
 */
const SPORT_EVENT = "sqlsports:sport-change";

const VALID: SportId[] = ["football", "basketball", "baseball"];

export function readStoredSport(): SportId | null {
  try {
    const value = window.localStorage.getItem(SPORT_STORAGE_KEY) as SportId | null;
    return value && VALID.includes(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * `hydrated` is false on the server and on the first client render, so callers
 * can render a stable placeholder instead of mismatching what the server sent.
 */
export function useSport(): {
  sport: SportId | null;
  setSport: (next: SportId) => void;
  hydrated: boolean;
} {
  const [sport, setSportState] = useState<SportId | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSportState(readStoredSport());
    setHydrated(true);

    const sync = () => setSportState(readStoredSport());
    window.addEventListener(SPORT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SPORT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setSport = useCallback((next: SportId) => {
    try {
      window.localStorage.setItem(SPORT_STORAGE_KEY, next);
    } catch {
      // Non-fatal — the choice still applies for this page view.
    }
    setSportState(next);
    window.dispatchEvent(new Event(SPORT_EVENT));
  }, []);

  return { sport, setSport, hydrated };
}
