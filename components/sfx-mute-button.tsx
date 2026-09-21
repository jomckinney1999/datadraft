"use client";

import { useEffect, useState } from "react";
import {
  isSfxMuted,
  onSfxMuteChange,
  playSfx,
  toggleSfxMuted,
} from "@/lib/sfx";

/**
 * Compact speaker toggle for the lesson scorebug. Tapping unmute plays a
 * correct ding so the learner hears that audio is on.
 */
export default function SfxMuteButton() {
  const [muted, setMuted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMuted(isSfxMuted());
    setHydrated(true);
    return onSfxMuteChange(setMuted);
  }, []);

  if (!hydrated) {
    return (
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 rounded-full border border-panel-border bg-panel/80"
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
      aria-pressed={muted}
      onClick={() => {
        const next = toggleSfxMuted();
        setMuted(next);
        if (!next) playSfx("correct");
      }}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-panel-border bg-panel/80 text-ink-muted transition-colors hover:border-turf/40 hover:text-ink"
    >
      {muted ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d="M4 10v4h3.5L12 18V6L7.5 10H4z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M16 9l5 6M21 9l-5 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d="M4 10v4h3.5L12 18V6L7.5 10H4z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M16 9.5a3.5 3.5 0 010 5M18.5 7a6.5 6.5 0 010 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
