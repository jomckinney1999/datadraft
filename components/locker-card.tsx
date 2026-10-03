"use client";

/**
 * Own your character — callsign, jersey, kit. Lives on /account and feeds
 * the nav chip + dashboard leaderboard placeholder.
 */

import { useEffect, useState } from "react";
import PlayerMark from "@/components/player-mark";
import { setCallSign, setKit, type KitAccent, type Progress } from "@/lib/progress";
import { displayName, RANKS, tenureFrom } from "@/lib/tenure";

const ACCENTS: { id: KitAccent; label: string }[] = [
  { id: "ice", label: "Ice" },
  { id: "turf", label: "Turf" },
  { id: "gold", label: "Gold" },
];

export default function LockerCard({
  progress: initial,
  onChange,
}: {
  progress: Progress;
  onChange?: (p: Progress) => void;
}) {
  const [progress, setProgress] = useState(initial);
  const [name, setName] = useState(initial.username ?? "");
  const [jerseyDraft, setJerseyDraft] = useState(String(initial.jersey));

  useEffect(() => {
    setProgress(initial);
    setName(initial.username ?? "");
    setJerseyDraft(String(initial.jersey));
  }, [initial]);

  const tenure = tenureFrom(progress);
  const shown = displayName({ ...progress, username: name.trim() || null });

  function commitName() {
    const next = setCallSign(name);
    setProgress(next);
    onChange?.(next);
  }

  function commitJersey() {
    const n = Number.parseInt(jerseyDraft, 10);
    const jersey = Number.isFinite(n) ? n : progress.jersey;
    const next = setKit({ jersey });
    setJerseyDraft(String(next.jersey));
    setProgress(next);
    onChange?.(next);
  }

  function patchKit(patch: { kitTone?: number; kitAccent?: KitAccent; jersey?: number }) {
    const next = setKit(patch);
    setProgress(next);
    if (typeof patch.jersey === "number") setJerseyDraft(String(next.jersey));
    onChange?.(next);
  }

  return (
    <section
      id="locker"
      className="surface relative scroll-mt-20 overflow-hidden rounded-2xl border border-gold/35 bg-panel shadow-[0_0_48px_-16px_rgb(var(--c-gold)/0.4)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_10%_0%,rgb(var(--c-gold)/0.16),transparent_55%),radial-gradient(ellipse_55%_45%_at_100%_30%,rgb(var(--c-ice)/0.12),transparent_50%),radial-gradient(ellipse_50%_40%_at_50%_100%,rgb(var(--c-turf)/0.10),transparent_50%)]"
      />
      <div className="relative border-b border-panel-border bg-gold/5 px-5 py-4 sm:px-6">
        <p className="label-broadcast text-gold">your locker</p>
        <h2 className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">
          Own the roster spot
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Name your player, pick a kit, and level up by solving, learning and
          showing up. Tenure ranks reward commitment — not a one-day grind.
        </p>
      </div>

      <div className="relative grid gap-6 p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
        <div className="flex flex-col items-center">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,rgb(var(--c-gold)/0.2),transparent_65%)]">
            <PlayerMark
              jersey={progress.jersey}
              kitTone={progress.kitTone}
              kitAccent={progress.kitAccent}
              rankTone={tenure.rank.tone}
              size={148}
            />
          </div>
          <p className="mt-3 font-display text-lg font-bold text-ink">{shown}</p>
          <p
            className={`font-mono text-[11px] font-bold uppercase tracking-wider ${
              tenure.rank.tone === "gold"
                ? "text-gold"
                : tenure.rank.tone === "turf"
                  ? "text-turf"
                  : "text-ice"
            }`}
          >
            Lv {tenure.level} · {tenure.rank.name}
          </p>
          <div className="mt-2 w-full">
            <div className="quest-bar">
              <span style={{ width: `${Math.round(tenure.progress * 100)}%` }} />
            </div>
            <p className="mt-1 text-center font-mono text-[10px] text-ink-muted">
              {tenure.next
                ? `${tenure.need} to ${tenure.next.name}`
                : "Top of the board"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Callsign
            </span>
            <div className="mt-1.5 flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Free Agent"
                maxLength={24}
                className="min-w-0 flex-1 rounded-xl border border-panel-border bg-night px-3 py-2.5 font-display text-sm font-bold text-ink outline-none focus:border-turf"
              />
              <button
                type="button"
                onClick={commitName}
                className="shrink-0 rounded-xl border border-turf/50 bg-turf/15 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:bg-turf/25"
              >
                Save
              </button>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Jersey #
              </span>
              <input
                inputMode="numeric"
                value={jerseyDraft}
                onChange={(e) => setJerseyDraft(e.target.value.replace(/\D/g, "").slice(0, 2))}
                onBlur={commitJersey}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                className="mt-1.5 w-full rounded-xl border border-panel-border bg-night px-3 py-2.5 font-mono text-sm font-bold text-ink outline-none focus:border-gold"
              />
            </label>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Kit colour
              </span>
              <div className="mt-1.5 flex gap-1.5">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => patchKit({ kitAccent: a.id })}
                    aria-pressed={progress.kitAccent === a.id}
                    title={a.label}
                    className={`h-10 flex-1 rounded-xl border font-mono text-[10px] font-bold uppercase tracking-wider ${
                      progress.kitAccent === a.id
                        ? a.id === "gold"
                          ? "border-gold bg-gold/20 text-gold"
                          : a.id === "turf"
                            ? "border-turf bg-turf/20 text-turf"
                            : "border-ice bg-ice/20 text-ice"
                        : "border-panel-border text-ink-muted hover:border-ink-muted"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Look
            </span>
            <div className="mt-1.5 flex gap-2">
              {[0, 1, 2, 3].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => patchKit({ kitTone: t })}
                  aria-pressed={progress.kitTone === t}
                  aria-label={`Look ${t + 1}`}
                  className={`flex h-14 w-14 items-center justify-center rounded-full border bg-night/50 ${
                    progress.kitTone === t ? "border-turf ring-2 ring-turf/40" : "border-panel-border"
                  }`}
                >
                  <PlayerMark
                    kitTone={t}
                    kitAccent={progress.kitAccent}
                    jersey={progress.jersey}
                    size={52}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-panel-border bg-night/30 px-3 py-2.5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Career ladder
            </p>
            <ol className="mt-2 flex flex-wrap gap-1.5">
              {RANKS.map((r) => {
                const on = r.id === tenure.rank.id;
                const earned = tenure.score >= r.min;
                return (
                  <li
                    key={r.id}
                    className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                      on
                        ? "border-gold bg-gold/20 text-gold"
                        : earned
                          ? "border-turf/40 text-turf"
                          : "border-panel-border text-ink-muted"
                    }`}
                    title={r.blurb}
                  >
                    {r.name}
                  </li>
                );
              })}
            </ol>
            <p className="mt-2 text-xs leading-snug text-ink-soft">{tenure.rank.blurb}</p>
            <p className="mt-1 font-mono text-[10px] text-ink-muted">
              {progress.daysActive} day{progress.daysActive === 1 ? "" : "s"} active ·{" "}
              {progress.solvedQuestions.length} questions · {progress.completedLessons.length}{" "}
              lessons
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
