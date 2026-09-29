"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DIFFICULTY_LABEL,
  INTERVIEW_CASES,
  type Difficulty,
  type InterviewCase,
} from "@/lib/interview-cases";
import {
  loadInterviewProgress,
  statusCounts,
  type InterviewCaseStatus,
  type InterviewProgress,
} from "@/lib/interview-progress";
import Coach from "@/components/coach";
import AppNav from "@/components/app-nav";
import WaitlistForm from "@/components/waitlist-form";

const FILTERS: { id: Difficulty | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

function statusLabel(s: InterviewCaseStatus): string {
  if (s === "completed") return "Completed";
  if (s === "in_progress") return "In progress";
  return "Not started";
}

function CaseCard({
  c,
  status,
}: {
  c: InterviewCase;
  status: InterviewCaseStatus;
}) {
  const diffColor =
    c.difficulty === "easy"
      ? "text-turf border-turf/40"
      : c.difficulty === "medium"
        ? "text-gold border-gold/40"
        : "text-ice border-ice/40";

  return (
    <Link
      href={`/interview/${c.id}`}
      className="surface group flex flex-col border border-panel-border bg-panel/40 p-5 transition-colors hover:border-turf/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {status === "in_progress" && (
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gold">
              In progress
            </span>
          )}
          {status === "completed" && (
            <span className="rounded-full border border-turf/40 bg-turf/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-turf">
              Completed
            </span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${diffColor}`}
          >
            {DIFFICULTY_LABEL[c.difficulty]}
          </span>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {c.org}
        </span>
      </div>

      <h2 className="mt-3 font-display text-lg font-bold leading-snug text-ink group-hover:text-turf">
        {c.title}
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{c.blurb}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">{c.role}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {c.skills.map((s) => (
          <span
            key={s}
            className="rounded-full border border-panel-border bg-night/40 px-2 py-0.5 font-mono text-[10px] text-ink-muted"
          >
            {s}
          </span>
        ))}
      </div>

      <span className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-turf">
        {status === "completed"
          ? "Review →"
          : status === "in_progress"
            ? "Continue →"
            : "Start →"}
      </span>
    </Link>
  );
}

export default function InterviewCatalog() {
  const [filter, setFilter] = useState<Difficulty | "all">("all");
  const [progress, setProgress] = useState<InterviewProgress>({});

  useEffect(() => {
    setProgress(loadInterviewProgress());
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return INTERVIEW_CASES;
    return INTERVIEW_CASES.filter((c) => c.difficulty === filter);
  }, [filter]);

  const counts = statusCounts(
    INTERVIEW_CASES.map((c) => c.id),
    progress,
  );

  const inProgress = INTERVIEW_CASES.filter(
    (c) => progress[c.id]?.status === "in_progress",
  );

  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-5 pb-10 pt-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-broadcast text-gold">mock screens · SQL</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
              Interview cases
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Practice cases — brief, schema, live SQL. Filter by difficulty,
              take your time, peek at a hint if you need one. No timeouts spent.
            </p>
          </div>
          <Coach mood="whistle" size={88} className="hidden shrink-0 sm:block" />
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3 border border-panel-border bg-panel/30 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Difficulty
          </span>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  filter === f.id
                    ? "border-turf bg-turf/15 text-turf"
                    : "border-panel-border text-ink-muted hover:border-turf/40 hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="font-mono text-[10px] uppercase tracking-wider text-ink-muted underline-offset-2 hover:text-gold hover:underline"
            >
              Reset filters
            </button>
          )}
          <div className="ml-auto flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            <span>{counts.notStarted} not started</span>
            <span className="text-gold">{counts.inProgress} in progress</span>
            <span className="text-turf">{counts.completed} completed</span>
          </div>
        </div>

        {inProgress.length > 0 && filter === "all" && (
          <section className="mt-8">
            <p className="label-broadcast text-gold">In progress</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {inProgress.map((c) => (
                <CaseCard
                  key={c.id}
                  c={c}
                  status={progress[c.id]?.status ?? "not_started"}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <p className="label-broadcast text-turf">
            {filter === "all"
              ? "All cases"
              : `${DIFFICULTY_LABEL[filter]} cases`}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {filtered.map((c) => (
              <CaseCard
                key={c.id}
                c={c}
                status={progress[c.id]?.status ?? "not_started"}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-4 text-sm text-ink-muted">
              No cases at this difficulty yet.
            </p>
          )}
        </section>

        <section className="surface mt-12 border border-panel-border bg-panel/40 p-5">
          <h2 className="font-display text-lg font-bold text-ink">
            Want a live AI interviewer?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            These cases are scripted on purpose — graded, offline-friendly, no
            API. A conversational interviewer is still on the board. Leave your
            email and we&apos;ll ping you when it opens.
          </p>
          <div className="mt-4">
            <WaitlistForm
              interest="ai-interview"
              source="interview-catalog"
              label="Notify me"
            />
          </div>
        </section>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          {INTERVIEW_CASES.length} cases · status: {statusLabel("not_started")}{" "}
          tracking is local to this browser
        </p>
      </main>
    </>
  );
}
