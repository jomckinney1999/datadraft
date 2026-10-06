/**
 * The league tables' columns, without their rows. The lesson schema panel and
 * the question bank show this on pages that never load the dataset, and
 * importing it from lib/fantasy-data.ts put ~140 KB of rows in their
 * JavaScript (2026-10-06). lib/fantasy-data.ts re-exports it.
 */

export const SCHEMA: { table: string; columns: string[] }[] = [
  {
    table: "week_results",
    columns: ["player", "team", "position", "season", "week", "fantasy_pts"],
  },
  {
    table: "games",
    columns: [
      "game_id",
      "season",
      "week",
      "gameday",
      "weekday",
      "home_team",
      "away_team",
      "home_score",
      "away_score",
      "roof",
      "surface",
      "temp",
    ],
  },
  { table: "rosters", columns: ["team_name", "player"] },
  {
    table: "waiver_wire",
    columns: ["player", "team", "position", "pct_rostered", "trend"],
  },
];
