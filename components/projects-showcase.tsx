/**
 * The two builds, on the landing page, each with its picture.
 *
 * These used to carry flow diagrams — your league through an API into SQL,
 * raw CSVs through staging into marts. Accurate, and nobody's reason to
 * click. They now carry the same drawn scenes as the /projects catalogue
 * (components/project-art.tsx), so the landing page and the catalogue show
 * the same picture for the same project.
 */

import Link from "next/link";
import { liveProjects } from "@/lib/projects";
import ProjectArt from "@/components/project-art";

const PITCH: Record<string, string> = {
  "my-league-scorecard":
    "Nobody else's portfolio has your league in it. Pull it through a free public API, load it into SQL, and answer the questions your group chat argues about every week.",
  "nflverse-dbt-warehouse":
    "Analytics engineering, for real: model three seasons of raw nflverse releases into a tested dbt warehouse. Runs on DuckDB — no cloud account, no card, no waiting.",
  "fantasy-points-model":
    "Forecast every player's points before kickoff from real NFL history, then find out honestly whether you beat his last-three average. Ends with next week's projections.",
};

export default function ProjectsShowcase() {
  const builds = liveProjects();

  return (
    <section
      data-reveal-section
      className="wash-ice border-b border-panel-border"
    >
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="sequence text-center">
          <p className="reveal label-broadcast text-ice">projects</p>
          <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
            Leave with something you can show
          </h2>
          <p className="reveal mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            Not a certificate. A repo, a notebook, a lineage graph — the kind
            of thing an interviewer clicks on and asks you about.
          </p>
        </div>

        <div className="sequence mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="reveal ring-lift surface group flex flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel"
            >
              <div className="h-44 overflow-hidden border-b border-panel-border bg-night/40">
                <ProjectArt
                  id={p.id}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
                      p.accent === "gold" ? "text-gold" : "text-turf"
                    }`}
                  >
                    Build · {p.hours}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                    {p.level}
                  </span>
                </div>
                <p className="mt-2 font-display text-xl font-bold text-ink">
                  {p.title}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {PITCH[p.id] ?? p.blurb}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-panel-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-4 border-t border-panel-border pt-3 font-mono text-[11px] text-ink-muted">
                  You leave with:{" "}
                  <span className="text-ink">{p.artifact}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="reveal mt-8 text-center">
          <Link
            href="/projects"
            className="rounded-xl border border-panel-border px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-ice/50 hover:text-ice"
          >
            All builds &amp; cases →
          </Link>
        </div>
      </div>
    </section>
  );
}
