"use client";

/**
 * /dax: the Power BI-style measure builder with no grade, an editable
 * visual (rows and a season slicer), and a handful of measures worth trying.
 * Same engine and builder the Power BI drills use.
 */

import { useMemo, useState } from "react";
import DaxBuilder from "@/components/dax-builder";
import { useLessonDb } from "@/lib/use-lesson-db";
import { DAX_LOAD_SQL, rowsFromResult, type DaxVisual } from "@/lib/dax";

const MEASURES = { "Total Points": "SUM(Results[Points])", Games: "COUNTROWS(Results)" };

const TRY: { label: string; text: string }[] = [
  { label: "Points per game", text: "Points per Game = DIVIDE([Total Points], [Games])" },
  { label: "Share of the total", text: "Share = DIVIDE([Total Points], CALCULATE([Total Points], ALL(Results[Position])))" },
  { label: "Best single game", text: "Best Game = MAX(Results[Points])" },
  { label: "30-point games", text: "Big Games = CALCULATE(COUNTROWS(Results), Results[Points] >= 30)" },
  { label: "Average player total", text: "Avg Player Total = AVERAGEX(VALUES(Results[Player]), [Total Points])" },
  { label: "Players over 300", text: "Players Over 300 = COUNTROWS(FILTER(VALUES(Results[Player]), [Total Points] > 300))" },
];

export default function DaxLab() {
  const { run, ready, failed } = useLessonDb();
  const [measure, setMeasure] = useState(TRY[0].text);
  const [visual, setVisual] = useState<DaxVisual>({ rows: "position", slicers: { season: 2024 } });
  const rows = useMemo(() => (ready ? rowsFromResult(run(DAX_LOAD_SQL)?.values ?? []) : null), [ready, run]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="surface overflow-hidden rounded-2xl border border-panel-border bg-panel">
        {failed && <p className="p-4 font-mono text-[12px] text-gold">The database couldn&apos;t load. Refresh the page.</p>}
        <DaxBuilder
          measure={measure}
          onChange={setMeasure}
          model={rows ? { rows, measures: MEASURES } : null}
          visual={visual}
          onVisualChange={setVisual}
        />
      </div>
      <aside className="space-y-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">Try a measure</p>
        {TRY.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setMeasure(t.text)}
            className="surface block w-full rounded-xl border border-panel-border bg-panel px-3 py-2.5 text-left text-sm text-ink transition-colors hover:border-gold/50"
          >
            {t.label}
          </button>
        ))}
        <p className="px-1 pt-1 text-[12px] leading-relaxed text-ink-muted">
          Change the rows or the slicer and watch the same measure give different numbers. That&apos;s filter context.
        </p>
      </aside>
    </div>
  );
}
