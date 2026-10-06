"use client";

/**
 * Mock SQL screens (`/questions/mock`): pick a format, get a clock and a few
 * unseen questions, and no help until it's over. The rules and the rubric
 * are in lib/mock-interview.ts; this file is the three screens — the lobby,
 * the live screen, and the report.
 *
 * A screen survives a reload (`sqlsports.mock.v1`): the clock is an end time,
 * not a counter, so closing the tab doesn't pause it — the same as a real
 * timed assessment. Finished screens are kept in `sqlsports.mock.history.v1`.
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
import { usePass } from "@/lib/use-pass";
import { FREE_ALLOWANCE } from "@/lib/season-pass";
import QueryDoctorPanel from "@/components/query-doctor-panel";
import FilmRoom from "@/components/film-room";
import { loadProgress, solveQuestion } from "@/lib/progress";
import type { Question } from "@/lib/questions";
import { DIFFICULTY_XP } from "@/lib/question-meta";
import { schemaFor } from "@/lib/schema-for";
import { diagnoseSql } from "@/lib/query-doctor";
import { resultsMatch } from "@/lib/sql-grade";
import {
  MOCK_FORMATS,
  clock,
  pickScreen,
  verdictFor,
  type MockAnswer,
  type MockFormat,
} from "@/lib/mock-interview";
import { gameMoment } from "@/lib/big-moments";
import { useBigMoments } from "@/components/big-moment";

type Live = {
  v: 1;
  format: MockFormat["id"];
  seed: string;
  ids: string[];
  startedAt: number;
  endsAt: number;
  answers: MockAnswer[];
  drafts: string[];
  finishedAt: number | null;
};
type HistoryRow = { at: string; format: MockFormat["id"]; solved: number; of: number; seconds: number };

const LIVE_KEY = "sqlsports.mock.v1";
const HISTORY_KEY = "sqlsports.mock.history.v1";
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

/** The pinned lesson database, booted in the tab (shared with the Analyst Screen). */
export function useLessonDb(): Database | null {
  const [db, setDb] = useState<Database | null>(null);
  useEffect(() => {
    let made: Database | null = null;
    let cancelled = false;
    Promise.all([
      import("sql.js").then((m) => m.default({ locateFile: () => "/sql-wasm.wasm" })),
      import("@/lib/fantasy-data"),
      // Screens draw from the whole bank, so the practice store comes too.
      import("@/lib/practice-datasets"),
    ]).then(([SQL, data, practice]) => {
      if (cancelled) return;
      made = new SQL.Database();
      made.run(data.buildSeedSql());
      made.run(practice.buildShopSeedSql());
      setDb(made);
    });
    return () => {
      cancelled = true;
      made?.close();
    };
  }, []);
  return db;
}

export default function MockInterview({ pool }: { pool: Question[] }) {
  const db = useLessonDb();
  const byId = useMemo(() => new Map(pool.map((q) => [q.id, q])), [pool]);
  const [live, setLive] = useState<Live | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [now, setNow] = useState(() => Date.now());
  // finish() runs from a click and from the clock, and React may call a state
  // updater twice in development: side effects live here, not in an updater,
  // and a screen is recorded once, keyed by its seed.
  const liveRef = useRef<Live | null>(null);
  liveRef.current = live;
  const recorded = useRef<string | null>(null);
  const moments = useBigMoments();
  // The interviewer's intro, once per format; the clock starts on its button.
  const [briefing, setBriefing] = useState<MockFormat | null>(null);

  useEffect(() => {
    const saved = read<Live>(LIVE_KEY);
    if (saved && saved.v === 1 && saved.ids.every((id) => byId.has(id))) setLive(saved);
    setHistory(read<HistoryRow[]>(HISTORY_KEY) ?? []);
  }, [byId]);

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

  function start(format: MockFormat) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const seed = Array.from(bytes, (b) => b.toString(36)).join("");
    const qs = pickScreen(format, seed, loadProgress().solvedQuestions, pool);
    const t = Date.now();
    setNow(t);
    setLive({
      v: 1,
      format: format.id,
      seed,
      ids: qs.map((q) => q.id),
      startedAt: t,
      endsAt: t + format.minutes * 60_000,
      answers: qs.map((q) => ({ id: q.id, attempts: 0, solvedAt: null, lastSql: "" })),
      drafts: qs.map((q) => q.starter ?? "SELECT "),
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
    const verdict = verdictFor(l.answers);
    if (verdict.band === "strong" || verdict.band === "pass") {
      const name = MOCK_FORMATS.find((f) => f.id === l.format)?.name ?? "Mock screen";
      moments.play(gameMoment("touchdown", `mock:${l.seed}`, verdict.band === "strong" ? "Strong pass!" : "You passed!", `${name} · ${row.solved} of ${row.of} solved`));
    }
  }

  function leave() {
    write(LIVE_KEY, null);
    setLive(null);
  }

  if (!live) {
    return (
      <>
        <Lobby
          onStart={(f) => (sceneSeen(`mock:${f.id}`) ? start(f) : setBriefing(f))}
          onBrief={setBriefing}
          history={history}
        />
        {briefing && (
          <Cutscene
            open
            kicker={`Mock SQL screen · ${briefing.minutes} minutes`}
            title={briefing.name}
            beats={mockBeats(briefing)}
            objectives={[
              `${briefing.mix.length} questions, ${briefing.mix[0]} to ${briefing.mix[briefing.mix.length - 1]}`,
              `${briefing.minutes} minutes on the clock, and it doesn't pause`,
              "No hints and no answer button. Run your query as often as you like",
              "A report at the end: what went wrong, and the answers",
            ]}
            startLabel="Start the clock"
            onClose={() => {
              markSceneSeen(`mock:${briefing.id}`);
              setBriefing(null);
            }}
            onStart={() => {
              const f = briefing;
              markSceneSeen(`mock:${f.id}`);
              setBriefing(null);
              start(f);
            }}
          />
        )}
      </>
    );
  }
  if (live.finishedAt)
    return (
      <>
        <Report live={live} db={db} onAgain={leave} byId={byId} />
        {moments.node}
      </>
    );
  return <Screen live={live} setLive={setLive} db={db} now={now} onFinish={finish} byId={byId} />;
}

// ── Lobby ─────────────────────────────────────────────────────────────
/** The interviewer's intro to each screen (components/cutscene.tsx). */
function mockBeats(f: MockFormat): Beat[] {
  const riley = { kind: "caller" as const, name: "Riley", title: "Analytics lead · the hiring team", tone: "ice" as const };
  return f.id === "phone"
    ? [
        { who: { kind: "coach", mood: "whistle" }, text: "Your interviewer's dialing in. Deep breath." },
        { who: riley, text: "Hi, thanks for making the time. I'll keep this to twenty minutes." },
        { who: riley, text: "Two SQL questions on our data. Run your query as often as you like, and submit when you're sure." },
        { who: { kind: "coach", mood: "point" }, text: "The clock starts when you press the button. You've got this." },
      ]
    : [
        { who: { kind: "coach", mood: "whistle" }, text: "This is the round that decides it. Interviewer's on." },
        { who: riley, text: "Welcome back. Three questions today, easy to hard, forty-five minutes." },
        { who: riley, text: "I care more about a correct answer than a clever one." },
        { who: { kind: "coach", mood: "point" }, text: "Bank the easy one first, then go after the hard one." },
      ];
}

function Lobby({
  onStart,
  onBrief,
  history,
}: {
  onStart: (f: MockFormat) => void;
  onBrief: (f: MockFormat) => void;
  history: HistoryRow[];
}) {
  // Free: one phone screen, to try it. Everything else is the Season Pass
  // (a no-op until the paywall is on).
  const pass = usePass();
  const locked = (f: MockFormat) =>
    pass === false && (f.id !== "phone" || history.length >= FREE_ALLOWANCE.mockScreens);
  const anyLocked = MOCK_FORMATS.some(locked);
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <div className="flex justify-center">
          <PassTag />
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-5xl">Mock SQL screens</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
          The first technical round for an analyst job, rehearsed. A clock, questions you haven&apos;t solved, and no
          help: no hints, no answer button. Run your query as often as you like and submit when you&apos;re sure. The
          report afterwards shows what went wrong.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {MOCK_FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => (locked(f) ? document.getElementById("mock-offer")?.scrollIntoView({ behavior: "smooth", block: "center" }) : onStart(f))}
            className={`${CARD} lift group overflow-hidden p-5 text-left transition-colors hover:border-turf/60 ${locked(f) ? "opacity-70" : ""}`}
          >
            <span className="-mx-5 -mt-5 mb-4 block h-32 border-b border-panel-border bg-night/40">
              {hasPrepArt(f.id) && <PrepArt id={f.id} className="h-full w-full" />}
            </span>
            <p className="label-broadcast text-turf">{f.minutes} minutes</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">{f.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.blurb}</p>
            <div className="mt-3 flex gap-1.5">
              {f.mix.map((d, i) => (
                <DifficultyChip key={i} difficulty={d} />
              ))}
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
        {MOCK_FORMATS.map((f, i) => (
          <span key={f.id}>
            {i > 0 && " · "}
            <button type="button" onClick={() => onBrief(f)} className="font-bold text-gold hover:underline">
              {f.name}
            </button>
          </span>
        ))}
      </p>

      {anyLocked && (
        <div id="mock-offer" className="mt-4">
          <PassOffer moment={history.length ? "mock" : "mock-technical"} />
        </div>
      )}

      <ul className="mt-6 grid gap-2 text-sm text-ink-soft sm:grid-cols-3">
        <li className={`${CARD} p-3`}>
          <strong className="text-ink">Same grading as the bank.</strong> By result, not by query text, so any
          correct SQL passes.
        </li>
        <li className={`${CARD} p-3`}>
          <strong className="text-ink">The clock doesn&apos;t pause.</strong> Close the tab and it keeps running, like
          a real timed assessment.
        </li>
        <li className={`${CARD} p-3`}>
          <strong className="text-ink">Unseen first.</strong> Questions you&apos;ve already solved come last.
        </li>
      </ul>

      {history.length > 0 && (
        <section className={`${CARD} mt-6 p-4`}>
          <p className="label-broadcast">your screens</p>
          <ul className="mt-2 divide-y divide-panel-border/60">
            {history.slice(0, 8).map((h, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink-soft">
                  {h.at} · {MOCK_FORMATS.find((f) => f.id === h.format)?.name}
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
  byId,
}: {
  live: Live;
  setLive: (fn: (l: Live | null) => Live | null) => void;
  db: Database | null;
  now: number;
  onFinish: () => void;
  byId: Map<string, Question>;
}) {
  const questions = useMemo(() => live.ids.map((id) => byId.get(id)!), [live.ids, byId]);
  const [at, setAt] = useState(() => Math.max(0, live.answers.findIndex((a) => a.solvedAt === null)));
  const [result, setResult] = useState<{ grid?: QueryExecResult; error?: string; verdict?: "right" | "wrong" } | null>(null);
  const q = questions[at];
  const answer = live.answers[at];
  const left = (live.endsAt - now) / 1000;
  const sql = live.drafts[at];
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setResult(null), [at]);

  function setSql(next: string) {
    setLive((l) => (l ? { ...l, drafts: l.drafts.map((d, i) => (i === at ? next : d)) } : l));
  }

  function run(grade: boolean) {
    if (!db) return;
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
              i === at ? { ...a, attempts: a.attempts + 1, lastSql: sql, solvedAt: a.solvedAt ?? (ok ? t : null) } : a,
            ),
          }
        : l,
    );
    if (ok) solveQuestion(q.id, DIFFICULTY_XP[q.difficulty], false, "", "");
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
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            {MOCK_FORMATS.find((f) => f.id === live.format)?.name}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {questions.map((x, i) => {
            const solved = live.answers[i].solvedAt !== null;
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => setAt(i)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] font-bold ${
                  i === at
                    ? "border-ice bg-ice/15 text-ice"
                    : solved
                      ? "border-turf/60 text-turf"
                      : "border-panel-border text-ink-soft hover:text-ink"
                }`}
              >
                Q{i + 1} {solved ? "✓" : ""}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              if (window.confirm("End the screen now? Unsolved questions count as missed.")) onFinish();
            }}
            className="ml-1 rounded-lg border border-gold/60 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:bg-gold/10"
          >
            End screen
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className={`${CARD} p-5 lg:col-span-5`}>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-ink-muted">Question {at + 1}</span>
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
            ref={editorRef}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                run(true);
              }
            }}
          >
            <CodeEditor value={sql} onChange={setSql} lang="sql" rows={12} ariaLabel={`SQL for question ${at + 1}`} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!db}
              onClick={() => run(false)}
              className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-ice/50 hover:text-ice disabled:opacity-40"
            >
              Run
            </button>
            <button type="button" disabled={!db} onClick={() => run(true)} className="press btn-turf disabled:opacity-40">
              Submit
            </button>
            <span className="font-mono text-[10px] text-ink-muted">
              {answer.attempts} submission{answer.attempts === 1 ? "" : "s"}
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
              {at < questions.length - 1 ? (
                <button type="button" onClick={() => setAt(at + 1)} className="mt-2 press btn-turf">
                  Next question →
                </button>
              ) : live.answers.every((a) => a.solvedAt !== null) ? (
                <button type="button" onClick={onFinish} className="mt-2 press btn-gold">
                  Finish and see the report →
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
    </div>
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
function Report({
  live,
  db,
  onAgain,
  byId,
}: {
  live: Live;
  db: Database | null;
  onAgain: () => void;
  byId: Map<string, Question>;
}) {
  const questions = live.ids.map((id) => byId.get(id)!);
  const verdict = verdictFor(live.answers);
  const solved = live.answers.filter((a) => a.solvedAt !== null).length;
  const used = Math.round(((live.finishedAt ?? live.endsAt) - live.startedAt) / 1000);
  const format = MOCK_FORMATS.find((f) => f.id === live.format)!;
  const tone = verdict.band === "strong" ? "border-turf/60 bg-turf/10" : verdict.band === "pass" ? "border-ice/50 bg-ice/10" : "border-gold/50 bg-gold/10";

  return (
    <div className="mx-auto max-w-4xl">
      <section className={`${CARD} p-6 text-center sm:p-8`}>
        <p className="label-broadcast text-gold">{format.name} · report</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">
          {solved} of {questions.length} solved
        </h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">
          in {clock(used)} of {format.minutes}:00
        </p>
        <div className={`mx-auto mt-5 max-w-md rounded-xl border p-3 ${tone}`}>
          <p className="font-display text-xl font-bold text-ink">{verdict.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{verdict.detail}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink-muted">our rubric, not any company&apos;s</p>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onAgain} className="press btn-turf">
            Run another screen
          </button>
          <Link
            href="/questions"
            className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft hover:border-turf/40"
          >
            Practise in the bank
          </Link>
        </div>
      </section>

      <div className="mt-4 space-y-4">
        {questions.map((q, i) => (
          <ReportItem key={q.id} q={q} n={i + 1} answer={live.answers[i]} db={db} />
        ))}
      </div>
    </div>
  );
}

function ReportItem({ q, n, answer, db }: { q: Question; n: number; answer: MockAnswer; db: Database | null }) {
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
          <span className="font-mono text-[11px] font-bold text-ink-muted">Q{n}</span>
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
