"use client";

/**
 * The analyst path, drawn (lib/analyst-path.ts has the logic). Four steps
 * in a column: the one you're on is open, with its checklist and one button
 * for what to do next; the others are a single line each, so the page shows
 * where you are rather than everything at once. Ticks come from progress
 * the site already records; the only self-reported one is the Colab
 * notebook, and it says so.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { analystPath, currentStep, markPath, readPathInputs, type PathCatalog, type PathStep } from "@/lib/analyst-path";
import { PROGRESS_EVENT } from "@/lib/progress";

function Tick({ done, n }: { done: boolean; n?: number }) {
  return (
    <span
      aria-hidden
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[11px] font-bold ${
        done ? "border-turf bg-turf text-night" : "border-panel-border text-ink-muted"
      }`}
    >
      {done ? "✓" : n}
    </span>
  );
}

export default function AnalystPath({ catalog }: { catalog: PathCatalog }) {
  const [steps, setSteps] = useState<PathStep[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setSteps(analystPath(readPathInputs(), catalog));
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener("sqlsports:path", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener("sqlsports:path", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [catalog]);

  if (!steps) {
    // Same height as the real thing, so nothing jumps when progress loads.
    return <div className="surface h-[26rem] rounded-2xl border border-panel-border bg-panel" aria-hidden />;
  }

  const current = currentStep(steps);
  const doneCount = steps.filter((s) => s.done).length;
  const openId = open ?? current?.id ?? null;

  return (
    <section aria-labelledby="path-title" className="surface rounded-2xl border border-panel-border bg-panel p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="path-title" className="font-display text-xl font-bold text-ink">
          {current ? `Step ${steps.indexOf(current) + 1} of ${steps.length}: ${current.title}` : "Path complete"}
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          {doneCount}/{steps.length} steps done
        </span>
      </div>
      <div className="quest-bar mt-2">
        <span style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      {!current && (
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Every step ticked. Keep the habit with today&apos;s question, and run a technical screen the week before a
          real interview.
        </p>
      )}

      <ol className="mt-5 space-y-2">
        {steps.map((s, i) => {
          const isOpen = openId === s.id;
          const isCurrent = current?.id === s.id;
          return (
            <li
              key={s.id}
              className={`rounded-xl border transition-colors ${
                isCurrent ? "border-turf/50 bg-turf/5" : "border-panel-border bg-night/30"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? "" : s.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
              >
                <Tick done={s.done} n={i + 1} />
                <span className="min-w-0 flex-1">
                  <span className={`block font-display text-base font-bold ${s.done ? "text-ink-soft" : "text-ink"}`}>
                    {s.title}
                  </span>
                  {!isOpen && (
                    <span className="block truncate text-xs text-ink-muted">
                      {s.skipped ? "Skipped" : s.done ? "Done" : isCurrent ? `You're here · ${s.have}/${s.need}` : "Up next"}
                    </span>
                  )}
                </span>
                <span aria-hidden className={`text-ink-muted transition-transform ${isOpen ? "rotate-90" : ""}`}>
                  ›
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-panel-border px-3.5 pb-4 pt-3 sm:pl-[3.4rem]">
                  <p className="text-sm leading-relaxed text-ink-soft">{s.why}</p>
                  <ul className={`mt-3 grid gap-1.5 ${s.items.length > 4 ? "sm:grid-cols-2" : ""}`}>
                    {s.items.map((it) => (
                      <li key={it.label}>
                        <Link
                          href={it.href}
                          className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-panel"
                        >
                          <span
                            aria-hidden
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                              it.done ? "border-turf bg-turf/20 text-turf" : "border-panel-border"
                            }`}
                          >
                            {it.done ? "✓" : ""}
                          </span>
                          <span className={`min-w-0 flex-1 text-sm ${it.done ? "text-ink-muted" : "text-ink group-hover:text-turf"}`}>
                            {it.label}
                          </span>
                          {it.detail && <span className="shrink-0 font-mono text-[10px] text-ink-muted">{it.detail}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {!s.done && (
                      <Link href={s.next.href} className="press btn-turf !px-4 !py-2 text-sm">
                        {s.next.label} →
                      </Link>
                    )}
                    {s.skipped && (
                      <button
                        type="button"
                        onClick={() => markPath({ skipFoundations: false })}
                        className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink"
                      >
                        Undo skip
                      </button>
                    )}
                    {s.id === "foundations" && !s.done && (
                      <button
                        type="button"
                        onClick={() => markPath({ skipFoundations: true })}
                        className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink"
                      >
                        I already know the basics, skip
                      </button>
                    )}
                    {s.id === "portfolio" && (
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                        <input
                          type="checkbox"
                          checked={s.done}
                          onChange={(e) => markPath({ portfolio: e.target.checked })}
                          className="h-4 w-4 accent-[rgb(var(--c-turf))]"
                        />
                        I&apos;ve built the notebook
                      </label>
                    )}
                    {s.extra && (
                      <Link href={s.extra.href} className="text-xs font-semibold text-ink-soft hover:text-ink hover:underline">
                        {s.extra.done ? "✓ " : ""}
                        {s.extra.label} →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
