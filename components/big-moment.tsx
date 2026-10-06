"use client";

/**
 * The big moments' front door: a queue and a lazily loaded stage.
 *
 *   const moments = useBigMoments();
 *   moments.play(lessonMoment(...));   // in an event handler or effect
 *   return <>{page}{moments.node}</>;
 *
 * The drawings and their CSS live in big-moment-stage.tsx and only load when
 * something is about to be earned (`preloadBigMoments()` on lesson start), so
 * a page that never celebrates never pays for the art. What each event earns
 * is decided in lib/big-moments.ts.
 */

import dynamic from "next/dynamic";
import { useCallback, useState, type ReactNode } from "react";
import type { Moment } from "@/lib/big-moments";

const load = () => import("./big-moment-stage");
const Stage = dynamic(load, { ssr: false });

/** Fetch the stage ahead of time, so a moment plays the instant it's earned. */
export function preloadBigMoments(): void {
  void load().catch(() => {
    /* it'll try again when a moment plays */
  });
}

export function useBigMoments(): {
  play: (...moments: Moment[]) => void;
  node: ReactNode;
  playing: boolean;
} {
  const [queue, setQueue] = useState<Moment[]>([]);
  const play = useCallback((...moments: Moment[]) => setQueue((q) => [...q, ...moments]), []);
  const done = useCallback(() => setQueue((q) => q.slice(1)), []);
  const current = queue[0];
  return {
    play,
    playing: !!current,
    node: current ? <Stage key={current.key} moment={current} onDone={done} /> : null,
  };
}
