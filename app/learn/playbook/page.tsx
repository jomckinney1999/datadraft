"use client";

// The playbook-style quiz: three questions from Coach Blitz that sort a
// learner into Film Room General / Gunslinger / Dual-Threat. The result is
// a recommendation — the learner can pick any style before locking in, and
// can retake this quiz anytime from the roadmap.

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  QUIZ,
  STYLES,
  getStyle,
  scoreQuiz,
  type PlaybookStyle,
} from "@/lib/playbook";
import { loadProgress, setPlaybookStyle } from "@/lib/progress";
import Coach from "@/components/coach";

function PlaybookQuiz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [step, setStep] = useState(0); // 0..QUIZ.length-1, then result
  const [answers, setAnswers] = useState<PlaybookStyle[]>([]);
  const [picked, setPicked] = useState<PlaybookStyle | null>(null);
  const [currentStyle, setCurrentStyle] = useState<PlaybookStyle | null>(null);

  useEffect(() => {
    setCurrentStyle(loadProgress().playbookStyle);
  }, []);

  const done = answers.length === QUIZ.length;
  const recommended = done ? scoreQuiz(answers) : null;
  const selection = picked ?? recommended;

  function answer(style: PlaybookStyle) {
    const next = [...answers, style];
    setAnswers(next);
    if (step < QUIZ.length - 1) setStep(step + 1);
  }

  function lockIn() {
    if (!selection) return;
    setPlaybookStyle(selection);
    router.push(from ? `/learn/${from}` : "/learn");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-16">
      <header className="flex items-center justify-between py-5">
        <Link
          href="/learn"
          className="font-display text-lg font-bold tracking-tight text-ink"
        >
          SQL<span className="text-turf">Sports</span>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            playbook style
          </span>
        </Link>
        {!done && (
          <div className="flex items-center gap-1.5">
            {QUIZ.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i < answers.length
                    ? "bg-turf"
                    : i === answers.length
                      ? "bg-gold"
                      : "bg-panel-hover"
                }`}
              />
            ))}
          </div>
        )}
      </header>

      {!done ? (
        <div className="flex flex-1 flex-col items-center gap-6 pt-6">
          <Coach mood="think" size={120} />
          <div className="w-full border border-panel-border bg-panel/80 p-6 shadow-scoreboard">
            <p className="label-broadcast text-gold">
              coach blitz · question {step + 1} of {QUIZ.length}
            </p>
            <h1 className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">
              {QUIZ[step].prompt}
            </h1>
            <div className="mt-5 grid gap-2">
              {QUIZ[step].options.map((opt) => (
                <button
                  key={opt.style}
                  type="button"
                  onClick={() => answer(opt.style)}
                  className="border border-panel-border bg-night/60 px-4 py-3.5 text-left text-[14px] leading-relaxed text-ink-soft transition-colors hover:border-turf/50 hover:bg-turf/5 hover:text-ink"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {currentStyle && (
            <p className="font-mono text-[11px] text-ink-muted">
              Current style: {getStyle(currentStyle).name} — finishing this quiz
              will let you change it.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-6 pt-2">
          <Coach mood="cheer" size={120} />
          <div className="text-center">
            <p className="label-broadcast text-turf">scouting report is in</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              You play like a {getStyle(recommended).name}.
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
              That&apos;s Coach&apos;s read — but it&apos;s your career. Pick
              the playbook you want to run. You can change it anytime.
            </p>
          </div>

          <div className="grid w-full gap-3">
            {STYLES.map((style) => {
              const isSelected = selection === style.id;
              const isRecommended = recommended === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setPicked(style.id)}
                  className={`border p-5 text-left transition-colors ${
                    isSelected
                      ? "border-turf bg-turf/10"
                      : "border-panel-border bg-panel/70 hover:border-turf/40"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h2
                      className={`font-display text-lg font-bold ${
                        isSelected ? "text-turf" : "text-ink"
                      }`}
                    >
                      {style.name}
                    </h2>
                    {isRecommended && (
                      <span className="shrink-0 border border-gold/50 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-gold">
                        Coach&apos;s pick
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                    {style.tagline}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {style.changes.map((c) => (
                      <li
                        key={c}
                        className="text-[13px] leading-relaxed text-ink-soft"
                      >
                        <span className="mr-2 text-turf">▸</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {selection && (
            <div className="w-full border border-panel-border bg-night/60 p-4">
              <p className="text-[13px] italic leading-relaxed text-ink-soft">
                “{getStyle(selection).coachLine}”
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                — Coach Blitz
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={lockIn}
            disabled={!selection}
            className="w-full max-w-sm border border-turf bg-turf/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25 disabled:opacity-40"
          >
            Lock in {selection ? getStyle(selection).name : "a style"}
          </button>
        </div>
      )}
    </main>
  );
}

export default function PlaybookPage() {
  // useSearchParams requires a Suspense boundary during prerender
  return (
    <Suspense fallback={null}>
      <PlaybookQuiz />
    </Suspense>
  );
}
