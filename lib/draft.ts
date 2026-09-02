// The SQLSports Draft: the course-selection ceremony.
//
// This board is DERIVED from lib/courses.ts rather than hand-written. It used
// to be its own hard-coded list, which drifted the moment the /learn catalog
// shipped its full catalog — a learner who picked Statistics from the catalog was
// then marched to a draft board offering one option called "Rookie Season"
// with a SQL scouting report. Deriving it means the board and the catalog can
// never disagree again.
//
// A drafted track id is stored in progress, so ids here are course ids from
// lib/courses.ts and must stay stable.

import { COURSES, type Course } from "./courses";

export type Track = {
  id: string;
  name: string;
  classOf: string;
  status: "live" | "declaring";
  scoutingReport: string;
  skills: string[];
};

/** Scouting-report voice for the draft board, per course. */
const SCOUTING: Record<string, string> = {
  "sql-fundamentals":
    "The consensus #1 overall. Every analyst job posting asks for it — SELECT through JOINs and window functions, every query run against a real database.",
  "sql-advanced":
    "Second-round riser. CTEs, views, triggers, indexing — the difference between writing a query and building something a team can run.",
  python:
    "Blue-chip prospect with the highest ceiling. Runs live in your browser — variables to DataFrames without installing anything.",
  stats:
    "The film-study pick. Won't light up a stat sheet, but it's why anyone believes the numbers you put in front of them.",
  git: "Undervalued by every draft board. Teams expect it on day one and almost nobody teaches it.",
  r: "Specialist with a real role. A huge share of public sports analytics is published in R — reading it is an edge.",
  excel: "Still the most-used tool in the building. Unglamorous, unavoidable, on more postings than anything else here.",
  tableau:
    "The presentation weapon. Builds the dashboard a stakeholder can run without you in the room.",
  powerbi:
    "The enterprise starter. Data modelling and real DAX, which is what most big organisations actually run.",
  ai: "Rookie with the loudest hype. Taught here as a tool with known failure modes, not a magic box.",
};

const SKILLS: Record<string, string[]> = {
  "sql-fundamentals": ["SELECT", "JOIN", "GROUP BY", "Windows"],
  "sql-advanced": ["CTEs", "Views", "Triggers", "Indexes"],
  python: ["pandas", "Loops", "Cleaning"],
  stats: ["Sample size", "Significance", "Regression"],
  git: ["commit", "branch", "pull request"],
  r: ["dplyr", "ggplot2", "Pipes"],
  excel: ["Lookups", "PivotTables", "Formulas"],
  tableau: ["LODs", "Dashboards", "Table calcs"],
  powerbi: ["DAX", "Modelling", "Power Query"],
  ai: ["Prompting", "Evals", "RAG"],
};

function toTrack(c: Course): Track {
  const live = c.status === "live";
  return {
    id: c.id,
    name: c.title,
    classOf: live ? "Available now" : "Declaring next season",
    status: live ? "live" : "declaring",
    scoutingReport: SCOUTING[c.id] ?? c.blurb,
    skills: SKILLS[c.id] ?? [],
  };
}

/** Draftable courses first, so the board opens on what a learner can pick. */
export const TRACKS: Track[] = [
  ...COURSES.filter((c) => c.status === "live").map(toTrack),
  ...COURSES.filter((c) => c.status !== "live").map(toTrack),
];

export function getTrack(id: string | null | undefined): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

/**
 * Old track ids from before the board was derived from the catalog. Anyone who
 * drafted then still has one of these in localStorage, so map it forward
 * rather than showing them a broken pick.
 */
const LEGACY: Record<string, string> = {
  "rookie-season": "sql-fundamentals",
  "contender-season": "sql-fundamentals",
  "analytics-combine": "sql-fundamentals",
  "dynasty-mode": "ai",
  // "sql" briefly split into three tiers, then collapsed back to two — carry
  // both the original id and the short-lived middle tier to the entry point
  // rather than showing a broken pick. (A learner who drafted the old
  // "sql-advanced" — JOINs/windows, since repurposed to mean CTEs/views/
  // triggers — still resolves fine here, just now points at a "building"
  // card instead of their in-progress content. Not fixed up: this predates
  // any real users, per the empty progress tables in Supabase.)
  sql: "sql-fundamentals",
  "sql-intermediate": "sql-fundamentals",
};

export function normalizeTrackId(id: string | null | undefined): string | null {
  if (!id) return null;
  if (TRACKS.some((t) => t.id === id)) return id;
  return LEGACY[id] ?? null;
}
