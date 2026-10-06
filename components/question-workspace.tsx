"use client";

/**
 * Solving one question, in whichever language it is written for.
 *
 * Deliberately not the lesson player. There is no drive, no down, no timeout
 * and nothing to lose — a wrong answer here costs you the twenty seconds you
 * spent on it. That is the whole point of the question bank: it has to be
 * cheap enough to open on a phone in a queue.
 *
 * Four runtimes behind one surface:
 *
 *   sql     → sql.js against the pinned lesson database, graded on the
 *             result grid, so a CTE and a subquery both pass
 *   python  → Pyodide, graded on what the code prints
 *   r       → WebR, same
 *   excel   → the real formula engine, graded on the value produced, so any
 *             correct spelling passes
 *
 * Python and R are multi-megabyte downloads, so they are fetched only when
 * a question in that language is opened, never on page load, and the button
 * says what it is about to cost before it costs it.
 *
 * The three affordances are ordered by how much they give away, and each is a
 * deliberate click: Run (see your own output), Hint (a nudge), Solution (the
 * key). Run is free and unlimited because looking at what your code actually
 * did is how people debug, and hiding it behind a grade would teach guessing.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Database, QueryExecResult } from "sql.js";
import ChartIt from "@/components/chart-it";
import { NFLVERSE_CREDIT } from "@/lib/chart";
import { SITE_URL } from "@/lib/site";
import {
  dailyNumber,
  encodeDailyResult,
  shareText,
  triesSquares,
  withIdentity,
  type DailyResult,
} from "@/lib/daily-share";
import { PAYWALL_LIVE } from "@/lib/season-pass";
import { waitlistJoined } from "@/lib/waitlist-memory";
import { consumeRankUp, shareIdentity, tenureFrom, type Rank } from "@/lib/tenure";
import type { CellValue } from "@/lib/excel-data";
import type { Question } from "@/lib/questions";
import {
  DIFFICULTY_XP,
  LANG_LABEL,
  LANG_WEIGHT,
  schemaFor,
} from "@/lib/questions";
import { resultsMatch } from "@/lib/sql-grade";
import { solveQuestion, loadProgress, setCallSign } from "@/lib/progress";
import { SHORT_CREDIT } from "@/lib/data-source";
import { playSfx } from "@/lib/sfx";
import CodeEditor from "@/components/code-editor";
import QuestionArt from "@/components/question-art";
import { Objective, SceneLine } from "@/components/scene-line";
import AppNav from "@/components/app-nav";
import { FaceCluster } from "@/components/qotd-card";
import { featuredPlayers } from "@/lib/question-players";
import { isLeagueOnly, SHOP_CREDIT, usesPlays, usesShop } from "@/lib/practice-schemas";
import Coach, { celebrationFor } from "@/components/coach";
import ExcelGrid from "@/components/excel-grid";
import DifficultyChip from "@/components/difficulty-chip";
import QueryDoctorPanel from "@/components/query-doctor-panel";
import FilmRoom from "@/components/film-room";
import PassOffer from "@/components/pass-offer";
import PassTag from "@/components/pass-tag";
import { usePass } from "@/lib/use-pass";
import { diagnoseSql, type Finding } from "@/lib/query-doctor";

/** The day the after-daily Season Pass offer was last dismissed. */
const AFTER_DAILY_KEY = "sqlsports.pass.afterDaily";

type Outcome = {
  /** Rendered output: a grid for SQL, text for everything else. */
  grid?: QueryExecResult;
  text?: string;
  error?: string;
};

/**
 * One honest sentence about the *shape* of a wrong answer: column names and
 * row count for SQL, line count for printed output, kind of value for Excel.
 * Shape, never values. It points at the mistake without handing over the
 * answer, which is the whole difference between a hint and a leak.
 */
function gridDiag(
  mine: QueryExecResult | undefined,
  key: QueryExecResult | undefined,
  orderMatters: boolean,
): string {
  if (!key) return "";
  const cols = (r?: QueryExecResult) => (r?.columns ?? []).join(", ");
  const rows = (r?: QueryExecResult) => r?.values.length ?? 0;
  const plural = (n: number) => (n === 1 ? "" : "s");
  if (!mine) {
    return `Your query returned no rows. The answer is ${rows(key)} row${plural(rows(key))} with columns ${cols(key)}.`;
  }
  if (cols(mine).toLowerCase() !== cols(key).toLowerCase()) {
    return `Your grid has columns ${cols(mine) || "(none)"}. The answer has ${cols(key)} — same columns, same order, same names.`;
  }
  if (rows(mine) !== rows(key)) {
    return `Right columns, wrong count: you returned ${rows(mine)} row${plural(rows(mine))}, the answer has ${rows(key)}. Check the filter, the grouping, or the LIMIT.`;
  }
  return orderMatters
    ? "Same columns, same row count, different values or order — check a calculation, a rounding, or the ORDER BY."
    : "Same columns, same row count, different values — check a calculation or a rounding.";
}

function printDiag(mine: string, key: string): string {
  const lines = (s: string) => s.trim().split(/\r?\n/).length;
  if (!mine.trim()) {
    return "Nothing was printed. Grading compares printed output, so the answer has to come out of print().";
  }
  const m = lines(mine);
  const k = lines(key);
  if (m !== k) return `You printed ${m} line${m === 1 ? "" : "s"}; the answer prints ${k}.`;
  return "Same number of lines, different content — check a rounding, a sort order, or a column name.";
}

function valueDiag(mine: CellValue | boolean, key: CellValue | boolean): string {
  const kind = (v: CellValue | boolean) =>
    typeof v === "number"
      ? "a number"
      : typeof v === "boolean"
        ? "TRUE/FALSE"
        : v === null || v === ""
          ? "blank"
          : "text";
  if (kind(mine) !== kind(key)) {
    return `Your formula returns ${kind(mine)}; the answer is ${kind(key)}.`;
  }
  return "Right kind of value, wrong amount — check the range you pointed at.";
}

function ResultGrid({ res }: { res: QueryExecResult }) {
  return (
    <div className="max-h-56 overflow-auto rounded-lg border border-panel-border">
      <table className="w-full text-left font-mono text-[11px]">
        <thead className="sticky top-0 bg-panel">
          <tr className="border-b border-panel-border text-ink-muted">
            {res.columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-3 py-1.5 font-semibold uppercase tracking-wider"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {res.values.map((row, i) => (
            <tr key={i} className="border-b border-panel-border/50 text-ink">
              {row.map((cell, j) => (
                <td key={j} className="whitespace-nowrap px-3 py-1.5">
                  {cell === null ? (
                    <span className="text-ink-muted">NULL</span>
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function QuestionWorkspace({
  question,
  isQotd,
  day,
  prevDay,
  nextId,
  prevId,
  position,
  total,
  challenge = null,
  free = true,
}: {
  question: Question;
  isQotd: boolean;
  /** A friend's daily result, from a /questions/<id>/vs/<n>-<tries> link. */
  challenge?: DailyResult | null;
  /** Solvable without the Season Pass (lib/pass-gates.ts). */
  free?: boolean;
  /** League-timezone day, resolved on the server so it can't drift. */
  day: string;
  prevDay: string;
  nextId: string | null;
  prevId: string | null;
  /** 1-based index within this language's pool, for "3 of 29". */
  position: number;
  total: number;
}) {
  const isSql = question.lang === "sql";
  const isExcel = question.lang === "excel";

  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(isExcel ? false : isSql ? false : true);
  const [booting, setBooting] = useState(false);
  const [code, setCode] = useState(
    question.starter ?? (isSql ? "SELECT " : isExcel ? "=" : ""),
  );
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [diag, setDiag] = useState<string | null>(null);
  /** SQL only: Query Doctor's findings on the last wrong or broken query. */
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [alreadySolved, setAlreadySolved] = useState(false);
  const [reward, setReward] = useState<{ xp: number; tickets: number } | null>(
    null,
  );
  // Graded submissions this visit, for the daily question's share line.
  const [tries, setTries] = useState(0);
  // The Season Pass gate (a no-op until the paywall is on): a Pass question
  // can be read and Run, but Submit and the solution open the offer.
  const pass = usePass();
  const locked = pass === false && !free;
  const [offer, setOffer] = useState(false);
  const [afterDailyOffer, setAfterDailyOffer] = useState(false);
  const [rankUp, setRankUp] = useState<Rank | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  /** SQL only: the query behind the result on screen, for the Film Room. */
  const [ranSql, setRanSql] = useState<string | null>(null);
  const getDb = useCallback(() => dbRef.current, []);

  useEffect(() => {
    setAlreadySolved(loadProgress().solvedQuestions.includes(question.id));
  }, [question.id]);

  // SQL and Excel are local and cheap, so warm them immediately. Python and R
  // are not, so they wait for the learner to press something.
  useEffect(() => {
    let cancelled = false;
    if (isSql) {
      let db: Database | null = null;
      Promise.all([
        import("sql.js").then((m) =>
          m.default({ locateFile: () => "/sql-wasm.wasm" }),
        ),
        import("@/lib/fantasy-data"),
        // The practice store, only for a question that uses it.
        usesShop(question.tables) ? import("@/lib/practice-datasets") : null,
        // The 2025 play-by-play (~0.8 MB), likewise.
        usesPlays(question.tables) ? import("@/lib/plays-dataset") : null,
      ])
        .then(async ([SQL, data, practice, plays]) => {
          if (cancelled) return;
          const made = new SQL.Database();
          made.run(data.buildSeedSql());
          if (practice) made.run(practice.buildShopSeedSql());
          if (plays) await plays.loadPlays(made);
          // The page may have moved on while the plays downloaded.
          if (cancelled) {
            made.close();
            return;
          }
          db = made;
          dbRef.current = made;
          setReady(true);
        })
        .catch(() =>
          setOutcome({ error: "The SQL engine didn't load. Try a refresh." }),
        );
      return () => {
        cancelled = true;
        db?.close();
        dbRef.current = null;
      };
    }
    if (isExcel) {
      import("@/lib/excel-engine")
        .then((m) => m.ensureFormulaEngine())
        .then(() => !cancelled && setReady(true))
        .catch(() =>
          setOutcome({ error: "The formula engine didn't load. Try a refresh." }),
        );
      return () => {
        cancelled = true;
      };
    }
    return () => {
      cancelled = true;
    };
  }, [isSql, isExcel]);

  /** Run the learner's work, and optionally grade it. */
  const attempt = useCallback(
    async (grade: boolean) => {
      if (grade && locked) {
        setOffer(true);
        return;
      }
      setVerdict(null);
      setFindings(null);
      if (grade) setTries((t) => t + 1);

      if (isSql) {
        const db = dbRef.current;
        if (!db) return;
        const schema = schemaFor(question).map((t) => ({ name: t.table, columns: t.columns }));
        let mine: QueryExecResult | undefined;
        try {
          mine = db.exec(code)[0];
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          setOutcome({ error });
          setFindings(diagnoseSql({ sql: code, error, schema }));
          return;
        }
        setOutcome({ grid: mine });
        setRanSql(code);
        if (!grade) return;
        const key = db.exec(question.expected)[0];
        const orderMatters = question.orderMatters ?? false;
        const ok = resultsMatch(mine, key, orderMatters);
        if (!ok) setFindings(diagnoseSql({ sql: code, mine, key, orderMatters, schema }));
        finish(ok, ok ? null : gridDiag(mine, key, orderMatters));
        return;
      }

      if (isExcel) {
        const engine = await import("@/lib/excel-engine");
        const sheet = question.sheet;
        const mine = await engine.evaluateFormula(code, sheet);
        if (mine.error) {
          setOutcome({ error: mine.error });
          return;
        }
        // A formula that reads no cell is rejected even when the number is
        // right — reading the answer off the grid is not the skill.
        if (grade && !engine.referencesCells(code)) {
          setOutcome({
            text: engine.formatValue(mine.value),
            error:
              "That answer doesn't reference a cell. Point at the data rather than typing the number you can see.",
          });
          return;
        }
        setOutcome({ text: engine.formatValue(mine.value) });
        if (!grade) return;
        const key = await engine.evaluateFormula(question.expected, sheet);
        const okX = engine.valuesMatch(mine.value, key.value);
        finish(okX, okX ? null : valueDiag(mine.value, key.value));
        return;
      }

      // Python and R: a cold runtime is a download, so say so and wait.
      setBooting(true);
      try {
        const rt = await import("@/lib/runtimes");
        const lang = question.lang === "r" ? "r" : "python";
        const prelude = question.setup ?? "";
        const mine = await rt.runCode(lang, `${prelude}\n${code}`);
        setReady(true);
        if (mine.error) {
          setOutcome({ error: mine.error });
          return;
        }
        setOutcome({ text: mine.stdout || "(nothing printed)" });
        if (!grade) return;
        const key = await rt.runCode(lang, `${prelude}\n${question.expected}`);
        const okP =
          Boolean(mine.stdout.trim()) &&
          mine.stdout.trim() === (key.stdout ?? "").trim();
        finish(okP, okP ? null : printDiag(mine.stdout, key.stdout ?? ""));
      } finally {
        setBooting(false);
      }

      function finish(ok: boolean, why: string | null = null) {
        setVerdict(ok ? "right" : "wrong");
        setDiag(why);
        playSfx(ok ? "touchdown" : "miss");
        if (!ok) return;
        const firstSolve = !alreadySolved;
        solveQuestion(
          question.id,
          DIFFICULTY_XP[question.difficulty],
          isQotd,
          day,
          prevDay,
        );
        setReward({
          xp: firstSolve ? DIFFICULTY_XP[question.difficulty] : 0,
          tickets: (firstSolve ? 5 : 1) + (isQotd ? 10 : 0),
        });
        setAlreadySolved(true);
        const progress = loadProgress();
        const promoted = consumeRankUp(progress);
        if (promoted) {
          setRankUp(promoted);
          playSfx("unlock");
        }
        if (!progress.username?.trim()) setNeedsName(true);
        // Soft offer after the daily: waitlist while the paywall is off,
        // Pass checkout once it's on. Never before or during the solve.
        const soft =
          isQotd &&
          (pass === false || !PAYWALL_LIVE) &&
          !( !PAYWALL_LIVE && waitlistJoined() );
        if (soft) {
          let seen = false;
          try {
            seen = localStorage.getItem(AFTER_DAILY_KEY) === day;
          } catch {
            /* show it */
          }
          setAfterDailyOffer(!seen);
        }
      }
    },
    // `finish` is declared inside so it closes over the current solve state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, question, isSql, isExcel, alreadySolved, isQotd, day, prevDay, locked, pass],
  );

  const tables = schemaFor(question);
  // A store question credits the invented store, not nflverse.
  const storeOnly =
    usesShop(question.tables) && !question.tables.some((t) => isLeagueOnly([t]));
  const weight = LANG_WEIGHT[question.lang];
  // A friend's link from an earlier day still works; it just isn't today's.
  const challengeIsToday = !!challenge && isQotd && challenge.number === dailyNumber(day);
  const players = featuredPlayers(question, 3);
  const canPress = isSql || isExcel ? ready : !booting;

  return (
    <>
      <AppNav back="/questions" backLabel="all questions" />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6">
        {challenge && (
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
            <span className="font-mono text-base tracking-[0.12em]" aria-hidden>
              {triesSquares(challenge.tries)}
            </span>
            <p className="text-sm text-ink">
              A friend solved this in{" "}
              <strong>
                {challenge.tries} {challenge.tries === 1 ? "try" : "tries"}
              </strong>{" "}
              as Daily {LANG_LABEL[question.lang]} #{challenge.number}.{" "}
              {challengeIsToday ? "Your turn." : "Beat their score, then try today's."}
            </p>
            {!challengeIsToday && (
              <Link href="/questions" className="ml-auto font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline">
                Today&apos;s is #{dailyNumber(day)} →
              </Link>
            )}
          </div>
        )}
        {/* On a phone this is a column in reading order: the problem, then
            the editor, then the tables and hints. On a desktop it is two
            columns, with the editor spanning both rows on the right. Putting
            the editor third on a phone meant scrolling past every reference
            block before you could type a character. */}
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-start">
          {/* ── The problem ───────────────────────────────── */}
          <section className="order-1 lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <div className="surface overflow-hidden rounded-2xl border border-panel-border bg-panel">
              <div className="relative h-36 overflow-hidden border-b border-panel-border">
                <QuestionArt
                  art={question.art}
                  align="left"
                  className="absolute inset-0 h-full w-full"
                />
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <FaceCluster players={players} size={72} names={false} />
                </div>
                {isQotd && (
                  <span className="absolute left-4 top-4 rounded-full border border-gold/50 bg-night/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                    Question of the day
                  </span>
                )}
                {alreadySolved && (
                  <span className="absolute right-4 top-4 rounded-full border border-turf/50 bg-night/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-turf">
                    ✓ Solved
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyChip difficulty={question.difficulty} />
                  <span className="rounded-full border border-ice/40 bg-ice/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ice">
                    {LANG_LABEL[question.lang]}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                    +{DIFFICULTY_XP[question.difficulty]} XP
                  </span>
                </div>
                <h1 className="mt-2 font-display text-2xl font-bold text-ink">
                  {question.title}
                </h1>
                {/* The situation, delivered like a scene; the task, as an
                    objective that ticks when it's solved. */}
                <SceneLine
                  mood={alreadySolved || verdict === "right" ? celebrationFor(question.id) : "think"}
                  className="mt-3"
                >
                  {question.prompt}
                </SceneLine>

                <Objective done={alreadySolved || verdict === "right"} className="mt-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Return </span>
                  {question.returns}
                </Objective>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {question.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-panel-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* -- Reference: tables, prelude, hints -- */}
          <section className="order-3 lg:col-span-5 lg:col-start-1 lg:row-start-2">
            {/* What you're working on. Only the tables this question touches —
                a learner who has to scroll past three irrelevant ones to find
                a column name stops looking and guesses. */}
            {isSql && (
              <div className="surface mt-3 rounded-2xl border border-panel-border bg-panel p-5">
                <p className="label-broadcast text-turf">the tables</p>
                <div className="mt-3 space-y-3">
                  {tables.map((t) => (
                    <div key={t.table}>
                      <p className="font-mono text-[12px] font-bold text-ink">
                        {t.table}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-ink-muted">
                        {t.columns.join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border-t border-panel-border pt-2 font-mono text-[10px] text-ink-muted">
                  {storeOnly ? SHOP_CREDIT : SHORT_CREDIT} ·{" "}
                  <Link
                    href={storeOnly ? "/data#practice-store" : "/data"}
                    className="text-turf hover:underline"
                  >
                    where this comes from
                  </Link>
                </p>
              </div>
            )}

            {question.setup && (
              <div className="surface mt-3 rounded-2xl border border-panel-border bg-panel p-5">
                <p className="label-broadcast text-turf">already loaded</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                  This runs before your code. Same twenty players the SQL
                  questions use.
                </p>
                <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-panel-border bg-night/60 px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-soft">
                  {question.setup}
                </pre>
              </div>
            )}

            {isExcel && (
              <div className="mt-3">
                <ExcelGrid sheet={question.sheet} maxRows={8} />
              </div>
            )}

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => setHintOpen((v) => !v)}
                className="w-full rounded-xl border border-panel-border px-4 py-2.5 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-ice/40 hover:text-ice"
              >
                {hintOpen ? "Hide hint" : "Need a hint?"}
              </button>
              {hintOpen && (
                <p className="rounded-xl border border-ice/30 bg-ice/5 px-4 py-3 text-sm leading-relaxed text-ink-soft">
                  {question.hint}
                </p>
              )}
              <button
                type="button"
                onClick={() => (locked ? setOffer(true) : setSolutionOpen((v) => !v))}
                className="w-full rounded-xl border border-panel-border px-4 py-2.5 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
              >
                {solutionOpen ? "Hide solution" : "Show solution"}
              </button>
              {solutionOpen && (
                <>
                  <pre className="overflow-x-auto rounded-xl border border-gold/30 bg-night/60 px-4 py-3 font-mono text-[12px] leading-relaxed text-ink-soft">
                    {question.expected}
                  </pre>
                  {isSql && ready && (
                    <FilmRoom sql={question.expected} getDb={getDb} subject="answer" variant="cta" locked={locked} onLocked={() => setOffer(true)} />
                  )}
                </>
              )}
            </div>
          </section>

          {/* ── The workspace ─────────────────────────────── */}
          <section className="order-2 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            <div className="surface rounded-2xl border border-panel-border bg-panel p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="label-broadcast text-ice">
                  {isExcel ? "your formula" : "your code"}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  {booting
                    ? `starting ${LANG_LABEL[question.lang]}…`
                    : ready
                      ? `${LANG_LABEL[question.lang]} · in your browser`
                      : weight
                        ? `${LANG_LABEL[question.lang]} · ${weight}`
                        : "warming up…"}
                </span>
              </div>

              {/* Cmd/Ctrl+Enter submits, the way every editor of this shape
                  does. Caught on a wrapper because the keydown bubbles up out
                  of the textarea; preventDefault stops it inserting a newline
                  on the way. */}
              <div
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    if (canPress) void attempt(true);
                  }
                }}
              >
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  lang={question.lang}
                  rows={isExcel ? 2 : 12}
                  ariaLabel={`${LANG_LABEL[question.lang]} for ${question.title}`}
                  disabled={booting}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void attempt(false)}
                  disabled={!canPress}
                  className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-ice/50 hover:text-ice disabled:opacity-40"
                >
                  Run
                </button>
                <button
                  type="button"
                  onClick={() => void attempt(true)}
                  disabled={!canPress}
                  className="press btn-turf disabled:opacity-40"
                >
                  {booting ? "Starting…" : "Submit"}
                </button>
                <span className="hidden font-mono text-[10px] text-ink-muted md:inline">
                  ⌘ / Ctrl + Enter submits
                </span>
                {locked && <PassTag />}
                <button
                  type="button"
                  onClick={() => {
                    setCode(
                      question.starter ??
                        (isSql ? "SELECT " : isExcel ? "=" : ""),
                    );
                    setOutcome(null);
                    setVerdict(null);
                    setDiag(null);
                    setFindings(null);
                  }}
                  className="ml-auto font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors hover:text-ink"
                >
                  Reset
                </button>
              </div>

              {offer && locked && <PassOffer moment="question" className="mt-3" />}

              {weight && !ready && !booting && (
                <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-muted">
                  First run downloads {LANG_LABEL[question.lang]} ({weight}).
                  After that it is instant for the rest of the session.
                </p>
              )}

              {outcome?.error && (
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-gold/50 bg-gold/10 p-4">
                  <Coach mood="facepalm" size={48} className="hidden shrink-0 sm:block" />
                  <p role="alert" className="min-w-0 font-mono text-[12px] leading-relaxed text-gold">
                    {outcome.error}
                  </p>
                </div>
              )}
              {outcome?.error && isSql && findings && (
                <QueryDoctorPanel findings={findings} sql={code} prompt={question.prompt} returns={question.returns} />
              )}

              {verdict === "wrong" && (
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-ice/40 bg-ice/5 p-4">
                  <Coach mood="shrug" size={48} className="hidden shrink-0 sm:block" />
                  <div className="min-w-0">
                    <p className="font-display text-base font-bold text-ice">
                      Not quite what we&apos;re after.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      It ran fine — it just produced something different. Compare
                      your output against what the question asks for:{" "}
                      <span className="text-ink">{question.returns}</span>
                    </p>
                    {isSql && findings?.length ? (
                      <QueryDoctorPanel findings={findings} sql={code} prompt={question.prompt} returns={question.returns} />
                    ) : (
                      diag && (
                        <p className="mt-2 rounded-lg border border-ice/30 bg-night/40 px-3 py-2 font-mono text-[12px] leading-relaxed text-ice">
                          {diag}
                        </p>
                      )
                    )}
                  </div>
                </div>
              )}

              {verdict === "right" && (
                <div className="mt-3 rounded-xl border border-turf/50 bg-turf/10 p-4">
                  <div className="flex items-start gap-3">
                    <Coach
                      mood={celebrationFor(question.id)}
                      size={54}
                      className="hidden shrink-0 sm:block"
                    />
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold text-turf">
                        Correct.
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {question.explain}
                      </p>
                      {isSql && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <FilmRoom sql={question.expected} getDb={getDb} subject="answer" variant="cta" locked={locked} onLocked={() => setOffer(true)} />
                          <span className="text-xs text-ink-muted">Our answer, clause by clause, in the order the database runs it.</span>
                        </div>
                      )}
                      {reward && (
                        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-gold">
                          {reward.xp > 0
                            ? `+${reward.xp} XP · +${reward.tickets} tickets`
                            : `+${reward.tickets} ticket${reward.tickets === 1 ? "" : "s"} · already banked the XP for this one`}
                          {(() => {
                            const t = tenureFrom(loadProgress());
                            return t.next
                              ? ` · ${t.need} to ${t.next.name}`
                              : "";
                          })()}
                        </p>
                      )}
                      {rankUp && (
                        <div className="mt-3 rounded-xl border border-gold/50 bg-gold/10 px-3 py-2.5">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                            Promoted
                          </p>
                          <p className="mt-0.5 font-display text-lg font-bold text-ink">
                            You&apos;re a {rankUp.name}
                          </p>
                          <p className="text-xs text-ink-soft">{rankUp.blurb}</p>
                          <Link
                            href="/account#locker"
                            className="mt-1 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
                          >
                            See your locker →
                          </Link>
                        </div>
                      )}
                      {needsName && (
                        <div className="mt-3 rounded-xl border border-ice/40 bg-ice/10 px-3 py-2.5">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ice">
                            Name your player
                          </p>
                          <p className="mt-0.5 text-xs text-ink-soft">
                            Your callsign shows on shares and the leaderboard.
                          </p>
                          <div className="mt-2 flex gap-2">
                            <input
                              value={nameDraft}
                              onChange={(e) => setNameDraft(e.target.value.slice(0, 24))}
                              placeholder="Callsign"
                              maxLength={24}
                              className="min-w-0 flex-1 rounded-lg border border-panel-border bg-night px-2.5 py-1.5 font-display text-sm font-bold text-ink outline-none focus:border-ice"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!nameDraft.trim()) return;
                                setCallSign(nameDraft);
                                setNeedsName(false);
                              }}
                              className="rounded-lg border border-ice/50 bg-ice/15 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ice"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setNeedsName(false)}
                              className="font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink"
                            >
                              Later
                            </button>
                          </div>
                        </div>
                      )}
                      {challenge && tries > 0 && (
                        <p className="mt-3 rounded-lg border border-panel-border bg-night/40 px-3 py-2 text-sm text-ink">
                          You: <strong>{tries}</strong> · Your friend: <strong>{challenge.tries}</strong>.{" "}
                          <span className={tries < challenge.tries ? "text-turf" : tries === challenge.tries ? "text-ice" : "text-gold"}>
                            {tries < challenge.tries
                              ? "You win."
                              : tries === challenge.tries
                                ? "Dead heat."
                                : "They take this one."}
                          </span>
                        </p>
                      )}
                      {afterDailyOffer && (
                        <PassOffer
                          moment="after-daily"
                          className="mt-3"
                          onDismiss={() => {
                            setAfterDailyOffer(false);
                            try {
                              localStorage.setItem(AFTER_DAILY_KEY, day);
                            } catch {
                              /* fine: it just shows again tomorrow */
                            }
                          }}
                        />
                      )}
                      {isQotd && tries > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2">
                          <span className="font-mono text-base tracking-[0.12em]" aria-hidden>
                            {triesSquares(tries)}
                          </span>
                          <span className="text-xs text-ink-soft">
                            Today&apos;s question in {tries} {tries === 1 ? "try" : "tries"}.
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              // The link is a challenge page: its preview shows
                              // this score and the squares, and a friend who
                              // opens it lands on the question with the score
                              // to beat.
                              const how = await shareText(
                                withIdentity(
                                  `DataDraft Daily ${LANG_LABEL[question.lang]} #${dailyNumber(day)} · solved in ${tries} ${tries === 1 ? "try" : "tries"}
${triesSquares(tries)}
Same question for everyone today:
${SITE_URL}/questions/${question.id}/vs/${encodeDailyResult(dailyNumber(day), tries)}`,
                                  shareIdentity(loadProgress()),
                                ),
                              );
                              setShareNote(how === "copied" ? "Copied" : how === "failed" ? "Couldn't copy" : null);
                            }}
                            className="press ml-auto rounded-lg border border-gold/60 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/15"
                          >
                            {shareNote ?? "Share"}
                          </button>
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {nextId && (
                          <Link
                            href={`/questions/${nextId}`}
                            className="press btn-turf"
                          >
                            Next question
                          </Link>
                        )}
                        <Link
                          href="/questions"
                          className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-turf/40"
                        >
                          Back to the bank
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {outcome?.grid && (
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                      your result · {outcome.grid.values.length} row
                      {outcome.grid.values.length === 1 ? "" : "s"}
                    </p>
                    <div className="flex items-center gap-2">
                    {ranSql && (
                      <FilmRoom sql={ranSql} getDb={getDb} subject="yours" locked={locked} onLocked={() => setOffer(true)} />
                    )}
                    <ChartIt
                      grid={outcome.grid}
                      title={question.title}
                      subtitle={isQotd ? "Today's DataDraft question · one SQL query on real NFL data" : "One SQL query on real NFL data"}
                      credit={NFLVERSE_CREDIT}
                      shareUrl={`${SITE_URL}/questions/${question.id}`}
                      shareText={isQotd ? `Solved today's DataDraft question: ${question.title}` : `${question.title}, in one SQL query.`}
                    />
                    </div>
                  </div>
                  <ResultGrid res={outcome.grid} />
                </div>
              )}

              {outcome?.text !== undefined && (
                <div className="mt-4">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                    {isExcel ? "value" : "output"}
                  </p>
                  <pre className="max-h-56 overflow-auto rounded-lg border border-panel-border bg-night/60 px-3 py-2 font-mono text-[12px] leading-relaxed text-ink">
                    {outcome.text}
                  </pre>
                </div>
              )}
            </div>
          </section>
        </div>

        <nav
          aria-label="Question navigation"
          className="mt-6 flex items-center justify-between gap-3 border-t border-panel-border pt-4 font-mono text-[11px] uppercase tracking-wider"
        >
          {prevId ? (
            <Link
              href={`/questions/${prevId}`}
              className="text-ink-muted transition-colors hover:text-ink"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink-muted">
            {LANG_LABEL[question.lang]} · {position} of {total}
          </span>
          {nextId ? (
            <Link
              href={`/questions/${nextId}`}
              className="text-ink-muted transition-colors hover:text-ink"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </>
  );
}
