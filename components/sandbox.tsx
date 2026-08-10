"use client";

import { useEffect, useRef, useState } from "react";
import type { Database, QueryExecResult, SqlJsStatic } from "sql.js";
import { PRESETS, SCHEMA, buildSeedSql } from "@/lib/fantasy-data";

const POSITION_STYLES: Record<string, string> = {
  QB: "bg-gold/15 text-gold",
  RB: "bg-turf/15 text-turf",
  WR: "bg-turf/15 text-turf",
  TE: "bg-gold/15 text-gold",
  K: "bg-panel-hover text-ink-muted",
  DEF: "bg-panel-hover text-ink-muted",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type EngineStatus = "loading" | "ready" | "error";
type ExecStatus = "idle" | "running" | "done" | "error";

export default function Sandbox() {
  const dbRef = useRef<Database | null>(null);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("loading");
  const [engineError, setEngineError] = useState<string | null>(null);

  const [query, setQuery] = useState(PRESETS[0].query);
  const [activePreset, setActivePreset] = useState<string | null>(PRESETS[0].id);
  const [execStatus, setExecStatus] = useState<ExecStatus>("idle");
  const [result, setResult] = useState<QueryExecResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(false);

  function seedDatabase(SQL: SqlJsStatic) {
    const db = new SQL.Database();
    db.run(buildSeedSql());
    dbRef.current = db;
  }

  useEffect(() => {
    let cancelled = false;

    import("sql.js")
      .then((mod) => mod.default({ locateFile: () => "/sql-wasm.wasm" }))
      .then((SQL) => {
        if (cancelled) return;
        seedDatabase(SQL);
        setEngineStatus("ready");
        runQuery(PRESETS[0].query);
      })
      .catch((err) => {
        if (cancelled) return;
        setEngineStatus("error");
        setEngineError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runQuery(sql: string) {
    const db = dbRef.current;
    if (!db) return;
    setExecStatus("running");
    setResult(null);
    setErrorMessage(null);
    setMs(null);

    try {
      const t0 = performance.now();
      const res = db.exec(sql);
      const t1 = performance.now();
      setResult(res[0] ?? { columns: [], values: [] });
      setMs(Math.max(1, Math.round(t1 - t0)));
      setExecStatus("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setExecStatus("error");
    }
  }

  function handleRun() {
    setActivePreset(null);
    runQuery(query);
  }

  function selectPreset(preset: (typeof PRESETS)[number]) {
    setActivePreset(preset.id);
    setQuery(preset.query);
    runQuery(preset.query);
  }

  function handleReset() {
    import("sql.js")
      .then((mod) => mod.default({ locateFile: () => "/sql-wasm.wasm" }))
      .then((SQL) => {
        dbRef.current?.close();
        seedDatabase(SQL);
        selectPreset(PRESETS[0]);
      });
  }

  const columns = result?.columns ?? [];
  const lowerCols = columns.map((c) => c.toLowerCase());
  const playerColIdx = lowerCols.findIndex((c) => c === "player" || c === "name");
  const positionColIdx = lowerCols.findIndex((c) => c === "position");
  const teamColIdx = lowerCols.findIndex((c) => c === "team");

  return (
    <div className="flex h-full min-h-[500px] flex-col border border-panel-border bg-night/95 shadow-scoreboard backdrop-blur-md">
      {/* Title bar — editor chrome */}
      <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-panel-hover" />
            <span className="h-2.5 w-2.5 rounded-full bg-panel-hover" />
            <span className="h-2.5 w-2.5 rounded-full bg-panel-hover" />
          </div>
          <span className="label-broadcast text-turf">live sandbox</span>
          <span className="hidden font-mono text-[10px] text-ink-muted sm:inline">
            · 2016–2018 · 16 players
          </span>
        </div>
        <div className="flex items-center gap-3">
          {ms !== null && execStatus === "done" && (
            <span className="stat-number text-[11px] text-ink-muted">
              {ms}
              <span className="ml-0.5 text-ink-muted/70">ms</span>
            </span>
          )}
          <span
            className={`font-mono text-[10px] uppercase tracking-widest ${
              engineStatus === "loading"
                ? "text-ink-muted"
                : execStatus === "running"
                  ? "text-gold"
                  : execStatus === "error"
                    ? "text-gold"
                    : execStatus === "done"
                      ? "text-turf"
                      : "text-ink-muted"
            }`}
          >
            {engineStatus === "loading"
              ? "loading engine"
              : execStatus === "running"
                ? "executing"
                : execStatus === "error"
                  ? "error"
                  : execStatus === "done"
                    ? "ready"
                    : "idle"}
          </span>
        </div>
      </div>

      {/* Preset queries + schema toggle */}
      <div className="flex flex-wrap items-center gap-2 border-b border-panel-border px-3 py-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => selectPreset(preset)}
            disabled={engineStatus !== "ready"}
            className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors duration-150 disabled:opacity-40 ${
              activePreset === preset.id
                ? "border-turf/50 bg-turf/10 text-turf"
                : "border-panel-border text-ink-muted hover:border-turf/40 hover:text-ink"
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSchemaOpen((v) => !v)}
          className={`ml-auto border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors duration-150 ${
            schemaOpen
              ? "border-gold/50 bg-gold/10 text-gold"
              : "border-panel-border text-ink-muted hover:border-gold/40 hover:text-ink"
          }`}
        >
          {schemaOpen ? "Hide schema" : "Schema"}
        </button>
      </div>

      {schemaOpen && (
        <div className="border-b border-panel-border bg-night/60 px-3 py-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {SCHEMA.map((t) => (
              <div key={t.table}>
                <p className="font-mono text-[11px] font-semibold text-gold">
                  {t.table}
                </p>
                <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-muted">
                  {t.columns.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query pane */}
      <div className="relative flex-1 border-b border-panel-border">
        <div className="absolute left-0 top-0 bottom-0 flex w-8 flex-col items-end gap-0 border-r border-panel-border/60 bg-night/40 py-3 pr-2 font-mono text-[11px] leading-5 text-ink-muted/50 select-none">
          {query.split("\n").map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <textarea
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActivePreset(null);
          }}
          spellCheck={false}
          className="h-full min-h-[140px] w-full resize-none bg-transparent py-3 pl-10 pr-3 font-mono text-[13px] leading-5 text-ink outline-none caret-turf"
          aria-label="SQL query editor"
        />
      </div>

      {/* Results pane */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
          <span className="label-broadcast">
            result set
            {result && execStatus === "done" && (
              <span className="ml-2 text-gold">
                {result.values.length} rows
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="font-mono text-[10px] uppercase tracking-wider text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              Reset data
            </button>
            <button
              type="button"
              onClick={handleRun}
              disabled={engineStatus !== "ready" || execStatus === "running"}
              className="inline-flex items-center gap-2 border border-turf/40 bg-turf/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-turf transition-colors duration-150 hover:border-turf hover:bg-turf/20 disabled:opacity-50"
            >
              <span className="inline-block h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-turf" />
              Run
            </button>
          </div>
        </div>

        {engineStatus === "loading" && (
          <p className="px-3 py-6 font-mono text-xs text-ink-muted">
            Loading SQL engine…
          </p>
        )}

        {engineStatus === "error" && (
          <p className="px-3 py-6 font-mono text-xs text-gold">
            Couldn&apos;t load the SQL engine{engineError ? `: ${engineError}` : ""}.
          </p>
        )}

        {engineStatus === "ready" && execStatus === "error" && (
          <div className="px-3 py-4">
            <p className="border border-gold/40 bg-gold/5 px-3 py-2 font-mono text-[12px] leading-relaxed text-gold">
              ⚠ {errorMessage}
            </p>
          </div>
        )}

        {engineStatus === "ready" &&
          execStatus !== "error" &&
          result &&
          result.columns.length === 0 && (
            <p className="px-3 py-6 font-mono text-xs text-ink-muted">
              Query ran, but returned no columns — try a SELECT statement.
            </p>
          )}

        {engineStatus === "ready" &&
          execStatus === "done" &&
          result &&
          result.columns.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-left">
                <thead>
                  <tr className="border-b border-panel-border">
                    {columns.map((col, i) => (
                      <th
                        key={col + i}
                        className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink-muted font-medium ${
                          i === playerColIdx ? "" : "text-right"
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.values.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-3 py-6 font-mono text-xs text-ink-muted"
                      >
                        0 rows returned.
                      </td>
                    </tr>
                  )}
                  {result.values.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-panel-border/50 transition-colors duration-100 hover:bg-turf/5"
                      style={{
                        animation: "fadeUp 0.35s ease-out forwards",
                        animationDelay: `${rowIdx * 40}ms`,
                        opacity: 0,
                      }}
                    >
                      {row.map((cell, colIdx) => {
                        const isPlayerCol = colIdx === playerColIdx;
                        const position =
                          positionColIdx !== -1
                            ? String(row[positionColIdx])
                            : undefined;
                        const team =
                          teamColIdx !== -1 ? String(row[teamColIdx]) : undefined;

                        if (isPlayerCol) {
                          const name = String(cell);
                          return (
                            <td key={colIdx} className="px-3 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold ${
                                    position && POSITION_STYLES[position]
                                      ? POSITION_STYLES[position]
                                      : "bg-panel-hover text-ink-muted"
                                  }`}
                                >
                                  {initials(name)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-mono text-[13px] font-medium text-ink">
                                    {name}
                                  </p>
                                  {(team || position) && (
                                    <p className="truncate font-mono text-[10px] uppercase tracking-wide text-ink-muted">
                                      {[team, position].filter(Boolean).join(" · ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        }

                        const isNumeric = typeof cell === "number";
                        return (
                          <td
                            key={colIdx}
                            className={`px-3 py-2.5 ${
                              isNumeric
                                ? "text-right stat-number text-[14px]"
                                : "font-mono text-[13px] text-[#BEC5DE]"
                            }`}
                          >
                            {cell === null ? (
                              <span className="text-ink-muted/60">null</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
