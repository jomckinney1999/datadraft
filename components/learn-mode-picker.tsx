"use client";

/**
 * Two-tile gate: Practice snaps (Duolingo) vs Studio (Udemy + Colab).
 */

import Link from "next/link";
import Coach from "@/components/coach";
import type { LearnMode } from "@/lib/use-learn-mode";

export default function LearnModePicker({
  mode,
  onPick,
}: {
  mode: LearnMode | null;
  onPick: (mode: LearnMode) => void;
}) {
  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-broadcast text-gold">how do you want to learn?</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">
            Pick your experience
          </h2>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            Same skills either way. Switch anytime — nothing is locked in.
          </p>
        </div>
        {mode && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Current · {mode === "drills" ? "Practice snaps" : "Studio"}
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Snaps */}
        <button
          type="button"
          onClick={() => onPick("drills")}
          className={`group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all lift ${
            mode === "drills"
              ? "border-turf bg-turf/10 shadow-[0_0_32px_-8px_rgb(var(--c-turf)/0.45)]"
              : "border-panel-border bg-panel hover:border-turf/50"
          }`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 yard-lines opacity-30"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex rounded-md border border-turf/40 bg-turf/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-turf">
                Option 1 · gamified
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-ink group-hover:text-turf">
                Practice snaps
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Duolingo-shaped drives: downs, XP, streaks, Coach Blitz. Short
                graded plays — perfect when you want to stay sharp in five
                minutes.
              </p>
            </div>
            <Coach mood="cheer" size={72} className="hidden shrink-0 sm:block" />
          </div>
          <ul className="relative mt-4 space-y-1.5 font-mono text-[11px] text-ink-muted">
            <li className="flex gap-2">
              <span className="text-turf">▸</span> Role path board + lesson player
            </li>
            <li className="flex gap-2">
              <span className="text-turf">▸</span> Instant grading in the browser
            </li>
            <li className="flex gap-2">
              <span className="text-turf">▸</span> Tickets, heaters, trophy case
            </li>
          </ul>
          <p className="relative mt-5 font-mono text-[11px] font-bold uppercase tracking-widest text-turf">
            {mode === "drills" ? "Selected · continue below →" : "Choose snaps →"}
          </p>
        </button>

        {/* Studio */}
        <button
          type="button"
          onClick={() => onPick("studio")}
          className={`group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all lift ${
            mode === "studio"
              ? "border-ice bg-ice/10 shadow-[0_0_32px_-8px_rgb(var(--c-ice)/0.45)]"
              : "border-panel-border bg-panel hover:border-ice/50"
          }`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 yard-lines opacity-30"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex rounded-md border border-ice/40 bg-ice/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ice">
                Option 2 · hands-on
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-ink group-hover:text-ice">
                Studio + Colab
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Udemy-style: sidebar topics, video instruction, and a real
                Google Colab notebook you run yourself. Get your hands dirty
                with the data.
              </p>
            </div>
            <Coach mood="think" size={72} className="hidden shrink-0 sm:block" />
          </div>
          <ul className="relative mt-4 space-y-1.5 font-mono text-[11px] text-ink-muted">
            <li className="flex gap-2">
              <span className="text-ice">▸</span> Course outline + watch stage
            </li>
            <li className="flex gap-2">
              <span className="text-ice">▸</span> Open-in-Colab notebooks
            </li>
            <li className="flex gap-2">
              <span className="text-ice">▸</span> Jump to a graded snap anytime
            </li>
          </ul>
          <p className="relative mt-5 font-mono text-[11px] font-bold uppercase tracking-widest text-ice">
            {mode === "studio" ? "Selected · open studio →" : "Choose studio →"}
          </p>
        </button>
      </div>

      {mode === "studio" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/learn/studio"
            className="btn-turf inline-flex items-center rounded-xl border border-turf/80 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-night"
          >
            Enter Studio →
          </Link>
          <p className="font-mono text-[11px] text-ink-muted">
            Videos fill in as we film — Colab is live today.
          </p>
        </div>
      )}
    </section>
  );
}
