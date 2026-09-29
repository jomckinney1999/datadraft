/**
 * Where the numbers come from, and what a learner is allowed to believe.
 *
 * This is the single source of truth for attribution. Every surface that
 * shows data — the lesson player's schema panel, the sandbox, the Practice
 * Field, /data — reads its citation from here so they cannot drift apart or
 * quietly overstate what is real.
 *
 * The distinction below is deliberate and load-bearing. The stat lines are
 * real and checkable. The fantasy league wrapped around them is invented,
 * because a league's rosters and waiver wire are properties of one private
 * league, not facts about the NFL. Presenting invented numbers as real would
 * be the same mistake the old synthetic dataset made.
 */

export type DataSource = {
  id: string;
  name: string;
  url: string;
  licence: string;
  licenceUrl: string;
  /** What this source actually provides, in plain language. */
  provides: string;
  /** Direct free download of the upstream data. */
  downloadUrl: string;
};

export const NFLVERSE: DataSource = {
  id: "nflverse",
  name: "nflverse-data",
  url: "https://github.com/nflverse/nflverse-data",
  licence: "CC BY 4.0",
  licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
  provides:
    "Weekly NFL player statistics, including computed standard and PPR fantasy points, updated through each season.",
  downloadUrl:
    "https://github.com/nflverse/nflverse-data/releases/tag/stats_player",
};

export const SOURCES: DataSource[] = [NFLVERSE];

/** Seasons covered by the lesson database. Keep in sync with the builder. */
export const LESSON_SEASONS = [2022, 2023, 2024] as const;

/**
 * Per-table honesty labels. `real` tables are checkable against the source;
 * `league` tables are the invented fantasy layer.
 */
export type TableProvenance = {
  table: string;
  kind: "real" | "league";
  note: string;
};

export const PROVENANCE: TableProvenance[] = [
  {
    table: "week_results",
    kind: "real",
    note: "Real PPR fantasy points, one row per player per game actually played, 2022–2024 regular seasons, from nflverse-data.",
  },
  {
    table: "games",
    kind: "real",
    note: "Real NFL schedule for the same seasons — one row per completed regular-season game, with the date, the teams, the final score and the conditions. From nflverse-data.",
  },
  {
    table: "rosters",
    kind: "league",
    note: "An example fantasy league over real players. Who owns whom is invented — that is a property of one private league, not of the NFL.",
  },
  {
    table: "waiver_wire",
    kind: "league",
    note: "Example free-agent pool for the same invented league. Roster percentages are illustrative.",
  },
];

/** One-line credit for compact UI (schema panels, footers). */
export const SHORT_CREDIT =
  "Real NFL stats from nflverse-data (CC BY 4.0)";

/** Static copies of exactly what is seeded, for learners to download. */
export const DOWNLOADS = [
  {
    file: "/data/week_results.csv",
    label: "week_results.csv",
    note: "Every row in the lessons' week_results table.",
  },
  {
    file: "/data/season_totals.csv",
    label: "season_totals.csv",
    note: "Season totals per player — the Excel workbook is built from these.",
  },
];
