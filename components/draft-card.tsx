"use client";

/**
 * The way into the Draft Room from the question bank and the dashboard: the
 * war-room draft board drawing, and where your open draft stands if you have
 * one.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import ProjectArt from "@/components/project-art";

export default function DraftCard({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sqlsports.draft.v1") ?? "null") as { phase: string; season: number } | null;
      if (saved && saved.phase === "draft") setStatus("Resume draft");
      else if (saved && saved.phase === "season") setStatus("Finish season");
    } catch {
      // No storage, no badge.
    }
  }, []);

  return (
    <Link
      href="/draft"
      className="lift surface group flex items-center gap-4 overflow-hidden rounded-2xl border border-panel-border bg-panel p-3 pr-5 transition-colors hover:border-turf/50"
    >
      <span className={`shrink-0 overflow-hidden rounded-xl border border-panel-border bg-night/60 ${compact ? "h-14 w-20" : "h-20 w-28"}`}>
        <ProjectArt id="positional-ranks" className="h-full w-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="label-broadcast text-turf">game · the draft room</span>
        <span className="mt-0.5 block font-display text-base font-bold text-ink sm:text-lg">
          Draft a real season. Scout it with SQL.
        </span>
        {!compact && (
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
            Real Sleeper ADP, seven bots, then the season plays out with the points that actually happened. About 15
            minutes.
          </span>
        )}
      </span>
      <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-turf">
        {status ?? "Draft →"}
      </span>
    </Link>
  );
}
