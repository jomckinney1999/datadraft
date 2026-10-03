"use client";

/**
 * Konami code → secret play. Whistle blows, Coach cheers, a gold toast
 * pops. Pure garnish — nothing unlocks — but it makes the site feel like
 * a game that notices you. Once per session so it stays a surprise.
 */

import { useEffect, useState } from "react";
import Coach from "@/components/coach";
import { blowWhistle } from "@/lib/whistle";
import { playSfx } from "@/lib/sfx";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

const SEEN = "sqlsports.secret-play.v1";

export default function SecretPlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        i = 0;
        return;
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === CODE[i]) {
        i += 1;
        if (i === CODE.length) {
          i = 0;
          try {
            if (sessionStorage.getItem(SEEN) === "1") return;
            sessionStorage.setItem(SEEN, "1");
          } catch {
            // sessionStorage can throw; still fire once this page view.
          }
          blowWhistle();
          playSfx("touchdown");
          setShow(true);
          window.setTimeout(() => setShow(false), 4200);
        }
      } else {
        i = key === CODE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!show) return null;

  return (
    <div className="secret-play" role="status" aria-live="polite">
      <Coach mood="cheer" size={64} className="shrink-0" />
      <div className="min-w-0">
        <p className="label-broadcast text-gold">secret play</p>
        <p className="mt-0.5 font-display text-lg font-bold text-ink">
          Audible! You found the Konami route.
        </p>
        <p className="mt-0.5 text-sm text-ink-soft">Nothing unlocked. Just vibes.</p>
      </div>
    </div>
  );
}
