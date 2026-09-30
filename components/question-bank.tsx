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
import type { QuestionDifficulty, QuestionLang } from "@/lib/questions";
import {
  DIFFICULTY_XP,
  LANG_LABEL,
  LANG_WEIGHT,
  QUESTIONS,
  questionOfTheDay,
  questionsIn,
} from "@/lib/questions";
import { EMPTY_PROGRESS, loadProgress, type Progress } from "@/lib/progress";
import QuestionArt from "@/components/question-art";
import DifficultyChip from "@/components/difficulty-chip";
import AppNav from "@/components/app-nav";
import QotdCard from "@/components/qotd-card";

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

export default function QuestionBank({ day }: { day: string }) {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLang] = useState<LangFilter>("all");
  const [diff, setDiff] = useState<DiffFilter>("all");
  const [unsolvedOnly, setUnsolvedOnly] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
    try {
      const saved = window.localStorage.getItem(LANG_KEY);
      if (saved && LANG_VALUES.includes(saved)) setLang(saved as QuestionLang);
    } catch {
      /* storage blocked — the default is fine */
    }
  }, []);

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
  const qotd = questionOfTheDay(day, lang === "all" ? "sql" : lang);

  const shown = QUESTIONS.filter((q) => {
    if (lang !== "all" && q.lang !== lang) return false;
    if (diff !== "all" && q.difficulty !== diff) return false;
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
            SQL, Python, R and Excel on real NFL scoring, 2022&ndash;2024. One
            problem at a time, no lesson around it, nothing to lose for a wrong
            answer.
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
        </div>

        {/* ── Progress per language ───────────────────────── */}
        {hydrated && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {LANGS.map((l) => {
              const pool = questionsIn(l);
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

        {/* ── Filters ─────────────────────────────────────── */}
        <div className="mt-6 space-y-2">
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
          {QUESTIONS.length} questions across {LANGS.length} languages · Python
          and R download their runtime the first time you run one
        </p>
      </main>
    </>
  );
}
