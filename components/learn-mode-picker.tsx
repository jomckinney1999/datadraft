"use client";

/**
 * Two-tile gate: Practice snaps (Duolingo) vs Studio (Udemy + Colab).
 */

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
            Practice snaps are open. Video and Colab are on the way.
          </p>
        </div>
        {mode === "drills" && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Current · Practice snaps
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

        {/* Studio — visible, not selectable until videos land. */}
        <div
          aria-disabled="true"
          className="relative cursor-default overflow-hidden rounded-2xl border-2 border-dashed border-panel-border bg-panel p-5 text-left opacity-60"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 yard-lines opacity-20"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex rounded-md border border-gold/40 bg-gold/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                Coming soon
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-ink">
                Studio + Colab
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Video lessons and a Google Colab notebook, side by side. Same
                courses as the snaps. Not open yet.
              </p>
            </div>
            <Coach mood="think" size={72} className="hidden shrink-0 opacity-70 sm:block" />
          </div>
          <ul className="relative mt-4 space-y-1.5 font-mono text-[11px] text-ink-muted">
            <li className="flex gap-2">
              <span className="text-ink-muted">▸</span> Course outline + watch stage
            </li>
            <li className="flex gap-2">
              <span className="text-ink-muted">▸</span> Open-in-Colab notebooks
            </li>
            <li className="flex gap-2">
              <span className="text-ink-muted">▸</span> Jump to a graded snap anytime
            </li>
          </ul>
          <p className="relative mt-5 font-mono text-[11px] font-bold uppercase tracking-widest text-gold">
            Coming soon
          </p>
        </div>
      </div>
    </section>
  );
}
