"use client";

/**
 * Own your character — callsign, drafted team and tenure. Lives on /account
 * and feeds the nav chip + dashboard leaderboard placeholder.
 */

import { useEffect, useState } from "react";
import PlayerMark from "@/components/player-mark";
import { setCallSign, type Progress } from "@/lib/progress";
import { displayName, RANKS, tenureFrom } from "@/lib/tenure";
import { nflTeam } from "@/lib/nfl-team-avatars";

export default function LockerCard({
  progress: initial,
  onChange,
  onChooseTeam,
}: {
  progress: Progress;
  onChange?: (p: Progress) => void;
  onChooseTeam?: () => void;
}) {
  const [progress, setProgress] = useState(initial);
  const [name, setName] = useState(initial.username ?? "");

  useEffect(() => {
    setProgress(initial);
    setName(initial.username ?? "");
  }, [initial]);

  const tenure = tenureFrom(progress);
  const shown = displayName({ ...progress, username: name.trim() || null });
  const team = nflTeam(progress.favoriteTeam);

  function commitName() {
    const next = setCallSign(name);
    setProgress(next);
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
          Name your owl, draft your team, and level up by solving, learning and
          showing up. Tenure ranks reward commitment — not a one-day grind.
        </p>
      </div>

      <div className="relative grid gap-6 p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
        <div className="flex flex-col items-center">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,rgb(var(--c-gold)/0.2),transparent_65%)]">
            <PlayerMark
              jersey={progress.jersey}
              kitAccent={progress.kitAccent}
              rankTone={tenure.rank.tone}
              status={tenure.rank.name}
              favoriteTeam={progress.favoriteTeam}
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

          <div className="flex items-center justify-between gap-3 rounded-xl border border-panel-border bg-night/30 px-3 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Your team
              </p>
              <p className="mt-0.5 truncate font-display text-sm font-bold text-ink">
                {team?.name ?? "No team drafted"}
              </p>
            </div>
            <button
              type="button"
              onClick={onChooseTeam}
              className="shrink-0 rounded-xl border border-ice/50 bg-ice/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ice hover:bg-ice/20"
            >
              {team ? "Change team" : "Draft a team"}
            </button>
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
