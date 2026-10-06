"use client";

// The Practice Field: a free-play SQL sandbox over real NFL data (nflverse).
// No grading, no hearts, no XP — just reps. Drill cards suggest questions;
// solutions are peekable but never forced.

import { useEffect, useRef, useState } from "react";
import type { Database, QueryExecResult } from "sql.js";
import {
  buildFieldSeedSql,
  DRILLS,
  FIELD_SCHEMA,
  PLAY_DRILLS,
  PLAYS_FIELD_SCHEMA,
  type Drill,
  type FieldData,
} from "@/lib/field-data";
import Coach from "@/components/coach";
import TeamChip, { isTeamColumn } from "@/components/team-chip";
import CodeEditor from "@/components/code-editor";
import ChartIt from "@/components/chart-it";
import { NFLVERSE_CREDIT } from "@/lib/chart";
import { SITE_URL } from "@/lib/site";

type EngineStatus = "loading" | "ready" | "error";

const DEFAULT_QUERY = `-- Real NFL data. No refs. Run anything.
SELECT player, team, week, opponent, fantasy_ppr
FROM player_weeks
ORDER BY fantasy_ppr DESC
LIMIT 10;`;

const TIERS: Drill["tier"][] = [
  "Warm-ups",
  "Position drills",
  "Game situations",
];

export default function FieldSandbox() {
  const dbRef = useRef<Database | null>(null);
  const [status, setStatus] = useState<EngineStatus>("loading");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    weeklySeason: number;
    summarySeasons: number[];
    weeklyRows: number;
    seasonRows: number;
  } | null>(null);

  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<QueryExecResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const [activeDrill, setActiveDrill] = useState<Drill | null>(null);
  /** The 2025 play-by-play, loaded into the same database on request. */
  const [plays, setPlays] = useState<"off" | "loading" | "on" | "error">("off");
  const [solutionShown, setSolutionShown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import("sql.js").then((mod) =>
        mod.default({ locateFile: () => "/sql-wasm.wasm" }),
      ),
      fetch("/field-data.json").then((r) => {
        if (!r.ok) throw new Error(`dataset fetch failed (${r.status})`);
        return r.json() as Promise<FieldData>;
      }),
    ])
      .then(([SQL, data]) => {
        if (cancelled) return;
        const db = new SQL.Database();
        db.run(buildFieldSeedSql(data));
        dbRef.current = db;
        setMeta({
          weeklySeason: data.weeklySeason,
          summarySeasons: data.summarySeasons,
          weeklyRows: data.weekly.length,
          seasonRows: data.seasons.length,
        });
        setStatus("ready");
        runQuery(DEFAULT_QUERY, db);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setStatusError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runQuery(sql: string, db?: Database) {
    const engine = db ?? dbRef.current;
    if (!engine) return;
    setError(null);
    try {
      const t0 = performance.now();
      const res = engine.exec(sql);
      const t1 = performance.now();
      setResult(res[res.length - 1] ?? { columns: [], values: [] });
      setMs(Math.max(1, Math.round(t1 - t0)));
    } catch (err) {
      setResult(null);
      setMs(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  // ~0.8 MB, so it waits to be asked for rather than loading with the page.
  async function loadPlaysTable() {
    const db = dbRef.current;
    if (!db || plays === "loading" || plays === "on") return;
    setPlays("loading");
    try {
      const { loadPlays } = await import("@/lib/plays-dataset");
      await loadPlays(db);
      setPlays("on");
    } catch {
      setPlays("error");
    }
  }

  function pickDrill(drill: Drill) {
    setActiveDrill(drill);
    setSolutionShown(false);
    setQuery(`-- ${drill.title}\n-- ${drill.prompt}\n\n`);
    setResult(null);
    setError(null);
    setMs(null);
  }

  function revealSolution() {
    if (!activeDrill) return;
    setSolutionShown(true);
    setQuery(activeDrill.solution);
    runQuery(activeDrill.solution);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* left rail: coach, schema, drills */}
      <aside className="space-y-5">
        <div className="surface border border-panel-border bg-panel/70 p-4">
          <div className="flex items-center gap-3">
            <Coach mood="idle" size={64} />
            <p className="text-[12px] leading-relaxed text-ink-soft">
              No refs out here, rookie. Real NFL data, every query legal.
              Break something? Reset and run it back.
            </p>
          </div>
        </div>

        <div className="surface border border-panel-border bg-panel/70 p-4">
          <p className="label-broadcast text-gold">the stat sheets</p>
          <div className="mt-3 space-y-4">
            {FIELD_SCHEMA.map((t) => (
              <div key={t.table}>
                <p className="font-mono text-[12px] font-semibold text-turf">
                  {t.table}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-ink-muted">
                  {t.grain}
                </p>
                <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-soft">
                  {t.columns.join(" · ")}
                </p>
              </div>
            ))}
          </div>
          {plays === "on" && (
            <div className="mt-4">
              <p className="font-mono text-[12px] font-semibold text-turf">{PLAYS_FIELD_SCHEMA.table}</p>
              <p className="mt-0.5 font-mono text-[10px] text-ink-muted">{PLAYS_FIELD_SCHEMA.grain}</p>
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-soft">
                {PLAYS_FIELD_SCHEMA.columns.join(" · ")}
              </p>
            </div>
          )}
          {meta && (
            <p className="mt-4 border-t border-panel-border pt-3 font-mono text-[10px] leading-relaxed text-ink-muted">
              {meta.weeklyRows.toLocaleString()} weekly rows (
              {meta.weeklySeason} season) · {meta.seasonRows.toLocaleString()}{" "}
              player-seasons ({meta.summarySeasons[0]}–{meta.summarySeasons[meta.summarySeasons.length - 1]}) · real stats via
              nflverse
            </p>
          )}
        </div>

        <div className="surface border border-panel-border bg-panel/70 p-4">
          <p className="label-broadcast text-gold">play-by-play</p>
          {plays !== "on" ? (
            <>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                Every snap of the 2025 season: who got the ball, where, and what it was worth. Real nflverse data.
              </p>
              <button
                type="button"
                onClick={loadPlaysTable}
                disabled={status !== "ready" || plays === "loading"}
                className="mt-3 w-full border border-turf/50 bg-turf/10 px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-turf transition-colors hover:bg-turf/20 disabled:opacity-50"
              >
                {plays === "loading" ? "Loading 35k plays…" : "Add the plays table · 0.8 MB"}
              </button>
              {plays === "error" && (
                <p className="mt-2 font-mono text-[10px] text-gold">That didn&apos;t load. Try again.</p>
              )}
            </>
          ) : (
            <div className="mt-1.5 space-y-1">
              {PLAY_DRILLS.map((drill) => (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => pickDrill(drill)}
                  className={`block w-full border px-2.5 py-1.5 text-left font-mono text-[11px] transition-colors ${
                    activeDrill?.id === drill.id
                      ? "border-turf/50 bg-turf/10 text-turf"
                      : "border-panel-border text-ink-soft hover:border-turf/40 hover:text-ink"
                  }`}
                >
                  {drill.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="surface border border-panel-border bg-panel/70 p-4">
          <p className="label-broadcast text-gold">drill book</p>
          {TIERS.map((tier) => (
            <div key={tier} className="mt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                {tier}
              </p>
              <div className="mt-1.5 space-y-1">
                {DRILLS.filter((d) => d.tier === tier).map((drill) => (
                  <button
                    key={drill.id}
                    type="button"
                    onClick={() => pickDrill(drill)}
                    className={`block w-full border px-2.5 py-1.5 text-left font-mono text-[11px] transition-colors ${
                      activeDrill?.id === drill.id
                        ? "border-turf/50 bg-turf/10 text-turf"
                        : "border-panel-border text-ink-soft hover:border-turf/40 hover:text-ink"
                    }`}
                  >
                    {drill.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* main: editor + results */}
      <div className="flex min-h-[540px] flex-col border border-panel-border bg-night/95 shadow-scoreboard">
        <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
          <span className="label-broadcast text-turf">
            practice field · live sql
          </span>
          <div className="flex items-center gap-3">
            {ms !== null && (
              <span className="stat-number text-[11px]">{ms}ms</span>
            )}
            <span
              className={`font-mono text-[10px] uppercase tracking-widest ${
                status === "loading"
                  ? "text-ink-muted"
                  : status === "error"
                    ? "text-gold"
                    : "text-turf"
              }`}
            >
              {status === "loading"
                ? "loading real nfl data…"
                : status === "error"
                  ? "engine error"
                  : "ready"}
            </span>
          </div>
        </div>

        {activeDrill && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-border bg-panel/40 px-3 py-2">
            <p className="text-[12px] text-ink-soft">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
                {activeDrill.tier} ·{" "}
              </span>
              {activeDrill.prompt}
            </p>
            {!solutionShown && (
              <button
                type="button"
                onClick={revealSolution}
                className="shrink-0 border border-panel-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted transition-colors hover:border-gold/50 hover:text-gold"
              >
                Show a solution
              </button>
            )}
          </div>
        )}

        <CodeEditor
          value={query}
          onChange={setQuery}
          lang="sql"
          rows={9}
          ariaLabel="SQL editor"
          className="min-h-[180px] flex-none"
        />

        <div className="flex items-center justify-between border-y border-panel-border px-3 py-2">
          <span className="label-broadcast">
            result set
            {result && (
              <span className="ml-2 text-gold">
                {result.values.length} rows
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {result && meta && (
              <ChartIt
                grid={result}
                title={activeDrill?.title ?? "From the Practice Field"}
                subtitle={`${meta.weeklySeason} season · one SQL query on real NFL data`}
                credit={NFLVERSE_CREDIT}
                shareUrl={`${SITE_URL}/field`}
                shareText="Made this from one SQL query on real NFL data."
              />
            )}
            <button
              type="button"
              onClick={() => {
                setQuery(DEFAULT_QUERY);
                setActiveDrill(null);
                setSolutionShown(false);
                runQuery(DEFAULT_QUERY);
              }}
              className="font-mono text-[10px] uppercase tracking-wider text-ink-muted transition-colors hover:text-ink"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => runQuery(query)}
              disabled={status !== "ready"}
              className="inline-flex items-center gap-2 border border-turf/40 bg-turf/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-turf transition-colors hover:border-turf hover:bg-turf/20 disabled:opacity-50"
            >
              <span className="inline-block h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-turf" />
              Run
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {status === "error" && (
            <p className="px-3 py-6 font-mono text-xs text-gold">
              Couldn&apos;t load the field
              {statusError ? `: ${statusError}` : ""}.
            </p>
          )}
          {error && (
            <p className="m-3 border border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] text-gold">
              ⚠ {error}
            </p>
          )}
          {result && result.columns.length > 0 && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-panel-border">
                  {result.columns.map((c, i) => (
                    <th
                      key={i}
                      className="whitespace-nowrap px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink-muted"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.values.slice(0, 100).map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-panel-border/40 transition-colors hover:bg-turf/5"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`whitespace-nowrap px-3 py-1.5 font-mono text-[12px] ${
                          typeof cell === "number"
                            ? "text-right tabular-nums text-ink"
                            : "text-ink-soft"
                        }`}
                      >
                        {isTeamColumn(result.columns[ci] ?? "") && cell
                          ? <TeamChip abbr={String(cell)} />
                          : cell === null ? "null" : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {result && result.values.length > 100 && (
            <p className="px-3 py-2 font-mono text-[10px] text-ink-muted">
              Showing 100 of {result.values.length} rows — add a LIMIT to trim
              the tape.
            </p>
          )}
          {result && result.columns.length === 0 && !error && (
            <p className="px-3 py-6 font-mono text-xs text-ink-muted">
              Query ran, but returned no columns — try a SELECT.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
