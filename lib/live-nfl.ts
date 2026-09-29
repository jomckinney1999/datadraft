/**
 * Live NFL data, straight from nflverse. Server-side only — it is imported by
 * a server component and parses megabytes of CSV, which must never reach a
 * browser.
 *
 * Everything else in the product runs on a pinned dataset, deliberately:
 * docs/DATA-PIPELINE.md's first rule is that lesson tables never auto-refresh,
 * because a silent swap breaks answer keys and lesson prose (it has, once).
 * This module is the other side of that rule — the parts of the site that
 * *should* be live: what happened in the league this week.
 *
 * Fetched on the server and never shipped to the browser as raw CSV; the page
 * renders a small summary. Caching is done by the page's `revalidate` rather
 * than Next's data cache, because games.csv is over the 2MB per-entry cache
 * limit and would silently refetch on every request.
 *
 * Betting columns are never read. games.csv ships moneylines, spreads and
 * totals; this product doesn't touch them (docs/PLAN.md, no gambling content).
 *
 * Source: nflverse-data, CC BY 4.0 — attribution is required wherever this is
 * shown (lib/data-source.ts holds the credit string).
 */

import { parse } from "csv-parse/sync";

const SCHEDULES =
  "https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv";
const WEEKLY = (season: number) =>
  `https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_${season}.csv`;

export type LiveGame = {
  id: string;
  week: number;
  day: string;
  kickoff: string;
  away: string;
  awayScore: number | null;
  home: string;
  homeScore: number | null;
  final: boolean;
  roof: string;
  temp: number | null;
};

export type LivePerformer = {
  player: string;
  team: string;
  position: string;
  opponent: string;
  points: number;
  line: string;
};

export type LiveWeek = {
  season: number;
  week: number;
  games: LiveGame[];
  performers: LivePerformer[];
  fetchedAt: string;
};

async function getCsv(url: string): Promise<Record<string, string>[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`nflverse ${res.status} for ${url}`);
  return parse(await res.text(), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];
}

const num = (v: string | undefined): number | null => {
  if (v === undefined || v === "" || v === "NA") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** A one-line stat line, so a score means something without clicking through. */
function statLine(r: Record<string, string>): string {
  const bits: string[] = [];
  const py = num(r.passing_yards);
  const pt = num(r.passing_tds);
  const ry = num(r.rushing_yards);
  const rt = num(r.rushing_tds);
  const rec = num(r.receptions);
  const recy = num(r.receiving_yards);
  const rect = num(r.receiving_tds);
  if (py) bits.push(`${py} pass yds${pt ? `, ${pt} TD` : ""}`);
  if (ry) bits.push(`${ry} rush yds${rt ? `, ${rt} TD` : ""}`);
  if (rec) bits.push(`${rec} rec, ${recy ?? 0} yds${rect ? `, ${rect} TD` : ""}`);
  return bits.join(" · ") || "—";
}

/**
 * The most recent week with completed games, and what happened in it.
 * Returns null on any failure — this is a nice-to-have panel and must never
 * take a page down with it.
 */
export async function getLiveWeek(): Promise<LiveWeek | null> {
  try {
    const schedule = await getCsv(SCHEDULES);
    const season = Math.max(...schedule.map((g) => Number(g.season) || 0));
    const thisSeason = schedule.filter(
      (g) => Number(g.season) === season && g.game_type === "REG",
    );
    const done = thisSeason.filter((g) => (g.result ?? "").trim() !== "");
    if (done.length === 0) return null;
    const week = Math.max(...done.map((g) => Number(g.week) || 0));

    const games: LiveGame[] = thisSeason
      .filter((g) => Number(g.week) === week)
      .map((g) => ({
        id: g.game_id,
        week,
        day: g.weekday ?? "",
        kickoff: g.gametime ?? "",
        away: g.away_team,
        awayScore: num(g.away_score),
        home: g.home_team,
        homeScore: num(g.home_score),
        final: (g.result ?? "").trim() !== "",
        roof: g.roof ?? "",
        temp: num(g.temp),
      }))
      .sort((a, b) => Number(b.final) - Number(a.final));

    const weekly = await getCsv(WEEKLY(season));
    const performers: LivePerformer[] = weekly
      .filter(
        (r) =>
          Number(r.week) === week &&
          (r.season_type ?? "REG") === "REG" &&
          num(r.fantasy_points_ppr) !== null,
      )
      .map((r) => ({
        player: r.player_display_name || r.player_name || "",
        team: r.team || "",
        position: r.position || "",
        opponent: r.opponent_team || "",
        points: num(r.fantasy_points_ppr) ?? 0,
        line: statLine(r),
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    return {
      season,
      week,
      games,
      performers,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
