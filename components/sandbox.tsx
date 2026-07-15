"use client";

import { useEffect, useState } from "react";

const SAMPLE_QUERY = `SELECT player, team, fantasy_pts
FROM week_results
WHERE position = 'WR'
  AND week = 12
ORDER BY fantasy_pts DESC
LIMIT 5;`;

const RESULT_ROWS = [
  { player: "Tyreek Hill", team: "MIA", pts: 28.4 },
  { player: "CeeDee Lamb", team: "DAL", pts: 24.1 },
  { player: "Amon-Ra St. Brown", team: "DET", pts: 22.7 },
  { player: "A.J. Brown", team: "PHI", pts: 19.8 },
  { player: "Puka Nacua", team: "LAR", pts: 18.2 },
];

export default function Sandbox() {
  const [query, setQuery] = useState(SAMPLE_QUERY);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [rows, setRows] = useState<typeof RESULT_ROWS | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  function runQuery() {
    setStatus("running");
    setRows(null);
    setMs(null);
    window.setTimeout(() => {
      setRows(RESULT_ROWS);
      setMs(42);
      setStatus("done");
    }, 380);
  }

  useEffect(() => {
    runQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full min-h-[420px] flex-col border border-panel-border bg-night/95 shadow-scoreboard backdrop-blur-md">
      {/* Title bar — editor chrome */}
      <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-panel-hover" />
            <span className="h-2.5 w-2.5 rounded-full bg-panel-hover" />
            <span className="h-2.5 w-2.5 rounded-full bg-panel-hover" />
          </div>
          <span className="label-broadcast text-teal">live sandbox</span>
        </div>
        <div className="flex items-center gap-3">
          {ms !== null && (
            <span className="stat-number text-[11px] text-ink-muted">
              {ms}
              <span className="ml-0.5 text-ink-muted/70">ms</span>
            </span>
          )}
          <span
            className={`font-mono text-[10px] uppercase tracking-widest ${
              status === "running"
                ? "text-amber"
                : status === "done"
                  ? "text-teal"
                  : "text-ink-muted"
            }`}
          >
            {status === "running" ? "executing" : status === "done" ? "ready" : "idle"}
          </span>
        </div>
      </div>

      {/* Query pane */}
      <div className="relative flex-1 border-b border-panel-border">
        <div className="absolute left-0 top-0 bottom-0 flex w-8 flex-col items-end gap-0 border-r border-panel-border/60 bg-night/40 py-3 pr-2 font-mono text-[11px] leading-5 text-ink-muted/50 select-none">
          {query.split("\n").map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          className="h-full min-h-[160px] w-full resize-none bg-transparent py-3 pl-10 pr-3 font-mono text-[13px] leading-5 text-ink outline-none caret-teal"
          aria-label="SQL query editor"
        />
      </div>

      {/* Results pane */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
          <span className="label-broadcast">
            result set
            {rows && (
              <span className="ml-2 text-amber">
                {rows.length} rows
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={runQuery}
            disabled={status === "running"}
            className="inline-flex items-center gap-2 border border-teal/40 bg-teal/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-teal transition-colors duration-150 hover:border-teal hover:bg-teal/20 disabled:opacity-50"
          >
            <span className="inline-block h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-teal" />
            Run
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left">
            <thead>
              <tr className="border-b border-panel-border">
                {["player", "team", "fantasy_pts"].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink-muted font-medium"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {status === "running" && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-6 font-mono text-xs text-ink-muted"
                  >
                    executing query…
                  </td>
                </tr>
              )}
              {rows?.map((row, i) => (
                <tr
                  key={row.player}
                  className="border-b border-panel-border/50 transition-colors duration-100 hover:bg-teal/5"
                  style={{
                    animation: "fadeUp 0.35s ease-out forwards",
                    animationDelay: `${i * 40}ms`,
                    opacity: 0,
                  }}
                >
                  <td className="px-3 py-2 font-mono text-[13px] font-medium text-ink">
                    {row.player}
                  </td>
                  <td className="px-3 py-2 font-mono text-[13px] text-[#C5CCD9]">
                    {row.team}
                  </td>
                  <td className="stat-number px-3 py-2 text-[15px]">
                    {row.pts.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
