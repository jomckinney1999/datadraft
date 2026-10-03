/**
 * Data Challenge — take-home prep in the shape top companies use after a
 * screen: messy data, joins, a business recommendation, documented DQ, and
 * a "what next" — judged on builder mindset, data management, and business
 * intent. Original football brief. Not any employer's confidential packet.
 */

export type ChallengeTask = {
  id: string;
  title: string;
  prompt: string;
  /** Graded SQL — omit for write-up / checklist tasks. */
  expected?: string;
  orderMatters?: boolean;
  hint: string;
  explain: string;
  kind: "sql" | "write" | "dq";
};

export type ChallengeTable = { table: string; columns: string[] };

/**
 * Gridiron Desk wants to pick five metro markets for a paid "Market Pulse"
 * report. Upfront build cost per market is fixed; punctual delivery of the
 * weekly drop is the brand. Same skill stack as bank/fintech take-homes,
 * football product instead of airlines.
 */
export const DATA_CHALLENGE = {
  id: "market-pulse",
  title: "Market Pulse — five markets to launch",
  org: "Gridiron Desk",
  blurb:
    "A take-home shaped like the ones after a phone screen: clean messy data, join it, recommend five markets, show your math, and say what you'd track next.",
  role: "You are a data analyst on Gridiron Desk. Product wants to launch paid weekly Market Pulse reports in five U.S. metros. Each market needs a dedicated pipeline; upfront build cost is $9,000 per market. The motto is “On time, for you” — late drops burn trust.",
  assumptions: [
    "Use only the tables in this challenge (no outside data).",
    "Exclude cancelled sessions from volume and revenue maths.",
    "A market’s size comes from market_profiles (medium or large only).",
    "Revenue per completed session = spend_usd from sessions.",
    "Compute cost = $0.05 × minutes per completed session.",
    "Support cost = that market’s SUM(support_tickets.cost_usd), allocated once to the market (not per session).",
    "Fixed delivery fee per completed session: $2 for medium, $4 for large.",
    "Delay SLA: first 15 minutes of publish_delay_min are free; each extra minute costs $1. Cap any session’s delay at 120 minutes before applying the free 15 (bad data).",
    "Upfront build cost to recover: $9,000 per market.",
    "Document joins and any fields you create.",
  ],
  questions: [
    "The 10 busiest markets by completed sessions in the quarter.",
    "The 10 most profitable markets (revenue − costs, before the $9k-a-market upfront). Show revenue, cost pieces, sessions, and profit.",
    "The 5 markets you recommend — and why (any factors you choose).",
    "Sessions to break even on the $9k upfront for each of those five.",
    "KPIs you’d track after launch.",
  ] as string[],
  rubric: [
    {
      id: "builder",
      name: "Builder mindset",
      asks: "Reusable joins/functions, clear structure, comments, right open-source tools — not a one-off hardcoded notebook.",
    },
    {
      id: "data",
      name: "Data management",
      asks: "At least three DQ findings, deliberate fixes, metadata for fields you create.",
    },
    {
      id: "biz",
      name: "Business intent",
      asks: "A story with charts or clear tables, a concrete recommendation, assumptions, and what you’d do next.",
    },
  ] as const,
  schema: [
    {
      table: "market_profiles",
      columns: ["market_id", "metro", "size", "status"],
    },
    {
      table: "sessions",
      columns: [
        "session_id",
        "market_id",
        "session_date",
        "minutes",
        "spend_usd",
        "cancelled",
        "publish_delay_min",
      ],
    },
    {
      table: "support_tickets",
      columns: ["ticket_id", "market_id", "opened_at", "cost_usd"],
    },
  ] as ChallengeTable[],
  /**
   * Intentionally messy: duplicate market row, size typos, NULL spend,
   * cancelled=1 noise, a 40000 delay outlier, support market_id typo.
   */
  seedSql: `
CREATE TABLE market_profiles (
  market_id TEXT,
  metro TEXT,
  size TEXT,
  status TEXT
);
INSERT INTO market_profiles VALUES
  ('M01', 'Austin', 'medium', 'active'),
  ('M02', 'Chicago', 'large', 'active'),
  ('M03', 'Denver', 'medium', 'active'),
  ('M04', 'Atlanta', 'large', 'active'),
  ('M05', 'Seattle', 'large', 'active'),
  ('M06', 'Phoenix', 'medium', 'active'),
  ('M07', 'Boston', 'large', 'active'),
  ('M08', 'Dallas', 'large', 'active'),
  ('M09', 'Detroit', 'medium', 'active'),
  ('M10', 'Nashville', 'medium', 'active'),
  ('M11', 'Portland', 'medium', 'paused'),
  ('M12', 'Miami', 'large', 'active'),
  ('M02', 'Chicago', 'Large', 'active'),
  ('M13', 'Raleigh', 'medum', 'active'),
  ('M14', 'smallville', 'small', 'active');

CREATE TABLE sessions (
  session_id INTEGER,
  market_id TEXT,
  session_date TEXT,
  minutes REAL,
  spend_usd REAL,
  cancelled INTEGER,
  publish_delay_min INTEGER
);
INSERT INTO sessions VALUES
  (1, 'M01', '2019-01-05', 40, 12.5, 0, 5),
  (2, 'M01', '2019-01-12', 38, 11.0, 0, 0),
  (3, 'M01', '2019-01-19', 42, 13.0, 1, 0),
  (4, 'M01', '2019-02-02', 45, 14.0, 0, 22),
  (5, 'M01', '2019-02-16', 41, 12.0, 0, 8),
  (6, 'M01', '2019-03-02', 39, 12.5, 0, 3),
  (7, 'M01', '2019-03-16', 44, 15.0, 0, 18),
  (8, 'M01', '2019-03-30', 40, 12.0, 0, 6),
  (9, 'M02', '2019-01-06', 55, 22.0, 0, 10),
  (10, 'M02', '2019-01-13', 58, 24.0, 0, 4),
  (11, 'M02', '2019-01-20', 52, 21.0, 0, 30),
  (12, 'M02', '2019-02-03', 60, 25.0, 0, 12),
  (13, 'M02', '2019-02-17', 54, 23.0, 1, 0),
  (14, 'M02', '2019-03-03', 57, 24.5, 0, 9),
  (15, 'M02', '2019-03-17', 59, 26.0, 0, 16),
  (16, 'M02', '2019-03-31', 56, 23.5, 0, 7),
  (17, 'M02', '2019-03-24', 53, 22.5, 0, 11),
  (18, 'M03', '2019-01-07', 35, 9.0, 0, 2),
  (19, 'M03', '2019-01-21', 36, 9.5, 0, 40000),
  (20, 'M03', '2019-02-04', 34, 8.5, 0, 5),
  (21, 'M03', '2019-02-18', 37, 10.0, 0, 14),
  (22, 'M03', '2019-03-04', 35, NULL, 0, 6),
  (23, 'M03', '2019-03-18', 38, 10.5, 0, 8),
  (24, 'M04', '2019-01-08', 50, 20.0, 0, 3),
  (25, 'M04', '2019-01-22', 48, 19.0, 0, 20),
  (26, 'M04', '2019-02-05', 51, 21.0, 0, 9),
  (27, 'M04', '2019-02-19', 49, 19.5, 0, 15),
  (28, 'M04', '2019-03-05', 52, 22.0, 0, 4),
  (29, 'M04', '2019-03-19', 50, 20.5, 0, 25),
  (30, 'M04', '2019-03-26', 47, 18.0, 0, 6),
  (31, 'M05', '2019-01-09', 46, 17.0, 0, 8),
  (32, 'M05', '2019-01-23', 44, 16.0, 0, 12),
  (33, 'M05', '2019-02-06', 45, 16.5, 0, 2),
  (34, 'M05', '2019-02-20', 47, 18.0, 1, 0),
  (35, 'M05', '2019-03-06', 43, 15.5, 0, 19),
  (36, 'M05', '2019-03-20', 46, 17.5, 0, 7),
  (37, 'M06', '2019-01-10', 32, 7.5, 0, 4),
  (38, 'M06', '2019-02-07', 33, 8.0, 0, 10),
  (39, 'M06', '2019-03-07', 31, 7.0, 0, 3),
  (40, 'M06', '2019-03-21', 34, 8.5, 0, 21),
  (41, 'M07', '2019-01-11', 48, 19.0, 0, 5),
  (42, 'M07', '2019-01-25', 50, 20.0, 0, 13),
  (43, 'M07', '2019-02-08', 49, 19.5, 0, 8),
  (44, 'M07', '2019-02-22', 51, 21.0, 0, 17),
  (45, 'M07', '2019-03-08', 47, 18.5, 0, 6),
  (46, 'M07', '2019-03-22', 52, 22.0, 0, 11),
  (47, 'M08', '2019-01-12', 53, 21.0, 0, 9),
  (48, 'M08', '2019-01-26', 55, 23.0, 0, 4),
  (49, 'M08', '2019-02-09', 54, 22.0, 0, 28),
  (50, 'M08', '2019-02-23', 56, 24.0, 0, 7),
  (51, 'M08', '2019-03-09', 52, 20.5, 0, 14),
  (52, 'M08', '2019-03-23', 57, 25.0, 0, 3),
  (53, 'M08', '2019-03-30', 51, 19.5, 0, 10),
  (54, 'M09', '2019-01-13', 30, 6.5, 0, 2),
  (55, 'M09', '2019-02-10', 29, 6.0, 0, 16),
  (56, 'M09', '2019-03-10', 31, 7.0, 0, 5),
  (57, 'M10', '2019-01-14', 36, 9.0, 0, 7),
  (58, 'M10', '2019-02-11', 37, 9.5, 0, 3),
  (59, 'M10', '2019-03-11', 35, 8.5, 0, 12),
  (60, 'M10', '2019-03-25', 38, 10.0, 0, 9),
  (61, 'M12', '2019-01-15', 49, 18.0, 0, 6),
  (62, 'M12', '2019-02-12', 50, 19.0, 0, 22),
  (63, 'M12', '2019-03-12', 48, 17.5, 0, 8),
  (64, 'M12', '2019-03-26', 51, 20.0, 0, 15),
  (65, 'M13', '2019-02-13', 28, 5.5, 0, 4),
  (66, 'M13', '2019-03-13', 27, 5.0, 0, 11),
  (67, 'M14', '2019-03-14', 20, 3.0, 0, 1);

CREATE TABLE support_tickets (
  ticket_id INTEGER,
  market_id TEXT,
  opened_at TEXT,
  cost_usd REAL
);
INSERT INTO support_tickets VALUES
  (1, 'M01', '2019-01-20', 4),
  (2, 'M01', '2019-03-01', 5.5),
  (3, 'M02', '2019-01-18', 9),
  (4, 'M02', '2019-02-22', 7),
  (5, 'M02', '2019-03-15', 8),
  (6, 'M03', '2019-02-01', 3),
  (7, 'M04', '2019-01-28', 6),
  (8, 'M04', '2019-03-10', 6.5),
  (9, 'M05', '2019-02-14', 5),
  (10, 'M07', '2019-01-30', 7.5),
  (11, 'M07', '2019-03-05', 4.5),
  (12, 'M08', '2019-02-01', 8.5),
  (13, 'M08', '2019-03-18', 9.5),
  (14, 'M12', '2019-02-20', 5.5),
  (15, 'M02 ', '2019-03-28', 4),
  (16, 'M99', '2019-03-01', 20);
`,
  tasks: [
    {
      id: "dq",
      kind: "dq",
      title: "Quality check",
      prompt:
        "List at least three data-quality issues that would skew the recommendation if ignored (duplicates, types, outliers, orphans, size filters). Write them in the box — this is scored on whether you noticed real problems in the seed, not on prose quality.",
      hint: "Start with SELECT market_id, COUNT(*) FROM market_profiles GROUP BY 1 HAVING COUNT(*) > 1; then peek at size values, NULL spend, the 40000 delay, and support market_ids that don't join.",
      explain:
        "Planted issues include: duplicate Chicago (M02) with size casing; 'medum' typo; small market that should be excluded; NULL spend; cancelled sessions; 40000-minute delay outlier; support row 'M02 ' with a trailing space; orphan M99.",
    },
    {
      id: "busiest",
      kind: "sql",
      title: "10 busiest markets",
      prompt:
        "Return the 10 busiest active markets by completed (non-cancelled) sessions. Use a cleaned market list: one row per market_id, size lowercased, only medium/large, status active. Columns: market_id, metro, size, sessions — ordered by sessions DESC, market_id ASC.",
      expected: "", // filled by challengeTasks()
      orderMatters: true,
      hint: "Deduplicate market_profiles, normalise size, drop small/paused, count sessions where cancelled = 0.",
      explain: "Busy = completed session count after cleaning markets. Raleigh's 'medum' still counts as medium once you fix the typo.",
    },
    {
      id: "profit",
      kind: "sql",
      title: "10 most profitable",
      prompt:
        "For cleaned active medium/large markets, compute profit for completed sessions: revenue = SUM(spend_usd); compute = SUM(0.05 * minutes); support = market's total support_tickets.cost_usd (TRIM market_id); fixed = sessions * ($2 medium / $4 large); delay = SUM(MAX(capped_delay - 15, 0) * $1) with capped_delay = MIN(120, publish_delay_min). profit = revenue − compute − support − fixed − delay. Return market_id, metro, sessions, revenue, total_cost, profit for the top 10 by profit. Order profit DESC, market_id ASC. Coalesce NULL spend to 0.",
      expected: "",
      orderMatters: true,
      hint: "Cap the absurd delay, TRIM support keys, allocate support once per market (not per session).",
      explain:
        "Profit before the $90k build. Cap delay so one bad row can't dominate; TRIM fixes the 'M02 ' ticket.",
    },
    {
      id: "recommend",
      kind: "write",
      title: "Recommend five markets",
      prompt:
        "Name five market_ids (and metros) you would fund. State the factors (profit, volume, delay risk, support load, size). This is a write-up — there isn't one correct set.",
      hint: "Balance profit with operational risk. A high-profit market with chronic delay may hurt the brand.",
      explain: "Strong answers trade off money vs SLA risk and say what they optimized for.",
    },
    {
      id: "breakeven",
      kind: "sql",
      title: "Breakeven sessions",
      prompt:
        "For markets M02, M08, M04, M07, M12 (a sample recommendation set), estimate sessions to recover $9,000 upfront: 9000 / profit_per_session rounded up to a whole session, using the same profit definition as the profitability task, profit_per_session = profit / sessions. Return market_id, metro, profit_per_session, breakeven_sessions. Order by market_id.",
      expected: "",
      orderMatters: true,
      hint: "Profit per session from the cleaned model, then round 9000 / pps up to a whole session.",
      explain: "Breakeven is upfront over per-session profit, rounded up. A market with zero or negative profit per session never breaks even — call that out in a real submission.",
    },
    {
      id: "kpi",
      kind: "write",
      title: "KPIs and what’s next",
      prompt:
        "List 4–6 KPIs you’d track post-launch (include at least one on-time / delay metric). Then 3 bullets on what you’d do next with more time (data, model, or product).",
      hint: "Think retention, contribution margin, SLA hit rate, support cost per session, time-to-publish.",
      explain: "Business intent closes with measurement and a backlog — not just the pick list.",
    },
  ] as ChallengeTask[],
} as const;

/** Canonical busiest query used for grading (kept separate so the long template literal stays honest). */
export const BUSIEST_SQL = `
WITH markets AS (
  SELECT market_id,
         MAX(metro) AS metro,
         CASE WHEN LOWER(MAX(size)) = 'medum' THEN 'medium' ELSE LOWER(MAX(size)) END AS size
  FROM market_profiles
  WHERE LOWER(status) = 'active'
  GROUP BY market_id
),
clean AS (
  SELECT * FROM markets WHERE size IN ('medium', 'large')
)
SELECT c.market_id, c.metro, c.size, COUNT(*) AS sessions
FROM sessions s
JOIN clean c ON c.market_id = s.market_id
WHERE s.cancelled = 0
GROUP BY c.market_id, c.metro, c.size
ORDER BY sessions DESC, c.market_id ASC
LIMIT 10;
`;

export const PROFIT_SQL = `
WITH markets AS (
  SELECT market_id, MAX(metro) AS metro,
         CASE WHEN LOWER(MAX(size)) = 'medum' THEN 'medium' ELSE LOWER(MAX(size)) END AS size
  FROM market_profiles
  WHERE LOWER(status) = 'active'
  GROUP BY market_id
),
clean AS (
  SELECT * FROM markets WHERE size IN ('medium', 'large')
),
supp AS (
  SELECT TRIM(market_id) AS market_id, SUM(cost_usd) AS support_cost
  FROM support_tickets
  GROUP BY TRIM(market_id)
),
sess AS (
  SELECT s.market_id,
         COUNT(*) AS sessions,
         SUM(COALESCE(s.spend_usd, 0)) AS revenue,
         SUM(0.05 * s.minutes) AS compute_cost,
         SUM(CASE WHEN MIN(120, s.publish_delay_min) > 15
                  THEN (MIN(120, s.publish_delay_min) - 15) * 1.0 ELSE 0 END) AS delay_cost,
         SUM(CASE WHEN c.size = 'medium' THEN 2.0 ELSE 4.0 END) AS fixed_cost
  FROM sessions s
  JOIN clean c ON c.market_id = s.market_id
  WHERE s.cancelled = 0
  GROUP BY s.market_id
)
SELECT c.market_id, c.metro, s.sessions,
       ROUND(s.revenue, 2) AS revenue,
       ROUND(s.compute_cost + COALESCE(p.support_cost, 0) + s.fixed_cost + s.delay_cost, 2) AS total_cost,
       ROUND(s.revenue - (s.compute_cost + COALESCE(p.support_cost, 0) + s.fixed_cost + s.delay_cost), 2) AS profit
FROM sess s
JOIN clean c ON c.market_id = s.market_id
LEFT JOIN supp p ON p.market_id = c.market_id
ORDER BY profit DESC, c.market_id ASC
LIMIT 10;
`;

export const BREAKEVEN_SQL = `
WITH markets AS (
  SELECT market_id, MAX(metro) AS metro,
         CASE WHEN LOWER(MAX(size)) = 'medum' THEN 'medium' ELSE LOWER(MAX(size)) END AS size
  FROM market_profiles
  WHERE LOWER(status) = 'active'
  GROUP BY market_id
),
clean AS (
  SELECT * FROM markets WHERE size IN ('medium', 'large') AND market_id IN ('M02','M08','M04','M07','M12')
),
supp AS (
  SELECT TRIM(market_id) AS market_id, SUM(cost_usd) AS support_cost
  FROM support_tickets GROUP BY TRIM(market_id)
),
sess AS (
  SELECT s.market_id,
         COUNT(*) AS sessions,
         SUM(COALESCE(s.spend_usd, 0)) AS revenue,
         SUM(0.05 * s.minutes) AS compute_cost,
         SUM(CASE WHEN MIN(120, s.publish_delay_min) > 15
                  THEN (MIN(120, s.publish_delay_min) - 15) * 1.0 ELSE 0 END) AS delay_cost,
         SUM(CASE WHEN c.size = 'medium' THEN 2.0 ELSE 4.0 END) AS fixed_cost
  FROM sessions s
  JOIN clean c ON c.market_id = s.market_id
  WHERE s.cancelled = 0
  GROUP BY s.market_id
),
p AS (
  SELECT c.market_id, c.metro, s.sessions,
         (s.revenue - (s.compute_cost + COALESCE(x.support_cost, 0) + s.fixed_cost + s.delay_cost)) * 1.0 / s.sessions AS pps
  FROM sess s
  JOIN clean c ON c.market_id = s.market_id
  LEFT JOIN supp x ON x.market_id = c.market_id
)
SELECT market_id, metro,
       ROUND(pps, 2) AS profit_per_session,
       CAST(9000.0 / pps AS INTEGER) + CASE WHEN 9000.0 / pps > CAST(9000.0 / pps AS INTEGER) THEN 1 ELSE 0 END AS breakeven_sessions
FROM p
ORDER BY market_id;
`;

/** Patch tasks with the clean expected SQL (avoids the messy inline template above). */
export function challengeTasks(): ChallengeTask[] {
  return DATA_CHALLENGE.tasks.map((t) => {
    if (t.id === "busiest") return { ...t, expected: BUSIEST_SQL };
    if (t.id === "profit") return { ...t, expected: PROFIT_SQL };
    if (t.id === "breakeven") return { ...t, expected: BREAKEVEN_SQL };
    return { ...t };
  });
}
