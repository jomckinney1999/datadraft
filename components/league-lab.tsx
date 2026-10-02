"use client";

/**
 * "Run it on your league" — the League Scorecard project, in the browser.
 *
 * Type a Sleeper username (or drop in the ESPN/Yahoo CSV), pick a league, and
 * the same three tables the Colab notebook builds load into sql.js in this
 * tab. Five ready-made queries answer the arguments every league has — who's
 * actually good, whose schedule was brutal, who left points on the bench —
 * and every result has Chart it, so the answer goes to the group chat as a
 * picture with the site's name on it. That group chat is the point: ten or
 * twelve people who all play fantasy, looking at a chart of their own league.
 *
 * Privacy, said on the panel too: the league comes straight from Sleeper into
 * this tab. Nothing is sent to DataDraft and nothing is stored, apart from
 * the username in this browser so it's filled in next time.
 */

import { useEffect, useRef, useState } from "react";
import type { Database, QueryExecResult } from "sql.js";
import CodeEditor from "@/components/code-editor";
import ChartIt from "@/components/chart-it";
import { SLEEPER_CREDIT, type ChartSpec } from "@/lib/chart";
import type { SleeperLeague } from "@/lib/data/sleeper";
import {
  findLeagues,
  leagueSeedSql,
  loadSleeperLeague,
  parseLeagueCsv,
  type LeagueData,
} from "@/lib/league-load";
import { SITE_URL } from "@/lib/site";

const USER_KEY = "sqlsports.league.sleeper";
// Every season Sleeper has run (it launched in 2017), newest first. Before
// September the newest season with any games in it is last year's.
const NOW = new Date();
const LATEST = NOW.getFullYear() - (NOW.getMonth() < 8 ? 1 : 0);
const SEASONS = Array.from({ length: LATEST - 2016 }, (_, i) => String(LATEST - i));

type Preset = {
  id: string;
  label: string;
  sql: string;
  needsStarters?: boolean;
  chart: (d: LeagueData) => Partial<ChartSpec>;
};

const span = (d: LeagueData) =>
  d.weeks.length ? `weeks ${d.weeks[0]}–${d.weeks[d.weeks.length - 1]}` : "";
const when = (d: LeagueData) => (d.source === "csv" ? span(d) : `${span(d)}, ${d.season}`);

const PRESETS: Preset[] = [
  {
    id: "luck",
    label: "Who's actually good?",
    sql: `-- All-play: your record if you'd played every team, every week.
-- Above the line and to the left? You've been lucky.
WITH pairwise AS (
  SELECT a.manager, a.week,
         CASE WHEN a.points_for > b.points_for THEN 1.0 ELSE 0.0 END AS beat
  FROM weekly_scores a
  JOIN weekly_scores b
    ON a.week = b.week AND a.roster_id != b.roster_id
),
actual AS (
  SELECT manager, AVG(win) AS win_pct
  FROM weekly_scores
  WHERE win IS NOT NULL
  GROUP BY manager
)
SELECT p.manager,
       ROUND(AVG(p.beat) * 100, 1) AS all_play_win_pct,
       ROUND(MAX(a.win_pct) * 100, 1) AS actual_win_pct
FROM pairwise p
JOIN actual a ON a.manager = p.manager
GROUP BY p.manager
ORDER BY all_play_win_pct DESC;`,
    chart: (d) => ({
      kind: "scatter",
      x: 1,
      y: 2,
      label: 0,
      quadrants: ["Lucky", "Legit", "Bad", "Unlucky"],
      title: `Who's actually good in ${d.name}?`,
      subtitle: `All-play win % vs. real win % · ${when(d)}`,
    }),
  },
  {
    id: "schedule",
    label: "Whose schedule was brutal?",
    sql: `-- Points scored vs. points scored against you.
SELECT manager,
       ROUND(SUM(points_for), 1) AS points_for,
       ROUND(SUM(points_against), 1) AS points_against
FROM weekly_scores
GROUP BY manager
ORDER BY points_for DESC;`,
    chart: (d) => ({
      kind: "scatter",
      x: 1,
      y: 2,
      label: 0,
      quadrants: ["Bad + tough draw", "Good + tough draw", "Bad + easy draw", "Good + easy draw"],
      title: `${d.name}: points for vs. points against`,
      subtitle: `Who scored, and who got scored on · ${when(d)}`,
    }),
  },
  {
    id: "points",
    label: "Most points",
    sql: `SELECT manager, ROUND(SUM(points_for), 1) AS points_for
FROM weekly_scores
GROUP BY manager
ORDER BY points_for DESC;`,
    chart: (d) => ({
      kind: "bar",
      x: 1,
      y: 1,
      label: 0,
      title: `${d.name}: total points`,
      subtitle: when(d),
    }),
  },
  {
    id: "bench",
    label: "Points left on the bench",
    needsStarters: true,
    sql: `SELECT manager, ROUND(SUM(bench_left), 1) AS points_left_on_bench
FROM starter_points
GROUP BY manager
ORDER BY points_left_on_bench DESC;`,
    chart: (d) => ({
      kind: "bar",
      x: 1,
      y: 1,
      label: 0,
      title: `${d.name}: points left on the bench`,
      subtitle: `Who needed a better lineup · ${when(d)}`,
    }),
  },
  {
    id: "race",
    label: "The points race",
    sql: `-- A running total per manager: the season as a race.
-- SUM(...) OVER (...) is a window function — it adds up as it goes.
SELECT week, manager,
       ROUND(SUM(points_for) OVER (PARTITION BY manager ORDER BY week), 1) AS total_points
FROM weekly_scores
ORDER BY week, manager;`,
    chart: (d) => ({
      kind: "line",
      x: 0,
      y: 2,
      label: 1,
      title: `${d.name}: the points race`,
      subtitle: `Running total of points scored · ${when(d)}`,
    }),
  },
];

const BOX = "surface rounded-2xl border border-panel-border bg-panel p-5";
const FIELD =
  "rounded-lg border border-panel-border bg-night/60 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-gold/60";

export default function LeagueLab() {
  const dbRef = useRef<Database | null>(null);
  const [username, setUsername] = useState("");
  const [season, setSeason] = useState(SEASONS[0]);
  const [leagues, setLeagues] = useState<SleeperLeague[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LeagueData | null>(null);
  const [sql, setSql] = useState(PRESETS[0].sql);
  const [active, setActive] = useState<Preset | null>(PRESETS[0]);
  const [result, setResult] = useState<QueryExecResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) setUsername(saved);
    } catch {
      // Storage refused; the field is just empty.
    }
    return () => dbRef.current?.close();
  }, []);

  async function find() {
    setError(null);
    setLeagues(null);
    setBusy("Finding your leagues…");
    try {
      const found = await findLeagues(username, season);
      setLeagues(found);
      try {
        localStorage.setItem(USER_KEY, username.trim());
      } catch {
        // fine
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function mount(d: LeagueData) {
    const SQL = await import("sql.js").then((m) => m.default({ locateFile: () => "/sql-wasm.wasm" }));
    dbRef.current?.close();
    const db = new SQL.Database();
    db.run(leagueSeedSql(d));
    dbRef.current = db;
    setData(d);
    run(PRESETS[0].sql, PRESETS[0]);
  }

  async function pick(league: SleeperLeague) {
    setError(null);
    setBusy(`Loading «${league.name}» from Sleeper…`);
    try {
      await mount(await loadSleeperLeague(league.league_id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function upload(file: File) {
    setError(null);
    setBusy("Reading your CSV…");
    try {
      const name = file.name.replace(/\.csv$/i, "").replace(/[_-]+/g, " ").trim() || "My league";
      await mount(parseLeagueCsv(await file.text(), name));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  function run(query: string, preset: Preset | null) {
    const db = dbRef.current;
    if (!db) return;
    setRunError(null);
    setActive(preset);
    try {
      const res = db.exec(query);
      setResult(res[res.length - 1] ?? { columns: [], values: [] });
    } catch (e) {
      setResult(null);
      setRunError(e instanceof Error ? e.message : String(e));
    }
  }

  function applyPreset(p: Preset) {
    setSql(p.sql);
    run(p.sql, p);
  }

  // A preset's chart settings only hold while its query is the one that ran.
  const chartPreset = data && active && sql === active.sql ? active.chart(data) : undefined;

  return (
    <section id="your-league" className="mt-8 scroll-mt-20">
      <p className="label-broadcast text-gold">no colab needed</p>
      <h2 className="mt-1 font-display text-xl font-bold text-ink">Run it on your league, right here</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Load your league into this tab, run the scorecard queries, and press{" "}
        <strong className="text-gold">Chart it</strong> to drop the answer in your league&apos;s group chat. The notebook
        is still the thing you keep — this is the fastest way to see your own league in SQL.
      </p>

      {!data && (
        <div className={`${BOX} mt-4`}>
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-[12rem] flex-1">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                Sleeper username
              </span>
              <input
                className={`${FIELD} w-full`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && find()}
                placeholder="the name in your Sleeper profile"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label>
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-muted">Season</span>
              <select className={FIELD} value={season} onChange={(e) => setSeason(e.target.value)}>
                {SEASONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={find} disabled={!!busy} className="press btn-gold disabled:opacity-50">
              Find my leagues
            </button>
          </div>

          {leagues && (
            <div className="mt-4 flex flex-wrap gap-2">
              {leagues.map((l) => (
                <button
                  key={l.league_id}
                  type="button"
                  disabled={!!busy}
                  onClick={() => pick(l)}
                  className="lift rounded-xl border border-panel-border bg-night/50 px-4 py-2.5 text-left transition-colors hover:border-gold/60 disabled:opacity-50"
                >
                  <span className="block font-display text-sm font-bold text-ink">{l.name}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                    {l.total_rosters} teams · {l.season}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-panel-border pt-3 text-xs text-ink-muted">
            On ESPN or Yahoo?{" "}
            <label className="cursor-pointer font-semibold text-gold hover:underline">
              Load a CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              />
            </label>{" "}
            with columns <code className="font-mono text-ink-soft">manager, week, points_for, points_against, win</code>{" "}
            — one row per manager per week.
          </div>
          {busy && <p className="mt-3 font-mono text-[11px] text-ink-soft">{busy}</p>}
          {error && <p className="mt-3 font-mono text-[11px] text-gold">{error}</p>}
          <p className="mt-3 font-mono text-[10px] text-ink-muted">
            Your league goes straight from Sleeper into this tab. Nothing is sent to DataDraft or saved.
          </p>
        </div>
      )}

      {data && (
        <div className={`${BOX} mt-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="status-chip">{data.name}</span>
              <span className="status-chip">{data.managers.length} managers</span>
              <span className="status-chip">{when(data)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setData(null);
                setResult(null);
                setLeagues(null);
              }}
              className="font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink"
            >
              Load another league
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {PRESETS.filter((p) => !p.needsStarters || data.starters.length).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  active?.id === p.id && sql === p.sql
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-panel-border text-ink-soft hover:border-gold/50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border border-panel-border">
            <CodeEditor value={sql} onChange={setSql} lang="sql" rows={8} ariaLabel="SQL on your league" />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] text-ink-muted">
              Tables: <span className="text-ink-soft">managers</span> ·{" "}
              <span className="text-ink-soft">weekly_scores</span>
              {data.starters.length > 0 && (
                <>
                  {" "}
                  · <span className="text-ink-soft">starter_points</span>
                </>
              )}{" "}
              — the same ones the notebook builds.
            </p>
            <div className="flex items-center gap-2">
              {result && (
                <ChartIt
                  grid={result}
                  title={`${data.name}`}
                  subtitle={when(data)}
                  credit={data.source === "csv" ? "Data: my league" : SLEEPER_CREDIT}
                  shareUrl={`${SITE_URL}/projects/my-league-scorecard`}
                  shareText="Ran my fantasy league through SQL."
                  preset={chartPreset}
                />
              )}
              <button type="button" onClick={() => run(sql, active && sql === active.sql ? active : null)} className="press btn-turf">
                Run
              </button>
            </div>
          </div>

          {runError && <p className="mt-3 font-mono text-[12px] text-gold">⚠ {runError}</p>}
          {result && result.columns.length > 0 && (
            <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-panel-border">
              <table className="w-full text-left font-mono text-[12px]">
                <thead className="sticky top-0 bg-panel">
                  <tr className="border-b border-panel-border text-ink-muted">
                    {result.columns.map((c) => (
                      <th key={c} className="whitespace-nowrap px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.values.slice(0, 200).map((row, i) => (
                    <tr key={i} className="border-b border-panel-border/50 text-ink">
                      {row.map((cell, j) => (
                        <td key={j} className={`whitespace-nowrap px-3 py-1.5 ${typeof cell === "number" ? "tabular-nums" : ""}`}>
                          {cell === null ? <span className="text-ink-muted">NULL</span> : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
