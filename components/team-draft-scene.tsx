"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Coach from "@/components/coach";
import TeamOwlAvatar from "@/components/team-owl-avatar";
import { useTypewriter } from "@/components/cutscene";
import {
  NFL_TEAM_AVATARS,
  nflTeam,
  randomNflTeam,
  type NflTeamAbbr,
} from "@/lib/nfl-team-avatars";

type Phase = "title" | "briefing" | "draft";

const LINE =
  "Every locker needs colors. Pick the team you ride with, or let the board make the call. This owl becomes your mark everywhere you show up.";

export default function TeamDraftScene({
  open,
  initialTeam = null,
  required = true,
  onConfirm,
  onClose,
}: {
  open: boolean;
  initialTeam?: NflTeamAbbr | null;
  /** First-account draft cannot be dismissed; locker replays can. */
  required?: boolean;
  onConfirm: (team: NflTeamAbbr) => Promise<void> | void;
  onClose?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("title");
  const [selected, setSelected] = useState<NflTeamAbbr | null>(initialTeam);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { shown, typing, finish } = useTypewriter(LINE, open && phase === "briefing");
  const picked = nflTeam(selected);

  const teams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? NFL_TEAM_AVATARS.filter(
          (team) =>
            team.name.toLowerCase().includes(q) ||
            team.nick.toLowerCase().includes(q) ||
            team.abbr.toLowerCase().includes(q),
        )
      : NFL_TEAM_AVATARS;
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setPhase("title");
    setSelected(initialTeam);
    setQuery("");
    setSaving(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, initialTeam]);

  useEffect(() => {
    if (!open || phase !== "title") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => setPhase("briefing"), reduced ? 450 : 1300);
    return () => window.clearTimeout(id);
  }, [open, phase]);

  const advance = useCallback(() => {
    if (phase === "title") return setPhase("briefing");
    if (phase === "briefing") {
      if (typing) finish();
      else setPhase("draft");
    }
  }, [phase, typing, finish]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typingInField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.getAttribute("contenteditable") === "true";
      if (event.key === "Escape") {
        event.preventDefault();
        if (phase !== "draft") setPhase("draft");
        else if (!required) onClose?.();
        return;
      }
      if (typingInField || phase === "draft") return;
      if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, required, onClose, advance]);

  async function confirm() {
    if (!selected || saving) return;
    setSaving(true);
    await onConfirm(selected);
    setSaving(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-night-100/95 backdrop-blur-sm">
      <div aria-hidden className="cutscene-bar cutscene-bar-top absolute inset-x-0 top-0 h-[7vh]" />
      <div aria-hidden className="cutscene-bar cutscene-bar-bottom absolute inset-x-0 bottom-0 h-[7vh]" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Draft your NFL team"
        tabIndex={-1}
        className="relative flex max-h-[86svh] w-full max-w-6xl flex-col px-3 sm:px-5"
      >
        {phase !== "draft" && (
          <button
            type="button"
            onClick={() => setPhase("draft")}
            className="absolute -top-8 right-4 z-10 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            Skip intro ⏭
          </button>
        )}

        {phase === "title" && (
          <div className="cutscene-title text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
              Account created · draft night
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-6xl">
              Draft your colors
            </h1>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Press any key
            </p>
          </div>
        )}

        {phase === "briefing" && (
          <div className="cutscene-pop mx-auto flex w-full max-w-3xl flex-col items-center gap-4 sm:flex-row sm:items-end">
            <div className="flex shrink-0 flex-col items-center">
              <Coach mood={typing ? "whistle" : "happy"} size={112} talking={typing} />
              <span className="mt-1 rounded-full border border-turf/60 bg-turf/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-turf">
                Coach Blitz
              </span>
            </div>
            <div className="cutscene-bubble relative min-h-[8rem] w-full rounded-2xl border-[3px] border-night bg-ink px-5 py-4 text-night">
              <p aria-hidden className="font-display text-lg font-semibold leading-snug sm:text-xl">
                {LINE.slice(0, shown)}
                {typing && <span className="cutscene-caret">▍</span>}
              </p>
              <p className="sr-only" aria-live="polite">
                Coach Blitz: {LINE}
              </p>
            </div>
            <button type="button" onClick={advance} className="press btn-gold shrink-0 !px-4 !py-2 text-sm">
              {typing ? "Show all" : "Draft board ▸"}
            </button>
          </div>
        )}

        {phase === "draft" && (
          <div className="surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gold/45 bg-panel shadow-scoreboard-gold">
            <header className="flex flex-col gap-3 border-b border-panel-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <p className="label-broadcast text-gold">32 teams · one locker</p>
                <h1 className="font-display text-2xl font-bold text-ink">Who do you ride with?</h1>
              </div>
              <div className="flex gap-2">
                <label className="sr-only" htmlFor="team-search">Find a team</label>
                <input
                  id="team-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find a team"
                  className="min-w-0 rounded-xl border border-panel-border bg-night px-3 py-2 font-mono text-xs text-ink outline-none placeholder:text-ink-muted focus:border-ice"
                />
                <button
                  type="button"
                  onClick={() => setSelected(randomNflTeam().abbr)}
                  className="shrink-0 rounded-xl border border-ice/50 bg-ice/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ice hover:bg-ice/20"
                >
                  Surprise me
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {teams.map((team) => {
                  const active = selected === team.abbr;
                  return (
                    <button
                      key={team.abbr}
                      type="button"
                      onClick={() => setSelected(team.abbr)}
                      aria-pressed={active}
                      className={`group rounded-xl border p-1.5 text-center transition ${
                        active
                          ? "border-gold bg-gold/15 shadow-[0_0_18px_rgb(var(--c-gold)/0.28)]"
                          : "border-panel-border bg-night/30 hover:border-ice/60 hover:bg-ice/5"
                      }`}
                    >
                      <TeamOwlAvatar
                        team={team.abbr}
                        className="mx-auto aspect-square w-full rounded-lg border border-night/60"
                      />
                      <span className={`mt-1 block truncate font-mono text-[9px] font-bold uppercase tracking-wide ${active ? "text-gold" : "text-ink-soft"}`}>
                        {team.abbr}
                      </span>
                      <span className="hidden truncate text-[10px] text-ink-muted sm:block">{team.nick}</span>
                    </button>
                  );
                })}
              </div>
              {teams.length === 0 && (
                <p className="py-10 text-center text-sm text-ink-muted">No team matches that search.</p>
              )}
            </div>

            <footer className="flex flex-col gap-3 border-t border-panel-border bg-night/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                {picked ? (
                  <>
                    <TeamOwlAvatar team={picked.abbr} className="h-12 w-12 shrink-0 rounded-full border-2 border-gold" />
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold text-ink">{picked.name}</p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-gold">Your owl · your colors</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">Pick a team—or let Surprise me decide.</p>
                )}
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2">
                {!required && onClose && (
                  <button type="button" onClick={onClose} className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink">
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={confirm}
                  disabled={!selected || saving}
                  className="press btn-gold !px-4 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "Drafting…" : picked ? `Draft ${picked.nick}` : "Choose a team"}
                </button>
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
