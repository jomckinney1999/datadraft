"use client";

/**
 * Whether this visitor has the Season Pass, for gating UI.
 *
 * Always true while the paywall is off, so every gate is a no-op today. Once
 * it's on, it's null until the page mounts (the server can't read this
 * browser), and gates act only on `false`, so a member never sees an offer
 * flash past while their progress loads. The flag itself comes from the
 * server-side subscription (lib/progress-sync.ts refreshPass), never from a
 * purchase made in this browser.
 */

import { useEffect, useState } from "react";
import { loadProgress } from "@/lib/progress";
import { PAYWALL_LIVE } from "@/lib/season-pass";

/** Fired after the Pass flag changes, so open pages re-read it. */
export const PASS_EVENT = "sqlsports:pass";

export function usePass(): boolean | null {
  const [has, setHas] = useState<boolean | null>(PAYWALL_LIVE ? null : true);
  useEffect(() => {
    if (!PAYWALL_LIVE) return;
    const read = () => setHas(loadProgress().seasonPass);
    read();
    window.addEventListener(PASS_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(PASS_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return has;
}
