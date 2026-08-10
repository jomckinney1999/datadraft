"use client";

import { SPORTS } from "@/lib/sports";
import { useSport } from "@/lib/use-sport";

export default function SportPicker() {
  const { sport, setSport, hydrated } = useSport();

  return (
    <section id="pick-your-sport" className="border-t border-panel-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="label-broadcast mb-3">
          <span className="mr-2 inline-block h-1.5 w-1.5 bg-turf align-middle" />
          Step one
        </p>
        <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
          Pick your sport. That&apos;s your lens.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
          The skills are identical whichever you choose — SQL, Python, R, Git,
          statistics. The sport only decides what the data is about. And you
          still don&apos;t have to watch the games: anything you need to know
          gets explained in a sentence, right where it matters.
        </p>

        <div
          role="radiogroup"
          aria-label="Choose your sport"
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {SPORTS.map((s) => {
            const selected = hydrated && sport === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSport(s.id)}
                className={`group flex flex-col items-start border p-5 text-left transition-colors duration-150 ${
                  selected
                    ? "border-turf bg-turf/10"
                    : "border-panel-border bg-panel hover:border-turf/50"
                }`}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <span aria-hidden className="text-3xl leading-none">
                    {s.icon}
                  </span>
                  {s.status === "live" ? (
                    <span className="border border-turf/40 bg-turf/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-turf">
                      Live now
                    </span>
                  ) : (
                    <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">
                      In build
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-xl font-semibold text-pop">
                  {s.name}
                </h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                  {s.league}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {s.tagline}
                </p>
                <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-muted">
                  {s.dataBlurb}
                </p>

                <span
                  className={`mt-5 font-mono text-[11px] uppercase tracking-wider ${
                    selected ? "text-turf" : "text-ink-muted group-hover:text-turf"
                  }`}
                >
                  {selected ? "✓ Selected" : "Choose this sport"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Football is the only sport with a real dataset today, and the site
            says so rather than implying three finished products. */}
        <p className="mt-6 max-w-2xl font-mono text-[11px] leading-relaxed text-ink-muted">
          Football runs on real NFL data today. Basketball and baseball are in
          active build — pick one now and you&apos;ll start on the football
          dataset, then switch your lens the week your sport goes live.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/learn"
            className="inline-flex items-center gap-2 border border-turf bg-turf px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-turf-dim"
          >
            Start learning →
          </a>
          <span className="font-mono text-[11px] text-ink-muted">
            No account needed.
          </span>
        </div>
      </div>
    </section>
  );
}
