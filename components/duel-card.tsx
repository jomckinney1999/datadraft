"use client";

/**
 * The way into the daily Stat Duel from the question bank and the dashboard:
 * a card with the balance-scale drawing that already means "compare" in the
 * question art, and today's score once you've played.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import QuestionArt from "@/components/question-art";

export default function DuelCard({ day, compact = false }: { day: string; compact?: boolean }) {
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sqlsports.duel.v1") ?? "null") as { day: string; picks: number[] } | null;
      if (saved && saved.day === day && saved.picks.length >= 5) setResult("Played today");
    } catch {
      // No storage, no badge.
    }
  }, [day]);

  return (
    <Link
      href="/questions/duel"
      className="lift surface group flex items-center gap-4 overflow-hidden rounded-2xl border border-panel-border bg-panel p-3 pr-5 transition-colors hover:border-gold/50"
    >
      <span className={`shrink-0 overflow-hidden rounded-xl border border-panel-border bg-night/60 ${compact ? "h-14 w-20" : "h-20 w-28"}`}>
        <QuestionArt art="scale" className="h-full w-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="label-broadcast text-gold">warm-up · stat duel</span>
          {!result && <span className="live-dot">Live</span>}
        </span>
        <span className="mt-0.5 block font-display text-base font-bold text-ink sm:text-lg">
          Who had more? Five head-to-heads.
        </span>
        {!compact && (
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
            No code needed — every answer comes with the SQL that proves it. About a minute.
          </span>
        )}
      </span>
      <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-gold">
        {result ?? "Play →"}
      </span>
    </Link>
  );
}
