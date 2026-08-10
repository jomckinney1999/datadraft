"use client";

import { useCallback, useEffect, useState } from "react";
import { ALL_MODULE, MODULES } from "./curriculum";

export const MODULE_STORAGE_KEY = "sqlsports-module";

/** Fired on write so the roadmap and the lesson player stay in agreement. */
const MODULE_EVENT = "sqlsports:module-change";

export function readStoredModule(): string {
  try {
    const value = window.localStorage.getItem(MODULE_STORAGE_KEY);
    return value && MODULES.some((m) => m.id === value) ? value : ALL_MODULE;
  } catch {
    return ALL_MODULE;
  }
}

/**
 * `hydrated` is false on the server and the first client render so callers can
 * render the default without mismatching what the server sent.
 */
export function useModule(): {
  moduleId: string;
  setModule: (next: string) => void;
  hydrated: boolean;
} {
  const [moduleId, setModuleState] = useState<string>(ALL_MODULE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setModuleState(readStoredModule());
    setHydrated(true);
    const sync = () => setModuleState(readStoredModule());
    window.addEventListener(MODULE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MODULE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setModule = useCallback((next: string) => {
    try {
      window.localStorage.setItem(MODULE_STORAGE_KEY, next);
    } catch {
      // Non-fatal — the choice still applies for this page view.
    }
    setModuleState(next);
    window.dispatchEvent(new Event(MODULE_EVENT));
  }, []);

  return { moduleId, setModule, hydrated };
}
