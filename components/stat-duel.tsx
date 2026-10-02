"use client";

/**
 * The Stat Duel, played: five rounds, tap who had more, see both numbers and
 * the SQL that proves it, run that SQL yourself, then share a result grid.
 *
 * The rounds arrive computed (lib/stat-duel.ts, in a server component), so
 * this file is only the game. Progress for the day lives in this browser —
 * `sqlsports.duel.v1` holds today's picks so a reload doesn't reset you, and
 * `sqlsports.duel.streak.v1` counts days in a row. "Run it yourself" loads
 * the same in-browser database as the questions, and only when asked.
 *
 * Keys: ← / 1 picks the left card, → / 2 the right, Enter moves on.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Database, QueryExecResult } from "sql.js";
import type { Duel, DuelRound, DuelSide } from "@/lib/stat-duel";
import { PLAYER_HEADSHOTS } from "@/lib/player-headshots.generated";
import Headshot from "@/components/headshot";
import TeamLogo from "@/components/team-logo";
import Coach from "@/components/coach";
import CodeEditor from "@/components/code-editor";
import ChartIt from "@/components/chart-it";
import { NFLVERSE_CREDIT } from "@/lib/chart";
import { SITE_URL } from "@/lib/site";

const DAY_KEY = "sqlsports.duel.v1";
const STREAK_KEY = "sqlsports.duel.streak.v1";

type Saved = { day: string; picks: (0 | 1)[] };
type Streak = { last: string; streak: number };

const read = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage refused: the game still plays, it just won't remember.
  }
};

const winnerOf = (r: DuelRound): 0 | 1 =>
  (r.higherWins ? r.a.value > r.b.value : r.a.value < r.b.value) ? 0 : 1;

const dayBefore = (day: string) =>
  new Date(Date.parse(`${day}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);

const prettyDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default function StatDuel({
  duel,
  qotdId,
}: {
  duel: Duel;
  /** Today's SQL question — where a finished duel sends you next. */
  qotdId: string;
}) {
  const [picks, setPicks] = useState<(0 | 1)[]>([]);
  const [current, setCurrent] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [streak, setStreak] = useState(0);
  const total = duel.rounds.length;
  const finished = picks.length >= total;

  useEffect(() => {
    const saved = read<Saved>(DAY_KEY);
    if (saved && saved.day === duel.day) {
      setPicks(saved.picks);
      // Finished earlier today: open on the score, not on round five.
      setCurrent(saved.picks.length >= total ? total : saved.picks.length);
    }
    const s = read<Streak>(STREAK_KEY);
    if (s && (s.last === duel.day || s.last === dayBefore(duel.day))) setStreak(s.streak);
    setHydrated(true);
  }, [duel.day, total]);

  function pick(side: 0 | 1) {
    if (picks.length !== current || finished) return;
    const next = [...picks, side];
    setPicks(next);
    write(DAY_KEY, { day: duel.day, picks: next } satisfies Saved);
    if (next.length === total) {
      const s = read<Streak>(STREAK_KEY);
      const run = s && s.last === dayBefore(duel.day) ? s.streak + 1 : s && s.last === duel.day ? s.streak : 1;
      write(STREAK_KEY, { last: duel.day, streak: run } satisfies Streak);
      setStreak(run);
    }
  }

  function advance() {
    if (current < total - 1) setCurrent(current + 1);
    else setCurrent(total);
  }

  // Keyboard: pick with ←/→ (or 1/2), continue with Enter. Never while typing.
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable)) return;
    // A focused button or link already acts on Enter; acting here too would
    // skip a round.
    if (e.key === "Enter" && t && (t.tagName === "BUTTON" || t.tagName === "A")) return;
    const answered = picks.length > current;
    if (!answered && current < total) {
      if (e.key === "ArrowLeft" || e.key === "1") pick(0);
      if (e.key === "ArrowRight" || e.key === "2") pick(1);
    } else if (e.key === "Enter" && current < total) {
      advance();
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const score = picks.filter((p, i) => duel.rounds[i] && p === winnerOf(duel.rounds[i])).length;
  const showSummary = hydrated && finished && current >= total;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="text-center">
        <p className="label-broadcast text-gold">stat duel #{duel.number} · {prettyDay(duel.day)}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Who had more?</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          Five head-to-heads on real NFL numbers. No code needed — but every answer comes with the SQL that proves it.
          Same five for everyone today.
        </p>
      </header>

      <ol className="mt-6 flex justify-center gap-2" aria-label="Rounds">
        {duel.rounds.map((r, i) => {
          const done = i < picks.length;
          const right = done && picks[i] === winnerOf(r);
          return (
            <li key={r.n}>
              <button
                type="button"
                onClick={() => done && setCurrent(i)}
                disabled={!done}
                aria-label={`Round ${r.n}${done ? (right ? ", right" : ", wrong") : ""}`}
                className={`h-3 w-9 rounded-full border transition-colors ${
                  i === current && !showSummary ? "border-ink" : "border-night"
                } ${done ? (right ? "bg-turf" : "bg-gold") : "bg-panel"}`}
              />
            </li>
          );
        })}
      </ol>

      {!showSummary && duel.rounds[current] && (
        <Round
          key={duel.rounds[current].n}
          round={duel.rounds[current]}
          total={total}
          picked={picks[current]}
          onPick={pick}
          onNext={advance}
          last={current === total - 1}
        />
      )}

      {showSummary && (
        <Summary duel={duel} picks={picks} score={score} streak={streak} qotdId={qotdId} onReview={(i) => setCurrent(i)} />
      )}
    </div>
  );
}

function Round({
  round,
  total,
  picked,
  onPick,
  onNext,
  last,
}: {
  round: DuelRound;
  total: number;
  picked: 0 | 1 | undefined;
  onPick: (s: 0 | 1) => void;
  onNext: () => void;
  last: boolean;
}) {
  const revealed = picked !== undefined;
  const win = winnerOf(round);
  const right = revealed && picked === win;

  return (
    <section className="mt-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="status-chip">Round {round.n} of {total}</span>
        <span className="status-chip">{round.scope}</span>
      </div>
      <h2 className="mx-auto mt-3 max-w-xl text-center font-display text-xl font-bold text-ink sm:text-2xl">
        {round.prompt}
      </h2>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-4">
        <Card side={round.a} round={round} index={0} picked={picked} win={win} onPick={onPick} />
        <div className="flex items-center">
          <span className="rounded-full border-2 border-night bg-gold px-2 py-1 font-display text-xs font-bold text-night shadow-[0_3px_0_0_rgb(var(--c-night))]">
            VS
          </span>
        </div>
        <Card side={round.b} round={round} index={1} picked={picked} win={win} onPick={onPick} />
      </div>
      {!revealed && (
        <p className="mt-3 hidden text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted sm:block">
          ← or → to pick
        </p>
      )}

      {revealed && (
        <div className="mt-6">
          <div className="flex items-center justify-center gap-3">
            <Coach mood={right ? "cheer" : "sad"} size={56} />
            <p className={`font-display text-lg font-bold ${right ? "text-turf" : "text-gold"}`}>
              {right ? "Called it." : "Not this time."}{" "}
              <span className="font-sans text-sm font-normal text-ink-soft">
                {(win === 0 ? round.a : round.b).name} by {formatGap(round)}.
              </span>
            </p>
          </div>
          <ProveIt round={round} />
          <div className="mt-5 flex justify-center">
            <button type="button" onClick={onNext} className="press btn-turf" aria-keyshortcuts="Enter">
              {last ? "See your score →" : "Next round →"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function formatGap(r: DuelRound): string {
  const gap = Math.abs(r.a.value - r.b.value);
  return `${gap.toFixed(r.decimals)} ${r.unit.replace(/, best game$/, "").replace(/ that week$/, "")}`;
}

function Card({
  side,
  round,
  index,
  picked,
  win,
  onPick,
}: {
  side: DuelSide;
  round: DuelRound;
  index: 0 | 1;
  picked: 0 | 1 | undefined;
  win: 0 | 1;
  onPick: (s: 0 | 1) => void;
}) {
  const revealed = picked !== undefined;
  const isWinner = revealed && win === index;
  const isPick = picked === index;
  const shot = side.kind === "player" ? PLAYER_HEADSHOTS[side.name]?.url ?? null : null;

  return (
    <button
      type="button"
      onClick={() => onPick(index)}
      disabled={revealed}
      aria-pressed={isPick}
      aria-keyshortcuts={index === 0 ? "ArrowLeft" : "ArrowRight"}
      className={`lift surface relative flex flex-col items-center rounded-2xl border-2 bg-panel px-3 py-5 text-center transition-colors sm:px-5 ${
        !revealed
          ? "border-panel-border hover:border-gold/60"
          : isWinner
            ? "border-turf"
            : "border-panel-border opacity-80"
      }`}
    >
      {revealed && isPick && (
        <span
          className={`absolute -top-3 rounded-full border-2 border-night px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
            isWinner ? "bg-turf text-night" : "bg-gold text-night"
          }`}
        >
          your pick
        </span>
      )}
      {side.kind === "player" ? (
        <Headshot name={side.name} src={shot} size={72} className="border-2" />
      ) : (
        <TeamLogo abbr={side.team} size={64} showCode={false} />
      )}
      <span className="mt-3 font-display text-base font-bold leading-tight text-ink sm:text-lg">{side.name}</span>
      <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
        {side.kind === "player" ? `${side.position} · ${side.team}` : "team"}
      </span>
      <span
        className={`mt-3 min-h-[2.75rem] font-display text-3xl font-bold tabular-nums sm:text-4xl ${
          revealed ? (isWinner ? "text-turf" : "text-ink-soft") : "text-ink-muted/40"
        }`}
        aria-hidden={!revealed}
      >
        {revealed ? side.value.toFixed(round.decimals) : "?"}
      </span>
      {revealed && <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">{round.unit}</span>}
      {revealed && isWinner && (
        <span className="mt-2 rounded-full bg-turf/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-turf">
          {round.higherWins ? "more" : "fewer"} ✓
        </span>
      )}
    </button>
  );
}

/** The SQL that proves the round, and a way to run (and change) it. */
function ProveIt({ round }: { round: DuelRound }) {
  const dbRef = useRef<Database | null>(null);
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sql, setSql] = useState(round.sql);
  const [result, setResult] = useState<QueryExecResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => dbRef.current?.close(), []);

  function exec(text: string) {
    const db = dbRef.current;
    if (!db) return;
    setError(null);
    try {
      const res = db.exec(text);
      setResult(res[res.length - 1] ?? { columns: [], values: [] });
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function goLive() {
    setBusy(true);
    try {
      const [SQL, data] = await Promise.all([
        import("sql.js").then((m) => m.default({ locateFile: () => "/sql-wasm.wasm" })),
        import("@/lib/fantasy-data"),
      ]);
      const db = new SQL.Database();
      db.run(data.buildSeedSql());
      dbRef.current = db;
      setLive(true);
      exec(sql);
    } catch {
      setError("The SQL engine didn't load. Try a refresh.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface mt-5 rounded-2xl border border-panel-border bg-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="label-broadcast text-ice">prove it</p>
        <p className="font-mono text-[10px] text-ink-muted">The query behind this round, on the same real data the questions use</p>
      </div>
      <div className="mt-2 overflow-hidden rounded-xl border border-panel-border">
        <CodeEditor value={sql} onChange={setSql} lang="sql" rows={Math.min(12, sql.split("\n").length + 1)} ariaLabel="The SQL behind this round" disabled={!live} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!live ? (
          <button type="button" onClick={goLive} disabled={busy} className="press btn-gold disabled:opacity-60">
            {busy ? "Loading the database…" : "Run it yourself"}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => exec(sql)} className="press btn-turf">
              Run
            </button>
            {result && (
              <ChartIt
                grid={result}
                title={round.prompt}
                subtitle={`${round.scope} · today's DataDraft Stat Duel`}
                credit={NFLVERSE_CREDIT}
                shareUrl={`${SITE_URL}/questions/duel`}
                shareText="Settled it with one SQL query."
              />
            )}
            <span className="font-mono text-[10px] text-ink-muted">Change it — try a third player, or another season.</span>
          </>
        )}
      </div>
      {error && <p className="mt-3 font-mono text-[12px] text-gold">⚠ {error}</p>}
      {result && result.columns.length > 0 && (
        <div className="mt-3 max-h-56 overflow-auto rounded-lg border border-panel-border">
          <table className="w-full text-left font-mono text-[12px]">
            <thead className="sticky top-0 bg-panel">
              <tr className="border-b border-panel-border text-ink-muted">
                {result.columns.map((c) => (
                  <th key={c} className="whitespace-nowrap px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.values.slice(0, 100).map((row, i) => (
                <tr key={i} className="border-b border-panel-border/50 text-ink">
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-1.5">
                      {cell === null ? <span className="text-ink-muted">NULL</span> : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Summary({
  duel,
  picks,
  score,
  streak,
  qotdId,
  onReview,
}: {
  duel: Duel;
  picks: (0 | 1)[];
  score: number;
  streak: number;
  qotdId: string;
  onReview: (i: number) => void;
}) {
  const [note, setNote] = useState<string | null>(null);
  const squares = duel.rounds.map((r, i) => (picks[i] === winnerOf(r) ? "🟩" : "🟥")).join("");
  const link = `${SITE_URL}/questions/duel`;
  const text = `DataDraft Stat Duel #${duel.number} · ${score}/${duel.rounds.length}\n${squares}\n${link}`;
  const total = duel.rounds.length;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      // Cancelled, or not allowed — fall through to copying.
    }
    try {
      await navigator.clipboard.writeText(text);
      setNote("Copied. Paste it in the group chat.");
    } catch {
      setNote("Couldn't copy. Select the grid above instead.");
    }
  }

  const verdict =
    score === total ? "A perfect duel." : score >= total - 1 ? "Nearly perfect." : score >= total / 2 ? "Solid." : "Rough day at the office.";

  return (
    <section className="mt-6 text-center" aria-live="polite">
      <div className="surface mx-auto max-w-md rounded-2xl border border-panel-border bg-panel p-6">
        <Coach mood={score >= total - 1 ? "cheer" : score >= total / 2 ? "happy" : "think"} size={88} className="mx-auto" />
        <p className="mt-3 font-display text-5xl font-bold text-ink">
          {score}
          <span className="text-ink-muted">/{total}</span>
        </p>
        <p
          className={`mt-1 font-display text-lg font-bold ${
            score >= total - 1 ? "text-turf" : score >= total / 2 ? "text-ink" : "text-gold"
          }`}
        >
          {verdict}
        </p>
        <p className="mt-3 select-all font-mono text-2xl tracking-[0.2em]" aria-label={`${score} of ${total} right`}>
          {squares}
        </p>
        {streak > 1 && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-gold">{streak} days in a row</p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={share} className="press btn-gold">
            Share result
          </button>
          <Link href={`/questions/${qotdId}`} className="press btn-turf">
            Now today&apos;s SQL question →
          </Link>
        </div>
        <p className="mt-2 min-h-[1rem] font-mono text-[10px] text-ink-muted" aria-live="polite">
          {note ?? "Five new duels tomorrow, at midnight Eastern."}
        </p>
      </div>

      <ol className="mx-auto mt-6 max-w-xl space-y-2 text-left">
        {duel.rounds.map((r, i) => {
          const right = picks[i] === winnerOf(r);
          return (
            <li key={r.n}>
              <button
                type="button"
                onClick={() => onReview(i)}
                className="flex w-full items-center gap-3 rounded-xl border border-panel-border bg-panel/50 px-4 py-2.5 text-left transition-colors hover:border-turf/40"
              >
                <span aria-hidden>{right ? "🟩" : "🟥"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{r.prompt}</span>
                  <span className="block font-mono text-[10px] text-ink-muted">
                    {r.a.name} {r.a.value.toFixed(r.decimals)} · {r.b.name} {r.b.value.toFixed(r.decimals)} · {r.scope}
                  </span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">see SQL</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
