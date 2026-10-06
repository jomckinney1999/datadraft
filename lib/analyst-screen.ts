/**
 * Analyst Screen — the timed online assessment most data hiring funnels
 * open with: SQL under a clock, plus MC on stats, wrangling, types and
 * judgement. Same shape as CodeSignal / HackerRank / company OAs, on our
 * NFL data, with our rubric. Not any company's test.
 *
 * SQL questions come from the bank (unsolved first). MC is a dedicated
 * bank below — the stats course doesn't cover t-tests or A/B yet, and an
 * OA always does.
 */

import { QUESTIONS, type Question, type QuestionDifficulty } from "@/lib/questions";
import { needsDownload } from "@/lib/practice-schemas";

export type McSkill = "stats" | "wrangle" | "types" | "insight" | "ab";

export const MC_SKILL_LABEL: Record<McSkill, string> = {
  stats: "Statistics",
  wrangle: "Wrangling",
  types: "Types & structures",
  insight: "Insight",
  ab: "A/B & inference",
};

export type McItem = {
  id: string;
  skill: McSkill;
  prompt: string;
  choices: string[];
  answer: number;
  explain: string;
};

export type AnalystFormat = {
  id: "online" | "sprint";
  name: string;
  blurb: string;
  minutes: number;
  sqlMix: QuestionDifficulty[];
  mcCount: number;
};

export const ANALYST_FORMATS: AnalystFormat[] = [
  {
    id: "online",
    name: "Online assessment",
    blurb:
      "Seventy minutes: two SQL questions plus six MC on stats, wrangling, types and A/B. The shape most companies send before a human talks to you.",
    minutes: 70,
    sqlMix: ["easy", "medium"],
    mcCount: 6,
  },
  {
    id: "sprint",
    name: "Quick screen",
    blurb: "Thirty-five minutes: one SQL question and four MC. A lunch-break dress rehearsal of the same skills.",
    minutes: 35,
    sqlMix: ["medium"],
    mcCount: 4,
  },
];

/** Conceptual MC covering what timed data OAs actually ask. Football-flavoured, transferable. */
export const ANALYST_MC: McItem[] = [
  {
    id: "mc-mean-median",
    skill: "stats",
    prompt:
      "Week scores for a RB: 4, 6, 8, 9, 55. Product wants a 'typical week' for a projection. Which summary should you lead with, and why?",
    choices: [
      "Mean (16.4) — it uses every game",
      "Median (8) — the 55 is an outlier that pulls the mean",
      "Mode — there isn't one, so report nothing",
      "Max (55) — managers care about ceiling",
    ],
    answer: 1,
    explain:
      "A single blow-up week makes the mean look like a normal week. Median (or a trimmed mean) is the honest 'typical' when the distribution is skewed.",
  },
  {
    id: "mc-stdev",
    skill: "stats",
    prompt:
      "Two WRs average 14 PPR. A has weekly SD ≈ 3; B has weekly SD ≈ 11. Same mean. What does that tell a risk-aware manager?",
    choices: [
      "A and B are interchangeable",
      "B is more consistent week to week",
      "A is steadier; B swings more around the same average",
      "Standard deviation only matters for sample sizes over 30",
    ],
    answer: 2,
    explain: "Same centre, different spread. Higher SD means a wider range of weekly outcomes — boom/bust vs floor.",
  },
  {
    id: "mc-pvalue",
    skill: "ab",
    prompt:
      "An A/B test on a 'Start/Sit' tip changes click-through from 12.0% to 12.4% (n large). The test reports p = 0.04. What is the most careful reading?",
    choices: [
      "The change is large and definitely worth shipping",
      "There's about a 4% chance of seeing a difference this big (or bigger) if the tip did nothing — significance ≠ importance",
      "p = 0.04 means there's a 96% chance the new tip is better for every user",
      "You must reject the result because p is below 0.05",
    ],
    answer: 1,
    explain:
      "p-value is about surprise under the null, not effect size. 0.4pp may be statistically detectable and still not worth the eng cost.",
  },
  {
    id: "mc-ttest",
    skill: "ab",
    prompt: "When is a two-sample t-test a reasonable tool for comparing average fantasy points between two groups of players?",
    choices: [
      "Whenever you have two columns of numbers",
      "When comparing means of roughly continuous outcomes, with independence and not-wildly-skewed samples (or large n)",
      "Only for proportions like win rate",
      "Only when the two groups have identical sample sizes",
    ],
    answer: 1,
    explain:
      "t-tests compare means. Independence and approximate normality (or large n via CLT) matter; equal n is convenient, not required for Welch's.",
  },
  {
    id: "mc-ab-peek",
    skill: "ab",
    prompt:
      "You're halfway through a planned 14-day A/B test. Day 7 looks significant (p < 0.05). What's the sound move?",
    choices: [
      "Ship immediately — p < 0.05 means you're done",
      "Keep the pre-registered stopping rule; peeking inflates false positives",
      "Restart the test with a new seed",
      "Switch to a one-sided test to make significance easier",
    ],
    answer: 1,
    explain:
      "Optional stopping without correction raises Type I error. Finish the planned window (or use a sequential design you chose up front).",
  },
  {
    id: "mc-join-fanout",
    skill: "wrangle",
    prompt:
      "You join `week_results` (one row per player-game) to a `managers` table that has two rows for the same `player` (a mid-season trade). What happens to season totals if you SUM without fixing the grain?",
    choices: [
      "Totals shrink because of NULL matches",
      "Totals can roughly double — the join fans out rows",
      "SQLite rejects the query",
      "Nothing — SUM ignores duplicates",
    ],
    answer: 1,
    explain: "A many-to-many or accidental duplicate key multiplies rows before aggregation. Always check row counts before and after a join.",
  },
  {
    id: "mc-null-agg",
    skill: "wrangle",
    prompt: "In SQL, what's the difference between COUNT(*) and COUNT(fantasy_pts) on a table where some fantasy_pts are NULL?",
    choices: [
      "No difference — both count rows",
      "COUNT(*) counts rows; COUNT(fantasy_pts) skips NULL fantasy_pts",
      "COUNT(fantasy_pts) is always larger",
      "COUNT(*) ignores NULLs in every column",
    ],
    answer: 1,
    explain: "COUNT(*) is rows. COUNT(col) is non-NULL values of that column. AVG also ignores NULLs.",
  },
  {
    id: "mc-grain",
    skill: "wrangle",
    prompt: "Before writing any metric off an unfamiliar table, what's the first thing to establish?",
    choices: [
      "The database vendor",
      "What one row represents (the grain)",
      "Whether the table is normalised to 3NF",
      "The primary key's data type only",
    ],
    answer: 1,
    explain:
      "Grain first. 'One row per player-week' vs 'one row per player' changes every join and every total. Analyst screens punish skipping this.",
  },
  {
    id: "mc-csv-types",
    skill: "types",
    prompt:
      "A CSV column of kickoff times arrives as '9/8/2024 13:00', '2024-09-15', and blank cells. You need reliable week filters. Best first move?",
    choices: [
      "Sort alphabetically — ISO and US formats interleave fine",
      "Parse to a real date/time type, standardise timezone, and decide how blanks should behave",
      "Cast everything to integer Unix time without checking formats",
      "Drop the column — dates are never trustworthy",
    ],
    answer: 1,
    explain: "Mixed formats and blanks are classic OA traps. Parse once into a typed column, document null policy, then filter.",
  },
  {
    id: "mc-string-num",
    skill: "types",
    prompt: "Occupancy rates arrive as the strings '0.82', '82%', and 'N/A'. You need an average occupancy. What's wrong with AVG(occupancy) as-is in SQL?",
    choices: [
      "Nothing — SQL coerces percentages automatically",
      "Types are inconsistent; you must clean/cast to a numeric fraction first or the aggregate is wrong or errors",
      "AVG never works on floats",
      "You should use MODE instead",
    ],
    answer: 1,
    explain: "Wrangling before maths. Normalise to one numeric scale (0–1 or 0–100), map N/A to NULL, then average.",
  },
  {
    id: "mc-outlier",
    skill: "insight",
    prompt:
      "A delay-cost field shows one flight at 40,000 delay minutes. Everything else is under 120. For a 'typical route cost' ranking, what should you do first?",
    choices: [
      "Leave it — more data is always better",
      "Investigate: data error vs real event; then winsorise, cap, or exclude with the rule written down",
      "Delete every row above the mean",
      "Multiply all delays by 0.01",
    ],
    answer: 1,
    explain:
      "Outliers can be bugs or truth. Document the check and the rule. Blind deletion and blind keep both fail take-homes.",
  },
  {
    id: "mc-metric-pick",
    skill: "insight",
    prompt:
      "Leadership asks for the 'busiest' fantasy markets. Sessions, unique users, and dollars spent disagree on the top 5. What do you do in a take-home?",
    choices: [
      "Pick sessions — volume is always the answer",
      "Define 'busy' explicitly, show sensitivity across definitions, and recommend with that definition stated",
      "Average the three ranks and ship that",
      "Refuse to answer until product picks one metric",
    ],
    answer: 1,
    explain:
      "Business intent is choosing and defending a metric. Good submissions state the definition and show they checked alternatives.",
  },
  {
    id: "mc-left-where",
    skill: "wrangle",
    prompt: "You LEFT JOIN airports to flights, then filter with WHERE airport_size = 'large' on the airports side. What subtle bug can that introduce?",
    choices: [
      "None — WHERE and ON are identical for LEFT JOIN",
      "It can turn the LEFT JOIN into an inner join by dropping non-matches (NULL size fails the filter)",
      "It duplicates every flight row",
      "It only affects RIGHT JOIN",
    ],
    answer: 1,
    explain: "Filters on the right table belong in the ON clause (or you accept converting to inner). Classic SQL screen trap.",
  },
  {
    id: "mc-group-select",
    skill: "wrangle",
    prompt: "You GROUP BY player and also SELECT week in the same query without aggregating week. What happens in strict SQL engines?",
    choices: [
      "You get one random week per player, silently",
      "The query is invalid — week isn't grouped or aggregated",
      "SQLite always errors; Postgres never does",
      "GROUP BY ignores extra SELECT columns",
    ],
    answer: 1,
    explain: "Non-aggregated, non-grouped columns are illegal in standard SQL. SQLite is lenient; interviews often aren't.",
  },
  {
    id: "mc-sample-size",
    skill: "stats",
    prompt: "A kicker's season average is 9.2 over 3 games; a WR's is 9.1 over 16. Who are you more confident has a true mean near that number?",
    choices: [
      "The kicker — higher sample mean",
      "The WR — more observations shrink uncertainty around the mean",
      "Equal confidence — the means are almost the same",
      "Neither — averages are meaningless under n = 30",
    ],
    answer: 1,
    explain: "Sample size drives precision. Small-n averages bounce; say so when you report them.",
  },
  {
    id: "mc-duplicate-keys",
    skill: "types",
    prompt: "A 'primary key' column player_id has two rows with the same id but different teams. What's your data-management move?",
    choices: [
      "Pick the first row and move on",
      "Flag it as a DQ issue, measure how often it happens, and choose a rule (latest team, SCD, drop) before aggregating",
      "Hash the id so collisions disappear",
      "Convert player_id to float",
    ],
    answer: 1,
    explain: "Broken uniqueness is a finding. Document frequency and the resolution rule — take-homes score this under data management.",
  },
];

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type ScreenSlot =
  | { kind: "sql"; question: Question }
  | { kind: "mc"; item: McItem };

/** Build a deterministic screen: SQL first (unsolved preferred), then MC covering distinct skills. */
export function pickAnalystScreen(format: AnalystFormat, seed: string, solved: string[]): ScreenSlot[] {
  const done = new Set(solved);
  const takenSql = new Set<string>();
  const sqlSlots: ScreenSlot[] = format.sqlMix.map((difficulty, i) => {
    const pool = QUESTIONS.filter(
      (q) => q.lang === "sql" && q.difficulty === difficulty && !takenSql.has(q.id) && !needsDownload(q.tables),
    );
    const fresh = pool.filter((q) => !done.has(q.id));
    const from = fresh.length ? fresh : pool;
    const ranked = from.map((q) => ({ q, k: hash(`${seed}:sql:${i}:${q.id}`) })).sort((a, b) => a.k - b.k);
    const pick = ranked[0].q;
    takenSql.add(pick.id);
    return { kind: "sql", question: pick };
  });

  const bySkill = new Map<McSkill, McItem[]>();
  for (const item of ANALYST_MC) {
    const list = bySkill.get(item.skill) ?? [];
    list.push(item);
    bySkill.set(item.skill, list);
  }
  const skills = Array.from(bySkill.keys()).sort((a, b) => hash(`${seed}:skill:${a}`) - hash(`${seed}:skill:${b}`));
  const mcSlots: ScreenSlot[] = [];
  const used = new Set<string>();
  let skillAt = 0;
  while (mcSlots.length < format.mcCount && skillAt < skills.length * 3) {
    const skill = skills[skillAt % skills.length];
    skillAt++;
    const pool = (bySkill.get(skill) ?? []).filter((m) => !used.has(m.id));
    if (!pool.length) continue;
    const ranked = pool.map((m) => ({ m, k: hash(`${seed}:mc:${mcSlots.length}:${m.id}`) })).sort((a, b) => a.k - b.k);
    used.add(ranked[0].m.id);
    mcSlots.push({ kind: "mc", item: ranked[0].m });
  }

  return [...sqlSlots, ...mcSlots];
}

export type AnalystSqlAnswer = {
  kind: "sql";
  id: string;
  attempts: number;
  solvedAt: number | null;
  lastSql: string;
  pick: number | null;
};

export type AnalystMcAnswer = {
  kind: "mc";
  id: string;
  attempts: number;
  solvedAt: number | null;
  lastSql: string;
  pick: number | null;
};

export type AnalystAnswer = AnalystSqlAnswer | AnalystMcAnswer;

export type AnalystVerdict = { band: "strong" | "pass" | "not-yet"; label: string; detail: string };

export function analystVerdict(answers: AnalystAnswer[]): AnalystVerdict {
  const solved = answers.filter((a) => a.solvedAt !== null).length;
  const n = answers.length;
  const sql = answers.filter((a) => a.kind === "sql");
  const sqlSolved = sql.filter((a) => a.solvedAt !== null).length;
  if (solved === n && sqlSolved === sql.length) {
    return {
      band: "strong",
      label: "Strong pass",
      detail: "SQL and the MC both cleared. On a real OA, this is the packet that gets a human interview.",
    };
  }
  if (solved >= Math.ceil((n * 2) / 3) && sqlSolved >= Math.ceil(sql.length / 2)) {
    return {
      band: "pass",
      label: "Pass",
      detail: "Enough right, including real SQL. Review the misses — OAs are often all-or-nothing on the SQL half.",
    };
  }
  return {
    band: "not-yet",
    label: "Not yet",
    detail: "Not enough under the clock. Drill the MC skills you missed, then another screen with fresh SQL.",
  };
}

export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
