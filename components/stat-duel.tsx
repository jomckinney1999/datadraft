"use client";

/**
 * The Stat Duel, played: five rounds, tap who had more, see both numbers and
 * the SQL that proves it, run that SQL yourself, then share a result grid.
 *
 * The rounds arrive computed (lib/stat-duel.ts, in a server component), so
 * this file is only the game. Progress for the day lives in this browser —
 * `sqlsports.duel.v1` holds today's picks so a reload doesn't reset you, and
 * `sqlsports.duel.history.v1` keeps every day's score, from which the
 * Wordle-style stats — played, average, streak, best streak, spread — are
 * recomputed rather than counted, so they can't drift. "Run it yourself"
 * loads the same in-browser database as the questions, and only when asked.
 *
 * The share text carries a challenge link (`?r=1-GGRGG`: which rounds were
 * right, never which side was picked), and a friend who opens it sees the
 * score to beat. The link's preview card is drawn by /api/og/duel.
 *
 * Keys: ← / 1 picks the left card, → / 2 the right, Enter moves on.
 *
 * The reveal is the fun part, so it's staged (2026-10-24): both numbers
 * count up like a scoreboard, a tug-of-war bar shows how close it was
 * ("Photo finish" to "Blowout"), the gap is put in football terms (yards in
 * football fields and first downs, points in touchdowns) and a run of right
 * calls shows as a streak. All of it is arithmetic on the two numbers shown,
 * never a fact from anywhere else. The counting is off under reduced motion.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Database, QueryExecResult } from "sql.js";
import type { Duel, DuelCategory, DuelRound, DuelSide } from "@/lib/stat-duel";
import { seedSql } from "@/lib/roll-call-meta";
import { PLAYER_HEADSHOTS } from "@/lib/player-headshots.generated";
import Headshot from "@/components/headshot";
import TeamLogo from "@/components/team-logo";
import Coach, { celebrationFor } from "@/components/coach";
import CodeEditor from "@/components/code-editor";
import ChartIt from "@/components/chart-it";
import { NFLVERSE_CREDIT } from "@/lib/chart";
import { SITE_URL } from "@/lib/site";
import {
  encodeDuelResult,
  formatCountdown,
  msUntilNextLeagueDay,
  shareText,
  squares,
  type DuelResult,
  withIdentity,
} from "@/lib/daily-share";
import { loadProgress } from "@/lib/progress";
import { shareIdentity } from "@/lib/tenure";
import { gameMoment } from "@/lib/big-moments";
import { useBigMoments } from "@/components/big-moment";

const DAY_KEY = "sqlsports.duel.v1";
const HISTORY_KEY = "sqlsports.duel.history.v1";

/**
 * `rounds` fingerprints the matchups the picks answered. The lesson data
 * refreshes on its own once a week (.github/workflows/weekly-data.yml), and
 * a refresh that lands mid-day can change today's rounds; saved picks are
 * only left/right, so without this a reload would score them against
 * matchups nobody saw. A mismatch starts the new duel fresh.
 */
type Saved = { day: string; picks: (0 | 1)[]; rounds?: string };
const fingerprint = (rounds: DuelRound[]) =>
  rounds.map((r) => `${r.prompt}|${r.a.name}=${r.a.value}|${r.b.name}=${r.b.value}`).join(";");
/** Score by day, for every duel finished in this browser. */
type History = Record<string, number>;

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

/** Each category's tag: an icon and one of the three accents. */
const CATEGORY: Record<DuelCategory, { icon: string; cls: string }> = {
  Fantasy: { icon: "📈", cls: "border-ice/40 bg-ice/10 text-ice" },
  Passing: { icon: "🎯", cls: "border-ice/40 bg-ice/10 text-ice" },
  Rushing: { icon: "💨", cls: "border-turf/40 bg-turf/10 text-turf" },
  Receiving: { icon: "🙌", cls: "border-gold/40 bg-gold/10 text-gold" },
  Touchdowns: { icon: "🏈", cls: "border-turf/40 bg-turf/10 text-turf" },
  "Big games": { icon: "💥", cls: "border-gold/40 bg-gold/10 text-gold" },
  "Team scoring": { icon: "🏟️", cls: "border-ice/40 bg-ice/10 text-ice" },
  "Team records": { icon: "🏆", cls: "border-gold/40 bg-gold/10 text-gold" },
  Clutch: { icon: "⏱️", cls: "border-turf/40 bg-turf/10 text-turf" },
};

function CategoryTag({ category }: { category: DuelCategory }) {
  const c = CATEGORY[category] ?? CATEGORY.Fantasy;
  return (
    <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${c.cls}`}>
      <span aria-hidden>{c.icon}</span> {category}
    </span>
  );
}

/** Counts from 0 up to `target` like a scoreboard when `run` turns on. */
function useCountUp(target: number, run: boolean): number {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (!run || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 650);
      setValue(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return value;
}

/** How far apart the two were, relative to the bigger one. */
const closeness = (r: DuelRound) =>
  Math.abs(r.a.value - r.b.value) / Math.max(Math.abs(r.a.value), Math.abs(r.b.value), 1);

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The gap, in football terms. Arithmetic on the two numbers, nothing else. */
function gapLine(r: DuelRound): string | null {
  const gap = Math.abs(r.a.value - r.b.value);
  if (/yds/.test(r.unit)) {
    if (gap >= 100) return `That's ${(gap / 100).toFixed(1)} football fields apart.`;
    if (gap >= 10) return `${plural(Math.floor(gap / 10), "first down's", "first downs'")} worth of yards.`;
    return "Less than a first down in it.";
  }
  if (/touchdowns|TD passes/.test(r.unit)) return gap === 1 ? "One trip to the end zone apart." : `${gap} trips to the end zone apart.`;
  if (/PPR/.test(r.unit)) {
    if (gap < 1) return "Less than a point in it.";
    if (gap >= 6) return `About ${plural(Math.round(gap / 6), "touchdown's", "touchdowns'")} worth of fantasy points.`;
    return null;
  }
  if (/^pts|point differential/.test(r.unit) && gap >= 7) {
    return `About ${plural(Math.round(gap / 7), "touchdown", "touchdowns")} apart over the season.`;
  }
  return null;
}

const prettyDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default function StatDuel({
  duel,
  qotdId,
  challenge,
}: {
  duel: Duel;
  /** Today's SQL question — where a finished duel sends you next. */
  qotdId: string;
  /** A friend's result, from the link they shared. */
  challenge: DuelResult | null;
}) {
  const [picks, setPicks] = useState<(0 | 1)[]>([]);
  const [current, setCurrent] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [history, setHistory] = useState<History>({});
  const total = duel.rounds.length;
  const moments = useBigMoments();
  const celebrated = useRef(false);
  const finished = picks.length >= total;
  const scoreOf = (p: (0 | 1)[]) => p.filter((x, i) => duel.rounds[i] && x === winnerOf(duel.rounds[i])).length;

  useEffect(() => {
    const saved = read<Saved>(DAY_KEY);
    const h = read<History>(HISTORY_KEY) ?? {};
    if (saved && saved.day === duel.day && (saved.rounds === undefined || saved.rounds === fingerprint(duel.rounds))) {
      setPicks(saved.picks);
      // Finished earlier today: open on the score, not on round five.
      setCurrent(saved.picks.length >= total ? total : saved.picks.length);
      if (saved.picks.length >= total && h[duel.day] === undefined) {
        h[duel.day] = scoreOf(saved.picks);
        write(HISTORY_KEY, h);
      }
    }
    setHistory(h);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duel.day, total]);

  function pick(side: 0 | 1) {
    if (picks.length !== current || finished) return;
    const next = [...picks, side];
    setPicks(next);
    write(DAY_KEY, { day: duel.day, picks: next, rounds: fingerprint(duel.rounds) } satisfies Saved);
    if (next.length === total) {
      const h = { ...(read<History>(HISTORY_KEY) ?? {}), [duel.day]: scoreOf(next) };
      write(HISTORY_KEY, h);
      setHistory(h);
    }
  }

  function advance() {
    if (current < total - 1) setCurrent(current + 1);
    else {
      setCurrent(total);
      // Five for five gets the ref, once: not on a review, not on a reload.
      if (!celebrated.current && picks.length === total && scoreOf(picks) === total) {
        celebrated.current = true;
        moments.play(gameMoment("touchdown", `duel:${duel.day}`, "Perfect duel!", `Stat Duel #${duel.number} · ${total} for ${total}`));
      }
    }
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
  /** Right calls in a row going into the round on screen. */
  let streak = 0;
  for (let i = Math.min(current, picks.length) - 1; i >= 0 && picks[i] === winnerOf(duel.rounds[i]); i--) streak++;

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

      {challenge && !(hydrated && finished) && (
        <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-3 rounded-2xl border-2 border-gold/60 bg-gold/10 px-4 py-3 text-center">
          <span className="font-mono text-lg tracking-[0.15em]" aria-hidden>
            {squares(challenge.grid)}
          </span>
          <span className="text-sm text-ink">
            {challenge.number === duel.number ? (
              <>
                A friend scored <strong className="text-gold">{challenge.score}/5</strong> on today&apos;s duel. Your turn.
              </>
            ) : (
              <>
                A friend scored <strong className="text-gold">{challenge.score}/5</strong> on Stat Duel #{challenge.number}.
                Today&apos;s is #{duel.number} — beat it.
              </>
            )}
          </span>
        </div>
      )}

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
          streak={streak}
          picked={picks[current]}
          onPick={pick}
          onNext={advance}
          last={current === total - 1}
        />
      )}

      {showSummary && (
        <Summary
          duel={duel}
          picks={picks}
          score={score}
          history={history}
          challenge={challenge}
          qotdId={qotdId}
          onReview={(i) => setCurrent(i)}
        />
      )}
      {moments.node}
    </div>
  );
}

function Round({
  round,
  total,
  streak,
  picked,
  onPick,
  onNext,
  last,
}: {
  round: DuelRound;
  total: number;
  streak: number;
  picked: 0 | 1 | undefined;
  onPick: (s: 0 | 1) => void;
  onNext: () => void;
  last: boolean;
}) {
  const revealed = picked !== undefined;
  const win = winnerOf(round);
  const right = revealed && picked === win;
  // Only a pick made just now counts up; reviewing an old round shows it settled.
  const [fresh, setFresh] = useState(false);
  const choose = (s: 0 | 1) => {
    if (revealed) return;
    setFresh(true);
    onPick(s);
  };
  const gap = gapLine(round);

  return (
    <section className="mt-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="status-chip">Round {round.n} of {total}</span>
        <CategoryTag category={round.category} />
        <span className="status-chip">{round.scope}</span>
        {streak >= 2 && (
          <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
            <span aria-hidden>🔥</span> {streak} in a row
          </span>
        )}
      </div>
      <h2 className="mx-auto mt-3 max-w-xl text-center font-display text-xl font-bold text-ink sm:text-2xl">
        {round.prompt}
      </h2>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-4">
        <Card side={round.a} round={round} index={0} picked={picked} win={win} onPick={choose} count={fresh} />
        <div className="flex items-center">
          <span className="rounded-full border-2 border-night bg-gold px-2 py-1 font-display text-xs font-bold text-night shadow-[0_3px_0_0_rgb(var(--c-night))]">
            VS
          </span>
        </div>
        <Card side={round.b} round={round} index={1} picked={picked} win={win} onPick={choose} count={fresh} />
      </div>
      {!revealed && (
        <p className="mt-3 hidden text-center font-mono text-[10px] uppercase tracking-widest text-ink-muted sm:block">
          ← or → to pick
        </p>
      )}

      {revealed && (
        <div className="mt-6">
          <CloseMeter round={round} />
          <div className="mt-4 flex items-center justify-center gap-3">
            <Coach mood={right ? celebrationFor(`duel-${round.n}-${round.prompt}`) : "sad"} size={56} />
            <p className={`font-display text-lg font-bold ${right ? "text-turf" : "text-gold"}`}>
              {right ? (streak >= 2 ? `Called it. That's ${streak + 1} straight.` : "Called it.") : "Not this time."}{" "}
              <span className="font-sans text-sm font-normal text-ink-soft">
                {(win === 0 ? round.a : round.b).name} by {formatGap(round)}.{gap ? ` ${gap}` : ""}
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

/** The tug of war: each side's share of the two numbers, and a verdict. */
function CloseMeter({ round }: { round: DuelRound }) {
  const c = closeness(round);
  const verdict = c < 0.05 ? "Photo finish" : c < 0.15 ? "Close call" : c < 0.4 ? "Clear winner" : "Blowout";
  // A share only means something for two positive totals where more wins.
  const bar = round.higherWins && round.a.value > 0 && round.b.value > 0;
  const shareA = bar ? round.a.value / (round.a.value + round.b.value) : 0.5;
  const win = winnerOf(round);
  return (
    <div className="mx-auto max-w-md">
      <p className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">{verdict}</p>
      {bar && (
        <div
          className="mt-1.5 flex h-3 overflow-hidden rounded-full border border-panel-border bg-night/40"
          role="img"
          aria-label={`${round.a.name} ${Math.round(shareA * 100)}%, ${round.b.name} ${100 - Math.round(shareA * 100)}%`}
        >
          <span className={`h-full ${win === 0 ? "bg-turf" : "bg-panel-border"}`} style={{ width: `${shareA * 100}%` }} />
          <span className={`h-full flex-1 ${win === 1 ? "bg-turf" : "bg-panel-border"}`} />
        </div>
      )}
    </div>
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
  count,
}: {
  side: DuelSide;
  round: DuelRound;
  index: 0 | 1;
  picked: 0 | 1 | undefined;
  win: 0 | 1;
  onPick: (s: 0 | 1) => void;
  /** Count the number up (a pick made just now). */
  count: boolean;
}) {
  const revealed = picked !== undefined;
  const isWinner = revealed && win === index;
  const isPick = picked === index;
  const shot = side.kind === "player" ? side.headshot ?? PLAYER_HEADSHOTS[side.name]?.url ?? null : null;
  const shown = useCountUp(side.value, revealed && count);

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
        {revealed ? (
          <>
            <span className="sr-only">{side.value.toFixed(round.decimals)}</span>
            <span aria-hidden>{shown.toFixed(round.decimals)}</span>
          </>
        ) : (
          "?"
        )}
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
      const [SQL, data, box] = await Promise.all([
        import("sql.js").then((m) => m.default({ locateFile: () => "/sql-wasm.wasm" })),
        import("@/lib/fantasy-data"),
        // A box-score round's table, the same file Roll Call runs on.
        round.source === "player_weeks" && round.dataUrl
          ? fetch(round.dataUrl).then((r) => r.json() as Promise<{ columns: string[]; rows: (string | number)[][] }>)
          : null,
      ]);
      const db = new SQL.Database();
      db.run(data.buildSeedSql());
      if (box) {
        db.run(seedSql(box.columns));
        const insert = db.prepare(`INSERT INTO player_weeks VALUES (${box.columns.map(() => "?").join(", ")})`);
        db.run("BEGIN");
        for (const row of box.rows) insert.run(row);
        db.run("COMMIT");
        insert.free();
      }
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
        <p className="font-mono text-[10px] text-ink-muted">
          {round.source === "player_weeks"
            ? "The query behind this round, on this season's real box scores"
            : "The query behind this round, on the same real data the questions use"}
        </p>
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
            <span className="font-mono text-[10px] text-ink-muted">
              Change it — try a third player, or another {round.source === "player_weeks" ? "week" : "season"}.
            </span>
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

/** Wordle's numbers, recomputed from the history every time. */
function statsOf(history: History, today: string, total: number) {
  const days = Object.keys(history).sort();
  const dist = Array.from({ length: total + 1 }, () => 0);
  let sum = 0;
  for (const d of days) {
    const sc = Math.max(0, Math.min(total, history[d]));
    dist[sc]++;
    sum += sc;
  }
  // Runs of consecutive days. The current run counts if it ends today or
  // yesterday (today's duel may not be played yet).
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    run = prev && dayBefore(d) === prev ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  const last = days[days.length - 1];
  const current = last && (last === today || last === dayBefore(today)) ? run : 0;
  return { played: days.length, avg: days.length ? sum / days.length : 0, current, best, dist };
}

function Summary({
  duel,
  picks,
  score,
  history,
  challenge,
  qotdId,
  onReview,
}: {
  duel: Duel;
  picks: (0 | 1)[];
  score: number;
  history: History;
  challenge: DuelResult | null;
  qotdId: string;
  onReview: (i: number) => void;
}) {
  const [note, setNote] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const total = duel.rounds.length;
  const grid = duel.rounds.map((r, i) => picks[i] === winnerOf(r));
  const link = `${SITE_URL}/questions/duel?r=${encodeDuelResult(duel.number, grid)}`;
  const text = withIdentity(
    `DataDraft Stat Duel #${duel.number} 🏈 ${score}/${total}\n${squares(grid)}\nWho had more? Beat me:\n${link}`,
    shareIdentity(loadProgress()),
  );
  const stats = statsOf(history, duel.day, total);
  const peak = Math.max(1, ...stats.dist);

  useEffect(() => {
    const tick = () => setLeft(msUntilNextLeagueDay());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  async function share() {
    const how = await shareText(text);
    setNote(how === "copied" ? "Copied. Paste it in the group chat." : how === "failed" ? "Couldn't copy. Select the grid above instead." : null);
  }

  const verdict =
    score === total ? "A perfect duel." : score >= total - 1 ? "Nearly perfect." : score >= total / 2 ? "Solid." : "Rough day at the office.";
  const beat =
    challenge && challenge.number === duel.number
      ? score > challenge.score
        ? `You beat your friend's ${challenge.score}/5.`
        : score === challenge.score
          ? `Tied with your friend at ${score}/5.`
          : `Your friend wins this one, ${challenge.score}/5.`
      : null;

  return (
    <section className="mt-6 text-center" aria-live="polite">
      <div className="surface mx-auto max-w-md rounded-2xl border border-panel-border bg-panel p-6">
        <Coach
          mood={score >= total - 1 ? "dance" : score >= total / 2 ? celebrationFor(`duel-score-${score}`) : "shrug"}
          size={88}
          className="mx-auto"
        />
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
        {beat && <p className="mt-1 text-sm text-ink-soft">{beat}</p>}
        <p className="mt-3 select-all font-mono text-2xl tracking-[0.2em]" aria-label={`${score} of ${total} right`}>
          {squares(grid)}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={share} className="press btn-gold">
            Share result
          </button>
          <Link href={`/questions/${qotdId}`} className="press btn-turf">
            Now today&apos;s SQL question →
          </Link>
        </div>
        <p className="mt-2 min-h-[1rem] font-mono text-[10px] text-ink-muted" aria-live="polite">
          {note ?? "Your link shows friends the score to beat — not the answers."}
        </p>

        {/* Wordle's panel: the numbers that make tomorrow worth coming back for. */}
        <div className="mt-5 grid grid-cols-4 gap-2 border-t border-panel-border pt-5">
          {[
            [stats.played, "played"],
            [stats.avg.toFixed(1), "avg score"],
            [stats.current, "streak"],
            [stats.best, "best streak"],
          ].map(([v, label]) => (
            <div key={String(label)}>
              <p className="font-display text-2xl font-bold text-ink">{v}</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-left" aria-label="How your scores spread">
          {stats.dist
            .map((count, sc) => ({ count, sc }))
            .reverse()
            .map(({ count, sc }) => (
              <div key={sc} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-right font-mono text-[11px] text-ink-muted">{sc}/5</span>
                <span
                  className={`flex h-5 items-center justify-end rounded-sm px-1.5 font-mono text-[11px] font-bold ${
                    sc === score ? "bg-turf text-night" : "bg-panel-border text-ink"
                  }`}
                  style={{ width: `${Math.max(8, (count / peak) * 100)}%` }}
                >
                  {count}
                </span>
              </div>
            ))}
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          Next duel in <span className="text-gold">{left === null ? "--:--:--" : formatCountdown(left)}</span>
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
                    {r.category} · {r.a.name} {r.a.value.toFixed(r.decimals)} · {r.b.name} {r.b.value.toFixed(r.decimals)} · {r.scope}
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
