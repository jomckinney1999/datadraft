"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HomeLink from "@/components/home-link";
import Coach from "@/components/coach";
import { CAREER_ROLES } from "@/lib/career-paths";
import { useCareerRole } from "@/lib/use-career-role";
import {
  BOOK_RECS,
  JOB_TACTICS,
  RESUME_SAMPLES,
  booksForRole,
  resumeForRole,
  resumeToMarkdown,
  type ResourceRoleId,
} from "@/lib/resources";

type Tab = "resumes" | "tactics" | "books";

export default function ResourcesHub() {
  const { roleId: storedRole, hydrated } = useCareerRole();
  const [roleFilter, setRoleFilter] = useState<ResourceRoleId>("all");
  const [tab, setTab] = useState<Tab>("resumes");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (storedRole && CAREER_ROLES.some((r) => r.id === storedRole)) {
      setRoleFilter(storedRole as ResourceRoleId);
    }
  }, [hydrated, storedRole]);

  const sample = useMemo(() => {
    if (roleFilter === "all") return RESUME_SAMPLES[0];
    return resumeForRole(roleFilter) ?? RESUME_SAMPLES[0];
  }, [roleFilter]);

  const books = useMemo(
    () => (roleFilter === "all" ? BOOK_RECS : booksForRole(roleFilter)),
    [roleFilter],
  );

  const roleTitle =
    roleFilter === "all"
      ? "All roadmaps"
      : (CAREER_ROLES.find((r) => r.id === roleFilter)?.title ?? "Your path");

  async function copyResume() {
    if (!sample) return;
    try {
      await navigator.clipboard.writeText(resumeToMarkdown(sample));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-10">
      <div className="mb-8">
        <HomeLink label="resources" back="/learn" backLabel="all courses" />
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-broadcast text-gold">career kit</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Resources
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            Resume outlines by roadmap, job-hunt tactics that actually move the
            ball, and a short book shelf — from real search scars, not HR
            fluff.
          </p>
        </div>
        <Coach mood="think" size={88} className="hidden shrink-0 sm:block" />
      </header>

      <section className="mt-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          Filter by roadmap
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <FilterChip
            active={roleFilter === "all"}
            onClick={() => setRoleFilter("all")}
            label="All"
          />
          {CAREER_ROLES.map((role) => (
            <FilterChip
              key={role.id}
              active={roleFilter === role.id}
              onClick={() => setRoleFilter(role.id)}
              label={role.title}
            />
          ))}
        </div>
        {storedRole && roleFilter === storedRole && (
          <p className="mt-2 font-mono text-[10px] text-turf">
            Matched to your /learn path pick
          </p>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-panel-border pb-3">
        {(
          [
            ["resumes", "Resumes"],
            ["tactics", "Job hunt"],
            ["books", "Books"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              tab === id
                ? "border-turf bg-turf/15 text-turf"
                : "border-panel-border text-ink-muted hover:border-turf/40 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "resumes" && sample && (
        <section className="mt-6 space-y-5">
          <div className="surface border border-panel-border bg-panel p-5">
            <p className="label-broadcast text-turf">{roleTitle}</p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              Resume sample outline
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{sample.blurb}</p>
            <p className="mt-3 font-mono text-xs text-gold">{sample.headline}</p>

            <h3 className="mt-5 font-display text-sm font-bold uppercase tracking-wide text-ink">
              Skills
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {sample.skills.map((s) => (
                <li
                  key={s}
                  className="rounded-md border border-panel-border bg-night/40 px-2 py-1 font-mono text-[10px] text-ink-soft"
                >
                  {s}
                </li>
              ))}
            </ul>

            <h3 className="mt-5 font-display text-sm font-bold uppercase tracking-wide text-ink">
              Experience bullets (rewrite with your numbers)
            </h3>
            {sample.experience.map((block) => (
              <div key={block.header} className="mt-3">
                <p className="text-sm font-medium text-ink">{block.header}</p>
                <ul className="mt-1 space-y-1.5">
                  {block.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-sm leading-relaxed text-ink-soft before:mr-2 before:text-turf before:content-['→']"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <h3 className="mt-5 font-display text-sm font-bold uppercase tracking-wide text-ink">
              Projects
            </h3>
            {sample.projects.map((block) => (
              <div key={block.header} className="mt-3">
                <p className="text-sm font-medium text-ink">{block.header}</p>
                <ul className="mt-1 space-y-1.5">
                  {block.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-sm leading-relaxed text-ink-soft before:mr-2 before:text-turf before:content-['→']"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <h3 className="mt-5 font-display text-sm font-bold uppercase tracking-wide text-ink">
              From the search trenches
            </h3>
            <ul className="mt-2 space-y-2">
              {sample.tips.map((t) => (
                <li key={t} className="text-sm leading-relaxed text-ink-soft">
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={copyResume} className="btn-gold">
                {copied ? "Copied" : "Copy markdown template"}
              </button>
              <Link
                href="/learn/project/my-league-scorecard"
                className="font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-turf"
              >
                Need a project line? League Scorecard →
              </Link>
            </div>
          </div>

          {roleFilter === "all" && (
            <p className="font-mono text-[10px] text-ink-muted">
              Tip: pick your roadmap above to swap the sample. Showing Data
              Analyst by default.
            </p>
          )}
        </section>
      )}

      {tab === "tactics" && (
        <section className="mt-6 space-y-3">
          <p className="text-sm text-ink-soft">
            Stuff that helped in real searches — structured outreach, proof
            over panic-apps, a cadence you can keep.
          </p>
          {JOB_TACTICS.map((t, i) => (
            <article
              key={t.id}
              className="surface border border-panel-border bg-panel p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                Tactic {i + 1}
                {t.from ? ` · ${t.from}` : ""}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-ink">
                {t.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {t.body}
              </p>
            </article>
          ))}
          <p className="pt-2 text-xs leading-relaxed text-ink-muted">
            Pair this with{" "}
            <Link href="/interview" className="text-turf hover:underline">
              Interview cases
            </Link>{" "}
            so the outreach story matches SQL you can actually run.
          </p>
        </section>
      )}

      {tab === "books" && (
        <section className="mt-6 space-y-3">
          <p className="text-sm text-ink-soft">
            Short shelf. Read for the next two weeks of your search — not a
            library flex.
          </p>
          {books.map((b) => (
            <article
              key={b.id}
              className="surface border border-panel-border bg-panel p-4"
            >
              <h2 className="font-display text-lg font-bold text-ink">
                {b.title}
              </h2>
              <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                {b.author}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {b.why}
              </p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
        active
          ? "border-gold bg-gold/15 text-gold"
          : "border-panel-border text-ink-muted hover:border-gold/40 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
