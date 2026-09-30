"use client";

import { useEffect, useState } from "react";
import {
  loadChecklist,
  saveChecklist,
  type Checklist,
} from "@/lib/project-progress";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import ProjectArt from "@/components/project-art";
import type { Project } from "@/lib/projects";
import { REPO_URL } from "@/lib/repo";

function StartLink({
  project,
  className,
}: {
  project: Project;
  className: string;
}) {
  const href =
    project.colabUrl ??
    (project.repoPath
      ? `${REPO_URL}/tree/main/${project.repoPath}`
      : null);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {project.colabUrl ? "Open in Google Colab →" : "Open the starter repo →"}
    </a>
  );
}

export default function ProjectGuide({ project }: { project: Project }) {
  const [done, setDone] = useState<Checklist>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDone(loadChecklist(project.id));
    setReady(true);
  }, [project.id]);

  function toggle(id: string) {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveChecklist(project.id, next);
      return next;
    });
  }

  const stepIds = project.steps.map((s) => s.id);
  const cleared = stepIds.filter((id) => done[id]).length;

  return (
    <>
      <AppNav back="/projects" backLabel="all projects" />
      <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-10 pt-8">
        <header className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="label-broadcast text-gold">portfolio project</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
              {project.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              {project.blurb}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="status-chip">{project.hours}</span>
              <span className="status-chip">{project.level}</span>
              <span className="status-chip">Pairs with {project.pairsWith}</span>
            </div>
          </div>
          <div className="hidden h-32 w-44 shrink-0 overflow-hidden rounded-xl border border-panel-border bg-night/60 sm:block">
            <ProjectArt id={project.id} className="h-full w-full" />
          </div>
        </header>

        <section className="surface mt-8 border border-panel-border bg-panel p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            Why this one
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            {project.pitch} Lessons run on a shared NFL sheet. A project ends
            in something with your name on it:{" "}
            <em className="not-italic text-turf">{project.artifact}</em>.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.skills.map((sk) => (
              <span
                key={sk}
                className="rounded-md border border-panel-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
              >
                {sk}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StartLink project={project} className="btn-gold inline-flex" />
            {/* The notebook is also served from this site, so a learner is
                never stuck on GitHub access: Colab opens GitHub notebooks
                only from a public repo, and File → Upload notebook takes the
                downloaded copy on any account. */}
            {project.notebookPath && (
              <a
                href={`/${project.notebookPath}`}
                download
                className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-gold/50 hover:text-gold"
              >
                Download the notebook
              </a>
            )}
          </div>
          <p className="mt-2 font-mono text-[10px] text-ink-muted">
            {project.colabUrl
              ? "Runs in the browser. Free Google account. No install. If Colab can't open it, download it and use File → Upload notebook."
              : "Runs locally on DuckDB. No cloud warehouse, no card."}
          </p>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="label-broadcast text-turf">game plan</p>
              <h2 className="mt-1 font-display text-xl font-bold text-ink">
                Walk through it
              </h2>
            </div>
            {ready && (
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                {cleared}/{stepIds.length} done
              </p>
            )}
          </div>

          <ol className="mt-4 space-y-3">
            {project.steps.map((step, i) => {
              const checked = Boolean(done[step.id]);
              return (
                <li
                  key={step.id}
                  className={`surface border border-panel-border bg-panel p-4 transition-colors ${
                    checked ? "border-turf/40" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => toggle(step.id)}
                      aria-pressed={checked}
                      aria-label={
                        checked
                          ? `Mark “${step.title}” incomplete`
                          : `Mark “${step.title}” done`
                      }
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs transition-colors ${
                        checked
                          ? "border-turf bg-turf/20 text-turf"
                          : "border-panel-border text-ink-muted hover:border-turf/50"
                      }`}
                    >
                      {checked ? "✓" : i + 1}
                    </button>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-bold text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {step.body}
                      </p>
                      {step.cta && (
                        <a
                          href={step.cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex font-mono text-[11px] font-semibold uppercase tracking-wider text-turf hover:underline"
                        >
                          {step.cta.label} →
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mt-10">
          <p className="label-broadcast text-gold">the scorecard</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">
            Questions you&apos;ll answer
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Same prompts live in the notebook. Write SQL. Check a hint if
            you&apos;re stuck.
          </p>
          <ul className="mt-4 space-y-2">
            {project.questions.map((q, i) => (
              <li
                key={q.id}
                className="border border-panel-border bg-panel/40 px-4 py-3"
              >
                <p className="text-sm font-medium text-ink">
                  <span className="mr-2 font-mono text-[11px] text-ink-muted">
                    Q{i + 1}
                  </span>
                  {q.prompt}
                </p>
                {q.tip && (
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    Hint: {q.tip}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <p className="label-broadcast text-ink-muted">ship it</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">
            What you walk away with
          </h2>
          <ul className="mt-3 space-y-2">
            {project.deliverables.map((d) => (
              <li
                key={d}
                className="flex gap-2 text-sm text-ink-soft before:text-turf before:content-['→']"
              >
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <StartLink project={project} className="btn-gold" />
          <Link
            href="/learn/track/sql-fundamentals"
            className="font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-turf"
          >
            Prefer lessons first? SQL Fundamentals →
          </Link>
        </div>
      </main>
    </>
  );
}
