import { NextResponse } from "next/server";
import { fetchSeasonStats } from "@/lib/data/nflverse";
import { createAdminClient } from "@/lib/supabase/admin";

// Scheduled ETL job (docs/LAUNCH-PLAN.md Phase 3): pulls the latest season's
// weekly stats from nflverse and upserts into nfl_player_stats. Triggered by
// Vercel Cron on a schedule (see vercel.json) — Vercel Cron always sends a
// GET request and automatically attaches `Authorization: Bearer
// $CRON_SECRET` as long as a project env var named exactly CRON_SECRET is
// set, which is what the check below relies on.
//
// Manual/backfill usage (e.g. from curl or Postman):
//   GET /api/cron/ingest-stats?season=2024
//   Header: Authorization: Bearer <CRON_SECRET>

async function runIngestion(season: number) {
  const stats = await fetchSeasonStats(season);

  if (stats.length === 0) {
    return { season, rowsIngested: 0, note: "No rows returned" };
  }

  const supabase = createAdminClient();

  const rows = stats.map((s) => ({
    player_id: s.playerId,
    player_name: s.playerDisplayName,
    position: s.position,
    team: s.team,
    season: s.season,
    week: s.week,
    opponent_team: s.opponentTeam,
    completions: s.completions,
    attempts: s.attempts,
    passing_yards: s.passingYards,
    passing_tds: s.passingTds,
    interceptions: s.interceptions,
    carries: s.carries,
    rushing_yards: s.rushingYards,
    rushing_tds: s.rushingTds,
    receptions: s.receptions,
    targets: s.targets,
    receiving_yards: s.receivingYards,
    receiving_tds: s.receivingTds,
    fantasy_points: s.fantasyPoints,
    fantasy_points_ppr: s.fantasyPointsPpr,
    updated_at: new Date().toISOString(),
  }));

  // Batch upserts — Supabase/Postgrest has a payload size limit, so chunk
  // rather than sending several thousand rows in one request.
  const chunkSize = 500;
  let ingested = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("nfl_player_stats")
      .upsert(chunk, { onConflict: "player_id,season,week" });

    if (error) {
      throw new Error(`${error.message} (ingested ${ingested} rows before failure)`);
    }
    ingested += chunk.length;
  }

  return { season, rowsIngested: ingested };
}

async function handle(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const season = Number(searchParams.get("season")) || new Date().getFullYear();

  try {
    const result = await runIngestion(season);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export const GET = handle;
export const POST = handle;

// Cron jobs can run long on a cold cache — allow up to 60s (Vercel Hobby
// plan max for cron-triggered functions).
export const maxDuration = 60;
