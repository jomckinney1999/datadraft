"use client";

import { SPORTS } from "@/lib/sports";
import { useSport } from "@/lib/use-sport";
import WaitlistForm from "@/components/waitlist-form";

export default function SportPicker() {
  const { sport, setSport, hydrated } = useSport();

  return (
    <section id="pick-your-sport" className="border-t border-panel-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="label-broadcast mb-3">
          <span className="mr-2 inline-block h-1.5 w-1.5 bg-turf align-middle" />
          Your lens
        </p>
        <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
          Pick a sport flavor. Start with football — it&apos;s live.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
          The skills stay the same whichever you choose. Football is built
          today with real NFL data; basketball and baseball are on the waitlist.
          You still don&apos;t have to watch the games — anything you need gets
          explained in a sentence where it matters.
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
                onClick={() => s.status === "live" && setSport(s.id)}
                disabled={s.status !== "live"}
                className={`group flex flex-col items-start border p-5 text-left transition-colors duration-150 ${
                  selected
                    ? "border-turf bg-turf/10"
                    : s.status === "live"
                      ? "border-panel-border bg-panel hover:border-turf/50"
                      : "cursor-default border-panel-border bg-panel/60"
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
                    selected
                      ? "text-turf"
                      : s.status === "live"
                        ? "text-ink-muted group-hover:text-turf"
                        : "text-gold"
                  }`}
                >
                  {selected
                    ? "✓ Selected"
                    : s.status === "live"
                      ? "Choose this sport"
                      : "Not ready yet"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Basketball and baseball aren't selectable because selecting them
            would change nothing: every lesson, the sandbox and the Practice
            Field are NFL data. Offering a choice that does nothing costs more
            trust than not offering it. */}
        <div className="mt-6 max-w-2xl border border-gold/30 bg-gold/5 p-4">
          <p className="font-mono text-[11px] leading-relaxed text-ink-soft">
            <span className="font-semibold uppercase tracking-wider text-gold">
              Football only, for now
            </span>{" "}
            — every lesson, the sandbox and the Practice Field run on real NFL
            data. Basketball and baseball need their own datasets before the
            choice means anything, so we&apos;re not pretending otherwise.
          </p>
          <p className="mt-3 font-mono text-[11px] text-ink-muted">
            Want your sport first? Tell us and we&apos;ll build it next.
          </p>
          <div className="mt-2">
            <WaitlistForm
              interest="sport:basketball-or-baseball"
              source="sport-picker"
              label="Vote for my sport"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/learn"
            className="btn-turf inline-flex items-center gap-2 border border-turf bg-turf px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-turf-dim"
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
