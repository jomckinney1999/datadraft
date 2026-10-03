"use client";

/**
 * Own your character — callsign, drafted team and tenure. Lives on /account
 * and feeds the nav chip + dashboard leaderboard placeholder.
 */

import { useEffect, useState } from "react";
import PlayerMark from "@/components/player-mark";
import TeamOwlAvatar from "@/components/team-owl-avatar";
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
      className="surface relative scroll-mt-20 overflow-hidden rounded-[2rem] border border-gold/50 bg-panel shadow-[0_24px_80px_-24px_rgb(var(--c-gold)/0.48)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_8%_12%,rgb(var(--c-gold)/0.26),transparent_55%),radial-gradient(ellipse_60%_55%_at_100%_28%,rgb(var(--c-ice)/0.20),transparent_52%),radial-gradient(ellipse_65%_50%_at_55%_110%,rgb(var(--c-turf)/0.16),transparent_58%)]"
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-turf via-ice to-gold" />
      <div aria-hidden className="yard-lines pointer-events-none absolute inset-0 opacity-[0.07]" />

      <div className="relative flex flex-col gap-4 border-b border-gold/25 bg-night/35 px-5 pb-5 pt-7 sm:flex-row sm:items-end sm:justify-between sm:px-7">
        <div>
          <p className="label-broadcast text-gold">your locker · player profile</p>
          <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-ink sm:text-3xl">
            Own the roster spot
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            Your team, your callsign, your climb. Every rep moves this card up
            the depth chart.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-turf shadow-[0_0_10px_rgb(var(--c-turf)/0.9)]" />
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-gold">
            {team ? `${team.abbr} drafted` : "free agent"}
          </span>
        </div>
      </div>

      <div className="relative grid gap-5 p-4 sm:grid-cols-[12rem_1fr] sm:p-6 lg:gap-7 lg:p-7">
        <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-gold/35 bg-night/55 px-4 pb-5 pt-4 shadow-[inset_0_1px_0_rgb(var(--c-ink)/0.08),0_18px_40px_-24px_rgb(var(--c-gold)/0.7)]">
          <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-gold/15 to-transparent" />
          <p className="relative mb-2 font-mono text-[9px] font-black uppercase tracking-[0.22em] text-gold/80">
            DataDraft player card
          </p>
          <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,rgb(var(--c-gold)/0.35),rgb(var(--c-ice)/0.12)_45%,transparent_70%)]">
            <span aria-hidden className="absolute inset-1 rounded-full border border-gold/25" />
            <span aria-hidden className="absolute inset-0 rounded-full shadow-[0_0_34px_rgb(var(--c-ice)/0.3)]" />
            <PlayerMark
              jersey={progress.jersey}
              kitAccent={progress.kitAccent}
              rankTone={tenure.rank.tone}
              status={tenure.rank.name}
              favoriteTeam={progress.favoriteTeam}
              size={164}
            />
          </div>
          <p className="mt-3 max-w-full truncate font-display text-xl font-black text-ink">{shown}</p>
          <p
            className={`mt-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] ${
              tenure.rank.tone === "gold"
                ? "text-gold"
                : tenure.rank.tone === "turf"
                  ? "text-turf"
                  : "text-ice"
            }`}
          >
            Lv {tenure.level} · {tenure.rank.name}
          </p>
          <div className="mt-4 w-full rounded-xl border border-panel-border/80 bg-panel/65 p-3">
            <div className="mb-2 flex items-center justify-between font-mono text-[8px] font-bold uppercase tracking-widest text-ink-muted">
              <span>Tenure</span>
              <span>{Math.round(tenure.progress * 100)}%</span>
            </div>
            <div className="quest-bar !h-2">
              <span style={{ width: `${Math.round(tenure.progress * 100)}%` }} />
            </div>
            <p className="mt-2 text-center font-mono text-[9px] font-bold uppercase tracking-wide text-ink-muted">
              {tenure.next
                ? `${tenure.need} to ${tenure.next.name}`
                : "Top of the board"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block rounded-2xl border border-panel-border bg-night/45 p-4 shadow-[inset_0_1px_0_rgb(var(--c-ink)/0.05)]">
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-ice">
              01 · Callsign
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
                className="min-w-0 flex-1 rounded-xl border border-panel-border bg-panel px-3 py-2.5 font-display text-base font-black text-ink outline-none transition focus:border-turf focus:shadow-[0_0_0_3px_rgb(var(--c-turf)/0.12)]"
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

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-ice/30 bg-gradient-to-r from-ice/10 via-night/45 to-night/45 p-4 shadow-[inset_0_1px_0_rgb(var(--c-ink)/0.05)]">
            <div className="flex min-w-0 items-center gap-3">
              {team ? (
                <TeamOwlAvatar
                  team={team.abbr}
                  labelled
                  className="h-12 w-12 shrink-0 rounded-xl border-2 border-ice/45 shadow-[0_0_18px_rgb(var(--c-ice)/0.22)]"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-ice/35 bg-ice/10 font-display text-sm font-black text-ice">
                  —
                </div>
              )}
              <div className="min-w-0">
                <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-ice">
                  02 · Your team
                </p>
                <p className="mt-0.5 truncate font-display text-base font-black text-ink">
                  {team?.name ?? "No team drafted"}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {team ? `${team.nick} owl active everywhere` : "Choose the owl that represents you"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onChooseTeam}
              className="shrink-0 rounded-xl border border-ice/50 bg-ice/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ice hover:bg-ice/20"
            >
              {team ? "Change team" : "Draft a team"}
            </button>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-night/45 p-4 shadow-[inset_0_1px_0_rgb(var(--c-ink)/0.05)]">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-gold">
                03 · Career ladder
              </p>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-[8px] font-black uppercase tracking-wider text-gold">
                {tenure.rank.name}
              </span>
            </div>
            <p className="mt-2 font-display text-lg font-black text-ink">
              {tenure.next ? `Chasing ${tenure.next.name}` : "Top of the board"}
            </p>
            <ol className="mt-3 flex flex-wrap gap-1.5">
              {RANKS.map((r) => {
                const on = r.id === tenure.rank.id;
                const earned = tenure.score >= r.min;
                return (
                  <li
                    key={r.id}
                    className={`rounded-full border px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-wider transition ${
                      on
                        ? "border-gold bg-gold/20 text-gold shadow-[0_0_12px_rgb(var(--c-gold)/0.2)]"
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
            <p className="mt-3 text-sm font-medium leading-snug text-ink-soft">{tenure.rank.blurb}</p>
            <p className="mt-2 border-t border-panel-border/70 pt-2 font-mono text-[9px] uppercase tracking-wide text-ink-muted">
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
