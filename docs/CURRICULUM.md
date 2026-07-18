# SQL Sports — 12-Week Curriculum

**Flagship program:** SQL & data analytics through fantasy football  
**Audience:** Complete beginner → job-ready analyst (or serious power user)  
**Format:** Structured like a premium immersive bootcamp — weekly modules, graded labs, live-season problem sets, and a portfolio capstone  
**Runtime:** 12 weeks · ~10–15 hours/week recommended  
**Primary language:** SQL (ANSI + Postgres dialect)  
**Domain dataset:** NFL + fantasy football (season, weekly, player, roster, league)

Last updated: 2026-07-16 (added set operations, string/date cleaning, ROLLUP/GROUPING SETS, and correlated subqueries to close real curriculum gaps; added full capstone project briefs with prompts/build plans/resume bullets; added Appendix D expert extensions; final fantasy-language pass)

---

## How to read this document

This is the **source outline** for the Roadmap / Career Track pathway. Marketing copy on the landing page compresses this into four skill phases; this doc is the full syllabus a $15–20k analytics bootcamp would hand a student on day one.

| Phase (marketing) | Weeks | Theme |
|---|---|---|
| Select & Filter | 1–3 | Foundations: schema literacy, SELECT, WHERE, ORDER BY |
| Joins & Matchups | 4–6 | Relational thinking: joins, multi-table analysis |
| Aggregations | 7–9 | Summarizing the season: GROUP BY, HAVING, CTEs |
| Window Functions + Portfolio | 10–12 | Analyst toolkit + capstone |

---

## Program outcomes

By graduation, a learner can:

1. **Model and query** a real sports analytics schema (players, games, weekly stats, fantasy scoring, rosters, waivers).
2. **Answer GM-style questions** with SQL — ranking, share-of-total, rolling trends, rookie-class-vs-veteran comparisons — without memorizing recipes.
3. **Debug** wrong results: grain mismatches, fanouts from joins, NULL traps, double-counting.
4. **Ship a portfolio project** (capstone) they can walk through in an interview in under 10 minutes.
5. **Speak like an analyst:** grain, keys, filters vs. aggregations, window vs. group, reproducible notebooks.

### What “SQL expert” means here

Not “memorized every obscure syntax.” Expert means every box below is checked — this isn't a marketing phrase, it's a checklist we hold ourselves to (see the full inventory in Appendix A):

- Confident on **reads** (SELECT / JOIN / CTE / window / quality checks)
- Fluent with **set operations** (UNION / INTERSECT / EXCEPT) as an alternative to joins
- Comfortable **cleaning messy real-world data** — string functions, date/week arithmetic, type casting
- Fluent in **advanced aggregation** (ROLLUP / GROUPING SETS), not just GROUP BY
- Can write and reason about **correlated subqueries**, not just joins and CTEs
- Fluent translating **fuzzy sports questions → precise queries**
- Ready for **entry-level analyst / analytics engineer interview SQL** — including the "expert extension" topics in Appendix D (recursive CTEs, LATERAL joins) that separate job-ready from actually advanced
- Able to extend into Python/BI later (out of scope for v1, but the mental model transfers)

We deliberately scope **reads only** — no INSERT/UPDATE/DELETE, no transactions, no schema design. That's not a gap, it's a choice: a fantasy analyst's job is answering questions with data that already exists, not administering the database. See the v1 scope guardrail below.

---

## Pedagogy (bootcamp standards)

| Principle | How it shows up |
|---|---|
| **Utility before mastery** | Every week includes at least one “Sunday-ready” query a learner can run on their own league |
| **Domain first, syntax second** | New concepts are introduced via a fantasy question the learner already cares about |
| **Real mess** | Byes, injuries, ties, trades, duplicate names, late scoring corrections — not Titanic.csv |
| **Active practice** | ~70% lab / sandbox time; ~30% conceptual teaching |
| **Spaced repetition** | Prior weeks’ patterns reappear in later labs under new covers |
| **Portfolio from week 1** | Learners keep a `season_notebook/` of saved queries; capstone grows from that archive |
| **Rubrics, not vibes** | Labs graded on correctness, grain awareness, readability, edge-case handling |

### Weekly rhythm (in-season)

| Day | Activity |
|---|---|
| Mon | Concept lesson + worked example (recorded or live) |
| Tue–Wed | Guided lab (sandbox, auto-checked) |
| Thu | Challenge set (“War Room” problems — harder, less scaffolding) |
| Fri | Peer review / office hours (Career Track) |
| Sat–Sun | **Live-week application** — new weekly data drop; lineup / waiver / start-sit queries |

Off-season cohorts substitute historical weeks and “mock slate” datasets for the live Friday drop.

### Time budget

- **Core path:** ~10 hrs/week  
- **Career Track stretch:** +3–5 hrs (portfolio polish, interview drills, resume story)

---

## Prerequisites

- None for SQL. Comfortable using a browser and typing.
- Helpful but not required: Excel/Sheets, fantasy football experience (strongly recommended — domain familiarity is the pedagogical lever).
- Tools provided: in-browser SQL sandbox, schema docs, starter notebooks. No local install required for weeks 1–9; optional Postgres local setup in week 11 for portfolio realism.

---

## Data assets (shared across the program)

Learners work against a documented schema that grows in complexity:

| Domain | Example tables | Notes |
|---|---|---|
| League structure | `leagues`, `teams`, `managers`, `rosters`, `roster_moves` | Fantasy side |
| Players & teams | `players`, `nfl_teams`, `positions` | Identity + metadata |
| Schedule | `games`, `weeks`, `bye_weeks` | Includes ties, postponements |
| Performance | `player_week_stats`, `team_week_stats` | Offensive + limited defensive |
| Fantasy scoring | `scoring_settings`, `fantasy_points` | PPR / half-PPR / standard variants |
| Market context | `adp`, `projections`, `injuries`, `snap_counts` | Introduced mid-program |
| Derived marts | `player_season_summary`, `matchup_context` | Built *by* learners in later weeks |

**Grain rules are taught explicitly** — every lab states the intended grain (e.g. “one row per player-week”).

---

## Assessment model

| Component | Weight | Notes |
|---|---|---|
| Weekly labs (auto + spot-check) | 40% | Must pass correctness checks |
| War Room challenges | 20% | Partial credit for approach |
| Mid-program checkpoint (Week 6) | 10% | Timed query set |
| Capstone (Weeks 11–12) | 25% | Rubric below |
| Professional habits | 5% | Notebook hygiene, README, reproducibility |

**Pass:** ≥70% overall + completed capstone  
**Credential:** SQL Sports Roadmap Certificate (Career Track adds portfolio review + mock interview sign-off)

### Capstone rubric (100 pts)

| Criterion | Pts |
|---|---|
| Question clarity & manager framing (fantasy manager or hiring manager) | 15 |
| Correct SQL / valid results | 30 |
| Grain & join correctness (no silent fanout) | 20 |
| Use of advanced patterns (CTE / window / quality checks) | 15 |
| Narrative & visualization-ready outputs | 10 |
| Reproducibility (params, comments, README) | 10 |

---

# Phase 1 — Select & Filter  
## Weeks 1–3 · “Can I pull the right rows?”

---

## Week 1 — Orientation: Thinking in Tables

**Fantasy hook:** *“Show me every WR who scored 15+ points last week.”*

### Learning objectives
- Explain what a relational table is (rows, columns, types, keys)
- Read a schema diagram and identify primary keys
- Write `SELECT`, column aliases, `LIMIT`
- Distinguish **filter** vs **sort** vs **project**
- Run queries in the sandbox; save results to a notebook

### Lessons
1. Why SQL (and why fantasy football is a good gym)
2. Schemas, keys, and grain — the three questions before every query
3. The SELECT clause: columns, `*`, aliases (`AS`)
4. First contact with `player_week_stats`
5. How fantasy points are *derived* (scoring settings → points)

### Labs
- **Lab 1.1:** Explore schema — list tables, describe columns, spot the PK
- **Lab 1.2:** Top 10 scorers last week (any position)
- **Lab 1.3:** Projection exercise — “which columns do I need for start/sit?”

### Sunday utility
Query last week’s top scorers by position for your league’s scoring format (starter notebook template provided).

### Exit criteria
Learner can write a correct `SELECT … FROM … LIMIT` and explain what one row in `player_week_stats` represents.

---

## Week 2 — Filtering Reality: WHERE, NULL, and Truth

**Fantasy hook:** *“Which RBs on bye this week should I avoid claiming?”*

### Learning objectives
- Write precise `WHERE` predicates (`=`, `<>`, `IN`, `BETWEEN`, `LIKE`)
- Combine filters with `AND` / `OR` and control precedence with parentheses
- Handle `NULL` correctly (`IS NULL` / `IS NOT NULL` / `COALESCE`)
- Filter dates/weeks safely
- Clean and standardize messy text (`TRIM`, `UPPER`/`LOWER`, `CONCAT`, `REPLACE`) so filters and joins don't silently miss rows
- Avoid the classic trap: filtering aggregated ideas too early (teaser for Week 7)

### Lessons
1. Predicates and boolean logic
2. NULL is not a value — three-valued logic in practice
3. Pattern matching and ID hygiene (player names vs stable IDs)
4. Bye weeks, inactive statuses, and injury flags as filters
5. String cleaning in practice: suffixes (Jr./II), punctuation, and team rebrands (the Redskins → Football Team → Commanders problem) as real join-key hygiene
6. Reading query plans at a glance (optional stretch: `EXPLAIN` intro)

### Labs
- **Lab 2.1:** Filter WRs with ≥5 targets and ≥10 points
- **Lab 2.2:** Players on bye *or* Out — exclusion list for waivers
- **Lab 2.3:** NULL hunt — find rows where `fantasy_pts` is missing and explain why
- **Lab 2.4:** Standardize player names and team abbreviations across two seasons of data (`TRIM`/`UPPER`/`REPLACE`) so a later join won't silently drop players

### War Room
Build a “do not roster” list for this week using bye + injury + inactive flags.

### Exit criteria
Learner can produce a correct filtered player list, articulate why `= NULL` is wrong, and clean a messy text column so it's safe to join or filter on.

---

## Week 3 — Ordering, Ranking Lite, and Readable Queries

**Fantasy hook:** *“Rank available WRs by targets over the last 3 weeks.”*

### Learning objectives
- Use `ORDER BY` (multi-key, `ASC`/`DESC`, `NULLS LAST`)
- Understand **stable sorts** and tie-breaking
- Write readable SQL (formatting, aliases, comments)
- Introduce `DISTINCT` and when it’s a smell
- Do date/week arithmetic safely (extracting season/week from a game date, ordering by date instead of a text column)
- Export results for Sheets / Discord decisioning

### Lessons
1. Sort semantics and deterministic output
2. Top-N patterns with `ORDER BY` + `LIMIT` (and their limits)
3. `DISTINCT` vs fixing the join (preview of Phase 2)
4. Date and week arithmetic: extracting season/week from `game_date`, and why sorting "Week 10" as text breaks after Week 9
5. Style guide for SQL Sports notebooks
6. Checkpoint: Phase 1 cumulative review

### Labs
- **Lab 3.1:** Position leaderboards for a chosen week
- **Lab 3.2:** Waiver wire board — free agents sorted by last-3-week points
- **Lab 3.3:** Refactor a messy query for readability (peer-comparable)
- **Lab 3.4:** Fix a leaderboard that's sorting weeks alphabetically ("Week 10" before "Week 2") using proper date/numeric ordering

### Mini-project (notebook)
**“Week 3 Lineup Helper v0”** — a documented query set that returns:
1. Your starters’ projected context (from provided projections table)
2. Top waiver adds by position  
No joins required beyond what was taught; use single-table or pre-joined teaching views if needed.

### Phase 1 checkpoint
Timed set (30–45 min): 5 queries covering SELECT / WHERE / ORDER BY / NULL.

---

# Phase 2 — Joins & Matchups  
## Weeks 4–6 · “Can I connect the right tables?”

---

## Week 4 — Relational Thinking & Inner Joins

**Fantasy hook:** *“Show me QB fantasy points next to their opponent’s pass defense rank.”*

### Learning objectives
- Explain one-to-many and many-to-one relationships
- Write `INNER JOIN` with explicit join keys
- Choose the correct grain after a join
- Detect fanout (row multiplication) early

### Lessons
1. Keys, foreign keys, and join predicates
2. `INNER JOIN` syntax and mental model (Venn is a metaphor, not a definition)
3. Joining `players` ↔ `player_week_stats` ↔ `games`
4. Matchup context: offense vs defense tables
5. Fanout autopsy — counting rows before/after joins

### Labs
- **Lab 4.1:** Player-week with team abbreviation and opponent
- **Lab 4.2:** QB points vs opponent secondary metrics
- **Lab 4.3:** Find and fix a deliberately broken join (wrong key / wrong grain)

### Sunday utility
“Start/sit with matchup” query for your QB/WR slots.

### Exit criteria
Learner can join 2–3 tables correctly and verify row counts against expected grain.

---

## Week 5 — Outer Joins, Anti-Joins, and Roster Logic

**Fantasy hook:** *“Which of my rostered players have no stats this week (bye/inactive)?”*

### Learning objectives
- Use `LEFT` / `RIGHT` / `FULL` joins appropriately
- Express anti-joins (`LEFT JOIN … WHERE right.key IS NULL` / `NOT EXISTS`)
- Model rosters, free agents, and “on team but no row this week”
- Prefer `NOT EXISTS` vs `NOT IN` with NULLs
- Combine result sets directly with `UNION` / `UNION ALL` / `INTERSECT` / `EXCEPT` as an alternative to joins

### Lessons
1. Preserving rows with outer joins
2. Anti-join patterns for waiver / bench diagnostics
3. Roster tables and effective dating (who was on the team *when*)
4. `EXISTS` / `NOT EXISTS` for semi-joins
5. Case study: trades mid-week and duplicated player rows
6. Set operations: `UNION`/`UNION ALL` (combine this week's offensive *and* defensive inactives into one list), `INTERSECT` (players who are *both* trending up *and* on the waiver wire), `EXCEPT` (rostered players *not* in this week's active lineup — a second way to write an anti-join)

### Labs
- **Lab 5.1:** All rostered players LEFT JOIN weekly points (include zeros/NULLs)
- **Lab 5.2:** Free agents = players not on any roster (anti-join)
- **Lab 5.3:** Managers who never set a lineup (attendance-style anti-join)
- **Lab 5.4:** Build a combined "inactive list" with `UNION`, then rewrite Lab 5.2's anti-join as an `EXCEPT` and confirm both return identical results

### War Room
Build a “roster health report”: bye, Out, and zero-snap players currently rostered.

### Exit criteria
Learner can explain when INNER drops rows, rewrite a problem as LEFT + filter or NOT EXISTS, and choose between a join, an anti-join, and a set operation for the same problem.

---

## Week 6 — Multi-Join Analysis & Midterm

**Fantasy hook:** *“For each matchup this week, who has the higher projected team total — and by how much?”*

### Learning objectives
- Join 4+ tables without losing the plot
- Use self-joins for opponent pairing / head-to-head
- Stage complex queries with subqueries (prep for CTEs)
- Mid-program assessment

### Lessons
1. Self-joins for H2H matchups
2. Bridging fantasy teams ↔ NFL games ↔ players
3. Subqueries in `FROM` / `WHERE` (readable patterns only)
4. Debugging checklist for multi-join queries
5. Midterm review workshop

### Labs
- **Lab 6.1:** H2H slate — each fantasy matchup with starters’ aggregate projections
- **Lab 6.2:** Self-join opponents table for “vs team X”
- **Lab 6.3:** Refactor a nested mess into clearer staging (subquery → upcoming CTE)

### **Midterm checkpoint (Week 6)**
Timed exam (60–75 min):
- 8–10 queries spanning Phases 1–2
- 1 short written: “What’s the grain of this result? What could go wrong?”

**Pass bar:** ≥70%. Remediation path: optional Week 6R lab pack before Phase 3.

---

# Phase 3 — Aggregations  
## Weeks 7–9 · “Can I summarize the season correctly?”

---

## Week 7 — GROUP BY & Aggregate Functions

**Fantasy hook:** *“Who are the season-long WR1s by average PPR points?”*

### Learning objectives
- Use `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`
- Group at the correct grain (`GROUP BY`)
- Know what must be aggregated vs grouped
- Filter groups with `HAVING` vs rows with `WHERE`

### Lessons
1. Aggregation mental model (collapse many rows → one)
2. `GROUP BY` rules and common errors
3. `WHERE` vs `HAVING`
4. Counting carefully: `COUNT(*)` vs `COUNT(col)` vs distinct counts
5. Season averages vs totals — when each lies

### Labs
- **Lab 7.1:** Season points and games played by player
- **Lab 7.2:** Position-week averages for the league
- **Lab 7.3:** HAVING — players averaging 15+ on ≥6 games played

### Sunday utility
“Rest-of-season standings” style rollup for your league’s scorers.

### Exit criteria
Learner writes correct grouped summaries and can debug “column must appear in GROUP BY.”

---

## Week 8 — Conditional Aggregation, Buckets & Share-of-Total

**Fantasy hook:** *“What % of my team’s points came from the WR slot?”*

### Learning objectives
- Use `CASE` inside aggregates
- Build category buckets (binning performance tiers)
- Compute share-of-total with joins to totals (pre-window approach)
- Pivot-lite with conditional aggregation
- Produce team + position + league subtotals in **one query** with `ROLLUP` / `GROUPING SETS`, instead of three separate `GROUP BY` queries stitched together by hand

### Lessons
1. `CASE WHEN` for labels and conditional sums
2. Performance tiers (WR1/WR2/WR3 by weekly rank thresholds — static version)
3. Share-of-total patterns without windows
4. Time buckets: by month, by stretch (weeks 1–4 vs 5–8)
5. Data quality: double-counting fantasy points across roster slots
6. `ROLLUP` / `GROUPING SETS`: one query that returns position subtotals, team totals, *and* the league grand total, with `GROUPING()` to tell the subtotal rows apart from the detail rows

### Labs
- **Lab 8.1:** Points by roster slot for a fantasy team
- **Lab 8.2:** Win rate by “boom week” definition (CASE buckets)
- **Lab 8.3:** Share of targets among a team’s WRs (pre-window)
- **Lab 8.4:** Rebuild Lab 8.1 as a single `ROLLUP` query returning position subtotals and the team grand total together

### War Room
Produce a one-page “team composition” report: points share by position, boom/bust counts.

### Exit criteria
Learner can answer composition questions with CASE + GROUP BY, verify totals add to 100%, and knows when a `ROLLUP` replaces three separate queries.

---

## Week 9 — CTEs, Clean Pipelines & Derived Marts

**Fantasy hook:** *“Build a reusable ‘player form’ table I can query every week.”*

### Learning objectives
- Write readable multi-step logic with `WITH` (CTEs)
- Prefer CTE pipelines over deeply nested subqueries
- Create derived tables / views for repeated analysis
- Write and reason about **correlated subqueries** — and know when a CTE + join is the clearer choice instead
- Document assumptions (scoring format, games played filters)

### Lessons
1. CTE syntax and scope
2. Staging: clean → enrich → aggregate → present
3. When to materialize (teaching: views vs tables)
4. Correlated subqueries: "players who beat their *own* season average in a given week" (a query that references the outer row) — and why this is a different tool than the joins/CTEs taught so far
5. Parameterizing week/season in notebooks
6. Phase 3 review

### Labs
- **Lab 9.1:** Refactor Week 8 share-of-total into a 3-CTE pipeline
- **Lab 9.2:** Build `player_form` CTE (last 3 / last 5 / season)
- **Lab 9.3:** Create a documented mart: `matchup_preview` for upcoming week
- **Lab 9.4:** Find every "boom week" defined as a player scoring 1.5× their own season average, using a correlated subquery — then rewrite it with a CTE + join and compare readability

### Mini-project
**“Form & Matchup Pack”** — a notebook that outputs, for a chosen week:
1. Hot/cold players by position  
2. Favorable matchups  
3. Waiver priorities ranked by form + opportunity (targets/carries)

### Phase 3 checkpoint
Ungraded self-test + optional graded challenge set.

---

# Phase 4 — Window Functions & Portfolio  
## Weeks 10–12 · “Can I analyze like a pro and prove it?”

---

## Week 10 — Window Functions I: Ranking & Partitions

**Fantasy hook:** *“Rank WRs within each week; find consistent top-12 finishers.”*

### Learning objectives
- Explain windows vs `GROUP BY` (keep detail rows)
- Use `RANK`, `DENSE_RANK`, `ROW_NUMBER`
- Partition correctly (`PARTITION BY`)
- Define weekly positional ranks for fantasy starts

### Lessons
1. Window frame mental model (simplified)
2. Ranking functions and ties
3. Positional weekly ranks (the WR12 problem)
4. “Started as WR1 vs finished as WR1” analysis
5. Performance pitfalls (indexing intuition — light touch)

### Labs
- **Lab 10.1:** Weekly rank within position
- **Lab 10.2:** Count of top-12 finishes per player YTD
- **Lab 10.3:** Identify busts — high ADP, low weekly ranks

### Sunday utility
“Consistency scoreboard” for your keepers / trade targets.

### Exit criteria
Learner produces positional ranks without collapsing to one row per player incorrectly.

---

## Week 11 — Window Functions II: Running Totals, LAG/LEAD, Moving Averages

**Fantasy hook:** *“Is this RB’s workload trending up — and did last week’s blowup change anything?”*

### Learning objectives
- Use `LAG` / `LEAD` for week-over-week change
- Compute running totals and moving averages
- Choose frame clauses (`ROWS BETWEEN`) intentionally
- Combine CTEs + windows for production-quality analysis

### Lessons
1. Offsets: prior week, next week
2. Running season totals
3. Moving averages (3-week form)
4. Framing: `ROWS` vs mental “range” (keep practical)
5. Capstone kickoff — briefs, data access, rubric

### Labs
- **Lab 11.1:** WoW point differentials
- **Lab 11.2:** 3-week moving average + season average side-by-side
- **Lab 11.3:** First time a player crossed season 100-point mark (running total)

### Capstone brief released
Learners choose **one** track (or propose a custom brief for approval):

| Track | Deliverable |
|---|---|
| **A. Waiver Edge** | Weekly ranked FA board with documented features (form, opportunity, matchup) |
| **B. Draft Kit** | ADP vs outcome study + value tiers for a chosen scoring format |
| **C. Manager Scorecard** | League analytics: lineup efficiency, waiver ROI, luck vs skill proxies |
| **D. Matchup Model Lite** | Start/sit engine with transparent rules (not ML — SQL feature layer) |

### Optional stretch
Local Postgres setup + `psql` / GUI; export marts for Tableau/Metabase (Career Track encouraged).

---

## Week 12 — Capstone Studio, Polish & Career Closeout

**Fantasy hook:** *“Ship something you’d put on a résumé.”*

### Learning objectives
- Scope an analysis to a clear question a fantasy manager (or hiring manager) actually cares about
- Deliver reproducible SQL + short narrative
- Defend methodology (grain, exclusions, scoring assumptions)
- (Career Track) Tell the interview story

### Schedule
| Block | Activity |
|---|---|
| Days 1–3 | Build: SQL, QA checks, draft README |
| Day 4 | Peer critique / instructor feedback |
| Day 5 | Polish: edge cases, visuals-ready CSVs, recording optional |
| Day 6–7 | Submit + Career Track mock interview (15–20 min walkthrough) |

### Capstone deliverables
1. **README** — question, audience, assumptions, how to run  
2. **SQL notebook / scripts** — CTE + window usage expected for Advanced mark  
3. **Outputs** — tables/charts data (CSV or sandbox snapshots)  
4. **1-page findings** — decisions a fantasy manager (or hiring manager) should care about  
5. **QA appendix** — row-count checks, known limitations  

### Career Track add-ons (same week)
- Resume bullet workshop from capstone language  
- Mock interview: live SQL + project defense  
- Application strategy: where this project sits in a portfolio sequence  

### Graduation
- Certificate issued on rubric pass  
- Capstone featured (optional opt-in) in SQL Sports showcase  
- Practice-tier alumni path: keep sandbox + weekly drops post-program  

---

## Capstone Project Briefs (Full Specs)

The one-line summaries in the Week 11 table are the pitch. These are the real briefs — handed to learners exactly like this, so the capstone is a genuine, defensible portfolio piece and not a toy exercise. Each includes the problem as a student would receive it, the required schema, the exact questions the project must answer, a build plan, rubric-aligned requirements, and a resume-bullet template they can adapt once it's done.

All four assume access to: `players`, `player_week_stats`, `games`, `rosters`, `roster_moves`, `scoring_settings`, `adp`, `projections`, `snap_counts`, plus any derived mart the learner builds along the way. Learners may propose a custom brief instead, subject to instructor approval against this same bar.

---

### Track A — Waiver Edge
**A weekly free-agent ranking tool a manager could actually use every Tuesday.**

**Prompt (as given to the learner):**
> Every league has 40+ free agents sitting on the wire, and most managers pick them based on last week's box score alone. Build a SQL pipeline that ranks available (non-rostered) players by a documented, defensible "waiver priority score" — one a manager could trust more than their gut on a Tuesday night. You are not building a black box: every factor in your score must be visible and explained.

**Your project must answer:**
1. Who are the top available players by recent form (a weighted L3/L5 average, not just last week)?
2. Who has rising opportunity (targets, carries, or snap share trending up) even if their raw points are still mediocre — the "before the breakout" signal?
3. Who has a favorable upcoming matchup (opponent's positional defense rank)?
4. What's the composite priority ranking, and how is it weighted — and can you defend that weighting?

**Build plan:**
1. Build a `player_form` CTE (L3 avg, L5 avg, season avg) — reuse the Week 9 pattern.
2. Build an `opportunity_trend` CTE (week-over-week change in targets/carries/snap share, via `LAG`).
3. Build a `matchup_quality` CTE joining upcoming opponent to a defense-rank table.
4. Anti-join against `rosters` to restrict to free agents only (Week 5 pattern).
5. Combine into a documented composite score (weights must be explicit constants, commented in the query).
6. Rank with `ROW_NUMBER`/`RANK`, output top 15.

**Rubric-aligned requirements:**
- At least one window function (ranking or trend) and one anti-join
- A multi-CTE pipeline (Week 9 style) — no unreadable nested subqueries
- Documented, justified scoring weights (not "because it felt right")
- QA check: confirm no rostered players leaked into the output; confirm no duplicate player rows

**Deliverables:** SQL notebook, `top_15_waiver_targets` output table, README (methodology + limitations), a 3-player written recommendation.

**Resume bullet template:**
> Built a SQL-based weekly waiver-wire ranking pipeline combining recent performance trends, opportunity share, and matchup context into a documented composite score — identified [N] priority pickups across a full NFL season of historical data.

---

### Track B — Draft Kit
**An ADP-vs-outcome study that makes next year's draft smarter.**

**Prompt (as given to the learner):**
> Every offseason, "ADP" (average draft position) tells you what people *thought* a player was worth — not what they turned out to be worth. Build a study that quantifies the gap: which players were steals relative to where they were drafted, which were busts, and where the real value cliffs are by position. This is the kind of analysis draft-kit content actually gets built from.

**Your project must answer:**
1. Which players outperformed their ADP-implied tier the most (biggest steals), and by how much?
2. Which players were drafted early and busted (biggest reaches)?
3. Where are the positional value cliffs (e.g., "RB1–4 were true difference-makers, then a drop-off")?
4. By draft round, what percentage of picks finished as a "startable" weekly scorer — and how does that hit rate change round to round?

**Build plan:**
1. Build `player_season_summary` (season totals, games played, points-per-game) — the derived mart from Week 9.
2. Join to `adp`, bucket players into ADP-implied value tiers (`CASE`, Week 8 pattern).
3. Define "steal"/"bust" as a documented function of (actual finish rank − ADP-implied rank); justify the threshold in the README, don't just pick a number.
4. Define "startable" explicitly (e.g., top-24 weekly finishes at the position) and compute round-by-round hit rate with `GROUP BY` + `HAVING`.
5. Rank steals/busts per position with a window function.

**Rubric-aligned requirements:**
- Window function ranking within position/tier
- `CASE`-based tiering plus `GROUP BY`/`HAVING` for the hit-rate summary
- Explicit, written definitions for "steal," "bust," and "startable" — a hiring manager should be able to disagree with your thresholds but not find them undefined
- QA check: row counts match expected player-season grain (one row per player per season)

**Deliverables:** value-tier table by position, "Top 10 Steals" / "Top 10 Busts" lists, round-by-round hit-rate table, README with methodology.

**Resume bullet template:**
> Analyzed [N] seasons of draft position and performance data in SQL to quantify bust/steal rates and positional value cliffs by draft round, using window functions and documented value-tier logic.

---

### Track C — Manager Scorecard
**Separating luck from skill for every manager in a league.**

**Prompt (as given to the learner):**
> Every league has a manager who "got lucky" and one who "got robbed" — but nobody backs it up with numbers. Build a scorecard for every manager that separates skill (lineup decisions, waiver activity) from luck (schedule variance), so a league's bragging rights are actually earned.

**Your project must answer:**
1. Lineup efficiency: what percentage of a manager's total available points did they actually start (points left on the bench)?
2. Waiver ROI: points gained from a manager's pickups vs. points lost from what they dropped?
3. A "luck score": how does a manager's actual record compare to their *all-play* record (their record if they'd played every other team, every week)?
4. A composite skill index combining the three — and a one-paragraph, human-readable profile per manager.

**Build plan:**
1. Lineup efficiency: join `rosters` (who was started) to `player_week_stats` (who scored what), aggregate started vs. total-available points per manager-week.
2. Waiver ROI: use `roster_moves` to identify adds/drops, join to subsequent weekly points, sum the delta.
3. All-play record: self-join every team's weekly score against every *other* team's weekly score for that week (Week 6 self-join pattern) to compute a hypothetical win rate; compare to actual record for the luck score.
4. Combine into one `manager_scorecard` table; rank managers by composite index.

**Rubric-aligned requirements:**
- A self-join (all-play calculation) and at least one window function (ranking managers)
- A full CTE pipeline: raw data → efficiency → waiver ROI → luck → composite
- An explicit small-sample-size caveat in the README (a 13-week season is not a lot of data — say so)
- QA check: every manager who existed all season appears exactly once in the final scorecard

**Deliverables:** `manager_scorecard` table (one row per manager), a written one-paragraph profile per manager, README with methodology and caveats.

**Resume bullet template:**
> Designed a SQL-based "luck vs. skill" analytics framework for a fantasy league, using self-joins and CTE pipelines to separate lineup-management performance from schedule variance across a full season.

---

### Track D — Matchup Model Lite
**A transparent, rules-based start/sit engine — no black box.**

**Prompt (as given to the learner):**
> Managers agonize over close start/sit calls every week, usually based on vibes. Build a start/sit recommendation engine that's entirely SQL — every input to the recommendation is visible and explainable, unlike a machine-learning model. Then prove it actually works by backtesting it against a real season.

**Your project must answer:**
1. Given two players in the same slot, what does recent form (weighted recent average) say?
2. What does matchup quality (opponent's positional defense rank) say?
3. What does opportunity/volume trend say?
4. Combined into one transparent "start score" — and when you backtest this rule against last season, how often would it have picked the actual higher scorer?

**Build plan:**
1. Reuse `player_form` and `matchup_quality` CTEs from Track A if applicable (this is a deliberate showcase of code reuse — a real analyst skill).
2. Combine into a single documented `start_score` formula (explicit weights, commented).
3. Build a query/view that takes two player IDs + a week and returns both players' scores and the recommendation.
4. **Backtest:** for every actual instance last season where two same-position players could have been compared, check whether `start_score` would have recommended the one who actually scored more. Report the hit rate.

**Rubric-aligned requirements:**
- Window function for recent-form calculation (moving average)
- `CASE`-based scoring logic, fully commented
- A genuine backtest query (this is the hard, valuable part — don't skip it) with a reported accuracy rate
- README explicitly states this is a heuristic feature layer, not a predictive model — ties to the program's ethics module on representing certainty honestly

**Deliverables:** the start/sit query or view, a backtest results table + reported hit rate, README with the explicit formula, weights, and limitations.

**Resume bullet template:**
> Built a transparent, rules-based SQL start/sit recommendation engine and validated it via backtesting against a full season of actual outcomes, reporting a [X]% accuracy rate against real results.

---

## Cross-cutting threads (all 12 weeks)

### 1. Data quality & analyst judgment
Every phase includes at least one “gotcha” lab: duplicate players, corrected scores, NULL fantasy points, join fanout, bye-week zeros vs missing rows.

### 2. Communication
Learners practice writing **question → query → answer in one paragraph**. Capstone grades narrative.

### 3. Scoring-format awareness
PPR vs half-PPR vs standard appears repeatedly so learners never hard-code “points” without naming the system.

### 4. Ethics & fairness (short modules)
- Don’t scrape against TOS; use licensed / provided datasets  
- Be careful with gambling-adjacent framing — SQL Sports teaches analysis, not betting systems  
- Represent uncertainty honestly in recommendations  

---

## Sample week detail (template for content authors)

Use this skeleton when writing full lesson content later:

```text
WEEK N — Title
Fantasy question:
Concept(s):
Schema objects touched:
Pre-work (≤20 min):
Lesson outline (45–60 min):
  1.
  2.
  3.
Guided lab (90 min):
  Tasks:
  Autograder checks:
War Room (60–90 min):
Sunday utility query:
Common mistakes:
Exit quiz (5 items):
Stretch:
```

---

## Mapping to product tiers

| Tier | Curriculum access |
|---|---|
| **Free** | Week 1 lessons + limited sandbox problems |
| **Practice** | Ongoing weekly problem sets + live data (not full graded pathway) |
| **Roadmap** | Full Weeks 1–12 + labs + capstone + certificate |
| **Career Track** | Roadmap + feedback, mock interview, portfolio/resume review |

---

## Staffing & delivery notes (internal)

| Role | Cadence |
|---|---|
| Curriculum lead | Owns this doc; updates post-season |
| Lesson authors | 1 week of content ≈ 1.5–2 weeks production |
| Autograder eng | Golden datasets + SQL result checks per lab |
| Instructors / TAs | Office hours; Career Track reviews |
| Data eng | Weekly ETL for live season drops |

**v1 scope guardrail:** teach **SQL analytics**, not full data engineering, not ML. Python/dbt/BI are future expansion axes (see `docs/PLAN.md`).

---

## Open curriculum questions

- Exact dialect support in sandbox (Postgres-only vs SQLite subset) — affects window frame coverage
- Whether Week 6 midterm is required for certificate or Roadmap-only
- Capstone: individual only vs optional pair for Career Track
- How aggressively to include defensive/IDP stats (complexity vs completeness)
- Off-season calendar: compressed 8-week variant vs full 12 with historical slates

---

## Appendix A — Skills inventory (checklist)

Learners should be able to check these off by Week 12:

**Foundation**
- [ ] SELECT / FROM / WHERE / ORDER BY / LIMIT
- [ ] NULL-safe filtering
- [ ] Schema & grain literacy
- [ ] String cleaning (TRIM / UPPER / LOWER / REPLACE / CONCAT) and date/week arithmetic

**Relational**
- [ ] INNER / LEFT joins
- [ ] Anti-joins / EXISTS
- [ ] Self-joins
- [ ] Fanout detection
- [ ] Set operations (UNION / UNION ALL / INTERSECT / EXCEPT) as an alternative to joins

**Aggregation**
- [ ] GROUP BY / HAVING
- [ ] Conditional aggregation (CASE)
- [ ] Share-of-total (join and window forms)
- [ ] ROLLUP / GROUPING SETS for multi-level subtotals

**Advanced**
- [ ] CTEs
- [ ] Correlated subqueries
- [ ] ROW_NUMBER / RANK / DENSE_RANK
- [ ] LAG / LEAD
- [ ] Running totals / moving averages

**Professional**
- [ ] Documented notebook
- [ ] QA checks
- [ ] Portfolio narrative
- [ ] A completed capstone from the Capstone Project Briefs, with a resume bullet drafted from it

**Expert Extensions (optional, Appendix D)**
- [ ] Recursive CTEs
- [ ] LATERAL joins / top-N-per-group
- [ ] Advanced window frames (gap-aware moving averages)
- [ ] FILTER clause for conditional aggregates

---

## Appendix B — Example progressive questions (spiral)

The same underlying fantasy decision, revisited with more power:

1. **W1:** List WRs who scored 15+ last week  
2. **W3:** Sort free-agent WRs by last-3-week points  
3. **W5:** Those FAs who are not on any roster  
4. **W7:** Season average ≥15 with ≥6 games  
5. **W9:** Form table (L3 / L5 / season) as a CTE  
6. **W10:** Weekly positional rank ≤12 in ≥50% of games  
7. **W11:** L3 moving average rising while season average flat (breakout detector)  
8. **Capstone:** Package into a weekly waiver product with README + QA  

---

## Appendix C — Alignment with landing-page phases

Keep marketing and curriculum in sync:

| Landing phase | Curriculum weeks | One-line promise |
|---|---|---|
| Select & Filter | 1–3 | Pull week results. Rank players. Learn WHERE before you memorize syntax. |
| Joins & Matchups | 4–6 | Connect rosters to schedules. Defense vs offense context. |
| Aggregations | 7–9 | Season totals, rolling form, share of team production. |
| Window Functions | 10–12 | Rank within position. Compare to league context. Ship the portfolio. |

If the landing page `ROADMAP` copy changes, update this appendix in the same PR.

---

## Appendix D — Expert Extensions (beyond the core 12 weeks)

The 12-week path makes someone genuinely job-ready. These four topics are the difference between job-ready and the analyst other analysts ask for help — real "expert" territory, not required for the certificate, but offered as graded stretch content for Roadmap/Career Track learners who want to keep going. Each ships with the same fantasy framing as the core program.

### D.1 — Recursive CTEs: tracing chains
**Fantasy hook:** *"This player was drafted by Team A, traded to Team B, then to Team C — walk the entire trade chain in one query."*

A `roster_moves` table (player, from_team, to_team, move_date) is inherently hierarchical — each move points to the next. A recursive `WITH` clause walks it without knowing in advance how many trades happened. Same pattern applies to a playoff bracket (each round's winner feeds the next) or a dynasty-league draft-pick lineage (this year's 2nd-round pick was originally whose?).

**Lab:** Given a player's full trade history, write a recursive CTE that outputs the complete ownership chain in order, with the number of hops from original owner to current.

### D.2 — LATERAL joins: efficient top-N-per-group
**Fantasy hook:** *"Top 3 waiver targets at every position — not just top 15 overall, which the Week 5 anti-join version can't guarantee is balanced."*

A `CROSS JOIN LATERAL` (or `OUTER APPLY` in some dialects) runs a correlated subquery *per row of the outer table* — the natural fit for "top N per group" without the row-multiplication problems of a naive join, and more efficient than a window function + filter on large tables.

**Lab:** Rebuild Track A's (Waiver Edge) top-15 list as "top 3 per position" using `LATERAL`, and compare the query plan to the window-function version from Week 10.

### D.3 — Advanced window frames
**Fantasy hook:** *"A 3-week moving average is easy. What about 'points scored in the last 3 games this player actually played,' skipping byes?"*

Deepens Week 11's `ROWS BETWEEN` into frame clauses that don't just count calendar weeks: `RANGE` vs `ROWS`, frame exclusion, and handling gaps (byes, injuries) so a "trailing 3 games" window doesn't quietly include a bye week's zero.

**Lab:** Fix a moving-average query that's silently including bye weeks as zero-point games, understating true form.

### D.4 — The `FILTER` clause: readable conditional aggregates
**Fantasy hook:** *"Home vs. away splits, without ten nested CASE statements."*

Postgres's `FILTER (WHERE …)` clause is a cleaner alternative to `CASE WHEN … THEN … END` inside aggregates once a query needs several conditional sums side by side — genuinely how working analysts write this once they know it exists.

**Lab:** Rewrite Week 8's conditional-aggregation lab using `FILTER` instead of `CASE`, and judge for yourself which is more readable at 5+ conditions.

**Note on scope:** D.1–D.4 assume Postgres (or a dialect supporting recursive CTEs and LATERAL). If the sandbox is SQLite-only, flag these as "concept + worked example" rather than graded labs — see the open dialect question below.
