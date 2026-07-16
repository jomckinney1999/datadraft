"use client";

import { useEffect, useState } from "react";

type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DEF" | "TEAM";

type ResultRow = {
  name: string;
  sub: string;
  position: Position;
  stat: string;
  trend?: "up" | "down";
};

type Dataset = {
  id: string;
  label: string;
  query: string;
  statLabel: string;
  rows: ResultRow[];
};

const POSITION_STYLES: Record<Position, string> = {
  QB: "bg-amber/15 text-amber",
  RB: "bg-teal/15 text-teal",
  WR: "bg-teal/15 text-teal",
  TE: "bg-amber/15 text-amber",
  K: "bg-panel-hover text-ink-muted",
  DEF: "bg-panel-hover text-ink-muted",
  TEAM: "bg-amber/15 text-amber",
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

const DATASETS: Dataset[] = [
  {
    id: "top-scorers",
    label: "Top Scorers",
    statLabel: "PTS",
    query: `SELECT player, team, position, fantasy_pts
FROM week_results
WHERE week = 12
ORDER BY fantasy_pts DESC
LIMIT 5;`,
    rows: [
      { name: "Tyreek Hill", sub: "MIA · WR", position: "WR", stat: "28.4", trend: "up" },
      { name: "CeeDee Lamb", sub: "DAL · WR", position: "WR", stat: "24.1", trend: "up" },
      { name: "Amon-Ra St. Brown", sub: "DET · WR", position: "WR", stat: "22.7" },
      { name: "A.J. Brown", sub: "PHI · WR", position: "WR", stat: "19.8", trend: "down" },
      { name: "Puka Nacua", sub: "LAR · WR", position: "WR", stat: "18.2", trend: "up" },
    ],
  },
  {
    id: "waiver-wire",
    label: "Waiver Wire",
    statLabel: "% ROST",
    query: `SELECT player, team, position, pct_rostered
FROM waiver_wire
WHERE pct_rostered < 50
ORDER BY trend DESC
LIMIT 5;`,
    rows: [
      { name: "Jaylen Warren", sub: "PIT · RB", position: "RB", stat: "42%", trend: "up" },
      { name: "Tank Dell", sub: "HOU · WR", position: "WR", stat: "38%", trend: "up" },
      { name: "Ray Davis", sub: "BUF · RB", position: "RB", stat: "31%", trend: "up" },
      { name: "Rome Odunze", sub: "CHI · WR", position: "WR", stat: "27%" },
      { name: "Tyler Allgeier", sub: "ATL · RB", position: "RB", stat: "19%", trend: "down" },
    ],
  },
  {
    id: "matchup",
    label: "My Matchup",
    statLabel: "TOTAL",
    query: `SELECT team_name, SUM(fantasy_pts) AS total
FROM roster
JOIN week_results USING (player)
WHERE week = 12
GROUP BY team_name
ORDER BY total DESC;`,
    rows: [
      { name: "Your Team", sub: "7-4 · This week", position: "TEAM", stat: "118.4", trend: "up" },
      { name: "Kupp's Krew", sub: "6-5 · Opponent", position: "TEAM", stat: "104.2", trend: "down" },
    ],
  },
];

export default function Sandbox() {
  const [activeId, setActiveId] = useState(DATASETS[0].id);
  const active = DATASETS.find((d) => d.id === activeId) ?? DATASETS[0];

  const [query, setQuery] = useState(active.query);
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [rows, setRows] = useState<ResultRow[] | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  function runQuery(dataset: Dataset) {
    setStatus("running");
    setRows(null);
    setMs(null);
    window.setTimeout(() => {
      setRows(dataset.rows);
      setMs(Math.round(28 + Math.random() * 34));
      setStatus("done");
    }, 380);
  }

  function selectDataset(dataset: Dataset) {
    setActiveId(dataset.id);
    setQuery(dataset.query);
    runQuery(dataset);
  }

  useEffect(() => {
    runQuery(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full min-h-[460px] flex-col border border-panel-border bg-night/95 shadow-scoreboard backdrop-blur-md">
      {/* Title bar — editor chrome */}
      <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-panel-hover" />
            <span className="h-2.5 w-2.5 rounded-full bg-panel-hover" />
            <span className="h-2.5 w-2.5 rounded-full bg-panel-hover" />
          </div>
          <span className="label-broadcast text-teal">live sandbox</span>
          <span className="hidden font-mono text-[10px] text-ink-muted sm:inline">
            · Sample League · Week 12
          </span>
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

      {/* Dataset tabs — app-nav flavor (Lineup / Waiver / Matchup) */}
      <div className="flex border-b border-panel-border">
        {DATASETS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => selectDataset(d)}
            className={`flex-1 border-r border-panel-border px-2 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors duration-150 last:border-r-0 sm:text-[11px] ${
              d.id === activeId
                ? "bg-teal/10 text-teal"
                : "text-ink-muted hover:bg-panel-hover hover:text-ink"
            }`}
          >
            {d.label}
          </button>
        ))}
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
          className="h-full min-h-[140px] w-full resize-none bg-transparent py-3 pl-10 pr-3 font-mono text-[13px] leading-5 text-ink outline-none caret-teal"
          aria-label="SQL query editor"
        />
      </div>

      {/* Results pane — fantasy-app-style roster rows */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-panel-border px-3 py-2">
          <span className="label-broadcast">
            result set
            {rows && (
              <span className="ml-2 text-amber">{rows.length} rows</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => runQuery(active)}
            disabled={status === "running"}
            className="inline-flex items-center gap-2 border border-teal/40 bg-teal/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-teal transition-colors duration-150 hover:border-teal hover:bg-teal/20 disabled:opacity-50"
          >
            <span className="inline-block h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-teal" />
            Run
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-left">
            <thead>
              <tr className="border-b border-panel-border">
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink-muted font-medium">
                  player
                </th>
                <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-widest text-ink-muted font-medium">
                  {active.statLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {status === "running" && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-6 font-mono text-xs text-ink-muted"
                  >
                    executing query…
                  </td>
                </tr>
              )}
              {rows?.map((row, i) => (
                <tr
                  key={row.name}
                  className="border-b border-panel-border/50 transition-colors duration-100 hover:bg-teal/5"
                  style={{
                    animation: "fadeUp 0.35s ease-out forwards",
                    animationDelay: `${i * 40}ms`,
                    opacity: 0,
                  }}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold ${POSITION_STYLES[row.position]}`}
                      >
                        {initials(row.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[13px] font-medium text-ink">
                          {row.name}
                        </p>
                        <p className="truncate font-mono text-[10px] uppercase tracking-wide text-ink-muted">
                          {row.sub}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {row.trend === "up" && (
                        <span className="text-[9px] text-teal">▲</span>
                      )}
                      {row.trend === "down" && (
                        <span className="text-[9px] text-ink-muted">▼</span>
                      )}
                      <span className="stat-number text-[15px]">
                        {row.stat}
                      </span>
                    </div>
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
