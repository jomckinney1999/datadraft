/**
 * The guide pages for the nine interview patterns (/sql-interview-questions
 * and /sql-interview-questions/<slug>; decided 2026-10-05).
 *
 * These are the pages someone finds by searching for the thing they're
 * worried about ("sql window function interview questions"), so each one
 * answers that search on its own: what the pattern is, why screens ask it,
 * the shape of an answer, the mistakes interviewers watch for, one worked
 * example from the bank, and every practice question in the pattern. The
 * practice list is computed from tags (lib/interview-patterns.ts), so a new
 * question shows up on its pattern's page the day it ships.
 *
 * The worked example is a real question whose answer key is shown in full,
 * so pick one people should see solved: the starter set where it covers the
 * pattern, otherwise a short medium. The verifier checks that every pattern
 * has a guide, that slugs are unique, and that each example is a SQL
 * question in its own pattern. The "shape" blocks are generic on purpose
 * (some_table, metric): they're for a reader, not keys, so nothing runs them.
 *
 * Voice: the bank's. Short sentences, "you", no hype, and nothing that
 * promises a job. Dialect notes say where SQLite (what runs in the browser)
 * differs from Postgres, Snowflake and BigQuery, because that's what the
 * reader will be interviewed in.
 */

import type { QuestionArt } from "@/lib/questions";
import type { DatasetId } from "@/lib/practice-schemas";

export type PatternGuide = {
  /** A pattern id from lib/interview-patterns.ts. */
  pattern: string;
  /** The URL segment, worded the way people search. */
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  lead: string;
  whyAsked: string;
  shape: string;
  shapeNote: string;
  mistakes: { title: string; body: string }[];
  /** A question id whose key is shown as the worked example. */
  example: string;
  faq: { q: string; a: string }[];
};

export const PATTERN_GUIDES: PatternGuide[] = [
  {
    pattern: "filter-sort",
    slug: "filtering-and-sorting",
    h1: "SQL filtering and sorting interview questions",
    metaTitle: "SQL WHERE, ORDER BY and LIMIT interview questions, with answers",
    metaDescription:
      "The warm-up in almost every SQL screen: find the rows, sort them, keep the top few. The mistakes interviewers watch for, a worked example, and practice questions on real NFL data.",
    lead: "The warm-up in almost every SQL screen: find the rows that match, put them in order, keep the top few. Easy to write. Easy to get slightly wrong.",
    whyAsked:
      "It's a reading test as much as a SQL test. Which rows exactly? Sorted by what? What happens when two rows tie for last place? Interviewers use it to see whether you check the question before you type.",
    shape: `SELECT col_a, col_b
FROM some_table
WHERE condition AND other_condition
ORDER BY col_b DESC, col_a   -- the second column breaks ties
LIMIT 10;`,
    shapeNote: "Same in every dialect except SQL Server, which writes SELECT TOP 10 instead of LIMIT 10.",
    mistakes: [
      {
        title: "LIMIT without ORDER BY",
        body: "LIMIT doesn't pick the best rows. It stops early. Without a sort you get whichever rows the database reached first, and that can change between runs.",
      },
      {
        title: "A tie at the cutoff",
        body: "If two rows tie for 10th, LIMIT 10 keeps one of them, and nothing says which. Add a tie-break column, or say out loud how you'd handle ties.",
      },
      {
        title: "AND and OR without brackets",
        body: "a OR b AND c means a OR (b AND c). If you meant (a OR b) AND c, write the brackets.",
      },
    ],
    example: "week-3-hammer",
    faq: [
      {
        q: "Do I need ORDER BY when I use LIMIT?",
        a: "SQL lets you leave it out, but then which rows you keep isn't defined. In an interview, always pair them.",
      },
      {
        q: "What's the difference between WHERE and HAVING?",
        a: "WHERE filters rows before they're grouped. HAVING filters groups after. If the condition uses COUNT, SUM or AVG, it belongs in HAVING.",
      },
    ],
  },
  {
    pattern: "aggregate",
    slug: "group-by",
    h1: "SQL GROUP BY interview questions",
    metaTitle: "SQL GROUP BY and HAVING interview questions, with answers",
    metaDescription:
      "Totals, averages and counts per thing, and filtering the groups with HAVING. The shape of the answer, the mistakes interviewers watch for, and practice on real NFL data.",
    lead: "Totals, averages and counts per thing: per player, per team, per week. Most analyst work is this, so most screens test it, usually with a HAVING twist.",
    whyAsked:
      "It shows you know when things happen. WHERE runs before the groups exist and HAVING runs after, and a lot of wrong answers come from mixing those up. It also shows whether you check what one row of the table is before you add it up.",
    shape: `SELECT group_col,
       COUNT(*)    AS n,
       AVG(metric) AS avg_metric
FROM some_table
WHERE row_filter          -- before grouping
GROUP BY group_col
HAVING COUNT(*) >= 10     -- after grouping
ORDER BY avg_metric DESC;`,
    shapeNote: "The same in every major dialect.",
    mistakes: [
      {
        title: "An aggregate in WHERE",
        body: "WHERE AVG(x) > 10 fails, because WHERE runs before there are any groups to average. Move it to HAVING.",
      },
      {
        title: "Selecting a column you didn't group by",
        body: "Postgres and most databases refuse. SQLite lets it through and hands you the value from one of the rows, with no say in which. Either way it's a bug: group by it, or aggregate it.",
      },
      {
        title: "COUNT(*) when you meant COUNT(col)",
        body: "COUNT(*) counts rows. COUNT(col) skips rows where col is NULL. Know which one the question is asking for.",
      },
      {
        title: "Not checking the grain",
        body: "Ask what one row is before you sum it. If the table has a row per player per week, a SUM per player is a season total, not a weekly one.",
      },
    ],
    example: "points-per-game",
    faq: [
      {
        q: "When do I use HAVING instead of WHERE?",
        a: "When the condition is about the group: a count, a total, an average. Everything about individual rows goes in WHERE, which also makes the query faster.",
      },
      {
        q: "Can I GROUP BY a column I don't SELECT?",
        a: "Yes. It's unusual but legal, and it's how you'd count rows per player without showing the player.",
      },
    ],
  },
  {
    pattern: "joins",
    slug: "joins",
    h1: "SQL JOIN interview questions",
    metaTitle: "SQL JOIN interview questions (INNER, LEFT, anti-join), with answers",
    metaDescription:
      "Combine tables without losing rows or doubling them. The LEFT JOIN trap, fan-out, anti-joins, a worked example and practice questions on real NFL data.",
    lead: "Combine tables without losing rows or doubling them. Joins are where a query can be wrong and still look fine.",
    whyAsked:
      "A join that drops rows, or quietly doubles them, still returns a tidy-looking table. Interviewers ask joins to see whether you check row counts and think about what happens to the rows with no match.",
    shape: `SELECT a.id, a.name,
       COALESCE(b.metric, 0) AS metric
FROM left_table a
LEFT JOIN right_table b
  ON  b.id = a.id
  AND b.period = 1     -- conditions on b go here, not in WHERE
ORDER BY metric DESC;`,
    shapeNote: "COALESCE and LEFT JOIN work the same in SQLite, Postgres, Snowflake and BigQuery.",
    mistakes: [
      {
        title: "A WHERE on the right table undoing the LEFT JOIN",
        body: "The unmatched rows have NULL in every column from the right table, so WHERE b.period = 1 throws them away and your LEFT JOIN becomes an INNER JOIN. Put the condition in ON.",
      },
      {
        title: "Fan-out",
        body: "Join on a key that isn't unique on one side and every match multiplies. Totals come out doubled and nothing errors. Count the rows before and after the join.",
      },
      {
        title: "INNER JOIN when the question says \"every\"",
        body: "\"Every player, including the ones who didn't play\" is a LEFT JOIN from the list you must keep. INNER keeps only the rows that match on both sides.",
      },
    ],
    example: "donut-week",
    faq: [
      {
        q: "What's the difference between INNER JOIN and LEFT JOIN?",
        a: "INNER keeps rows that match on both sides. LEFT keeps every row from the left table and fills the right side with NULL where there's no match.",
      },
      {
        q: "How do I find rows with no match?",
        a: "That's an anti-join: LEFT JOIN, then WHERE right_table.id IS NULL. NOT EXISTS does the same job, and is safer than NOT IN when the column can be NULL.",
      },
    ],
  },
  {
    pattern: "case",
    slug: "case-when",
    h1: "SQL CASE WHEN interview questions",
    metaTitle: "SQL CASE WHEN interview questions (buckets, flags, pivots), with answers",
    metaDescription:
      "Turn a rule into a column. CASE WHEN for buckets and flags, inside SUM for counting a subset, and pivots with conditional aggregation. Practice on real NFL data.",
    lead: "Buckets, flags and pivots. CASE WHEN turns a rule into a column. Put it inside SUM and it counts a subset without losing the rest of the group.",
    whyAsked:
      "Business questions come with rules: \"a big game is 20 points or more\", \"count the home wins and the away wins\". CASE is how you turn the rule into SQL, and screens use it to see whether you keep the zeros.",
    shape: `SELECT group_col,
       SUM(CASE WHEN metric >= 20 THEN 1 ELSE 0 END) AS big_ones,
       CASE WHEN AVG(metric) >= 15 THEN 'starter'
            ELSE 'bench' END                        AS tier
FROM some_table
GROUP BY group_col;`,
    shapeNote: "CASE is standard SQL and reads the same everywhere. Some dialects add shortcuts (IIF, IF), but CASE always works.",
    mistakes: [
      {
        title: "Filtering when you should be counting",
        body: "WHERE metric >= 20 then COUNT(*) drops every group that had none. If the question says \"including the zeros\", count with CASE inside SUM.",
      },
      {
        title: "No ELSE",
        body: "A row that matches no WHEN becomes NULL. Sometimes that's what you want. Usually it isn't, so write the ELSE.",
      },
      {
        title: "Branches in the wrong order",
        body: "CASE takes the first WHEN that's true. Put the narrowest condition first, or \"20 or more\" will swallow \"30 or more\".",
      },
    ],
    example: "boom-games",
    faq: [
      {
        q: "How do I pivot rows into columns in SQL?",
        a: "Conditional aggregation: one SUM(CASE WHEN category = 'x' THEN value ELSE 0 END) per column you want. It works in every dialect, unlike PIVOT.",
      },
      {
        q: "Can I use CASE in WHERE or ORDER BY?",
        a: "Yes, anywhere an expression goes. ORDER BY CASE … is a neat way to sort by a custom order.",
      },
    ],
  },
  {
    pattern: "subqueries",
    slug: "subqueries-and-ctes",
    h1: "SQL subquery and CTE interview questions",
    metaTitle: "SQL subquery and CTE (WITH) interview questions, with answers",
    metaDescription:
      "An answer about an answer: average something, then compare against the average. Subqueries, CTEs, correlated subqueries, a worked example and practice on real NFL data.",
    lead: "An answer about an answer: work out each player's average, then compare it with the average for his position. A CTE names the first step so the second can read it.",
    whyAsked:
      "Real questions take more than one step. Screens ask these to see whether you can break a problem down, say the steps out loud, and keep track of what one row means at each step.",
    shape: `WITH per_item AS (
  SELECT item, category, AVG(metric) AS avg_metric
  FROM some_table
  GROUP BY item, category
)
SELECT item, category, avg_metric
FROM per_item p
WHERE avg_metric > (
  SELECT AVG(avg_metric)
  FROM per_item x
  WHERE x.category = p.category   -- correlated: runs per row
);`,
    shapeNote: "WITH works in SQLite, Postgres, Snowflake, BigQuery and MySQL 8+.",
    mistakes: [
      {
        title: "Averaging the rows instead of the averages",
        body: "The average of every game isn't the average of each player's average. Work out which one the question means, then build that step first.",
      },
      {
        title: "A subquery that returns more than one row",
        body: "WHERE x > (SELECT …) needs exactly one value back. If the subquery can return several, you need IN, EXISTS or a join.",
      },
      {
        title: "Cramming it into one SELECT",
        body: "Say the steps, then write one CTE per step. It's easier to check, and easier for the interviewer to follow.",
      },
    ],
    example: "above-the-line",
    faq: [
      {
        q: "CTE or subquery: which should I use?",
        a: "Most databases run them the same way. CTEs read better when there's more than one step, and interviewers mostly care that you can explain each step.",
      },
      {
        q: "What's a correlated subquery?",
        a: "One that refers to the outer row, like the position average above, so it's worked out once per row. It's often the simplest correct answer; a window function can be faster.",
      },
    ],
  },
  {
    pattern: "ranking",
    slug: "window-functions-ranking",
    h1: "SQL window function interview questions: ranking and top-N per group",
    metaTitle: "SQL window function interview questions: ROW_NUMBER, RANK, top-N per group",
    metaDescription:
      "The best one in each group, with ties handled on purpose. ROW_NUMBER vs RANK vs DENSE_RANK, top-N per group, a worked example and practice on real NFL data.",
    lead: "The best one in each group: top scorer per team, latest order per customer, best week per season. It's the window question analyst screens ask most.",
    whyAsked:
      "GROUP BY can tell you the best score per team, but not who scored it. Getting the whole row back takes a window function, and choosing between ROW_NUMBER, RANK and DENSE_RANK shows whether you thought about ties.",
    shape: `WITH ranked AS (
  SELECT group_col, item, metric,
         ROW_NUMBER() OVER (
           PARTITION BY group_col
           ORDER BY metric DESC
         ) AS rn
  FROM some_table
)
SELECT group_col, item, metric
FROM ranked
WHERE rn = 1;   -- rn <= 3 for the top three`,
    shapeNote:
      "Snowflake, BigQuery and DuckDB also have QUALIFY, which filters on a window without the CTE: QUALIFY ROW_NUMBER() OVER (…) = 1.",
    mistakes: [
      {
        title: "Filtering on the window in WHERE",
        body: "Windows are worked out after WHERE, so WHERE rn = 1 in the same SELECT fails. Wrap it in a CTE and filter outside.",
      },
      {
        title: "Picking a ranking function without thinking about ties",
        body: "ROW_NUMBER keeps exactly one row per group, even on a tie. RANK keeps every tied row and skips numbers after (1, 1, 3). DENSE_RANK keeps them without gaps (1, 1, 2).",
      },
      {
        title: "Forgetting PARTITION BY",
        body: "Without it you rank the whole table, not each group, and \"the best in each team\" becomes \"the best overall\".",
      },
    ],
    example: "team-record-book",
    faq: [
      {
        q: "ROW_NUMBER, RANK or DENSE_RANK?",
        a: "ROW_NUMBER when you need exactly N rows per group. RANK or DENSE_RANK when tied rows should all count. Say which you chose and why.",
      },
      {
        q: "Why can't I use a window function in WHERE?",
        a: "Because WHERE runs first. Window functions see the rows that survive WHERE, so you filter on them one level up, in a CTE or subquery.",
      },
    ],
  },
  {
    pattern: "running",
    slug: "running-totals-lag-lead",
    h1: "SQL running total, LAG and LEAD interview questions",
    metaTitle: "SQL running total, moving average, LAG and LEAD interview questions",
    metaDescription:
      "Cumulative sums, moving averages, this week against last. Window frames, LAG and LEAD, the mistakes interviewers watch for, and practice on real NFL data.",
    lead: "Cumulative sums, moving averages, this week against last. A window with an ORDER BY sees the rows before it, and every row keeps its place.",
    whyAsked:
      "Trends are what a dashboard is for: revenue to date, week-over-week change, a three-week average. Screens ask these to check you know windows, and that you know what happens at the edges.",
    shape: `SELECT period, metric,
       SUM(metric) OVER (ORDER BY period)      AS running_total,
       metric - LAG(metric) OVER (ORDER BY period) AS change,
       AVG(metric) OVER (
         ORDER BY period
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       )                                       AS moving_avg_3
FROM some_table;`,
    shapeNote: "Window frames work the same in SQLite 3.25+, Postgres, Snowflake and BigQuery.",
    mistakes: [
      {
        title: "No PARTITION BY when there's more than one series",
        body: "A running total per player needs PARTITION BY player, or one player's total runs on into the next.",
      },
      {
        title: "Not saying what the first row should be",
        body: "LAG on the first row is NULL, because there's no week before it. Say whether that should be NULL, zero, or left out.",
      },
      {
        title: "Ties in the ORDER BY",
        body: "With only ORDER BY, the default frame includes tied rows, so two rows on the same date get the same running total. Write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when you mean row by row.",
      },
    ],
    example: "snowball",
    faq: [
      {
        q: "How do I write a running total without window functions?",
        a: "A self-join or a correlated subquery that sums every earlier row. It works, but it's slower and longer. Mention it, then use the window.",
      },
      {
        q: "What's the difference between LAG and LEAD?",
        a: "LAG looks at an earlier row and LEAD at a later one. Both take an offset (LAG(x, 2) is two rows back) and a default for when there's no such row.",
      },
    ],
  },
  {
    pattern: "dates",
    slug: "date-functions",
    h1: "SQL date interview questions",
    metaTitle: "SQL date function interview questions (days, months, gaps), with answers",
    metaDescription:
      "Days of the week, months and gaps between dates, in SQLite with notes for Postgres, Snowflake and BigQuery. Mistakes to avoid and practice on real NFL data.",
    lead: "Days of the week, months, gaps between dates. Date functions are the most dialect-specific part of SQL, so screens test whether you can reason about dates, not whether you've memorised the syntax.",
    whyAsked:
      "Almost every business question has a time window in it. Interviewers want to see you group by the right period, handle the edges of a range, and say which function you'd look up in their database.",
    shape: `SELECT strftime('%Y-%m', event_date)                AS month,
       COUNT(*)                                       AS events,
       julianday(MAX(event_date)) - julianday(MIN(event_date)) AS span_days
FROM some_table
WHERE event_date >= '2024-09-01' AND event_date < '2025-01-01'
GROUP BY month
ORDER BY month;`,
    shapeNote:
      "That's SQLite. Postgres: DATE_TRUNC('month', d) and d2 - d1. Snowflake: DATE_TRUNC and DATEDIFF(day, d1, d2). BigQuery: DATE_TRUNC(d, MONTH) and DATE_DIFF(d2, d1, DAY).",
    mistakes: [
      {
        title: "BETWEEN on timestamps",
        body: "BETWEEN '2024-09-01' AND '2024-09-30' misses everything after midnight on the 30th. Use >= the start and < the day after the end.",
      },
      {
        title: "Grouping by a label that sorts wrong",
        body: "Month names sort April, August, December. Group and sort by '2024-09' (or the month number), then show the name.",
      },
      {
        title: "Comparing dates stored as text",
        body: "Text dates only compare correctly in YYYY-MM-DD order. Check the format before you trust a < or a MAX.",
      },
    ],
    example: "christmas-football",
    faq: [
      {
        q: "Which date functions should I know for a SQL interview?",
        a: "Truncating to a period, pulling out a part (year, month, weekday), the difference between two dates, and adding an interval. Know the idea and say you'd check the exact name in their dialect.",
      },
      {
        q: "How do I find the gap between consecutive dates?",
        a: "LAG(date) OVER (PARTITION BY … ORDER BY date) gives the previous date on each row; subtract it.",
      },
    ],
  },
  {
    pattern: "nulls",
    slug: "nulls-and-messy-data",
    h1: "SQL NULL and messy data interview questions",
    metaTitle: "SQL NULL, COALESCE and duplicate-finding interview questions",
    metaDescription:
      "Missing values, duplicates and rows with no match. IS NULL vs = NULL, COALESCE, AVG skipping NULLs, NOT IN traps, and practice on real NFL data.",
    lead: "Missing values, duplicates and rows with no match. Real tables are messy, and screens check whether you notice before you average.",
    whyAsked:
      "A NULL quietly changes answers: AVG skips it, COUNT(col) skips it, = never matches it. Interviewers ask these to find out whether you look at the data before you trust a number from it.",
    shape: `SELECT category,
       COUNT(*)                AS rows_total,
       COUNT(col)              AS rows_with_value,  -- skips NULLs
       COUNT(*) - COUNT(col)   AS rows_missing,
       AVG(col)                AS avg_known,        -- ignores NULLs
       AVG(COALESCE(col, 0))   AS avg_missing_as_zero
FROM some_table
GROUP BY category;`,
    shapeNote: "All standard SQL. COUNT(*) - COUNT(col) counts the NULLs in any dialect.",
    mistakes: [
      {
        title: "= NULL",
        body: "Nothing equals NULL, not even NULL, so WHERE col = NULL returns no rows. Use IS NULL and IS NOT NULL.",
      },
      {
        title: "Letting AVG decide what missing means",
        body: "AVG skips NULLs, which treats missing as \"doesn't count\". If missing should mean zero, COALESCE it first, and say which you chose.",
      },
      {
        title: "NOT IN with a NULL in the list",
        body: "x NOT IN (1, 2, NULL) is never true, so the query returns nothing. Use NOT EXISTS, or filter the NULLs out of the subquery.",
      },
    ],
    example: "temperature-unknown",
    faq: [
      {
        q: "Why does WHERE col = NULL return no rows?",
        a: "NULL means unknown, and comparing anything to unknown gives unknown, which WHERE treats as false. IS NULL is the test for it.",
      },
      {
        q: "How do I find duplicate rows in SQL?",
        a: "GROUP BY the columns that should be unique, then HAVING COUNT(*) > 1. To see the duplicates themselves, ROW_NUMBER over the same columns and keep rn > 1.",
      },
    ],
  },
];

export const GUIDES_BASE = "/sql-interview-questions";

export function guideBySlug(slug: string): PatternGuide | undefined {
  return PATTERN_GUIDES.find((g) => g.slug === slug);
}

export function guideForPattern(patternId: string): PatternGuide | undefined {
  return PATTERN_GUIDES.find((g) => g.pattern === patternId);
}

/**
 * A guide to a kind of job rather than a pattern (2026-10-06). Same page and
 * the same parts, but its practice list is a whole practice database instead
 * of a tag set: product analytics is DAU, retention and funnels on an event
 * log, which is what Benchwarmer (lib/app-dataset.ts) exists for. It doesn't
 * join the nine patterns, so the analyst path and the bank's pattern grid
 * are unchanged. The verifier checks its example is a SQL question on its
 * database.
 */
export type TopicGuide = Omit<PatternGuide, "pattern"> & {
  topic: { id: string; name: string; asks: string; art: QuestionArt };
  dataset: DatasetId;
};

export const TOPIC_GUIDES: TopicGuide[] = [
  {
    topic: {
      id: "product-analytics",
      name: "Product analytics",
      asks: "Daily actives, retention, funnels, sessions and revenue, from an app's event log.",
      art: "funnel-steps",
    },
    dataset: "app",
    slug: "product-analytics",
    h1: "Product analytics SQL interview questions",
    metaTitle: "Product analytics SQL interview questions: DAU, retention, funnels, with answers",
    metaDescription:
      "What app companies ask in SQL screens: daily actives, day-7 retention, funnels, sessions and MRR. The traps interviewers watch for, a worked retention query, and practice questions on an event log you run in your browser.",
    lead: "If the company has an app, the screen has an event log: one row per thing a user did. The job is counting the right thing, over the right window, for the right people.",
    whyAsked:
      "Because it's the work. A product analyst's week is daily actives, retention and funnels, and the SQL is rarely hard on its own. What a screen tests is whether you count users or events, pick the window before you write the WHERE, and can say who's in the denominator before you divide.",
    shape: `-- Day-7 retention by signup cohort
WITH cohort AS (
  SELECT user_id, DATE(signup_at) AS signup_day
  FROM users
)
SELECT c.signup_day,
       COUNT(*) AS signups,
       SUM(CASE WHEN EXISTS (
             SELECT 1 FROM events e
             WHERE e.user_id = c.user_id
               AND DATE(e.event_time) = DATE(c.signup_day, '+7 days')
           ) THEN 1 ELSE 0 END) AS retained_day_7
FROM cohort c
GROUP BY c.signup_day
ORDER BY c.signup_day;`,
    shapeNote:
      "Date arithmetic is where dialects part ways: SQLite writes DATE(d, '+7 days'), Postgres d + INTERVAL '7 days', Snowflake DATEADD(day, 7, d) and BigQuery DATE_ADD(d, INTERVAL 7 DAY). Cutting a timestamp down to its day is DATE(ts) in SQLite and BigQuery, ts::date in Postgres, and TO_DATE(ts) in Snowflake.",
    mistakes: [
      {
        title: "Counting events when the question says users",
        body: "Active users is COUNT(DISTINCT user_id). COUNT(*) counts taps, and one keen user taps forty times a day.",
      },
      {
        title: "Joining when you mean EXISTS",
        body: "Join users to events to see who came back and every return visit becomes a row, so 'retained' can come out bigger than the cohort. EXISTS asks yes or no, once per person.",
      },
      {
        title: "Adding up distinct counts",
        body: "Monthly actives isn't the sum of daily actives: someone active on twenty days would count twenty times. Count each window on its own.",
      },
      {
        title: "Trusting the log",
        body: "Event logs carry duplicates from retried requests and gaps from outages. Compare COUNT(*) with a count of distinct rows before you report an event total, and say which one you used.",
      },
    ],
    example: "day-seven",
    faq: [
      {
        q: "What SQL do product analyst interviews ask?",
        a: "The same handful of metrics: daily and monthly active users, retention by signup cohort, a conversion funnel, sessions built from raw events, and revenue such as MRR or churn. They come down to GROUP BY, COUNT(DISTINCT), date functions, EXISTS or a LEFT JOIN, and window functions like LAG and ROW_NUMBER.",
      },
      {
        q: "How do you calculate retention in SQL?",
        a: "Pick the cohort first, for example everyone who signed up in a given month. For each person, check whether they did anything on the day or in the window you care about, with EXISTS or a LEFT JOIN to deduplicated activity. Retained people over cohort size is the rate. Decide out loud whether day 7 means exactly the seventh day or any day in the first week, because the interviewer will ask.",
      },
      {
        q: "How do you turn events into sessions in SQL?",
        a: "Order each user's events by time and use LAG to fetch the previous event's time. A new session starts at a user's first event and wherever the gap is longer than your threshold, usually 30 minutes. Count those starts for the number of sessions, or take a running SUM of them to number each event's session.",
      },
      {
        q: "Is the practice data real?",
        a: "No, and it says so wherever it appears. Benchwarmer is a fantasy football app we made up, because no real app's event log can be published. It's generated to behave like product data does: a signup rush, weekend spikes, a funnel that leaks and duplicate events from a client that retries.",
      },
    ],
  },
];

export function topicGuideBySlug(slug: string): TopicGuide | undefined {
  return TOPIC_GUIDES.find((g) => g.slug === slug);
}
