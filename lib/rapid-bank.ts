/**
 * Extra Rapid Fire snaps that aren't in a lesson walk-through.
 *
 * Curriculum MCs still feed the bank; this file is for recognition drills we
 * want under the clock without stuffing every course with more multiple choice.
 * `buildRapidBank` merges both. Keep the teaching voice: situation first,
 * short options, one clear explain.
 *
 * Types are local on purpose — importing from rapid-fire.ts would cycle
 * (that module imports this one).
 */

export type RapidBankLang =
  | "sql"
  | "python"
  | "excel"
  | "r"
  | "stats"
  | "git";

export type RapidBankSnap = {
  id: string;
  lang: RapidBankLang;
  prompt: string;
  code?: string;
  choices: string[];
  answer: number;
  explain: string;
};

const SNAPS: RapidBankSnap[] = [
  // ── SQL ──────────────────────────────────────────────────────────
  {
    id: "rf-sql-select-star",
    lang: "sql",
    prompt: "A GM wants every column from week_results, first ten rows. What's the ask?",
    choices: [
      "SELECT * FROM week_results LIMIT 10;",
      "SELECT ALL week_results LIMIT 10;",
      "GET * FROM week_results STOP 10;",
      "SELECT week_results.* WHERE LIMIT 10;",
    ],
    answer: 0,
    explain: "SELECT * means every column. LIMIT caps how many rows come back.",
  },
  {
    id: "rf-sql-where-vs-having",
    lang: "sql",
    prompt: "You grouped by player. You want only players whose total points clear 200. Which clause?",
    choices: ["WHERE", "HAVING", "LIMIT", "ORDER BY"],
    answer: 1,
    explain: "WHERE filters rows before the group. HAVING filters after aggregation.",
  },
  {
    id: "rf-sql-inner-drop",
    lang: "sql",
    prompt: "INNER JOIN roster to week_results. A rostered player on bye has no score row. What happens to him?",
    choices: [
      "He appears with NULL points",
      "He is dropped from the result",
      "He appears twice",
      "The query errors",
    ],
    answer: 1,
    explain: "INNER JOIN keeps only matching pairs. No score row means he's out — use LEFT JOIN for byes.",
  },
  {
    id: "rf-sql-left-null",
    lang: "sql",
    prompt: "LEFT JOIN scores onto roster. How do you keep only players with no score?",
    choices: [
      "WHERE s.points = 0",
      "WHERE s.player_id IS NULL",
      "HAVING COUNT(*) = 0",
      "ORDER BY s.points NULLS FIRST",
    ],
    answer: 1,
    explain: "After a LEFT JOIN, missing right-side rows show NULL keys. Filter on that.",
  },
  {
    id: "rf-sql-order-limit",
    lang: "sql",
    prompt: "Top scorer this week — which pattern?",
    choices: [
      "WHERE fantasy_pts = MAX(fantasy_pts)",
      "ORDER BY fantasy_pts DESC LIMIT 1",
      "GROUP BY fantasy_pts LIMIT 1",
      "SELECT TOP SCORER FROM week_results",
    ],
    answer: 1,
    explain: "Sort the metric you care about, then cut the list. MAX in WHERE isn't valid like that in SQLite.",
  },
  {
    id: "rf-sql-count-star",
    lang: "sql",
    prompt: "COUNT(*) vs COUNT(fantasy_pts) when fantasy_pts has no NULLs?",
    choices: [
      "COUNT(*) is always bigger",
      "They return the same number",
      "COUNT(fantasy_pts) errors",
      "COUNT(*) ignores the table",
    ],
    answer: 1,
    explain: "COUNT(column) skips NULLs. With no NULLs, both count every row.",
  },
  {
    id: "rf-sql-group-select",
    lang: "sql",
    prompt: "You SELECT player, week, SUM(fantasy_pts) and GROUP BY player only. What's wrong?",
    choices: [
      "SUM can't sit with GROUP BY",
      "week isn't aggregated or in the GROUP BY",
      "You must ORDER BY first",
      "player must be lowercase",
    ],
    answer: 1,
    explain: "Every selected non-aggregate column has to be in the GROUP BY (in strict SQL / SQLite).",
  },
  {
    id: "rf-sql-case",
    lang: "sql",
    prompt: "Label rows 'boom' if fantasy_pts >= 25 else 'normal'. Tool for that?",
    choices: ["COALESCE", "CASE WHEN", "CAST", "UNION"],
    answer: 1,
    explain: "CASE WHEN … THEN … ELSE … END builds a column from conditions.",
  },
  {
    id: "rf-sql-distinct",
    lang: "sql",
    prompt: "How many different teams appear in week_results?",
    choices: [
      "SELECT COUNT(team) FROM week_results;",
      "SELECT COUNT(DISTINCT team) FROM week_results;",
      "SELECT UNIQUE team FROM week_results;",
      "SELECT team GROUP BY COUNT(*);",
    ],
    answer: 1,
    explain: "COUNT(DISTINCT …) counts unique values. Plain COUNT(team) counts non-null rows.",
  },
  {
    id: "rf-sql-cte",
    lang: "sql",
    prompt: "A WITH block before the main SELECT is called a…",
    choices: ["View", "Trigger", "CTE (common table expression)", "Index"],
    answer: 2,
    explain: "A CTE names a temporary result you can query like a table in the same statement.",
  },
  {
    id: "rf-sql-window",
    lang: "sql",
    prompt: "Rank WRs within each week by points without collapsing rows. Which family?",
    choices: ["GROUP BY alone", "Window functions (OVER)", "UNION ALL", "CROSS JOIN"],
    answer: 1,
    explain: "Window functions add a rank (or running total) while keeping every row.",
  },
  {
    id: "rf-sql-null-eq",
    lang: "sql",
    prompt: "WHERE team = NULL — what do you get?",
    choices: [
      "Every row where team is NULL",
      "No rows (use IS NULL)",
      "A syntax error always",
      "Every row in the table",
    ],
    answer: 1,
    explain: "NULL isn't equal to anything, including NULL. Use IS NULL / IS NOT NULL.",
  },
  {
    id: "rf-sql-alias",
    lang: "sql",
    prompt: "SELECT fantasy_pts AS pts — what is pts?",
    choices: [
      "A new column stored in the table",
      "A display name for that column in the result",
      "A second table",
      "A filter",
    ],
    answer: 1,
    explain: "AS renames the column in the output. It doesn't change the stored table.",
  },
  {
    id: "rf-sql-join-on",
    lang: "sql",
    prompt: "Join condition belongs in…",
    choices: ["SELECT", "ON (or USING)", "LIMIT", "DISTINCT"],
    answer: 1,
    explain: "ON says how rows match. Putting it in WHERE after a LEFT JOIN can accidentally turn it into an inner join.",
  },
  {
    id: "rf-sql-avg-null",
    lang: "sql",
    prompt: "AVG(points) with some NULL points — NULLs…",
    choices: [
      "Count as zero",
      "Are skipped",
      "Make AVG return NULL always",
      "Error the query",
    ],
    answer: 1,
    explain: "Aggregates ignore NULLs. Zeros would pull the average down; missing games usually shouldn't.",
  },

  // ── Python ───────────────────────────────────────────────────────
  {
    id: "rf-py-list-len",
    lang: "python",
    prompt: "scores = [12.4, 8.1, 22.0]. How many games?",
    code: "scores = [12.4, 8.1, 22.0]",
    choices: ["len(scores)", "scores.count()", "size(scores)", "scores.length"],
    answer: 0,
    explain: "len(list) is the length. .count() needs a value to count occurrences of.",
  },
  {
    id: "rf-py-dict-get",
    lang: "python",
    prompt: "player = {\"name\": \"Puka\", \"pts\": 21}. Safe read of \"team\" with default \"FA\"?",
    choices: [
      "player[\"team\"] or \"FA\"",
      "player.get(\"team\", \"FA\")",
      "player.team(\"FA\")",
      "get(player, team, FA)",
    ],
    answer: 1,
    explain: ".get(key, default) returns the default when the key is missing — no KeyError.",
  },
  {
    id: "rf-py-slice",
    lang: "python",
    prompt: "First three of a points list?",
    choices: ["points[1:3]", "points[:3]", "points[0:2]", "points[-3:]"],
    answer: 1,
    explain: "[:3] is start through index 2 — the first three items.",
  },
  {
    id: "rf-py-comprehension",
    lang: "python",
    prompt: "Double every score in scores = [10, 12, 8]. Idiomatic one-liner?",
    choices: [
      "[x * 2 for x in scores]",
      "scores.each(lambda x: x * 2)",
      "map(scores * 2)",
      "for x in scores: x *= 2; scores",
    ],
    answer: 0,
    explain: "A list comprehension builds a new list in one expression.",
  },
  {
    id: "rf-py-none",
    lang: "python",
    prompt: "Check that bye is missing (None). Correct test?",
    choices: ["bye == None", "bye is None", "bye = None", "none(bye)"],
    answer: 1,
    explain: "Use is None for identity. == None works often but isn't the style guide default.",
  },
  {
    id: "rf-py-pandas-filter",
    lang: "python",
    prompt: "DataFrame df of weekly scores. Rows where pts > 20?",
    choices: [
      "df.where(pts > 20)",
      "df[df[\"pts\"] > 20]",
      "df.select(pts > 20)",
      "df.filter(pts > 20)",
    ],
    answer: 1,
    explain: "Boolean indexing: df[condition] keeps the True rows.",
  },
  {
    id: "rf-py-groupby",
    lang: "python",
    prompt: "Total points per player in a DataFrame?",
    choices: [
      "df.sum(\"player\")",
      "df.groupby(\"player\")[\"pts\"].sum()",
      "df.aggregate(player=pts)",
      "df.pivot(pts)",
    ],
    answer: 1,
    explain: "groupby splits, then you aggregate a column — same idea as SQL GROUP BY.",
  },
  {
    id: "rf-py-merge",
    lang: "python",
    prompt: "pandas join of roster to scores on player_id, keep all roster rows?",
    choices: [
      "pd.concat([roster, scores])",
      "roster.merge(scores, on=\"player_id\", how=\"left\")",
      "roster.join(scores, how=\"inner\")",
      "roster.append(scores)",
    ],
    answer: 1,
    explain: "merge with how=\"left\" is the LEFT JOIN. concat stacks; it doesn't match keys.",
  },
  {
    id: "rf-py-isna",
    lang: "python",
    prompt: "Count missing pts in a Series s?",
    choices: ["s.null().sum()", "s.isna().sum()", "len(s.missing)", "s.count(None)"],
    answer: 1,
    explain: "isna() (or isnull()) marks missing values; sum() counts the Trues.",
  },
  {
    id: "rf-py-sort",
    lang: "python",
    prompt: "Highest pts at the top of a DataFrame?",
    choices: [
      "df.sort_values(\"pts\", ascending=False)",
      "df.order_by(\"pts\")",
      "df.sort(\"pts\", reverse)",
      "sorted(df.pts)",
    ],
    answer: 0,
    explain: "sort_values with ascending=False puts the biggest numbers first.",
  },
  {
    id: "rf-py-fstring",
    lang: "python",
    prompt: "name = \"CMC\"; pts = 24.5 — f-string that prints CMC: 24.5?",
    choices: [
      "\"{name}: {pts}\"",
      "f\"{name}: {pts}\"",
      "format(name + pts)",
      "%s: %s\" % name, pts",
    ],
    answer: 1,
    explain: "f\"…{expr}…\" interpolates. A plain string won't substitute.",
  },
  {
    id: "rf-py-truthy",
    lang: "python",
    prompt: "if scores:  — empty list [] is…",
    choices: ["Truthy", "Falsy", "An error", "None"],
    answer: 1,
    explain: "Empty lists, 0, \"\", and None are falsy in boolean context.",
  },

  // ── Excel ────────────────────────────────────────────────────────
  {
    id: "rf-xl-sum",
    lang: "excel",
    prompt: "Add B2 through B10?",
    choices: ["=ADD(B2:B10)", "=SUM(B2:B10)", "=TOTAL(B2:B10)", "=B2+B10"],
    answer: 1,
    explain: "SUM takes a range. B2+B10 only adds those two cells.",
  },
  {
    id: "rf-xl-average",
    lang: "excel",
    prompt: "Mean of a points column C2:C18?",
    choices: ["=MEAN(C2:C18)", "=AVERAGE(C2:C18)", "=AVG(C2:C18)", "=MEDIAN(C2:C18)"],
    answer: 1,
    explain: "AVERAGE is Excel's mean. MEDIAN is the middle value — different question.",
  },
  {
    id: "rf-xl-if",
    lang: "excel",
    prompt: "Show \"start\" if D2 >= 15, else \"bench\"?",
    choices: [
      "=IF(D2>=15,\"start\",\"bench\")",
      "=WHEN(D2>=15,\"start\",\"bench\")",
      "=CASE(D2>=15,\"start\",\"bench\")",
      "=IIF(D2>=15,\"start\",\"bench\")",
    ],
    answer: 0,
    explain: "IF(condition, value_if_true, value_if_false).",
  },
  {
    id: "rf-xl-xlookup",
    lang: "excel",
    prompt: "Pull a player's team from a roster table by name — modern Excel?",
    choices: ["VLOOKUP only", "XLOOKUP", "SUMIF", "CONCAT"],
    answer: 1,
    explain: "XLOOKUP looks both ways and defaults more safely than VLOOKUP.",
  },
  {
    id: "rf-xl-countif",
    lang: "excel",
    prompt: "How many weeks did someone clear 20 points in E2:E17?",
    choices: [
      "=COUNT(E2:E17>20)",
      "=COUNTIF(E2:E17,\">20\")",
      "=COUNTIFS(\">20\")",
      "=SUMIF(E2:E17,20)",
    ],
    answer: 1,
    explain: "COUNTIF(range, criteria). Criteria for \"greater than\" is a string like \">20\".",
  },
  {
    id: "rf-xl-abs-ref",
    lang: "excel",
    prompt: "Lock the season total in $G$2 while you drag a formula down?",
    choices: [
      "Relative reference",
      "Absolute reference ($)",
      "Named only",
      "Array formula",
    ],
    answer: 1,
    explain: "$ keeps the grid address from sliding when you fill.",
  },
  {
    id: "rf-xl-trim",
    lang: "excel",
    prompt: "Names pasted with extra spaces — first cleanup function?",
    choices: ["=CLEAN()", "=TRIM()", "=PROPER()", "=VALUE()"],
    answer: 1,
    explain: "TRIM strips leading/trailing spaces and squeezes repeats. CLEAN is for non-printables.",
  },
  {
    id: "rf-xl-value",
    lang: "excel",
    prompt: "\"18.4\" stored as text — make it a number?",
    choices: ["=NUMBER()", "=VALUE()", "=INT()", "=TEXT()"],
    answer: 1,
    explain: "VALUE turns numeric text into a real number so math works.",
  },
  {
    id: "rf-xl-sumifs",
    lang: "excel",
    prompt: "Sum points for one player and one age — two conditions?",
    choices: ["SUMIF only", "SUMIFS", "COUNT", "VLOOKUP"],
    answer: 1,
    explain: "SUMIFS handles multiple criteria. SUMIF is the one-criterion cousin.",
  },
  {
    id: "rf-xl-error",
    lang: "excel",
    prompt: "XLOOKUP finds nothing — you see…",
    choices: ["0", "#N/A (unless you set if_not_found)", "#DIV/0!", "blank always"],
    answer: 1,
    explain: "Missing lookups surface as #N/A unless you pass an if_not_found argument.",
  },

  // ── R ────────────────────────────────────────────────────────────
  {
    id: "rf-r-c",
    lang: "r",
    prompt: "Make a numeric vector of three scores in base R?",
    choices: ["list(10, 12, 8)", "c(10, 12, 8)", "vec(10, 12, 8)", "array(10, 12, 8)"],
    answer: 1,
    explain: "c() combines values into a vector — the everyday R container.",
  },
  {
    id: "rf-r-mean",
    lang: "r",
    prompt: "Average of vector pts?",
    choices: ["avg(pts)", "mean(pts)", "Mean(pts)", "pts.mean()"],
    answer: 1,
    explain: "mean() is base R. Watch NA values — use na.rm = TRUE when needed.",
  },
  {
    id: "rf-r-filter",
    lang: "r",
    prompt: "tidyverse: keep rows where pts > 20?",
    choices: [
      "select(df, pts > 20)",
      "filter(df, pts > 20)",
      "where(df, pts > 20)",
      "subset_rows(df, pts > 20)",
    ],
    answer: 1,
    explain: "filter() keeps rows. select() picks columns.",
  },
  {
    id: "rf-r-mutate",
    lang: "r",
    prompt: "Add a column boom = pts >= 25 with dplyr?",
    choices: [
      "transmute(df, boom = pts >= 25)",
      "mutate(df, boom = pts >= 25)",
      "arrange(df, boom = pts >= 25)",
      "rename(df, boom = pts >= 25)",
    ],
    answer: 1,
    explain: "mutate adds or changes columns. transmute keeps only what you create.",
  },
  {
    id: "rf-r-group",
    lang: "r",
    prompt: "Total pts by player in dplyr?",
    choices: [
      "df %>% group_by(player) %>% summarise(total = sum(pts))",
      "df %>% count(pts)",
      "df %>% summarise(player)",
      "aggregate(df)",
    ],
    answer: 0,
    explain: "group_by then summarise is the GROUP BY pattern in tidyverse.",
  },
  {
    id: "rf-r-na",
    lang: "r",
    prompt: "Test if x is missing?",
    choices: ["x == NA", "is.na(x)", "missing(x)", "x is NULL"],
    answer: 1,
    explain: "is.na(x). Equality with NA doesn't work the way beginners expect.",
  },
  {
    id: "rf-r-pipe",
    lang: "r",
    prompt: "The tidyverse pipe %>% means…",
    choices: [
      "Logical OR",
      "Pass the left result into the next function",
      "Assign to a name",
      "End the script",
    ],
    answer: 1,
    explain: "x %>% f(y) is roughly f(x, y) — read the pipeline left to right.",
  },
  {
    id: "rf-r-head",
    lang: "r",
    prompt: "First six rows of a data frame?",
    choices: ["first(df)", "head(df)", "top(df)", "df[6]"],
    answer: 1,
    explain: "head(df) peeks. Same instinct as LIMIT in SQL.",
  },

  // ── Stats ────────────────────────────────────────────────────────
  {
    id: "rf-st-mean-vs-median",
    lang: "stats",
    prompt: "One 50-point outlier week — which center moves more?",
    choices: ["Median", "Mean", "Mode", "Neither"],
    answer: 1,
    explain: "The mean chases extremes. The median stays put unless the middle changes.",
  },
  {
    id: "rf-st-sample",
    lang: "stats",
    prompt: "You have four games of a rookie. Calling him \"WR1 for the year\" is risky mainly because of…",
    choices: ["Bias only", "Small sample size", "Too many decimals", "PPR scoring"],
    answer: 1,
    explain: "Tiny samples swing hard. Wait for more games before you rewrite the board.",
  },
  {
    id: "rf-st-regression-mean",
    lang: "stats",
    prompt: "A WR just posted a 40-point week. Next week you should expect…",
    choices: [
      "Another 40, on average",
      "Something closer to his usual level (regression to the mean)",
      "Exactly zero",
      "Always higher",
    ],
    answer: 1,
    explain: "Extreme outcomes usually slide back toward the player's typical range.",
  },
  {
    id: "rf-st-variance",
    lang: "stats",
    prompt: "Two RBs with the same average — one boom/bust, one steady. The boom/bust has higher…",
    choices: ["Mean", "Variance (or SD)", "Sample size", "Median always"],
    answer: 1,
    explain: "Variance / standard deviation measure spread around the center.",
  },
  {
    id: "rf-st-correlation",
    lang: "stats",
    prompt: "Targets and fantasy points rise together. That's…",
    choices: [
      "Proof targets cause points",
      "A positive association (correlation ≠ causation alone)",
      "Negative correlation",
      "Independent events",
    ],
    answer: 1,
    explain: "Association isn't a full causal story — but it's the right word for \"move together.\"",
  },
  {
    id: "rf-st-percent",
    lang: "stats",
    prompt: "3 TDs on 10 red-zone touches. Conversion rate?",
    choices: ["3%", "30%", "0.3%", "13%"],
    answer: 1,
    explain: "3/10 = 0.3 = 30%. Rates are successes over attempts.",
  },
  {
    id: "rf-st-outlier",
    lang: "stats",
    prompt: "Before you average season PPG, you should check…",
    choices: [
      "Only the team name",
      "Whether a tiny sample or injury weeks warp the number",
      "The font in the chart",
      "ESPN's projection only",
    ],
    answer: 1,
    explain: "Context on sample and missing games keeps one weird week from owning the story.",
  },
  {
    id: "rf-st-baseline",
    lang: "stats",
    prompt: "A model claims 2-point MAE. You should compare it to…",
    choices: [
      "Zero always",
      "A simple baseline (like last-3 average)",
      "The Super Bowl score",
      "Random.org",
    ],
    answer: 1,
    explain: "Skill is improvement over an obvious guess — not a raw error in a vacuum.",
  },

  // ── Git ──────────────────────────────────────────────────────────
  {
    id: "rf-git-status",
    lang: "git",
    prompt: "See what changed before you commit?",
    choices: ["git log", "git status", "git push", "git clone"],
    answer: 1,
    explain: "git status shows staged, unstaged, and untracked files.",
  },
  {
    id: "rf-git-commit",
    lang: "git",
    prompt: "Save a snapshot with a message?",
    choices: [
      "git save -m \"msg\"",
      "git commit -m \"msg\"",
      "git push -m \"msg\"",
      "git snapshot \"msg\"",
    ],
    answer: 1,
    explain: "commit records the staged changes. push sends commits to a remote.",
  },
  {
    id: "rf-git-branch",
    lang: "git",
    prompt: "Why branch for a feature?",
    choices: [
      "To delete main",
      "To isolate work until it's ready to merge",
      "Branches replace commits",
      "You can't commit on main",
    ],
    answer: 1,
    explain: "Branches let you try work without blocking everyone else on main.",
  },
  {
    id: "rf-git-pull",
    lang: "git",
    prompt: "Bring remote updates into your local branch?",
    choices: ["git push", "git pull", "git init", "git rm"],
    answer: 1,
    explain: "pull fetches and merges (or rebases) from the remote tracking branch.",
  },
  {
    id: "rf-git-clone",
    lang: "git",
    prompt: "First copy of a GitHub repo onto your machine?",
    choices: ["git fork", "git clone <url>", "git copy", "git download"],
    answer: 1,
    explain: "clone creates a local repo with remote history. fork is a GitHub-side copy.",
  },
  {
    id: "rf-git-diff",
    lang: "git",
    prompt: "Line-by-line unstaged changes?",
    choices: ["git blame", "git diff", "git show-branch", "git ls"],
    answer: 1,
    explain: "git diff shows the patch. blame annotates who last touched each line.",
  },
  {
    id: "rf-git-merge-conflict",
    lang: "git",
    prompt: "Two branches edited the same lines. Git reports a…",
    choices: ["Soft reset", "Merge conflict", "Fast-forward only", "Detached tag"],
    answer: 1,
    explain: "You resolve conflicts in the file, then commit the merge.",
  },
  {
    id: "rf-git-pr",
    lang: "git",
    prompt: "Ask teammates to review your branch before it hits main — on GitHub that's a…",
    choices: ["Pull request", "Hard reset", "Submodule", "Stash"],
    answer: 0,
    explain: "A pull request (PR) is the review + merge workflow on GitHub/GitLab.",
  },
];

/** Extra snaps for one Rapid Fire language (empty array if none). */
export function rapidBankFor(lang: RapidBankLang): RapidBankSnap[] {
  return SNAPS.filter((s) => s.lang === lang);
}

/** Counts by language — handy for smoke checks. */
export function rapidBankCounts(): Record<RapidBankLang, number> {
  const out: Record<RapidBankLang, number> = {
    sql: 0,
    python: 0,
    excel: 0,
    r: 0,
    stats: 0,
    git: 0,
  };
  for (const s of SNAPS) out[s.lang] += 1;
  return out;
}
