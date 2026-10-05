"use client";

/**
 * /viz: the Tableau-style builder with no grade, both tables, and a few
 * starting views one click away. Same builder the Tableau drills use.
 */

import { useState } from "react";
import VizBuilder from "@/components/viz-builder";
import { useLessonDb } from "@/lib/use-lesson-db";
import { emptySpec, type VizSpec } from "@/lib/viz";

const STARTERS: { label: string; spec: VizSpec }[] = [
  {
    label: "2024 leaderboard",
    spec: {
      ...emptySpec(),
      columns: [{ field: "player" }],
      rows: [{ field: "fantasy_pts", agg: "SUM" }],
      filters: [{ field: "season", values: [2024] }],
      sort: "desc",
      top: 10,
    },
  },
  {
    label: "A season as a line",
    spec: {
      ...emptySpec(),
      columns: [{ field: "week" }],
      rows: [{ field: "fantasy_pts", agg: "SUM" }],
      filters: [
        { field: "player", values: ["Josh Allen"] },
        { field: "season", values: [2024] },
      ],
      mark: "line",
    },
  },
  {
    label: "Games vs points (scatter)",
    spec: {
      ...emptySpec(),
      columns: [{ field: "fantasy_pts", agg: "COUNT" }],
      rows: [{ field: "fantasy_pts", agg: "SUM" }],
      detail: [{ field: "player" }],
      color: [{ field: "position" }],
      filters: [{ field: "season", values: [2024] }],
      mark: "circle",
    },
  },
  {
    label: "Scoring by position, by season",
    spec: {
      ...emptySpec(),
      columns: [{ field: "season" }],
      rows: [{ field: "fantasy_pts", agg: "AVG" }],
      color: [{ field: "position" }],
      mark: "line",
    },
  },
  {
    label: "Home scoring by roof (games)",
    spec: {
      ...emptySpec("games"),
      columns: [{ field: "roof" }],
      rows: [{ field: "home_score", agg: "AVG" }],
    },
  },
];

export default function VizLab() {
  const { run, failed } = useLessonDb();
  const [spec, setSpec] = useState<VizSpec>(STARTERS[0].spec);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="surface overflow-hidden rounded-2xl border border-panel-border bg-panel">
        {failed && <p className="p-4 font-mono text-[12px] text-gold">The database couldn&apos;t load. Refresh the page.</p>}
        <VizBuilder spec={spec} onChange={setSpec} run={run} sources={["week_results", "games"]} />
      </div>
      <aside className="space-y-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">Start from</p>
        {STARTERS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setSpec(s.spec)}
            className="surface block w-full rounded-xl border border-panel-border bg-panel px-3 py-2.5 text-left text-sm text-ink transition-colors hover:border-turf/50"
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSpec(emptySpec(spec.source))}
          className="block w-full rounded-xl border border-dashed border-panel-border px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-ink"
        >
          Clear the view
        </button>
      </aside>
    </div>
  );
}
