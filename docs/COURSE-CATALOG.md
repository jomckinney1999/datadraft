# SQL Sports — Full Course Catalog & Lesson Plan

The production plan for every course on the platform: what gets taught, in what order, and what the sports angle is for each lesson.

This is the **content spec**. `lib/curriculum.ts` is the implementation, and it currently covers a fraction of what's below — see [Build status](#build-status) for what's real today versus what's still on paper.

Related: `docs/CURRICULUM.md` (the original 12-week SQL syllabus, now a subset of Course 1), `docs/PLAN.md` (positioning), `docs/LAUNCH-PLAN.md` (build phases).

---

## How these lessons are built

**Every lesson is 5–15 minutes.** That's a constraint, not a target: a lesson that can't be finished on a lunch break doesn't get finished at all. If a topic needs 25 minutes, it's two lessons.

**Every lesson has the same anatomy** (enforced by the `Lesson` type in `lib/curriculum.ts`):

1. **Brief** — the goal in one line, the setup in two, and for data courses a live preview of the actual rows. Nobody gets asked about data they haven't seen.
2. **Theory** — one chalkboard card. Film Room learners get bonus cards; Gunslingers skip straight to the drills.
3. **Drills** — 4–6 exercises. Where a runtime exists, most should be hands-on (`query` / `code`), not multiple choice.

**Every lesson carries a sports lens.** The skill is identical to any other course on the internet; the dataset is what makes it stick. The rule: the sport is the *example*, never the *prerequisite*. If a lesson can't be followed by someone who has never watched a game, the copy is wrong.

**Every course ends job-ready** — a portfolio artifact a hiring manager can open, plus an interview module covering what actually gets asked for that skill.

### Grading available per course

| Course | Graded by | Notes |
|---|---|---|
| SQL | Live execution (sql.js) | Real queries against a seeded database |
| Python | Live execution (Pyodide) | Real code, including pandas |
| R | Live execution (WebR) | Real code, including dplyr |
| Statistics | `mc` / `fill` + Python | Compute the stats in Python where it helps |
| Excel | Live execution (fast-formula-parser) | Real formulas against a real workbook |
| Tableau / Power BI | `mc` / `fill` + guided builds | No runtime — follow along in the real tool |
| Git & GitHub | `mc` / `fill` | Command-assembly drills |
| LLMs / AI | `mc` / `fill` + Python | Prompt critique plus API code in Pyodide |

Tableau and Power BI cannot execute in the browser. Those courses teach through guided builds against a downloadable dataset, framed honestly as "follow along in the real tool" — never a fake simulator.

Excel **can** now execute: `lib/excel-engine.ts` evaluates real formulas against the two-sheet workbook in `lib/excel-data.ts` and grades on the value produced, so learners write `=SUMIF(...)` and see the answer rather than picking it from a list. The engine is MIT-licensed — the more complete HyperFormula is GPL-3.0-only and would force this whole app to GPL, so it is permanently off the table.

---

## Course 1 — SQL

**Outcome:** query a real relational database confidently, from `SELECT` to window functions, and pass a SQL screen.
**Depth:** beginner → advanced · 72 lessons

### 1.1 Reading Data (8)
1. What a database actually is — tables, rows, columns · *a stat sheet is a table*
2. Table grain: what one row represents · *one row = one player-week*
3. `SELECT *` and reading a whole table · *pull the full box score*
4. Selecting specific columns · *just name, team, points*
5. Column aliases with `AS` · *rename `fantasy_pts` to `PPG`*
6. `LIMIT` and sampling · *peek at 5 rows before pulling 5 million*
7. `DISTINCT` — unique values · *how many teams are in this dataset?*
8. Comments and query formatting · *readable SQL is a team sport*

### 1.2 Filtering (9)
1. `WHERE` and equality · *one player's game log*
2. Strings vs numbers, quoting rules · *why `'KC'` needs quotes and `22.4` doesn't*
3. Comparison operators · *every week over 20 points*
4. `AND` — narrowing · *RBs who scored 20+ at home*
5. `OR` and the precedence trap · *QBs or TEs, and why parentheses matter*
6. `IN` — matching a list · *the four teams in your division*
7. `BETWEEN` — inclusive ranges · *weeks 10 through 14*
8. `LIKE` and wildcards · *every player whose name starts with "Ja"*
9. `NULL` and why `= NULL` never works · *the injury column is blank, not zero*

### 1.3 Sorting & Limiting (5)
1. `ORDER BY`, `ASC` vs `DESC` · *rank the scoring leaders*
2. Sorting by multiple columns · *by position, then by points*
3. `ORDER BY` + `LIMIT` — every top-N question · *top 10 receivers*
4. `OFFSET` and pagination · *page 2 of the waiver wire*
5. The tie-break problem · *two players tied at the cutoff — who makes the list?*

### 1.4 Aggregation (9)
1. `COUNT` — how many rows · *how many games did he play?*
2. `SUM`, `AVG`, `MIN`, `MAX` · *season total, per-game average, career day*
3. `ROUND` and number formatting · *18.4, not 18.400000001*
4. `GROUP BY` — one row per group · *totals per player*
5. Grouping by multiple columns · *per player, per season*
6. `HAVING` vs `WHERE` — the classic interview question · *filter groups, not rows*
7. `COUNT(*)` vs `COUNT(column)` and NULLs · *the difference that bites*
8. Conditional aggregation with `CASE` · *count only home games*
9. Share-of-total · *what percentage of team targets did he get?*

### 1.5 Joins (10)
1. Why data lives in multiple tables · *rosters, schedules, results*
2. Primary and foreign keys · *what links a player to a team*
3. `INNER JOIN` · *attach each player's team name*
4. Table aliases and qualified columns · *`w.player` vs `r.player`*
5. `LEFT JOIN` · *keep every player, even the unrostered ones*
6. `RIGHT` and `FULL OUTER` joins · *and why you'll rarely use them*
7. Anti-joins — finding what's missing · *rostered players with no game log*
8. Joining three or more tables · *player → team → schedule*
9. Self-joins · *compare a player's week to his previous week*
10. Join fan-out, the silent row multiplier · *why your totals doubled*

### 1.6 Subqueries & CTEs (7)
1. Subqueries in `WHERE` · *players above the league average*
2. Subqueries in `SELECT` · *each player's points beside the team total*
3. `IN` vs `EXISTS` · *and when each is faster*
4. Derived tables · *aggregate, then filter the aggregate*
5. CTEs with `WITH` · *name your steps instead of nesting*
6. Chaining multiple CTEs · *build a season report in readable stages*
7. Recursive CTEs, a first look · *walk a playoff bracket*

### 1.7 Window Functions (9)
1. What a window function is, and why it isn't `GROUP BY` · *keep every row, add a ranking*
2. `OVER (PARTITION BY ...)` · *average within each position*
3. `ROW_NUMBER` · *number the weeks*
4. `RANK` vs `DENSE_RANK` · *how ties are handled*
5. Rank within a group · *WR1 through WR5 on each team*
6. `LAG` and `LEAD` · *this week versus last week*
7. Running totals · *cumulative points through the season*
8. Moving averages and window frames · *rolling 3-game form*
9. `NTILE` and bucketing · *split players into quartiles*

### 1.8 Real-World SQL (8)
1. `CASE` for bucketing · *label players Elite / Starter / Bench*
2. Date and time functions · *games in the last 30 days*
3. String functions · *split "Last, First" into two columns*
4. Type casting · *the points column arrived as text*
5. `COALESCE` and missing values · *treat a missing score as 0 — carefully*
6. `UNION` vs `UNION ALL` · *stack two seasons*
7. Reading a query plan · *why your query takes 40 seconds*
8. Indexes: what they do, when they help · *the one optimisation you'll be asked about*

### 1.9 Job-Ready SQL (7)
1. The 12 SQL questions asked in most interviews · *rapid-fire drills*
2. Second-highest value, four ways · *the classic whiteboard problem*
3. Duplicate detection and removal · *the same game logged twice*
4. Writing SQL a reviewer will approve · *formatting, CTEs, naming*
5. Debugging someone else's query · *inherit a 200-line report and fix it*
6. Explaining your query out loud · *the part candidates fluff*
7. **Capstone:** a season analytics report built from raw tables

---

## Course 2 — Excel

**Outcome:** do real analysis in the tool most jobs actually run on, and stop being the person who does it by hand.
**Depth:** beginner → advanced · 52 lessons

### 2.1 Foundations (7)
1. Workbooks, sheets, cells, ranges · *one sheet per season*
2. Data types, and why numbers arrive as text · *the import that breaks every formula*
3. Relative vs absolute references · *the number one beginner bug*
4. Named ranges · *`ROSTER` beats `Sheet1!$A$2:$D$60`*
5. Formatting that aids reading, not decoration · *make the leaders obvious*
6. Freeze panes and navigating big sheets · *17 weeks by 400 players*
7. The 15 keyboard shortcuts worth memorising · *speed is a real skill here*

### 2.2 Core Formulas (9)
1. `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT` · *season totals*
2. `COUNTA` and `COUNTBLANK` · *how many games were missed*
3. `IF` — conditional logic · *flag a 20-point game*
4. Nested `IF`, and when to stop · *and what to use instead*
5. `IFS` and `SWITCH` · *tier players cleanly*
6. `SUMIF` / `SUMIFS` · *total points at home only*
7. `COUNTIF` / `COUNTIFS` · *how many 20-point games*
8. `AVERAGEIF` / `AVERAGEIFS` · *average against winning teams*
9. `ROUND`, `ROUNDUP`, `CEILING` · *and the rounding bug in every budget*

### 2.3 Lookups (8)
1. Why lookups exist · *two sheets, one player*
2. `VLOOKUP` and its limitations · *why it breaks when columns move*
3. `HLOOKUP` · *and why you'll rarely want it*
4. `INDEX` + `MATCH` · *the combination that survives edits*
5. `XLOOKUP` · *the modern replacement for all of the above*
6. Approximate match on sorted data · *bucket points into tiers*
7. Two-way lookup · *player by week*
8. `IFERROR` and lookup failures · *a missing player shouldn't break the sheet*

### 2.4 Data Cleaning (7)
1. `TRIM`, `CLEAN`, and invisible characters · *"Josh Allen " is not "Josh Allen"*
2. `LEFT`, `RIGHT`, `MID`, `LEN` · *pull the team code out of a string*
3. `TEXTSPLIT` and Text to Columns · *split "Last, First"*
4. `CONCAT` and `TEXTJOIN` · *build a display name*
5. Find & Replace with wildcards · *normalise team abbreviations*
6. Finding duplicates before removing them · *the same game entered twice*
7. Data Validation · *stop bad input at the door*

### 2.5 PivotTables (8)
1. What a PivotTable is — `GROUP BY` with a mouse · *totals per player in 10 seconds*
2. Rows, columns, values, filters · *the four wells*
3. Changing the aggregation · *sum vs average vs count*
4. Grouping dates and numbers · *by month, by points bucket*
5. Calculated fields · *points per game inside the pivot*
6. Slicers and timelines · *make it interactive*
7. `GETPIVOTDATA` · *and how to turn it off*
8. PivotCharts · *a chart that follows the pivot*

### 2.6 Analysis & Charts (7)
1. Choosing the right chart · *bar for comparison, line for time*
2. Formatting a chart people can read · *labels, units, no 3-D*
3. Combo charts and secondary axes · *volume vs efficiency*
4. Conditional formatting and data bars · *heat-map the schedule*
5. Sparklines · *a season trend inside one cell*
6. Sorting and filtering large tables · *the tools before Pivot*
7. `SUBTOTAL` and filtered aggregates · *totals that respect the filter*

### 2.7 Job-Ready Excel (6)
1. Structuring a workbook someone else can use · *inputs, calcs, outputs*
2. Documenting assumptions · *the tab that saves your reputation*
3. Auditing formulas and tracing precedents · *find the broken link*
4. Common Excel interview tasks · *timed drills*
5. When to stop using Excel · *the honest limits, and what comes next*
6. **Capstone:** a self-updating weekly report workbook

---

## Course 3 — Statistics

**Outcome:** reason about data honestly — know what a number supports, what it doesn't, and how to say so out loud.
**Depth:** beginner → advanced · 54 lessons

### 3.1 Describing Data (8)
1. Populations vs samples · *this season vs every season ever*
2. Mean, median, mode · *and which one a skew breaks*
3. Range, variance, standard deviation · *consistency vs boom-or-bust*
4. Percentiles and quartiles · *what "top 10%" actually means*
5. The shape of a distribution · *skew, and what causes it*
6. Outliers — detect, then decide · *the 60-point game*
7. Z-scores and standardising · *compare a QB to a kicker*
8. Summary tables that aren't misleading · *always report n*

### 3.2 Probability (7)
1. Probability basics · *what a 60% win probability means*
2. Independent vs dependent events · *back-to-back games*
3. Conditional probability · *win rate given a halftime lead*
4. Bayes' theorem, intuitively · *updating after new information*
5. Expected value · *the maths behind going for it on 4th down*
6. Common distributions · *normal, binomial, Poisson*
7. Simulation instead of algebra · *run the season 10,000 times*

### 3.3 Sampling & Uncertainty (7)
1. Why sample size dominates everything · *3-for-3 isn't elite*
2. Sampling bias · *only surveying the fans who stayed*
3. The Central Limit Theorem, plainly · *why averages behave*
4. Standard error vs standard deviation · *the one people mix up*
5. Building a confidence interval · *the range, not the point*
6. Reading a confidence interval correctly · *what it does not mean*
7. Regression to the mean · *the hot hand cools, and it isn't a jinx*

### 3.4 Hypothesis Testing (9)
1. The logic of a null hypothesis · *assume nothing changed*
2. p-values — what they are and aren't · *the most misused number in analytics*
3. Significance levels, and the arbitrariness of 0.05 · *a threshold, not a truth*
4. Type I and Type II errors · *false alarm vs missed signal*
5. One-sample t-test · *is this team above league average?*
6. Two-sample t-test · *home vs away scoring*
7. Paired tests · *before and after a coaching change*
8. Chi-square for categorical data · *does formation predict outcome?*
9. Multiple comparisons and p-hacking · *test 20 things, find one "significant"*

### 3.5 Relationships (8)
1. Correlation and what it measures · *targets vs points*
2. Correlation is not causation · *with real examples*
3. Confounding variables · *the third thing driving both*
4. Simple linear regression · *predict points from targets*
5. Reading regression output · *coefficients, R², p-values*
6. Multiple regression · *targets and snaps together*
7. Residuals, and what they reveal · *where the model is wrong*
8. Overfitting, plainly · *a model that memorised last season*

### 3.6 Experiments & Causality (7)
1. Why randomisation works · *the only clean way to claim cause*
2. A/B test design · *sample size before you start*
3. Reading an A/B result · *and when to stop peeking*
4. Observational data and its limits · *you can't randomise a trade*
5. Difference-in-differences · *compare the change, not the level*
6. Survivorship bias · *only studying players who lasted*
7. Simpson's paradox · *the trend that reverses when you split it*

### 3.7 Job-Ready Statistics (8)
1. Choosing the right test — a decision tree · *the flowchart worth memorising*
2. Communicating uncertainty to non-technical people · *saying "we're not sure" well*
3. Statistics interview questions · *rapid-fire drills*
4. Case study: "is this metric up?" · *the most common real question*
5. Case study: sizing an experiment · *how many weeks do we need?*
6. Red flags in someone else's analysis · *reviewing a colleague's work*
7. When the data can't answer the question · *saying so is the job*
8. **Capstone:** a full statistical write-up, caveats included

---

## Course 4 — Python

**Outcome:** write Python that loads, cleans, analyses and ships real data — the language most analytics jobs assume.
**Depth:** beginner → advanced · 64 lessons

### 4.1 Language Foundations (9)
1. Variables and assignment · *name a stat and reuse it*
2. Numbers vs strings, and the conversion trap · *"24.6" won't divide*
3. Booleans and comparison · *did he clear the threshold?*
4. Lists — ordered collections · *a roster*
5. Indexing and slicing · *first three weeks*
6. Dictionaries — key/value lookup · *player → points*
7. Sets and uniqueness · *how many distinct opponents*
8. Tuples and immutability · *a fixed (player, week) pair*
9. `None` and truthiness · *the missing value that isn't zero*

### 4.2 Control Flow & Functions (8)
1. `if` / `elif` / `else` · *tier a performance*
2. `for` loops over a collection · *process every player*
3. `while` loops, and when to avoid them · *and how to not hang the page*
4. `break`, `continue`, `range` · *loop control*
5. Writing a function with `def` · *package the logic once*
6. Arguments, defaults, keyword args · *flexible without being fragile*
7. Return values vs printing · *the distinction beginners miss*
8. Scope, and why your variable is undefined · *inside vs outside*

### 4.3 Working with Data Structures (7)
1. List comprehensions · *one line instead of five*
2. Dict comprehensions · *build a lookup on the fly*
3. `enumerate` and `zip` · *loop with an index, loop two lists together*
4. Sorting with `key` and `lambda` · *sort players by points*
5. `map` and `filter`, and why comprehensions usually win · *readability*
6. Nested structures · *a dict of lists of games*
7. Unpacking and multiple assignment · *clean tuple handling*

### 4.4 Files, Errors & Modules (7)
1. Reading and writing text files · *load a CSV by hand once*
2. The `csv` module · *before pandas, understand the format*
3. JSON, and why APIs speak it · *parse a stats API response*
4. `try` / `except` — handling failure · *a missing file shouldn't crash the report*
5. Raising your own errors · *fail loudly on bad input*
6. Imports, modules, and the standard library · *don't rewrite what exists*
7. Virtual environments and `pip` · *the setup step every tutorial skips*

### 4.5 pandas Core (10)
1. What a DataFrame is · *a table with superpowers*
2. `read_csv` and first-look methods · *`head`, `info`, `describe`*
3. Selecting columns and rows · *`[]`, `.loc`, `.iloc`*
4. Boolean filtering · *pandas' `WHERE`*
5. Sorting with `sort_values` · *pandas' `ORDER BY`*
6. Adding and deriving columns · *points per target*
7. `groupby` and aggregation · *pandas' `GROUP BY`*
8. Multiple aggregations with `.agg` · *sum, mean and count at once*
9. `merge` — joining DataFrames · *pandas' `JOIN`*
10. `concat` — stacking data · *combine two seasons*

### 4.6 Cleaning Real Data (8)
1. Missing values — find them first · *`isna`, `sum`*
2. Dropping vs filling · *and the judgement call between them*
3. Type conversion and `astype` · *the numeric column that's text*
4. String methods on columns · *`.str.strip()`, `.str.split()`*
5. Dates with `to_datetime` · *parse the game date*
6. Duplicates — detect and remove · *the same game logged twice*
7. Renaming and reordering columns · *make the output readable*
8. Reshaping: `pivot`, `melt` · *wide vs long, and when each is right*

### 4.7 Visualisation in Python (7)
1. matplotlib basics · *figure, axes, plot*
2. Line and bar charts · *trend and comparison*
3. Scatter plots and correlation · *targets vs points*
4. Histograms and distributions · *the shape of scoring*
5. Labels, titles, legends · *the difference between a chart and a screenshot*
6. Subplots · *four positions, one figure*
7. seaborn for statistical plots · *less code, better defaults*

### 4.8 Job-Ready Python (8)
1. Writing readable code — PEP 8, naming · *the reviewer is a person*
2. Structuring a script vs a notebook · *when each is right*
3. Refactoring a messy analysis · *turn 200 lines into functions*
4. Writing a first test · *prove the calculation is right*
5. Working with an API · *pull live stats over HTTP*
6. Automating a recurring report · *the thing that gets you promoted*
7. Python interview questions · *rapid-fire drills*
8. **Capstone:** an end-to-end analysis notebook, cleaned and documented

---

## Course 5 — R

**Outcome:** read and write the R that a huge share of public sports analytics is published in, and use it where it beats Python.
**Depth:** beginner → intermediate-advanced · 46 lessons

### 5.1 R Foundations (8)
1. Why R exists alongside Python · *stats-first by design*
2. Assignment with `<-`, and R's quirks · *what published code looks like*
3. Vectors — R's core type · *a season of scores*
4. Vectorised operations · *no loop needed*
5. Factors and categorical data · *positions, done properly*
6. Data frames · *the table type*
7. Indexing and subsetting · *`[ ]`, `$`, and `[[ ]]`*
8. Packages and `install.packages` · *the CRAN ecosystem*

### 5.2 dplyr (9)
1. The pipe `|>` · *read a chain in order*
2. `filter` — rows · *R's `WHERE`*
3. `select` — columns · *the name that confuses SQL people*
4. `arrange` — sorting · *R's `ORDER BY`*
5. `mutate` — derived columns · *points per target*
6. `summarise` — aggregation · *R's aggregate functions*
7. `group_by` + `summarise` · *R's `GROUP BY`*
8. Joins in dplyr · *`left_join`, `inner_join`, `anti_join`*
9. `case_when` — vectorised conditionals · *tier every player at once*

### 5.3 tidyr & Data Cleaning (6)
1. Tidy data — the principle · *one variable per column*
2. `pivot_longer` · *wide season table to long*
3. `pivot_wider` · *and back again*
4. Handling `NA` in R · *`is.na`, `na.rm`*
5. `separate` and `unite` · *split a combined column*
6. `distinct` and duplicate handling · *dedupe the game log*

### 5.4 ggplot2 (8)
1. The grammar of graphics · *data, aesthetics, geometry*
2. `ggplot` + `aes` · *the mapping layer*
3. `geom_point` — scatter · *targets vs points*
4. `geom_col` and `geom_bar` · *and the difference between them*
5. `geom_line` — trends · *a season arc*
6. Faceting · *one panel per position*
7. Scales, labels, and themes · *make it publishable*
8. Saving and exporting plots · *get it into a report*

### 5.5 Statistics in R (7)
1. Summary statistics · *`summary`, `mean`, `sd`*
2. `t.test` in R · *home vs away, in one line*
3. `lm` — linear regression · *R's native strength*
4. Reading `summary(model)` · *coefficients and significance*
5. Model diagnostics and plots · *check the assumptions*
6. `cor` and correlation matrices · *what moves together*
7. Simulation in R · *`sample`, `replicate`*

### 5.6 Job-Ready R (8)
1. R Markdown — analysis and write-up in one file · *the R superpower*
2. Reproducible reports · *knit it and send it*
3. Reading someone else's R · *the public analytics ecosystem*
4. Using nflverse and public sports packages · *real data, one line*
5. Writing functions in R · *package your own logic*
6. R vs Python — choosing per task · *an honest comparison*
7. R interview questions · *what actually gets asked*
8. **Capstone:** a reproducible R Markdown analysis report

---

## Course 6 — Tableau

**Outcome:** build dashboards a stakeholder can use without you in the room, and speak the BI language most analyst postings list.
**Depth:** beginner → advanced · 48 lessons
**Format note:** no browser runtime — every module is a guided build against a provided dataset, in real Tableau Public (free).

### 6.1 Getting Started (7)
1. What Tableau is for, and what it isn't · *BI vs analysis vs spreadsheets*
2. Tableau Public vs Desktop vs Server · *the honest licensing picture*
3. Connecting to a data source · *load the season CSV*
4. The interface — shelves, marks, cards · *the map of the tool*
5. Dimensions vs measures · *the distinction everything else depends on*
6. Discrete vs continuous (blue vs green) · *the thing that confuses everyone*
7. Your first chart in 90 seconds · *points by player*

### 6.2 Core Visualisations (9)
1. Bar charts and sorting · *the scoring leaderboard*
2. Line charts and dates · *a season trend*
3. Scatter plots · *targets vs points*
4. Maps · *team locations and travel*
5. Heat maps and highlight tables · *the schedule grid*
6. Histograms · *the shape of weekly scoring*
7. Dual-axis and combo charts · *volume against efficiency*
8. Box plots · *consistency by position*
9. Choosing the right mark type · *the decision that makes or breaks a viz*

### 6.3 Calculations (8)
1. Calculated fields · *points per game*
2. Aggregate vs row-level calculations · *the mistake that doubles your numbers*
3. Logical functions — `IF`, `CASE` · *tier players*
4. String and date functions · *clean names, extract the week*
5. Level of Detail (LOD) expressions: `FIXED` · *team total beside each player*
6. `INCLUDE` and `EXCLUDE` LODs · *the advanced BI interview topic*
7. Table calculations · *running total, percent of total*
8. Quick table calcs and their traps · *what "compute using" really changes*

### 6.4 Interactivity (7)
1. Filters — and the six kinds Tableau has · *the order of operations*
2. Quick filters and filter cards · *let the user drive*
3. Parameters · *let the user pick the metric*
4. Actions: filter, highlight, URL · *click a team, filter the page*
5. Sets and groups · *build your own cohorts*
6. Hierarchies and drill-down · *position → player → game*
7. Tooltips worth reading · *the detail on hover*

### 6.5 Dashboards (9)
1. Dashboard layout — containers and sizing · *the part everyone skips*
2. Fixed vs automatic sizing · *why it broke on their monitor*
3. Designing for one question · *a dashboard with a point of view*
4. Colour and accessibility in BI · *not red/green*
5. Titles, captions, and annotation · *explain the finding on the page*
6. Performance — why your dashboard is slow · *extracts, filters, calcs*
7. Mobile layouts · *because they'll open it on a phone*
8. Publishing to Tableau Public · *a shareable portfolio URL*
9. Storyboards · *walk a stakeholder through the argument*

### 6.6 Job-Ready Tableau (8)
1. Data prep before Tableau · *fix it upstream, not in calcs*
2. Joins vs relationships vs blends · *the modern data model*
3. Extracts vs live connections · *and when each is right*
4. Recreating a dashboard from a screenshot · *the classic take-home*
5. Dashboard critique — reviewing someone else's · *what a lead looks for*
6. Explaining a dashboard in an interview · *narrating your choices*
7. Building a portfolio on Tableau Public · *the profile hiring managers check*
8. **Capstone:** a published, interactive season dashboard

---

## Course 7 — Power BI

**Outcome:** build and model reports in the Microsoft stack, including real DAX — the BI tool most enterprises actually run.
**Depth:** beginner → advanced · 50 lessons
**Format note:** guided builds in Power BI Desktop (free, Windows).

### 7.1 Getting Started (7)
1. Where Power BI fits · *Desktop, Service, and the licensing reality*
2. The interface — report, data, model views · *three views, one file*
3. Connecting to data · *CSV, Excel, database*
4. Power Query basics · *the load-and-clean layer*
5. Your first visual · *points by player*
6. The Fields pane and field types · *what Power BI infers, and gets wrong*
7. Saving, publishing, and sharing · *the .pbix lifecycle*

### 7.2 Power Query & Cleaning (8)
1. The Query Editor, and why transforms are recorded steps · *reproducible cleaning*
2. Removing rows, columns, and errors · *first-pass cleanup*
3. Changing data types · *the text-that-should-be-a-number problem*
4. Split, merge, and extract columns · *parse the player name*
5. Unpivot — the transform people forget · *wide season table to long*
6. Append vs merge queries · *stack seasons, or join tables*
7. Parameters and reusable queries · *point it at a new season*
8. Refresh, and what breaks it · *the report that died on Monday*

### 7.3 Data Modelling (8)
1. Why a data model beats one flat table · *the core BI idea*
2. Star schema — facts and dimensions · *the shape to aim for*
3. Relationships and cardinality · *one-to-many, and why it matters*
4. Filter direction and cross-filtering · *how a click propagates*
5. Bidirectional filtering, and its dangers · *the ambiguity trap*
6. Date tables — why you need a real one · *time intelligence depends on it*
7. Hiding fields and model hygiene · *a model someone else can use*
8. Model documentation · *what the next analyst needs*

### 7.4 DAX (11)
1. What DAX is, and how it differs from Excel formulas · *row context vs filter context*
2. Calculated columns vs measures · *the distinction that defines DAX*
3. `SUM`, `AVERAGE`, `COUNTROWS` · *basic measures*
4. `CALCULATE` — the most important function · *change the filter context*
5. `FILTER` inside `CALCULATE` · *conditional aggregation*
6. `ALL` and removing filters · *percent-of-total*
7. Row context and `SUMX` · *iterators, explained plainly*
8. `RELATED` and crossing tables · *pull the team name into the fact table*
9. Time intelligence: YTD, prior period · *season-to-date scoring*
10. `DIVIDE` and safe division · *avoid the divide-by-zero*
11. Variables with `VAR` · *readable, faster DAX*

### 7.5 Visuals & Reports (8)
1. Core visual types and when to use them · *the chart decision, again*
2. Formatting for readability · *labels, units, spacing*
3. Slicers and sync slicers · *filter across pages*
4. Drillthrough pages · *right-click into detail*
5. Bookmarks and buttons · *build navigation*
6. Conditional formatting · *heat-map the table*
7. Tooltips and report page tooltips · *rich hover detail*
8. Themes and consistency · *a report that looks designed*

### 7.6 Job-Ready Power BI (8)
1. Report performance — Performance Analyzer · *find the slow visual*
2. Common DAX interview questions · *`CALCULATE` shows up every time*
3. Row-level security · *the enterprise requirement*
4. Deploying to the Service, workspaces, apps · *how it reaches users*
5. Version control for .pbix files · *the honest state of it*
6. Recreating a report from a spec · *the classic take-home*
7. Power BI vs Tableau · *an honest comparison for interviews*
8. **Capstone:** a modelled, multi-page season report with DAX measures

---

## Course 8 — Git & GitHub

**Outcome:** work like a professional on a team — version control, branches, pull requests, and a portfolio a hiring manager can actually open.
**Depth:** beginner → intermediate-advanced · 40 lessons

### 8.1 Version Control Basics (8)
1. What version control solves · *the end of `final_v3_REAL.py`*
2. Installing Git and first-time setup · *name, email, editor*
3. `git init` and the repository · *what the `.git` folder is*
4. The three states: working, staged, committed · *Git's mental model*
5. `git status` — the command you'll run most · *read the output properly*
6. `git add` — staging changes · *why it's a separate step*
7. `git commit` and writing a message worth reading · *"fix bye-week double count"*
8. `git log` and reading history · *what happened and when*

### 8.2 Working with Changes (7)
1. `git diff` — see what changed · *before you commit*
2. Undoing uncommitted changes · *`restore`, and what it destroys*
3. Amending the last commit · *fix the message or add a file*
4. `git reset` — soft, mixed, hard · *the one that scares people*
5. `git revert` — undoing safely in shared history · *the right tool on `main`*
6. `.gitignore` · *never commit secrets or `node_modules`*
7. The leaked-secret problem · *rotate the key; history keeps everything*

### 8.3 Branching & Merging (8)
1. What a branch is · *a parallel line of work*
2. Creating and switching branches · *`switch -c`*
3. Merging a branch · *bring it back to `main`*
4. Fast-forward vs merge commits · *what the graph shows*
5. Merge conflicts — resolving one · *normal, not a failure*
6. Rebase, and when not to · *clean history vs shared history*
7. Branch naming and workflow conventions · *how teams actually organise*
8. Deleting merged branches · *keep the list meaningful*

### 8.4 GitHub & Collaboration (9)
1. Remotes: `origin`, `push`, `pull` · *local vs hosted*
2. Cloning an existing repo · *start from someone else's work*
3. `fetch` vs `pull` · *the difference that avoids surprises*
4. Pull requests — opening one · *propose, don't impose*
5. Writing a PR description reviewers thank you for · *what changed and why*
6. Code review — giving and receiving · *the professional skill*
7. Resolving review feedback · *push follow-up commits*
8. Issues and project boards · *how work gets tracked*
9. Forks and open-source contribution · *your first outside PR*

### 8.5 Job-Ready Git (8)
1. The README that does your hiring for you · *question, finding, how to run*
2. Structuring a data project repo · *data, notebooks, src, README*
3. Notebooks in Git — the diff problem · *and the usual fixes*
4. GitHub Pages for a portfolio site · *free hosting for your work*
5. GitHub Actions, a first look · *run checks automatically*
6. Git interview questions · *branch, merge, revert, conflict*
7. Recovering from disaster · *`reflog` and getting work back*
8. **Capstone:** a public, documented analysis repo with real commit history

---

## Course 9 — LLMs & AI

**Outcome:** use AI as a working analyst does — as a tool with known failure modes — and build something real with an API.
**Depth:** beginner → intermediate-advanced · 44 lessons

### 9.1 How LLMs Actually Work (8)
1. What a language model is doing · *next-token prediction, plainly*
2. Tokens, context windows, and limits · *why long documents get truncated*
3. Training vs fine-tuning vs prompting · *three different levers*
4. Why models hallucinate · *the mechanism, not the mystique*
5. Temperature and sampling · *the determinism dial*
6. What models are genuinely good and bad at · *an honest capability map*
7. Model families and choosing one · *speed, cost, capability trade-offs*
8. Cost and latency basics · *what you're actually paying for*

### 9.2 Prompting Well (8)
1. Specificity, context, and constraints · *the three levers that matter*
2. Role and format instructions · *ask for the output shape you need*
3. Few-shot examples · *show, don't just tell*
4. Chain-of-thought and step-by-step reasoning · *when it helps*
5. Structured output — JSON that parses · *making the response usable*
6. Iterating on a prompt systematically · *change one thing at a time*
7. Prompt failure modes · *and how to diagnose them*
8. Critiquing a bad prompt · *drills on real examples*

### 9.3 AI for Analysts (8)
1. Generating SQL with an LLM — and verifying it · *never ship unread SQL*
2. Explaining someone else's code · *the highest-value everyday use*
3. Debugging with an LLM · *how to give it the right context*
4. Cleaning messy text data · *categorise 5,000 free-text notes*
5. Summarising documents responsibly · *what gets lost*
6. Drafting analysis write-ups · *first draft, not final*
7. Where NOT to use an LLM · *arithmetic, facts, judgement calls*
8. Verification habits · *the discipline that keeps you employable*

### 9.4 Building with the API (10)
1. API keys, environment variables, and safety · *never commit the key*
2. Your first API call in Python · *request and response*
3. System vs user messages · *shaping behaviour*
4. Handling the response object · *parse it properly*
5. Streaming responses · *why apps feel faster*
6. Error handling and rate limits · *build something that doesn't fall over*
7. Structured outputs and tool use · *let the model call your function*
8. Embeddings — what they are · *meaning as numbers*
9. RAG: retrieval-augmented generation · *answer from your own data*
10. Building a stats Q&A bot · *natural language to SQL, end to end*

### 9.5 Judgement & Job-Ready AI (10)
1. Evaluating LLM output systematically · *build a small eval set*
2. Bias in models and in training data · *where it comes from*
3. Privacy: what never goes in a prompt · *customer data, credentials*
4. AI policy at work · *what most companies actually require*
5. Attribution and honesty about AI use · *the professional norm*
6. The "AI wrote it" failure mode in interviews · *why you must understand your code*
7. Cost control in production · *caching, model selection, prompt size*
8. Where AI is heading for analyst work · *an honest, non-hyped read*
9. AI interview questions · *what hiring managers ask now*
10. **Capstone:** a working natural-language interface over a sports database

---

## Capstone projects

Each course closes with one portfolio artifact. Learners on the all-in-one pathway ship a combined capstone instead:

**The Season Report** — pull raw data with SQL, clean and analyse it in Python, validate the claim statistically, visualise it in Tableau or Power BI, publish the code to GitHub with a README, and write a short piece explaining the finding. One project touching every course, and a genuine interview talking point.

---

## Build status

Honest state of what exists in `lib/curriculum.ts` today versus this spec:

| Course | Spec'd | Built | Live runtime |
|---|---|---|---|
| SQL | 72 | **20 lessons (units 1–6, joins and windows now live)** | Yes — sql.js |
| Python | 64 | **11 lessons (units 7, 13, 14)** | Yes — Pyodide |
| Statistics | 54 | 3 lessons (unit 8) | No |
| Visualization (generic) | — | 3 lessons (unit 9) | No |
| Git & GitHub | 40 | 3 lessons (unit 10) | No |
| R | 46 | 3 lessons (unit 11) | Yes — WebR |
| Excel | 52 | **16 lessons (units 15–18)** | Yes — fast-formula-parser |
| Tableau | 48 | 0 | n/a |
| Power BI | 50 | 0 | n/a |
| LLMs & AI | 44 | 0 (unit 12 is a stub) | Planned — Pyodide |

**56 of 470 lessons exist** (the 3 visualization lessons in unit 9 are folded into Tableau/Power BI above, so they aren't counted here). The catalog page marks unbuilt courses "In build" rather than implying they're ready — keep it that way until the lessons land.

**Suggested build order**, by demand and by what the existing runtimes already support:

1. **Finish SQL** — the flagship, the runtime works, and it's the most-searched skill.
2. **Finish Python** — runtime works, second-most-demanded.
3. ~~**Excel**~~ — done: units 15–18 cover the grid and first formulas, logic and conditional math, lookups, and cleaning a bad export. Modules 2.5–2.7 of the spec (PivotTables, charts, job-ready workbooks) are **not** built — PivotTables in particular have no equivalent in the formula engine, so they need either a genuine guided-build treatment or an honest concept-only unit.
4. **Statistics** — no runtime needed, and it lifts the credibility of every other course.
5. **Tableau or Power BI** — pick one and do it properly; building both half-way is worse than one done well.
6. **Git** — short course, high job relevance.
7. **LLMs & AI** — fast-moving, so build it last and expect to revise it often.
8. **R** — real but niche; lowest priority unless the audience skews academic.
