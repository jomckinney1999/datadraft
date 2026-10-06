/**
 * Where the numbers come from, and what a learner is allowed to believe.
 *
 * This is the single source of truth for attribution. Every surface that
 * shows data — the lesson player's schema panel, the sandbox, the Practice
 * Field, /data — reads its citation from here so they cannot drift apart or
 * quietly overstate what is real.
 *
 * The distinction below is deliberate and load-bearing. The stat lines and
 * the waiver wire are real and checkable. The rosters are a draft run on real
 * ADP: the order players went in is real, but the five managers are ours,
 * because a real league's rosters belong to that league. The league used to
 * be invented outright; presenting invented numbers as real would be the
 * same mistake the old synthetic dataset made, so every label here says
 * exactly how much of a table is real.
 */

// From the small facts file, not lesson-data.generated.ts: this module gives
// the credit line to pages all over the site, and importing the dataset here
// put ~140 KB of rows in every one of them (2026-10-06).
import { LATEST, LEAGUE_META, SEASONS_ON_FILE } from "@/lib/lesson-facts.generated";

export type DataSource = {
  id: string;
  name: string;
  url: string;
  licence: string;
  licenceUrl: string;
  /** What this source actually provides, in plain language. */
  provides: string;
  /** Where to get the upstream data yourself. */
  downloadUrl: string;
  downloadLabel: string;
  /** One line on how to treat the source. */
  creditNote: string;
};

export const NFLVERSE: DataSource = {
  id: "nflverse",
  name: "nflverse-data",
  url: "https://github.com/nflverse/nflverse-data",
  licence: "CC BY 4.0",
  licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
  provides:
    "Weekly NFL player statistics, including computed standard and PPR fantasy points, and the full schedule with final scores. Updated through each season.",
  downloadUrl:
    "https://github.com/nflverse/nflverse-data/releases/tag/stats_player",
  downloadLabel: "Download the full dataset, free →",
  creditNote:
    "nflverse is maintained by volunteers. If you use it in your own work, credit them — that is the whole of the licence.",
};

export const SLEEPER: DataSource = {
  id: "sleeper",
  name: "Sleeper",
  url: "https://sleeper.com",
  licence: "Public API",
  licenceUrl: "https://docs.sleeper.com",
  provides:
    "Fantasy platform data: average draft position from real Sleeper drafts, and the share of Sleeper leagues rostering each player, week by week.",
  downloadUrl: "https://docs.sleeper.com",
  downloadLabel: "Read the API docs →",
  creditNote:
    "Sleeper's API is free, read-only and needs no key, which is why the league comes from Sleeper rather than ESPN or Yahoo.",
};

export const SOURCES: DataSource[] = [NFLVERSE, SLEEPER];

/** Seasons covered by the lesson database, straight from the builder. */
export const LESSON_SEASONS: readonly number[] = SEASONS_ON_FILE;

/** How far the newest season goes, and the league's season and wire week. */
export { LATEST, LEAGUE_META };

const FIRST = SEASONS_ON_FILE[0];

/** "2022 through week 3 of 2026" — the span in words, for prose. */
export const SEASON_SPAN = `${FIRST} through week ${LATEST.week} of ${LATEST.season}`;

/**
 * Per-table honesty labels. `real` tables are checkable against the source.
 * `drafted` is built from real data by a stated rule: the rosters.
 */
export type TableProvenance = {
  table: string;
  /** `invented`: the practice schemas in lib/practice-datasets.ts, made up and labelled so. */
  kind: "real" | "drafted" | "invented";
  /** The chip text: a word or two. */
  label: string;
  note: string;
};

export const PROVENANCE: TableProvenance[] = [
  {
    table: "week_results",
    kind: "real",
    label: "real",
    note: `Real PPR fantasy points, one row per player per game actually played, regular seasons from ${SEASON_SPAN}. From nflverse-data.`,
  },
  {
    table: "games",
    kind: "real",
    label: "real",
    note: "Real NFL schedule for the same seasons — one row per completed regular-season game, with the date, the teams, the final score and the conditions. From nflverse-data.",
  },
  {
    table: "rosters",
    kind: "drafted",
    label: "real ADP",
    note: `A ${LEAGUE_META.teams}-team, ${LEAGUE_META.rounds}-round snake draft of the twenty lesson players, each pick the best real Sleeper ${LEAGUE_META.season} PPR ADP left on the board. The draft order is real; the five managers and their team names are ours, because a real league's rosters belong to that league.`,
  },
  {
    table: "waiver_wire",
    kind: "real",
    label: "real",
    note: `Sleeper's real waiver wire going into week ${LEAGUE_META.wireWeek} of ${LEAGUE_META.season}: players under 50% rostered whose rostered share moved most. pct_rostered is the share of Sleeper leagues rostering him that week; trend is how many points it moved since the week before.`,
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
    file: "/data/games.csv",
    label: "games.csv",
    note: "Every completed regular-season game in the same seasons.",
  },
  {
    file: "/data/season_totals.csv",
    label: "season_totals.csv",
    note: "Season totals per player — the Excel workbook is built from these.",
  },
  {
    file: "/data/rosters.csv",
    label: "rosters.csv",
    note: "The league's draft, with each pick's round, overall number and real Sleeper ADP.",
  },
  {
    file: "/data/waiver_wire.csv",
    label: "waiver_wire.csv",
    note: "Sleeper's real waiver wire, exactly as the lessons load it.",
  },
];
