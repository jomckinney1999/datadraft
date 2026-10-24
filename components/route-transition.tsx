"use client";

/**
 * The curtain that carries a page transition across a navigation
 * (lib/route-transition.ts). It lives in the root layout because the layout
 * is the one thing that stays mounted while the route changes underneath.
 *
 * Until a transition link asks, it renders nothing and loads nothing; the
 * drawings come from route-transition-curtain.tsx when they're needed.
 *
 *   cover  — the drawing covers the page; the route is pushed when it's done.
 *   reveal — the new pathname is in (two frames later, so it has painted):
 *            the drawing clears off it, then unmounts.
 *
 * If the new page hasn't arrived in MAX_HOLD_MS the curtain lifts anyway.
 * A transition can make a click slower; it must never make it stick.
 *
 * While it's up, <html> carries CURTAIN_ATTR, and TRANSITION_END_EVENT fires
 * when it's gone, so the arriving page can hold its heavy work until then
 * (transitionSettled() in lib/route-transition.ts).
 */

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import {
  COVER_MS,
  CURTAIN_ATTR,
  LIGHT_COVER_MS,
  LIGHT_QUERY,
  LIGHT_REVEAL_MS,
  MAX_HOLD_MS,
  REVEAL_MS,
  TRANSITION_END_EVENT,
  TRANSITION_EVENT,
  pathOf,
  type TransitionKind,
  type TransitionRequest,
} from "@/lib/route-transition";
import { loadCurtain } from "@/components/route-transition-load";
import type { CurtainProps } from "@/components/route-transition-curtain";

type Run = {
  kind: TransitionKind;
  label: string;
  from: string;
  phase: "cover" | "reveal";
  /** The light version (LIGHT_QUERY): phones, tablets, touch screens. */
  light: boolean;
};

const setCurtainFlag = (kind: TransitionKind | null) => {
  const root = document.documentElement;
  if (kind) root.setAttribute(CURTAIN_ATTR, kind);
  else if (root.hasAttribute(CURTAIN_ATTR)) {
    root.removeAttribute(CURTAIN_ATTR);
    window.dispatchEvent(new Event(TRANSITION_END_EVENT));
  }
};

export default function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [run, setRun] = useState<Run | null>(null);
  const [Curtain, setCurtain] = useState<ComponentType<CurtainProps> | null>(null);
  const curtainRef = useRef<ComponentType<CurtainProps> | null>(null);
  const runRef = useRef<Run | null>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const lift = useCallback(() => {
    const r = runRef.current;
    if (!r || r.phase === "reveal") return;
    for (const t of timers.current.splice(0)) window.clearTimeout(t);
    const next = { ...r, phase: "reveal" as const };
    runRef.current = next;
    setRun(next);
    timers.current.push(
      window.setTimeout(() => {
        runRef.current = null;
        setRun(null);
        setCurtainFlag(null);
      }, (r.light ? LIGHT_REVEAL_MS : REVEAL_MS)[r.kind]),
    );
  }, []);

  // A touchstart and click can land in the same frame. Fetching the drawing
  // only on touchstart left a blank beat on phones while the chunk arrived.
  // Warm that small chunk after mount on touch screens, before anyone taps.
  useEffect(() => {
    if (!window.matchMedia(LIGHT_QUERY).matches) return;
    const id = window.setTimeout(() => {
      void loadCurtain().then((m) => {
        curtainRef.current = m.default;
        setCurtain(() => m.default);
      }).catch(() => {
        /* A plain link still works if the optional drawing fails to load. */
      });
    }, 200);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onAsk = (e: Event) => {
      const ask = (e as CustomEvent<TransitionRequest>).detail;
      ask.handled = true;
      if (runRef.current) return; // a second click while one runs
      const from = window.location.pathname;
      const light = window.matchMedia(LIGHT_QUERY).matches;
      const start: Run = { kind: ask.kind, label: ask.label, from, phase: "cover", light };
      runRef.current = start;
      const coverMs = (light ? LIGHT_COVER_MS : COVER_MS)[ask.kind];
      const startRun = (View: ComponentType<CurtainProps>) => {
        curtainRef.current = View;
        setCurtain(() => View);
        setRun(start);
        setCurtainFlag(ask.kind);
        later(() => {
          router.push(ask.href);
          // Same page, new hash: no pathname change is coming.
          if (pathOf(ask.href) === from) later(lift, 120);
        }, coverMs);
        later(lift, coverMs + MAX_HOLD_MS);
      };

      router.prefetch(ask.href);
      if (curtainRef.current) {
        startRun(curtainRef.current);
      } else {
        loadCurtain()
          .then((m) => startRun(m.default))
          .catch(() => {
            runRef.current = null;
            setCurtainFlag(null);
            router.push(ask.href);
          });
      }
    };
    window.addEventListener(TRANSITION_EVENT, onAsk);
    const list = timers.current;
    return () => {
      window.removeEventListener(TRANSITION_EVENT, onAsk);
      for (const t of list.splice(0)) window.clearTimeout(t);
      setCurtainFlag(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, lift]);

  // The new page is in: give it two frames to paint, then lift.
  useEffect(() => {
    const r = runRef.current;
    if (!r || r.phase !== "cover" || pathname === r.from) return;
    let a = 0;
    let b = 0;
    a = requestAnimationFrame(() => {
      b = requestAnimationFrame(lift);
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [pathname, lift]);

  if (!run || !Curtain) return null;
  return <Curtain kind={run.kind} label={run.label} phase={run.phase} />;
}
