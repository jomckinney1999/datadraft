"use client";

/**
 * Projects.
 *
 * Two kinds of thing live here, and the split is by how long they take and
 * what you leave holding.
 *
 * **Builds** take an afternoon and end in a repo or a notebook with your
 * name on it — your own fantasy league pulled through the Sleeper API, or
 * raw nflverse releases modelled into a tested dbt warehouse.
 *
 * **Cases** take half an hour and end in a right answer. These were the
 * "interview cases": a brief, a schema, three questions, a live terminal.
 * Calling them interview prep undersold them — they are the shortest
 * complete piece of analyst work on the site, and useful whether or not
 * anyone is interviewing.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import { INTERVIEW_CASES } from "@/lib/interview-cases";
import { loadInterviewProgress, type InterviewProgress } from "@/lib/interview-progress";
import { loadChecklist } from "@/lib/project-progress";
import DifficultyChip from "@/components/difficulty-chip";
import ProjectArt from "@/components/project-art";
import AppNav from "@/components/app-nav";
import Coach from "@/components/coach";

type Kind = "all" | "builds" | "cases";

export default function ProjectCatalog() {
  const [kind, setKind] = useState<Kind>("all");
  const [caseProgress, setCaseProgress] = useState<InterviewProgress | null>(
    null,
  );
  const [buildDone, setBuildDone] = useState<Record<string, number>>({});

  useEffect(() => {
    setCaseProgress(loadInterviewProgress());
    const counts: Record<string, number> = {};
    for (const p of PROJECTS) {
      counts[p.id] = Object.values(loadChecklist(p.id)).filter(Boolean).length;
    }
    setBuildDone(counts);
  }, []);

  const builds = useMemo(
    () => PROJECTS.filter((p) => p.status === "live"),
    [],
  );

  const showBuilds = kind !== "cases";
  const showCases = kind !== "builds";

  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              Projects
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              Longer than a question, realer than a lesson. Builds end in
              something you can show someone; cases end in a right answer and
              take about half an hour.
            </p>
          </div>
          <Coach mood="clipboard" size={80} className="hidden shrink-0 sm:block" />
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(
            [
              { id: "all", label: `All ${builds.length + INTERVIEW_CASES.length}` },
              { id: "builds", label: `Builds ${builds.length}` },
              { id: "cases", label: `Cases ${INTERVIEW_CASES.length}` },
            ] as { id: Kind; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setKind(f.id)}
              aria-pressed={kind === f.id}
              className={`rounded-lg border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                kind === f.id
                  ? "border-turf bg-turf/15 text-turf"
                  : "border-panel-border text-ink-muted hover:border-turf/40 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {showBuilds && (
          <section id="builds" className="mt-6 scroll-mt-20">
            <p className="label-broadcast text-gold">builds</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {builds.map((p) => {
                const done = buildDone[p.id] ?? 0;
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="lift surface group flex flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel p-5 transition-colors hover:border-gold/50"
                  >
                    <div className="-mx-5 -mt-5 mb-4 h-40 overflow-hidden border-b border-panel-border bg-night/60">
                      <ProjectArt
                        id={p.id}
                        className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`font-display text-lg font-bold ${
                          p.accent === "gold" ? "text-gold" : "text-turf"
                        }`}
                      >
                        {p.title}
                      </p>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                        {p.hours}
                      </span>
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                      {p.blurb}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-panel-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 border-t border-panel-border pt-3 font-mono text-[11px] text-ink-muted">
                      You leave with: <span className="text-ink">{p.artifact}</span>
                      {done > 0 && (
                        <span className="ml-2 text-turf">· {done} steps done</span>
                      )}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {showCases && (
          <section id="cases" className="mt-8 scroll-mt-20">
            <p className="label-broadcast text-ice">cases</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              A brief, a schema you have never seen, and questions someone
              would actually ask. Never spends a timeout.
            </p>
            <ul className="mt-3 space-y-2">
              {INTERVIEW_CASES.map((c) => {
                const answered = caseProgress?.[c.id]?.answered.length ?? 0;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/projects/case/${c.id}`}
                      className="lift surface flex items-center gap-4 rounded-xl border border-panel-border bg-panel px-4 py-3 transition-colors hover:border-ice/40"
                    >
                      <span className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-panel-border bg-night/60 sm:h-14 sm:w-[76px]">
                        <ProjectArt id={c.id} className="h-full w-full" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-display text-[15px] font-bold text-ink">
                          {c.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
                          {c.org} · {c.skills.join(" · ")}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        {answered > 0 && (
                          <span className="font-mono text-[11px] text-turf">
                            {answered}/{c.questions.length}
                          </span>
                        )}
                        <DifficultyChip difficulty={c.difficulty} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="mt-10 text-center font-mono text-[11px] text-ink-muted">
          Progress on these is local to this browser.
        </p>
      </main>
    </>
  );
}
