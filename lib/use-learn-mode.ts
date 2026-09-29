"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * How the learner wants to take courses:
 *   drills  — Duolingo-style snaps (existing lesson player)
 *   studio  — Udemy-style watch + Colab notebook track
 */

export type LearnMode = "drills" | "studio";

export const LEARN_MODE_KEY = "sqlsports-learn-mode";
const LEARN_MODE_EVENT = "sqlsports:learn-mode-change";

const VALID: LearnMode[] = ["drills", "studio"];

export function readStoredLearnMode(): LearnMode | null {
  try {
    const value = window.localStorage.getItem(LEARN_MODE_KEY) as LearnMode | null;
    return value && VALID.includes(value) ? value : null;
  } catch {
    return null;
  }
}

export function useLearnMode(): {
  mode: LearnMode | null;
  setMode: (next: LearnMode) => void;
  hydrated: boolean;
} {
  const [mode, setModeState] = useState<LearnMode | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setModeState(readStoredLearnMode());
    setHydrated(true);

    const sync = () => setModeState(readStoredLearnMode());
    window.addEventListener(LEARN_MODE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LEARN_MODE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setMode = useCallback((next: LearnMode) => {
    try {
      window.localStorage.setItem(LEARN_MODE_KEY, next);
    } catch {
      // Non-fatal
    }
    setModeState(next);
    window.dispatchEvent(new Event(LEARN_MODE_EVENT));
  }, []);

  return { mode, setMode, hydrated };
}
