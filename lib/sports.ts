/**
 * The sport a learner picks as their lens.
 *
 * The skills taught (SQL, Python, R, Git, stats) are identical across all
 * three — only the dataset changes. See docs/PLAN.md.
 *
 * Availability is tracked honestly: football has a real dataset today
 * (`public/field-data.json`, built by scripts/build-field-dataset.mjs), the
 * other two do not. Don't flip a sport to "live" until there's an actual
 * pipeline behind it — the site labels these states to visitors.
 */

export type SportId = "football" | "basketball" | "baseball";

export type Sport = {
  id: SportId;
  name: string;
  league: string;
  icon: string;
  status: "live" | "building";
  tagline: string;
  /** Shown on the picker so a non-fan can tell what they'd actually be querying. */
  dataBlurb: string;
};

export const SPORTS: Sport[] = [
  {
    id: "football",
    name: "Football",
    league: "NFL",
    icon: "🏈",
    status: "live",
    tagline: "Weekly box scores, matchups, and fantasy rosters.",
    dataBlurb: "Real 2025 nflverse data, already live in the Practice Field.",
  },
  {
    id: "basketball",
    name: "Basketball",
    league: "NBA",
    icon: "🏀",
    status: "building",
    tagline: "Per-possession data, shot charts, pace-adjusted ratings.",
    dataBlurb: "Curriculum being ported — not queryable yet.",
  },
  {
    id: "baseball",
    name: "Baseball",
    league: "MLB",
    icon: "⚾",
    status: "building",
    tagline: "The deepest stats history in sports — a sabermetrics playground.",
    dataBlurb: "Curriculum being ported — not queryable yet.",
  },
];

export function sportById(id: SportId): Sport {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[0];
}
