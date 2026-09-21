"use client";

import { useCallback, useEffect, useState } from "react";
import { CAREER_ROLES } from "./career-paths";

export const CAREER_ROLE_KEY = "sqlsports-career-role";
const EVENT = "sqlsports:career-role-change";

export function readStoredRole(): string | null {
  try {
    const value = window.localStorage.getItem(CAREER_ROLE_KEY);
    return value && CAREER_ROLES.some((r) => r.id === value) ? value : null;
  } catch {
    return null;
  }
}

export function useCareerRole(): {
  roleId: string | null;
  setRoleId: (next: string | null) => void;
  hydrated: boolean;
} {
  const [roleId, setRoleState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRoleState(readStoredRole());
    setHydrated(true);
    const sync = () => setRoleState(readStoredRole());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setRoleId = useCallback((next: string | null) => {
    try {
      if (next) window.localStorage.setItem(CAREER_ROLE_KEY, next);
      else window.localStorage.removeItem(CAREER_ROLE_KEY);
    } catch {
      // Non-fatal
    }
    setRoleState(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { roleId, setRoleId, hydrated };
}
