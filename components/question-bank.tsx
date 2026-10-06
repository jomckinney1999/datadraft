"use client";

/**
 * The question bank — a LeetCode list with a Question of the Day on top.
 *
 * The QOTD card is the whole retention argument in one component: the same
 * question for everyone, a streak that only advances by solving it, and a
 * reason to open the site on a Tuesday when you are not in the mood for a
 * lesson.
 *
 * **There is a daily per language, and the card follows your filter.** One
 * rotation across the whole bank would hand a SQL learner an R question and
 * break a streak they had done nothing to lose. Solving any language's daily
 * counts for the day.
 *
 * The list itself is deliberately plain — language, difficulty, title, tags,
 * solved tick. A card grid looks better and scans worse, and this is a page
 * people come back to dozens of times.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Question, QuestionArt as QuestionArtId } from "@/lib/questions";
// The list arrives as props from the server (app/questions/page.tsx): the
// bank itself carries every answer key, setup prelude, hint and explanation,
// and importing it here put all of that in this page's JavaScript.
import {
  DIFFICULTY_XP,
  LANG_LABEL,
  LANG_WEIGHT,
  type QuestionDifficulty,
  type QuestionLang,
} from "@/lib/question-meta";
import { EMPTY_PROGRESS, loadProgress, type Progress } from "@/lib/progress";
import QuestionArt from "@/components/question-art";
import DifficultyChip from "@/components/difficulty-chip";
import AppNav from "@/components/app-nav";
import QotdCard from "@/components/qotd-card";
import DuelCard from "@/components/duel-card";
import PassTag from "@/components/pass-tag";
import PrepArt, { hasPrepArt } from "@/components/prep-art";
import { FACTS } from "@/lib/lesson-facts.generated";
import { DATASETS, datasetOf, type DatasetId } from "@/lib/practice-schemas";

type LangFilter = "all" | QuestionLang;

/**
 * Remembered per browser. A Python learner should land on the Python daily,
 * not reselect it every visit; picking "All" clears the memory rather than
 * storing it, so a cleared filter is the same as a fresh one.
 */
const LANG_KEY = "sqlsports.questions.lang";
const LANG_VALUES: readonly string[] = ["sql", "python", "r", "excel"];
type DiffFilter = "all" | QuestionDifficulty;

const LANGS: QuestionLang[] = ["sql", "python", "r", "excel"];

const LANG_TINT: Record<QuestionLang, string> = {
  sql: "border-turf bg-turf/15 text-turf",
  python: "border-ice bg-ice/15 text-ice",
  r: "border-gold bg-gold/15 text-gold",
  excel: "border-turf bg-turf/15 text-turf",
};

function FlameIcon({ lit }: { lit: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${lit ? "text-gold" : "text-ink-muted"}`}
      aria-hidden
    >
      <path
        d="M12 2c1 4-3 5.5-3 9a3 3 0 0 0 6 0c0-1.5-.8-2.6-.8-2.6S17 10 17 13a5 5 0 0 1-10 0c0-4.5 4-6.5 5-11z"
        fill="currentColor"
      />
    </svg>
  );
}

/** What the list shows for one question: no key, prelude or hints. */
export type BankItem = Pick<Question, "id" | "title" | "lang" | "difficulty" | "tags" | "tables" | "prompt"> & {
  art: QuestionArtId;
};

/** An interview pattern and the questions in it, worked out on the server. */
export type BankPattern = { id: string; name: string; asks: string; ids: string[] };

export default function QuestionBank({
  day,
  list,
  dailies,
  patterns,
  initialPattern = null,
  initialData = null,
  initialLang = null,
}: {
  day: string;
  list: BankItem[];
  /** Today's question in each language, for the card. */
  dailies: Record<QuestionLang, Question>;
  patterns: BankPattern[];
  /** Deep link from hiring prep: `/questions?pattern=joins#interview`. */
  initialPattern?: string | null;
  /** Deep link from /data: `/questions?data=app`. */
  initialData?: string | null;
  /** ?lang=python, from the pandas guide: opens on that language and remembers it. */
  initialLang?: string | null;
}) {
  const seedPattern =
    initialPattern && patterns.some((p) => p.id === initialPattern) ? initialPattern : null;
  const seedData = DATASETS.find((d) => d.id === initialData)?.id ?? null;
  const seedLang = initialLang && LANG_VALUES.includes(initialLang) ? (initialLang as QuestionLang) : null;
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLang] = useState<LangFilter>(
    seedPattern || (seedData && seedData !== "league") ? "sql" : seedLang ?? "all",
  );
  /** Which database (SQL only, apart from the league). */
  const [data, setData] = useState<"all" | DatasetId>(seedData ?? "all");
  const [diff, setDiff] = useState<DiffFilter>("all");
  const [unsolvedOnly, setUnsolvedOnly] = useState(false);
  const [query, setQuery] = useState("");
  /** An interview pattern to narrow the list to (SQL only). */
  const [pattern, setPattern] = useState<string | null>(seedPattern);
  const patternIds = useMemo(() => {
    const p = patterns.find((x) => x.id === pattern);
    return p ? new Set(p.ids) : null;
  }, [pattern, patterns]);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
    try {
      // A deep-linked pattern wins over the remembered language filter.
      if (seedPattern) {
        window.localStorage.setItem(LANG_KEY, "sql");
      } else if (seedData && seedData !== "league") {
        /* a dataset deep link is SQL for this visit; leave the memory alone */
      } else if (seedLang) {
        window.localStorage.setItem(LANG_KEY, seedLang);
      } else {
        const saved = window.localStorage.getItem(LANG_KEY);
        if (saved && LANG_VALUES.includes(saved)) setLang(saved as QuestionLang);
      }
    } catch {
      /* storage blocked — the default is fine */
    }
  }, [seedPattern, seedData, seedLang]);

  function pickData(next: "all" | DatasetId) {
    setData(next);
    // Only the league has Python, R and Excel; the other databases are SQL.
    if (next !== "all" && next !== "league" && lang !== "all" && lang !== "sql") pickLang("sql");
  }

  function pickLang(next: LangFilter) {
    setLang(next);
    try {
      if (next === "all") window.localStorage.removeItem(LANG_KEY);
      else window.localStorage.setItem(LANG_KEY, next);
    } catch {
      /* storage blocked — the pick still applies for this visit */
    }
  }

  const solved = useMemo(
    () => new Set(progress.solvedQuestions),
    [progress.solvedQuestions],
  );
  const qotdDone = hydrated && progress.qotdLastDay === day;

  // With no language chosen, the daily on show is the SQL one — it is the
  // language everything else here assumes, and the only one that costs
  // nothing to start.
  const qotd = dailies[lang === "all" ? "sql" : lang];

  const shown = list.filter((q) => {
    if (patternIds && !patternIds.has(q.id)) return false;
    if (lang !== "all" && q.lang !== lang) return false;
    if (diff !== "all" && q.difficulty !== diff) return false;
    if (data !== "all" && datasetOf(q.tables) !== data) return false;
    if (unsolvedOnly && solved.has(q.id)) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return (
      q.title.toLowerCase().includes(needle) ||
      q.tags.some((t) => t.toLowerCase().includes(needle)) ||
      q.prompt.toLowerCase().includes(needle)
    );
  });

  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        <header className="text-center">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Questions
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            SQL, Python, R and Excel on real NFL scoring, {FACTS.seasons[0]}{" "}
            through week {FACTS.latest.week} of {FACTS.latest.season}, and
            real 2025 play-by-play, plus an invented store and app for the
            schemas interviews hand you. One problem at a time, nothing to lose
            for a wrong answer.
          </p>
        </header>

        {/* ── Question of the Day ─────────────────────────── */}
        <div className="mt-6">
          <QotdCard
            question={qotd}
            done={qotdDone}
            streak={progress.qotdStreak}
            hydrated={hydrated}
          />
          <p className="mt-3 text-center font-mono text-[10px] leading-relaxed text-ink-muted">
            Every language has its own daily. Solve any one of them and the
            streak survives.
          </p>
          {/* The warm-up: no code to guess, every answer with its SQL. One
              row: the Draft Room and the other games are in the Questions
              menu, and two big cards here pushed the bank off the screen. */}
          <div className="mt-4">
            <DuelCard day={day} compact />
          </div>
        </div>

        {/* ── Progress per language ───────────────────────── */}
        {hydrated && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {LANGS.map((l) => {
              const pool = list.filter((q) => q.lang === l);
              const done = pool.filter((q) => solved.has(q.id)).length;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => pickLang(lang === l ? "all" : l)}
                  aria-pressed={lang === l}
                  className={`surface rounded-xl border bg-panel px-4 py-3 text-left transition-colors ${
                    lang === l
                      ? "border-turf/60"
                      : "border-panel-border hover:border-turf/30"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-sm font-bold text-ink">
                      {LANG_LABEL[l]}
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted">
                      {done}/{pool.length}
                    </span>
                  </div>
                  <div className="quest-bar mt-2">
                    <span
                      style={{
                        width: `${pool.length ? (done / pool.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Interview prep ──────────────────────────────── */}
        <section id="interview" className="mt-10 scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="label-broadcast text-turf">interview prep</p>
              <h2 className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">
                The SQL patterns analyst screens test
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/sql-interview-questions"
                className="font-mono text-[11px] font-bold uppercase tracking-wider text-ice hover:underline"
              >
                A guide to each →
              </Link>
              <PassTag />
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((p) => {
              const qs = p.ids;
              const done = qs.filter((id) => solved.has(id)).length;
              const on = pattern === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setPattern(on ? null : p.id);
                    if (!on) {
                      pickLang("sql");
                      document.getElementById("bank-filters")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={`surface flex items-center gap-3 rounded-xl border bg-panel p-2.5 pr-4 text-left transition-colors ${
                    on ? "border-turf/70" : "border-panel-border hover:border-turf/40"
                  }`}
                >
                  <span className="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-panel-border bg-night/60">
                    {hasPrepArt(p.id) && <PrepArt id={p.id} className="h-full w-full" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-sm font-bold text-ink">{p.name}</span>
                      <span className="font-mono text-[11px] text-ink-muted">
                        {hydrated ? `${done}/${qs.length}` : qs.length}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{p.asks}</span>
                    <span className="quest-bar mt-2 block">
                      <span style={{ width: `${hydrated && qs.length ? (done / qs.length) * 100 : 0}%` }} />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <Link
            href="/questions/mock"
            className="lift surface group mt-3 flex items-center gap-4 overflow-hidden rounded-2xl border border-panel-border bg-panel p-3 pr-5 transition-colors hover:border-turf/50"
          >
            <span className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-panel-border bg-night/60">
              <PrepArt id="technical" className="h-full w-full" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="label-broadcast text-turf">mock sql screens</span>
              <span className="mt-0.5 block font-display text-base font-bold text-ink sm:text-lg">
                Rehearse the technical round, against the clock
              </span>
              <span className="mt-0.5 hidden text-xs leading-relaxed text-ink-soft sm:block">
                Two or three unseen questions, 20 or 45 minutes, no hints — then a report on what went wrong.
              </span>
            </span>
            <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-turf">Start →</span>
          </Link>
        </section>

        {/* ── Filters ─────────────────────────────────────── */}
        <div id="bank-filters" className="mt-6 scroll-mt-20 space-y-2">
          {pattern && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Pattern</span>
              <button
                type="button"
                onClick={() => setPattern(null)}
                className="rounded-lg border border-turf bg-turf/15 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-turf"
              >
                {patterns.find((x) => x.id === pattern)?.name} ✕
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Language
            </span>
            {(["all", ...LANGS] as LangFilter[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => pickLang(l)}
                aria-pressed={lang === l}
                className={`rounded-lg border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  lang === l
                    ? l === "all"
                      ? "border-turf bg-turf/15 text-turf"
                      : LANG_TINT[l]
                    : "border-panel-border text-ink-muted hover:border-turf/40 hover:text-ink"
                }`}
              >
                {l === "all" ? "All" : LANG_LABEL[l]}
                {l !== "all" && LANG_WEIGHT[l] && (
                  <span className="ml-1.5 font-normal normal-case tracking-normal opacity-70">
                    ↓
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Data
            </span>
            {(["all", ...DATASETS.map((d) => d.id)] as ("all" | DatasetId)[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => pickData(d)}
                aria-pressed={data === d}
                className={`rounded-lg border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  data === d
                    ? "border-turf bg-turf/15 text-turf"
                    : "border-panel-border text-ink-muted hover:border-turf/40 hover:text-ink"
                }`}
              >
                {d === "all" ? "All" : DATASETS.find((x) => x.id === d)?.label}
              </button>
            ))}
          </div>
          {(() => {
            const d = DATASETS.find((x) => x.id === data);
            if (!d || (!d.invented && !d.guide)) return null;
            return (
              <p className="text-[12px] leading-relaxed text-ink-muted">
                {d.invented && (
                  <>
                    Invented data: a made-up {data === "store" ? "online store" : "fantasy football app"},
                    for practising on the kind of schema a screen hands you.{" "}
                    <Link href={d.href} className="text-ice underline underline-offset-2 hover:text-ink">
                      What&apos;s in it →
                    </Link>{" "}
                  </>
                )}
                {d.guide && (
                  <>
                    Interviewing for a {d.guide.role} role?{" "}
                    <Link
                      href={`/sql-interview-questions/${d.guide.slug}`}
                      className="text-turf underline underline-offset-2 hover:text-ink"
                    >
                      Read the guide →
                    </Link>
                  </>
                )}
              </p>
            );
          })()}

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Level
            </span>
            {(["all", "easy", "medium", "hard"] as DiffFilter[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiff(d)}
                aria-pressed={diff === d}
                className={`rounded-lg border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  diff === d
                    ? "border-turf bg-turf/15 text-turf"
                    : "border-panel-border text-ink-muted hover:border-turf/40 hover:text-ink"
                }`}
              >
                {d === "all" ? "All" : d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setUnsolvedOnly((v) => !v)}
              aria-pressed={unsolvedOnly}
              className={`rounded-lg border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                unsolvedOnly
                  ? "border-ice bg-ice/15 text-ice"
                  : "border-panel-border text-ink-muted hover:border-ice/40 hover:text-ink"
              }`}
            >
              Unsolved only
            </button>
            <label className="ml-auto min-w-[10rem] flex-1 sm:max-w-xs">
              <span className="sr-only">Search questions</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a topic…"
                className="w-full rounded-lg border border-panel-border bg-night/60 px-3 py-2 font-mono text-[12px] text-ink placeholder:text-ink-muted"
              />
            </label>
          </div>
        </div>

        {/* ── The list ────────────────────────────────────── */}
        <ul className="mt-3 space-y-2">
          {shown.map((q) => {
            const done = hydrated && solved.has(q.id);
            return (
              <li key={q.id}>
                <Link
                  href={`/questions/${q.id}`}
                  className="lift surface flex items-center gap-4 rounded-xl border border-panel-border bg-panel px-4 py-3 transition-colors hover:border-turf/40"
                >
                  <span className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-panel-border bg-night/60 sm:h-14 sm:w-[76px]">
                    <QuestionArt art={q.art} className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[15px] font-bold text-ink">
                        {q.title}
                      </span>
                      {done && (
                        <span
                          className="font-mono text-[11px] text-turf"
                          title="Solved"
                        >
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
                      {q.tags.join(" · ")}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <span className="hidden font-mono text-[10px] uppercase tracking-widest text-ink-muted lg:inline">
                      +{DIFFICULTY_XP[q.difficulty]} XP
                    </span>
                    {datasetOf(q.tables) !== "league" && (
                      <span className="hidden rounded-md border border-ice/40 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ice sm:inline">
                        {DATASETS.find((d) => d.id === datasetOf(q.tables))?.label}
                      </span>
                    )}
                    <span className="rounded-md border border-panel-border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                      {LANG_LABEL[q.lang]}
                    </span>
                    <DifficultyChip difficulty={q.difficulty} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {shown.length === 0 && (
          <p className="mt-6 text-center text-sm text-ink-muted">
            Nothing matches that.{" "}
            {unsolvedOnly && "You have cleared everything in this filter."}
          </p>
        )}

        <p className="mt-8 text-center font-mono text-[11px] text-ink-muted">
          {list.length} questions across {LANGS.length} languages · Python
          and R download their runtime the first time you run one
        </p>
      </main>
    </>
  );
}
