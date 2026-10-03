"use client";

/**
 * The Analyst Screen (`/questions/screen`): the timed online assessment most
 * data hiring funnels open with. SQL under a clock, plus multiple choice on
 * stats, wrangling, types and A/B. The formats, the MC bank and the verdict
 * are in lib/analyst-screen.ts; this file is the three screens, the lobby,
 * the live screen and the report.
 *
 * Same rules as the mock SQL screens: the clock is an end time, so closing
 * the tab doesn't pause it, and there's no help until it's over. A screen
 * survives a reload (`sqlsports.screen.v1`) and finished screens are kept
 * in `sqlsports.screen.history.v1`. Multiple choice locks on Submit, like
 * the real thing.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Database, QueryExecResult } from "sql.js";
import CodeEditor from "@/components/code-editor";
import DifficultyChip from "@/components/difficulty-chip";
import PassTag from "@/components/pass-tag";
import PassOffer from "@/components/pass-offer";
import Cutscene, { markSceneSeen, sceneSeen, type Beat } from "@/components/cutscene";
import PrepArt, { hasPrepArt } from "@/components/prep-art";
import QueryDoctorPanel from "@/components/query-doctor-panel";
import FilmRoom from "@/components/film-room";
import { useLessonDb } from "@/components/mock-interview";
import { usePass } from "@/lib/use-pass";
import { FREE_ALLOWANCE } from "@/lib/season-pass";
import { loadProgress, solveQuestion } from "@/lib/progress";
import { DIFFICULTY_XP, getQuestion, schemaFor, type Question } from "@/lib/questions";
import { diagnoseSql } from "@/lib/query-doctor";
import { resultsMatch } from "@/lib/sql-grade";
import {
  ANALYST_FORMATS,
  ANALYST_MC,
  MC_SKILL_LABEL,
  analystVerdict,
  clock,
  pickAnalystScreen,
  type AnalystAnswer,
  type AnalystFormat,
  type McItem,
  type ScreenSlot,
} from "@/lib/analyst-screen";

type SlotRef = { kind: "sql" | "mc"; id: string };

type Live = {
  v: 1;
  format: AnalystFormat["id"];
  seed: string;
  slots: SlotRef[];
  startedAt: number;
  endsAt: number;
  answers: AnalystAnswer[];
  drafts: string[];
  finishedAt: number | null;
};
type HistoryRow = { at: string; format: AnalystFormat["id"]; solved: number; of: number; seconds: number };

const LIVE_KEY = "sqlsports.screen.v1";
const HISTORY_KEY = "sqlsports.screen.history.v1";
const CARD = "surface rounded-2xl border border-panel-border bg-panel";

function read<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") as T | null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode: the screen still runs, it just won't survive a reload.
  }
}

function resolveSlot(ref: SlotRef): ScreenSlot | null {
  if (ref.kind === "sql") {
    const question = getQuestion(ref.id);
    return question ? { kind: "sql", question } : null;
  }
  const item = ANALYST_MC.find((m) => m.id === ref.id);
  return item ? { kind: "mc", item } : null;
}

/** A slot is finished once SQL is solved or MC is locked in. */
function finished(a: AnalystAnswer): boolean {
  return a.kind === "sql" ? a.solvedAt !== null : a.attempts > 0;
}

export default function AnalystScreen() {
  const db = useLessonDb();
  const [live, setLive] = useState<Live | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [now, setNow] = useState(() => Date.now());
  // finish() runs from a click and from the clock, and React may call a state
  // updater twice in development: side effects live here, not in an updater,
  // and a screen is recorded once, keyed by its seed.
  const liveRef = useRef<Live | null>(null);
  liveRef.current = live;
  const recorded = useRef<string | null>(null);
  // The interviewer's intro, once per format; the clock starts on its button.
  const [briefing, setBriefing] = useState<AnalystFormat | null>(null);

  useEffect(() => {
    const saved = read<Live>(LIVE_KEY);
    if (saved && saved.v === 1 && saved.slots.every((s) => resolveSlot(s))) setLive(saved);
    setHistory(read<HistoryRow[]>(HISTORY_KEY) ?? []);
  }, []);

  useEffect(() => {
    if (live) write(LIVE_KEY, live);
  }, [live]);

  // One tick a second while a screen is running; it ends itself at zero.
  useEffect(() => {
    if (!live || live.finishedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [live]);
  useEffect(() => {
    if (live && !live.finishedAt && now >= live.endsAt) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, live]);

  function start(format: AnalystFormat) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const seed = Array.from(bytes, (b) => b.toString(36)).join("");
    const slots = pickAnalystScreen(format, seed, loadProgress().solvedQuestions);
    const t = Date.now();
    setNow(t);
    setLive({
      v: 1,
      format: format.id,
      seed,
      slots: slots.map((s) => ({ kind: s.kind, id: s.kind === "sql" ? s.question.id : s.item.id })),
      startedAt: t,
      endsAt: t + format.minutes * 60_000,
      answers: slots.map((s) => ({
        kind: s.kind,
        id: s.kind === "sql" ? s.question.id : s.item.id,
        attempts: 0,
        solvedAt: null,
        lastSql: "",
        pick: null,
      })) as AnalystAnswer[],
      drafts: slots.map((s) => (s.kind === "sql" ? (s.question.starter ?? "SELECT ") : "")),
      finishedAt: null,
    });
    window.scrollTo({ top: 0 });
  }

  function finish() {
    const l = liveRef.current;
    if (!l || l.finishedAt || recorded.current === l.seed) return;
    recorded.current = l.seed;
    const finishedAt = Math.min(Date.now(), l.endsAt);
    setLive({ ...l, finishedAt });
    const row: HistoryRow = {
      at: new Date().toISOString().slice(0, 10),
      format: l.format,
      solved: l.answers.filter((a) => a.solvedAt !== null).length,
      of: l.answers.length,
      seconds: Math.round((finishedAt - l.startedAt) / 1000),
    };
    const next = [row, ...(read<HistoryRow[]>(HISTORY_KEY) ?? [])].slice(0, 30);
    write(HISTORY_KEY, next);
    setHistory(next);
    window.scrollTo({ top: 0 });
  }

  function leave() {
    write(LIVE_KEY, null);
    setLive(null);
  }

  if (!live) {
    return (
      <>
        <Lobby
          onStart={(f) => (sceneSeen(`screen:${f.id}`) ? start(f) : setBriefing(f))}
          onBrief={setBriefing}
          history={history}
        />
        {briefing && (
          <Cutscene
            open
            kicker={`Analyst Screen · ${briefing.minutes} minutes`}
            title={briefing.name}
            beats={screenBeats(briefing)}
            objectives={[
              `${briefing.sqlMix.length} SQL question${briefing.sqlMix.length === 1 ? "" : "s"} and ${briefing.mcCount} multiple choice`,
              `${briefing.minutes} minutes on the clock, and it doesn't pause`,
              "Multiple choice locks when you submit. SQL you can run as often as you like",
              "A report at the end: the answers, and why",
            ]}
            startLabel="Start the clock"
            onClose={() => {
              markSceneSeen(`screen:${briefing.id}`);
              setBriefing(null);
            }}
            onStart={() => {
              const f = briefing;
              markSceneSeen(`screen:${f.id}`);
              setBriefing(null);
              start(f);
            }}
          />
        )}
      </>
    );
  }
  if (live.finishedAt) return <Report live={live} db={db} onAgain={leave} />;
  return <Screen live={live} setLive={setLive} db={db} now={now} onFinish={finish} />;
}

// ── Lobby ─────────────────────────────────────────────────────────────
/** The interviewer's intro to each screen (components/cutscene.tsx). */
function screenBeats(f: AnalystFormat): Beat[] {
  const riley = { kind: "caller" as const, name: "Riley", title: "Analytics lead · the hiring team", tone: "ice" as const };
  return f.id === "sprint"
    ? [
        { who: { kind: "coach", mood: "whistle" }, text: "A lunch-break screen. Short, but the clock is real." },
        { who: riley, text: "Quick one today: a SQL question and four multiple choice." },
        { who: riley, text: "The multiple choice locks when you submit, so read each one twice." },
        { who: { kind: "coach", mood: "point" }, text: "Bank the SQL first. Then the MC is a sprint." },
      ]
    : [
        { who: { kind: "coach", mood: "whistle" }, text: "This is the one that comes before the humans. Deep breath." },
        { who: riley, text: "Thanks for taking the assessment. Seventy minutes, eight items." },
        { who: riley, text: "Two SQL questions on our data, then six multiple choice on stats, wrangling, types and A/B tests." },
        { who: { kind: "coach", mood: "point" }, text: "Tabs let you jump around. Take the sure points first." },
      ];
}

function Lobby({
  onStart,
  onBrief,
  history,
}: {
  onStart: (f: AnalystFormat) => void;
  onBrief: (f: AnalystFormat) => void;
  history: HistoryRow[];
}) {
  // Free: one quick screen, to try it. Everything else is the Season Pass
  // (a no-op until the paywall is on).
  const pass = usePass();
  const sprintsDone = history.filter((h) => h.format === "sprint").length;
  const locked = (f: AnalystFormat) =>
    pass === false && (f.id !== "sprint" || sprintsDone >= FREE_ALLOWANCE.screenSprints);
  const anyLocked = ANALYST_FORMATS.some(locked);
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <div className="flex justify-center">
          <PassTag />
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-5xl">Analyst Screen</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
          The timed online assessment that comes before a human talks to you. SQL on real NFL data, plus multiple
          choice on statistics, wrangling, types and A/B tests. One clock, no hints, and a report afterwards with
          every answer explained.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ANALYST_FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() =>
              locked(f)
                ? document.getElementById("screen-offer")?.scrollIntoView({ behavior: "smooth", block: "center" })
                : onStart(f)
            }
            className={`${CARD} lift group overflow-hidden p-5 text-left transition-colors hover:border-turf/60 ${locked(f) ? "opacity-70" : ""}`}
          >
            <span className="-mx-5 -mt-5 mb-4 block h-32 border-b border-panel-border bg-night/40">
              {hasPrepArt(f.id) && <PrepArt id={f.id} className="h-full w-full" />}
            </span>
            <p className="label-broadcast text-turf">{f.minutes} minutes</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">{f.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.blurb}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {f.sqlMix.map((d, i) => (
                <DifficultyChip key={i} difficulty={d} />
              ))}
              <span className="rounded-full border border-panel-border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                {f.mcCount} MC
              </span>
            </div>
            <span
              className={`mt-4 inline-block font-mono text-[11px] font-bold uppercase tracking-wider group-hover:underline ${
                locked(f) ? "text-gold" : "text-turf"
              }`}
            >
              {locked(f) ? "★ Season Pass" : "Start the clock →"}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-wider text-ink-muted">
        ▶ Replay the intro:{" "}
        {ANALYST_FORMATS.map((f, i) => (
          <span key={f.id}>
            {i > 0 && " · "}
            <button type="button" onClick={() => onBrief(f)} className="font-bold text-gold hover:underline">
              {f.name}
            </button>
          </span>
        ))}
      </p>

      {anyLocked && (
        <div id="screen-offer" className="mt-4">
          <PassOffer moment="screen" />
        </div>
      )}

      <ul className="mt-6 grid gap-2 text-sm text-ink-soft sm:grid-cols-3">
        <li className={`${CARD} p-3`}>
          <strong className="text-ink">Two kinds of item.</strong> SQL graded by result, and multiple choice that
          locks when you submit.
        </li>
        <li className={`${CARD} p-3`}>
          <strong className="text-ink">The clock doesn&apos;t pause.</strong> Close the tab and it keeps running,
          like a real timed assessment.
        </li>
        <li className={`${CARD} p-3`}>
          <strong className="text-ink">Unseen SQL first.</strong> Questions you&apos;ve already solved come last.
        </li>
      </ul>

      <p className="mt-4 text-center text-sm text-ink-soft">
        Next in the funnel:{" "}
        <Link href="/questions/mock" className="font-bold text-turf hover:underline">
          Mock SQL screens
        </Link>{" "}
        ·{" "}
        <Link href="/projects/challenge" className="font-bold text-turf hover:underline">
          Data Challenge
        </Link>{" "}
        ·{" "}
        <Link href="/questions/prep" className="font-bold text-turf hover:underline">
          Hiring prep
        </Link>
      </p>

      {history.length > 0 && (
        <section className={`${CARD} mt-6 p-4`}>
          <p className="label-broadcast">your screens</p>
          <ul className="mt-2 divide-y divide-panel-border/60">
            {history.slice(0, 8).map((h, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink-soft">
                  {h.at} · {ANALYST_FORMATS.find((f) => f.id === h.format)?.name}
                </span>
                <span className={`font-mono ${h.solved === h.of ? "text-turf" : "text-ink-soft"}`}>
                  {h.solved}/{h.of} in {clock(h.seconds)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ── The live screen ───────────────────────────────────────────────────
function Screen({
  live,
  setLive,
  db,
  now,
  onFinish,
}: {
  live: Live;
  setLive: (fn: (l: Live | null) => Live | null) => void;
  db: Database | null;
  now: number;
  onFinish: () => void;
}) {
  const slots = useMemo(() => live.slots.map((s) => resolveSlot(s)!), [live.slots]);
  const [at, setAt] = useState(() => Math.max(0, live.answers.findIndex((a) => !finished(a))));
  const [result, setResult] = useState<{ grid?: QueryExecResult; error?: string; verdict?: "right" | "wrong" } | null>(null);
  const slot = slots[at];
  const answer = live.answers[at];
  const left = (live.endsAt - now) / 1000;
  const format = ANALYST_FORMATS.find((f) => f.id === live.format);
  const allDone = live.answers.every(finished);

  useEffect(() => setResult(null), [at]);

  // Tab labels: SQL 1, SQL 2, MC 1 …
  const labels = useMemo(() => {
    let sql = 0;
    let mc = 0;
    return slots.map((s) => (s.kind === "sql" ? `SQL ${++sql}` : `MC ${++mc}`));
  }, [slots]);

  function setSql(next: string) {
    setLive((l) => (l ? { ...l, drafts: l.drafts.map((d, i) => (i === at ? next : d)) } : l));
  }

  function runSql(grade: boolean) {
    if (!db || slot.kind !== "sql") return;
    const q = slot.question;
    const sql = live.drafts[at];
    let mine: QueryExecResult | undefined;
    try {
      mine = db.exec(sql)[0];
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : String(e) });
      return;
    }
    if (!grade) {
      setResult({ grid: mine });
      return;
    }
    const ok = resultsMatch(mine, db.exec(q.expected)[0], q.orderMatters ?? false);
    setResult({ grid: mine, verdict: ok ? "right" : "wrong" });
    const t = Math.round((Date.now() - live.startedAt) / 1000);
    setLive((l) =>
      l
        ? {
            ...l,
            answers: l.answers.map((a, i) =>
              i === at && a.kind === "sql"
                ? { ...a, attempts: a.attempts + 1, lastSql: sql, solvedAt: a.solvedAt ?? (ok ? t : null) }
                : a,
            ),
          }
        : l,
    );
    if (ok) solveQuestion(q.id, DIFFICULTY_XP[q.difficulty], false, "", "");
  }

  function pickChoice(i: number) {
    setLive((l) =>
      l
        ? { ...l, answers: l.answers.map((a, k) => (k === at && a.kind === "mc" && a.attempts === 0 ? { ...a, pick: i } : a)) }
        : l,
    );
  }

  function submitMc() {
    if (slot.kind !== "mc" || answer.pick === null) return;
    const ok = answer.pick === slot.item.answer;
    const t = Math.round((Date.now() - live.startedAt) / 1000);
    setLive((l) =>
      l
        ? {
            ...l,
            answers: l.answers.map((a, k) =>
              k === at && a.kind === "mc" && a.attempts === 0 ? { ...a, attempts: 1, solvedAt: ok ? t : null } : a,
            ),
          }
        : l,
    );
    // Straight to the next item that isn't finished, so the clock isn't spent on a click.
    const next = live.answers.findIndex((a, k) => k !== at && !finished(a));
    if (next !== -1) setAt(next);
  }

  return (
    <div>
      <div className={`${CARD} sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4`}>
        <div className="flex items-center gap-3">
          <span
            className={`font-display text-3xl font-bold tabular-nums ${left < 300 ? "text-gold" : "text-ink"}`}
            aria-label={`${clock(left)} left`}
          >
            {clock(left)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">{format?.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {slots.map((s, i) => {
            const a = live.answers[i];
            const solved = a.solvedAt !== null;
            const locked = s.kind === "mc" && a.attempts > 0 && !solved;
            return (
              <button
                key={`${s.kind}-${i}`}
                type="button"
                onClick={() => setAt(i)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] font-bold ${
                  i === at
                    ? "border-ice bg-ice/15 text-ice"
                    : solved
                      ? "border-turf/60 text-turf"
                      : locked
                        ? "border-panel-border text-ink-muted"
                        : "border-panel-border text-ink-soft hover:text-ink"
                }`}
              >
                {labels[i]} {solved ? "✓" : locked ? "·" : ""}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              if (allDone || window.confirm("End the screen now? Unfinished items count as missed.")) onFinish();
            }}
            className="ml-1 rounded-lg border border-gold/60 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:bg-gold/10"
          >
            {allDone ? "Finish" : "End screen"}
          </button>
        </div>
      </div>

      {slot.kind === "sql" ? (
        <SqlSlot
          n={at + 1}
          q={slot.question}
          sql={live.drafts[at]}
          attempts={answer.attempts}
          db={db}
          result={result}
          onChange={setSql}
          onRun={runSql}
          next={at < slots.length - 1 ? () => setAt(at + 1) : null}
          allDone={allDone}
          onFinish={onFinish}
        />
      ) : (
        <McSlot
          n={at + 1}
          item={slot.item}
          pick={answer.pick}
          locked={answer.attempts > 0}
          onPick={pickChoice}
          onSubmit={submitMc}
          allDone={allDone}
          onFinish={onFinish}
        />
      )}
    </div>
  );
}

function SqlSlot({
  n,
  q,
  sql,
  attempts,
  db,
  result,
  onChange,
  onRun,
  next,
  allDone,
  onFinish,
}: {
  n: number;
  q: Question;
  sql: string;
  attempts: number;
  db: Database | null;
  result: { grid?: QueryExecResult; error?: string; verdict?: "right" | "wrong" } | null;
  onChange: (s: string) => void;
  onRun: (grade: boolean) => void;
  next: (() => void) | null;
  allDone: boolean;
  onFinish: () => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
      <section className={`${CARD} p-5 lg:col-span-5`}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-ink-muted">Item {n} · SQL</span>
          <DifficultyChip difficulty={q.difficulty} />
        </div>
        <h2 className="mt-2 font-display text-xl font-bold text-ink">{q.title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{q.prompt}</p>
        <div className="mt-4 rounded-xl border border-ice/30 bg-ice/5 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ice">Return</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{q.returns}</p>
        </div>
        <div className="mt-4 space-y-2">
          {schemaFor(q).map((t) => (
            <div key={t.table} className="rounded-lg border border-panel-border bg-night/40 p-2.5">
              <p className="font-mono text-[11px] font-bold text-ink">{t.table}</p>
              <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-ink-muted">{t.columns.join(", ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${CARD} p-4 sm:p-5 lg:col-span-7`}>
        <div
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              onRun(true);
            }
          }}
        >
          <CodeEditor value={sql} onChange={onChange} lang="sql" rows={12} ariaLabel={`SQL for item ${n}`} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!db}
            onClick={() => onRun(false)}
            className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-ice/50 hover:text-ice disabled:opacity-40"
          >
            Run
          </button>
          <button type="button" disabled={!db} onClick={() => onRun(true)} className="press btn-turf disabled:opacity-40">
            Submit
          </button>
          <span className="font-mono text-[10px] text-ink-muted">
            {attempts} submission{attempts === 1 ? "" : "s"}
          </span>
        </div>

        {result?.error && (
          <p role="alert" className="mt-3 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 font-mono text-[12px] text-gold">
            {result.error}
          </p>
        )}
        {result?.verdict === "right" && (
          <div className="mt-3 rounded-xl border border-turf/50 bg-turf/10 p-3">
            <p className="font-display text-base font-bold text-turf">Accepted.</p>
            {allDone ? (
              <button type="button" onClick={onFinish} className="mt-2 press btn-gold">
                Finish and see the report →
              </button>
            ) : next ? (
              <button type="button" onClick={next} className="mt-2 press btn-turf">
                Next item →
              </button>
            ) : null}
          </div>
        )}
        {result?.verdict === "wrong" && (
          <p className="mt-3 rounded-xl border border-ice/40 bg-ice/5 px-4 py-3 text-sm text-ink-soft">
            <strong className="text-ice">Doesn&apos;t match yet.</strong> No hints in a screen — check it against the
            Return line and try again. The report will show you what was off.
          </p>
        )}
        {result?.grid && <Grid res={result.grid} />}
        {result && !result.error && !result.grid && <p className="mt-3 font-mono text-[12px] text-ink-muted">No rows.</p>}
      </section>
    </div>
  );
}

function McSlot({
  n,
  item,
  pick,
  locked,
  onPick,
  onSubmit,
  allDone,
  onFinish,
}: {
  n: number;
  item: McItem;
  pick: number | null;
  locked: boolean;
  onPick: (i: number) => void;
  onSubmit: () => void;
  allDone: boolean;
  onFinish: () => void;
}) {
  return (
    <section className={`${CARD} mx-auto mt-4 max-w-3xl p-5 sm:p-6`}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] font-bold text-ink-muted">Item {n} · Multiple choice</span>
        <span className="rounded-full border border-ice/40 bg-ice/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ice">
          {MC_SKILL_LABEL[item.skill]}
        </span>
      </div>
      <h2 className="mt-3 font-display text-lg font-bold leading-snug text-ink sm:text-xl">{item.prompt}</h2>

      <div role="radiogroup" aria-label={`Choices for item ${n}`} className="mt-4 space-y-2">
        {item.choices.map((choice, i) => {
          const on = pick === i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={locked}
              onClick={() => onPick(i)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] leading-relaxed transition-colors ${
                on ? "border-ice bg-ice/10 text-ink" : "border-panel-border text-ink-soft hover:border-ice/50"
              } ${locked ? "cursor-default" : ""}`}
            >
              <span
                aria-hidden
                className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  on ? "border-ice" : "border-panel-border"
                }`}
              >
                {on && <span className="h-2 w-2 rounded-full bg-ice" />}
              </span>
              <span>{choice}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {locked ? (
          <>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Locked in. The report has the answer.</p>
            {allDone && (
              <button type="button" onClick={onFinish} className="press btn-gold">
                Finish and see the report →
              </button>
            )}
          </>
        ) : (
          <button type="button" disabled={pick === null} onClick={onSubmit} className="press btn-turf disabled:opacity-40">
            Submit
          </button>
        )}
      </div>
    </section>
  );
}

function Grid({ res }: { res: QueryExecResult }) {
  return (
    <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-panel-border">
      <table className="w-full text-left font-mono text-[11.5px]">
        <thead className="sticky top-0 bg-panel">
          <tr className="text-ink-muted">
            {res.columns.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-1.5 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {res.values.map((row, i) => (
            <tr key={i} className="border-t border-panel-border/50 text-ink-soft">
              {row.map((v, j) => (
                <td key={j} className="whitespace-nowrap px-3 py-1">
                  {v === null ? "NULL" : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── The report ────────────────────────────────────────────────────────
function Report({ live, db, onAgain }: { live: Live; db: Database | null; onAgain: () => void }) {
  const slots = live.slots.map((s) => resolveSlot(s)!);
  const verdict = analystVerdict(live.answers);
  const solved = live.answers.filter((a) => a.solvedAt !== null).length;
  const used = Math.round(((live.finishedAt ?? live.endsAt) - live.startedAt) / 1000);
  const format = ANALYST_FORMATS.find((f) => f.id === live.format)!;
  const tone =
    verdict.band === "strong" ? "border-turf/60 bg-turf/10" : verdict.band === "pass" ? "border-ice/50 bg-ice/10" : "border-gold/50 bg-gold/10";

  // MC by skill, so a "Not yet" says which skill to drill.
  const skills = useMemo(() => {
    const by = new Map<string, { right: number; of: number }>();
    slots.forEach((s, i) => {
      if (s.kind !== "mc") return;
      const row = by.get(s.item.skill) ?? { right: 0, of: 0 };
      row.of++;
      if (live.answers[i].solvedAt !== null) row.right++;
      by.set(s.item.skill, row);
    });
    return Array.from(by.entries());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  return (
    <div className="mx-auto max-w-4xl">
      <section className={`${CARD} p-6 text-center sm:p-8`}>
        <p className="label-broadcast text-gold">{format.name} · report</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">
          {solved} of {slots.length} correct
        </h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          in {clock(used)} of {format.minutes}:00
        </p>
        <div className={`mx-auto mt-5 max-w-md rounded-xl border p-3 ${tone}`}>
          <p className="font-display text-xl font-bold text-ink">{verdict.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{verdict.detail}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink-muted">our rubric, not any company&apos;s</p>
        </div>
        {skills.length > 0 && (
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {skills.map(([skill, s]) => (
              <li
                key={skill}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] font-bold ${
                  s.right === s.of ? "border-turf/50 text-turf" : "border-gold/50 text-gold"
                }`}
              >
                {MC_SKILL_LABEL[skill as keyof typeof MC_SKILL_LABEL]} {s.right}/{s.of}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onAgain} className="press btn-turf">
            Run another screen
          </button>
          <Link
            href="/projects/challenge"
            className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-turf/40"
          >
            Try the Data Challenge
          </Link>
        </div>
      </section>

      <div className="mt-4 space-y-4">
        {slots.map((s, i) =>
          s.kind === "sql" ? (
            <SqlReportItem key={`sql-${s.question.id}`} q={s.question} n={i + 1} answer={live.answers[i]} db={db} />
          ) : (
            <McReportItem key={`mc-${s.item.id}`} item={s.item} n={i + 1} answer={live.answers[i]} />
          ),
        )}
      </div>
    </div>
  );
}

function McReportItem({ item, n, answer }: { item: McItem; n: number; answer: AnalystAnswer }) {
  const solved = answer.solvedAt !== null;
  return (
    <section className={`${CARD} p-5 ${solved ? "border-turf/40" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-ink-muted">Item {n}</span>
          <span className="rounded-full border border-ice/40 bg-ice/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ice">
            {MC_SKILL_LABEL[item.skill]}
          </span>
        </div>
        <span className={`font-mono text-[11px] font-bold uppercase tracking-wider ${solved ? "text-turf" : "text-gold"}`}>
          {solved ? "✓ correct" : answer.attempts ? "missed" : "not answered"}
        </span>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-ink">{item.prompt}</p>
      <ul className="mt-3 space-y-1.5">
        {item.choices.map((choice, i) => {
          const right = i === item.answer;
          const mine = answer.pick === i && answer.attempts > 0;
          return (
            <li
              key={i}
              className={`rounded-lg border px-3 py-2 text-sm leading-relaxed ${
                right
                  ? "border-turf/50 bg-turf/10 text-ink"
                  : mine
                    ? "border-gold/50 bg-gold/10 text-ink-soft"
                    : "border-panel-border text-ink-soft"
              }`}
            >
              {choice}
              {right && <span className="ml-2 font-mono text-[10px] font-bold uppercase tracking-wider text-turf">answer</span>}
              {mine && !right && <span className="ml-2 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">your pick</span>}
              {mine && right && <span className="ml-2 font-mono text-[10px] font-bold uppercase tracking-wider text-turf">your pick</span>}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.explain}</p>
    </section>
  );
}

function SqlReportItem({ q, n, answer, db }: { q: Question; n: number; answer: AnalystAnswer; db: Database | null }) {
  const [show, setShow] = useState(false);
  const solved = answer.solvedAt !== null;
  const getDb = useCallback(() => db, [db]);
  const findings = useMemo(() => {
    if (solved || !db || !answer.lastSql.trim()) return [];
    const schema = schemaFor(q).map((t) => ({ name: t.table, columns: t.columns }));
    try {
      const mine = db.exec(answer.lastSql)[0];
      return diagnoseSql({ sql: answer.lastSql, mine, key: db.exec(q.expected)[0], orderMatters: q.orderMatters ?? false, schema });
    } catch (e) {
      return diagnoseSql({ sql: answer.lastSql, error: e instanceof Error ? e.message : String(e), schema });
    }
  }, [solved, db, answer.lastSql, q]);

  return (
    <section className={`${CARD} p-5 ${solved ? "border-turf/40" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-ink-muted">Item {n} · SQL</span>
          <DifficultyChip difficulty={q.difficulty} />
          <h2 className="font-display text-lg font-bold text-ink">{q.title}</h2>
        </div>
        <span className={`font-mono text-[11px] font-bold uppercase tracking-wider ${solved ? "text-turf" : "text-gold"}`}>
          {solved
            ? `✓ solved at ${clock(answer.solvedAt!)} · ${answer.attempts} submission${answer.attempts === 1 ? "" : "s"}`
            : answer.attempts
              ? `missed · ${answer.attempts} submission${answer.attempts === 1 ? "" : "s"}`
              : "not attempted"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{q.prompt}</p>
      <p className="mt-1 text-xs text-ink-muted">Return: {q.returns}</p>

      {answer.lastSql.trim() && (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">your {solved ? "answer" : "last submission"}</p>
            {db && <FilmRoom sql={answer.lastSql} getDb={getDb} subject="yours" />}
          </div>
          <pre className="mt-1 overflow-x-auto rounded-lg border border-panel-border bg-night/60 p-3 font-mono text-[12px] leading-relaxed text-ink-soft">
            {answer.lastSql}
          </pre>
        </div>
      )}
      {!solved && findings.length > 0 && (
        <QueryDoctorPanel findings={findings} sql={answer.lastSql} prompt={q.prompt} returns={q.returns} />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="font-mono text-[11px] font-bold uppercase tracking-wider text-ice hover:underline"
        >
          {show ? "Hide the answer" : "Show the answer"}
        </button>
        <Link href={`/questions/${q.id}`} className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted hover:text-ink">
          Open in the bank →
        </Link>
        <span className="font-mono text-[10px] text-ink-muted">{q.tags.join(" · ")}</span>
      </div>
      {show && (
        <div className="mt-2">
          <pre className="overflow-x-auto rounded-lg border border-turf/40 bg-night/60 p-3 font-mono text-[12px] leading-relaxed text-ink">
            {q.expected}
          </pre>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{q.explain}</p>
          {db && <FilmRoom sql={q.expected} getDb={getDb} subject="answer" variant="cta" className="mt-2" />}
        </div>
      )}
    </section>
  );
}
