"use client";

/**
 * Rapid Fire player — pick a language, answer shuffled MCs under the clock,
 * earn scouting tickets. Non-linear on purpose.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Coach from "@/components/coach";
import CodeEditor from "@/components/code-editor";
import {
  RAPID_LANGS,
  RAPID_ROUND_SIZE,
  RAPID_SECONDS,
  awardRapidFire,
  buildRapidBank,
  dealCourseRound,
  dealRapidRound,
  getRapidLang,
  scoreRapidRound,
  type RapidLangId,
  type RapidQuestion,
} from "@/lib/rapid-fire";
import { type Progress } from "@/lib/progress";

type Phase = "pick" | "play" | "done";

function accentText(a: "turf" | "ice" | "gold") {
  return a === "ice" ? "text-ice" : a === "gold" ? "text-gold" : "text-turf";
}
function accentBorder(a: "turf" | "ice" | "gold") {
  return a === "ice"
    ? "border-ice/50"
    : a === "gold"
      ? "border-gold/50"
      : "border-turf/50";
}
function accentBg(a: "turf" | "ice" | "gold") {
  return a === "ice"
    ? "bg-ice/15 text-ice"
    : a === "gold"
      ? "bg-gold/15 text-gold"
      : "bg-turf/15 text-turf";
}

export default function RapidFire({
  onProgress,
  initialLang,
  courseModuleId,
  roundSize = 5,
  embedded = false,
  onClose,
}: {
  onProgress?: (p: Progress) => void;
  initialLang?: RapidLangId;
  /** Snap round drawn from this course only — played on the path. */
  courseModuleId?: string;
  roundSize?: number;
  embedded?: boolean;
  onClose?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(
    courseModuleId || initialLang ? "play" : "pick",
  );
  const [missing, setMissing] = useState(false);
  const [langId, setLangId] = useState<RapidLangId | null>(
    courseModuleId ? "sql" : (initialLang ?? null),
  );
  const [deck, setDeck] = useState<RapidQuestion[]>(() =>
    courseModuleId ? dealCourseRound(courseModuleId, roundSize) : [],
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [seconds, setSeconds] = useState(RAPID_SECONDS);
  const [locked, setLocked] = useState(false);
  const [tickets, setTickets] = useState(0);
  const [perfect, setPerfect] = useState(false);

  const lang = langId ? getRapidLang(langId) : null;
  const q = deck[idx] ?? null;

  const start = useCallback((id?: RapidLangId) => {
    const round = courseModuleId
      ? dealCourseRound(courseModuleId, roundSize)
      : id
        ? dealRapidRound(id)
        : [];
    if (round.length === 0) {
      setMissing(true);
      return;
    }
    setMissing(false);
    setLangId(id ?? "sql");
    setDeck(round);
    setIdx(0);
    setPicked(null);
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setSeconds(RAPID_SECONDS);
    setLocked(false);
    setTickets(0);
    setPerfect(false);
    setPhase("play");
  }, [courseModuleId, roundSize]);

  useEffect(() => {
    if (courseModuleId) return;
    if (initialLang) start(initialLang);
  }, [courseModuleId, initialLang, start]);

  // Countdown
  useEffect(() => {
    if (phase !== "play" || locked || !q) return;
    if (seconds <= 0) {
      // Time out = miss
      setLocked(true);
      setStreak(0);
      setPicked(-1);
      return;
    }
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, locked, seconds, q]);

  function choose(i: number) {
    if (locked || !q) return;
    setLocked(true);
    setPicked(i);
    const hit = i === q.answer;
    if (hit) {
      const nextStreak = streak + 1;
      setCorrect((c) => c + 1);
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
    } else {
      setStreak(0);
    }
  }

  function advance() {
    if (!langId || !q) return;
    if (idx + 1 >= deck.length) {
      const result = scoreRapidRound({
        correct,
        total: deck.length,
        bestStreak,
      });
      const saved = awardRapidFire(result.tickets);
      setTickets(result.tickets);
      setPerfect(result.perfect);
      onProgress?.(saved);
      setPhase("done");
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setLocked(false);
    setSeconds(RAPID_SECONDS);
  }

  if (embedded && courseModuleId && !q && phase !== "done") {
    return (
      <p className="text-center text-sm text-ink-soft">
        {missing ? "This course doesn't have snap questions yet." : "Loading round…"}
      </p>
    );
  }

  if (phase === "pick") {
    return (
      <div>
        <p className="label-broadcast text-gold">rapid fire</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink">
          Pick a language. No path order.
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          {RAPID_ROUND_SIZE} shuffled questions from the real curriculum ·{" "}
          {RAPID_SECONDS}s each · tickets for hits. Zero timeouts.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RAPID_LANGS.map((l) => {
            const n = buildRapidBank(l.id).length;
            return (
              <button
                key={l.id}
                type="button"
                disabled={n === 0}
                onClick={() => start(l.id)}
                className={`rounded-2xl border-2 bg-panel p-4 text-left transition-colors lift ${accentBorder(l.accent)} hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${accentBg(l.accent)}`}
                >
                  {n} questions
                </span>
                <p className="mt-2 font-display text-lg font-bold text-ink">
                  {l.label} Rapid Fire
                </p>
                <p className="mt-1 text-sm text-ink-soft">{l.blurb}</p>
                <p
                  className={`mt-3 font-mono text-[11px] font-bold uppercase tracking-widest ${accentText(l.accent)}`}
                >
                  Fire →
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "done" && lang) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <Coach mood={perfect ? "cheer" : "happy"} size={120} />
        <p className={`mt-4 label-broadcast ${accentText(lang.accent)}`}>
          round complete
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          {correct}/{deck.length} hits
        </h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-gold">
            +{tickets} ✦ tickets
          </span>
          {bestStreak >= 3 && (
            <span className="rounded-full border border-turf/40 bg-turf/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-turf">
              🔥 best streak {bestStreak}
            </span>
          )}
          {perfect && (
            <span className="rounded-full border border-ice/40 bg-ice/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ice">
              Perfect round
            </span>
          )}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {!embedded && (
            <button
              type="button"
              onClick={() => langId && start(langId)}
              className="btn-turf inline-flex rounded-xl border border-turf/80 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-night"
            >
              Rematch
            </button>
          )}
          {embedded ? (
            <button
              type="button"
              onClick={onClose}
              className="btn-turf inline-flex rounded-xl border border-turf/80 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-night"
            >
              Back on the path
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPhase("pick")}
              className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-soft hover:border-turf/40"
            >
              Switch language
            </button>
          )}
          {!embedded && (
            <Link
              href="/learn"
              className="font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-turf"
            >
              Back to learn →
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!q || !lang) return null;

  const timedOut = locked && picked === -1;
  const hit = picked !== null && picked === q.answer;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Scorebug */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${accentBg(lang.accent)}`}
          >
            {lang.label}
          </span>
          <span className="font-mono text-[11px] text-ink-muted">
            {idx + 1}/{deck.length}
          </span>
          {streak >= 2 && (
            <span className="font-mono text-[11px] font-bold text-gold">
              🔥 {streak}
            </span>
          )}
        </div>
        <div
          className={`font-mono text-lg font-bold tabular-nums ${
            seconds <= 3 ? "text-gold animate-pulse" : accentText(lang.accent)
          }`}
        >
          0:{String(seconds).padStart(2, "0")}
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-night">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            lang.accent === "ice"
              ? "bg-ice"
              : lang.accent === "gold"
                ? "bg-gold"
                : "bg-turf"
          }`}
          style={{ width: `${(seconds / RAPID_SECONDS) * 100}%` }}
        />
      </div>

      <div className="mt-6">
        <p className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
          {q.prompt}
        </p>
        {q.code && (
          <div className="mt-4 overflow-hidden rounded-xl border border-panel-border">
            <CodeEditor
              value={q.code}
              onChange={() => {}}
              lang={
                lang.id === "python"
                  ? "python"
                  : lang.id === "r"
                    ? "r"
                    : lang.id === "excel"
                      ? "excel"
                      : "sql"
              }
              rows={Math.min(6, q.code.split("\n").length + 1)}
              disabled
              ariaLabel="Question code"
            />
          </div>
        )}

        <ul className="mt-5 space-y-2">
          {q.choices.map((c, i) => {
            let style =
              "border-panel-border hover:border-turf/40 text-ink-soft";
            if (locked) {
              if (i === q.answer) style = "border-turf/60 bg-turf/15 text-turf";
              else if (i === picked)
                style = "border-gold/50 bg-gold/10 text-gold";
              else style = "border-panel-border opacity-50";
            }
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => choose(i)}
                  className={`w-full rounded-xl border-2 border-b-4 px-4 py-3 text-left text-sm font-medium transition-colors ${style}`}
                >
                  <span className="mr-2 font-mono text-[10px] text-ink-muted">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {c}
                </button>
              </li>
            );
          })}
        </ul>

        {locked && (
          <div
            className={`mt-5 animate-feedback-rise rounded-xl border px-4 py-3 ${
              hit
                ? "border-turf/40 bg-turf/10"
                : "border-gold/40 bg-gold/10"
            }`}
          >
            <p
              className={`font-display text-base font-bold ${
                hit ? "text-turf" : "text-gold"
              }`}
            >
              {hit ? "Nice." : timedOut ? "Clock ran out." : "Not that one."}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {q.explain}
            </p>
            <button
              type="button"
              onClick={advance}
              className="btn-turf mt-4 inline-flex rounded-xl border border-turf/80 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-night"
            >
              {idx + 1 >= deck.length ? "See results" : "Next snap →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
