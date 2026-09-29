# SQL curriculum redesign

Target: two SQL courses — **Foundations** (16 modules) and **Analytics** (25
modules) — taught one small idea at a time, problem first, with the learner
writing SQL constantly. Source brief: Duolingo's pacing, DataCamp's depth.

This doc is Pass 1: what exists, what the target is, what maps where, and what
has to be built before parts of the target are even teachable. Pass 2 (the
lesson contract) is [LESSON-GRAMMAR.md](LESSON-GRAMMAR.md).

## Where we actually are (measured 2026-09-29)

| | Foundations (`u1`–`u6`) | Analytics (`u19`–`u22`) |
|---|---|---|
| Lessons | 20 | 15 |
| Write-real-SQL drills | 36 | **7** |
| Multiple choice | 40 | **37** |
| Fill-in-the-blank | 17 | 16 |

Whole curriculum: 22 units, 74 lessons, 331 exercises (159 mc / 58 fill /
43 query / 25 code / 46 formula).

**What is already good, and should not be "fixed":**

- **Prose is short.** Longest brief beat in the entire curriculum is 39 words;
  the average is 20–33. The walls-of-text problem the brief describes is not
  the problem we have.
- **The lesson shape already matches the target.** `brief.steps` is
  hook→teach→show, `intro`/`film` is the explanation, `exercises` is practice,
  `explain` is feedback. No engine work is needed for Foundations.
- Every live lesson has a paced walk-in (74/74, 156 beats), questions are
  already situation-based rather than vocabulary lookups, and misses re-queue.

**The real problems:**

1. **Analytics is 71% multiple choice with 7 hands-on drills in 15 lessons.**
   You can finish "Advanced SQL" having written almost no SQL. This is the
   single biggest gap against the brief.
2. **Coverage.** 6 modules where the target has 16; 4 where it has 25.
3. **No difficulty ladder inside a concept.** A concept gets an mc and a query
   drill. Nothing walks recognition → completion → modification → creation →
   application. See LESSON-GRAMMAR.md.
4. **Window functions sit in Foundations** (`u6`). The target puts them in
   Analytics as its flagship module. Moving them makes Foundations finishable
   by a beginner and gives Analytics its centrepiece.

## Scale, stated honestly

16 + 25 modules at ~5 lessons each is **~200 lessons and ~1,000 exercises**,
against 35 SQL lessons today. Every `query` answer key has to run green in
`scripts/verify-answer-keys.mjs`. This is a content programme measured in
months of writing, not a single change. Plan it module by module.

## Module map

Status key: **keep** (content survives, light edit) · **rewrite** (same topic,
rebuilt to the grammar) · **split** · **new** · **blocked** (needs engine or
data work first).

### Course 1 — SQL Foundations

| # | Module | From | Status |
|---|---|---|---|
| 1 | Databases & SQL fundamentals | `u1-l1` walk-in | rewrite → own module |
| 2 | Your first queries (SELECT/FROM/alias/DISTINCT) | `u1` | **rewrite — pilot, `f2`** |
| 3 | Filtering (WHERE, BETWEEN, IN, LIKE, precedence) | `u2` | rewrite + expand |
| 4 | Sorting & limiting (+ pagination) | `u3` | keep + expand |
| 5 | NULL & missing data | — | new |
| 6 | Calculations & CASE | — | new |
| 7 | Functions (aggregate/string/date/numeric) | part of `u4` | split out |
| 8 | GROUP BY & HAVING | `u4` | rewrite |
| 9 | JOINs (largest module) | `u5` | rewrite + **needs tables** |
| 10 | Subqueries | — | new |
| 11 | Set operations | — | new |
| 12 | Data modification (INSERT/UPDATE/DELETE) | — | **blocked** |
| 13 | Creating & altering tables | — | **blocked** |
| 14 | Data cleaning with SQL | — | new |
| 15 | SQL debugging | — | new |
| 16 | Beginner capstone | `lib/finals.ts` | rewrite |

### Course 2 — SQL Analytics

| # | Module | From | Status |
|---|---|---|---|
| 1 | Mental models (execution order, grain, cardinality) | — | new |
| 2 | CTEs | `u19` | keep + expand |
| 3 | **Window functions (flagship)** | `u6` (moves here) | rewrite + expand |
| 4 | Advanced aggregation (ROLLUP/GROUPING SETS) | — | new, **engine check** |
| 5 | Advanced JOIN strategies | — | new + needs tables |
| 6 | Advanced subqueries | — | new |
| 7 | Date & time analytics | — | new + **needs a date column** |
| 8 | Analytical SQL (KPIs, percentiles, Pareto) | — | new |
| 9 | Cohort & retention | — | new, **domain problem** |
| 10 | Advanced CASE | — | new |
| 11 | Cleaning & transformation (JSON, pivot) | — | new, **engine check** |
| 12 | Temp tables & intermediate data | part of `u19` | split |
| 13 | Views | `u20` | keep |
| 14 | Performance & optimization | `u22` | rewrite |
| 15 | Indexing | `u22` | split + expand |
| 16 | Transactions & concurrency | — | **blocked** |
| 17 | Database design & modelling | — | new (concept-heavy) |
| 18 | Data warehousing | — | new (concept-heavy) |
| 19 | JSON & semi-structured | — | **engine check** |
| 20 | SQL + Python + BI | `u14` overlaps | new (cross-course) |
| 21 | Fraud, risk & anomaly detection | — | **scope question** |
| 22 | Business analytics | — | new, **domain problem** |
| 23 | Interview problem patterns | `lib/interview-cases.ts` | wire up |
| 24 | Professional practices | — | new |
| 25 | Advanced capstone | — | new |

Not in the target list but live today: **`u21` Triggers**. Keep it as an
appendix or drop it; it does not belong in an analyst path.

## What blocks parts of this

1. **DML and DDL can't be graded.** Grading runs the learner's SQL and the
   answer key and compares returned rows (`lib/sql-grade.ts`). `INSERT`,
   `UPDATE`, `CREATE TABLE` return no rows, and `verify-answer-keys.mjs`
   *fails* any key returning zero rows — correctly, since that's almost always
   a broken key. Modules 12, 13, 16 (and MERGE/upserts in 18) need a grader
   that runs the statement, then runs a verification `SELECT` and compares
   *that*. Roughly: add `verifySql` to `QueryExercise`, plus a fresh DB per
   attempt so a learner's `DELETE` can't poison the rest of the drive.
2. **Column names are invisible to grading.** `normalizeResult` compares values
   only, so `SELECT player AS name` and `SELECT player` grade identical. Any
   lesson whose point *is* the column name — aliases, computed column naming —
   can't be graded by a `query` drill today. Needs an opt-in `columnsMatter`
   flag. The pilot teaches aliases with `fill`/`mc` to work around this.
3. **The database is three tables.** `week_results` (real, 876 rows, 20
   players, 2022–24) plus invented `rosters` / `waiver_wire`. The target's JOIN
   module is meant to be the largest in Foundations, and Analytics needs games,
   dates and injuries. nflverse has real schedules, team and injury data, so
   this is a `scripts/build-lesson-dataset.mjs` job, not an invention job.
   **There is no date column anywhere today** — Analytics module 7 is
   unteachable until games/schedules land.
4. **Engine checks needed** before writing against them: `ROLLUP` /
   `GROUPING SETS` (SQLite has neither — needs `UNION ALL` workarounds taught
   honestly, or the module reframed), JSON functions (json1 may or may not be
   in our sql.js build), `EXPLAIN QUERY PLAN` (SQLite has it, and it reads
   nothing like Postgres — teach it as "how to read *a* plan").

## Decisions I need from you

1. ~~Betting lines.~~ **Decided 2026-09-29: out.** The original brief listed
   them for the capstone. They are not going in — this is a career-change
   product for beginners, and gambling content changes how app stores, ad
   networks and employers read it. No odds, lines, spreads or wagering framing
   anywhere in the curriculum. `docs/CURRICULUM.md` already carried the same
   warning; this makes it a rule rather than a caution.
2. **Fraud/risk (Analytics 21) and cohort/retention (9), business analytics
   (22).** None are sports. Either they get a second non-sports dataset, or
   they get taught on sports analogues (retention = "which managers keep
   setting lineups"). The second is cheaper and keeps the premise.
3. **Other sports.** The brief says NBA/MLB/soccer "where appropriate". We have
   NFL data only, and CLAUDE.md forbids marking a sport live without a pipeline
   behind it. Recommend NFL-only wording until a dataset exists.
4. **Progress migration.** Restructuring changes lesson ids, and completed
   lessons are stored by id in localStorage. Beta learners would see progress
   reset unless we ship an id remap. Cheap now, expensive after launch.
5. **Do modules 12/13/16 make the cut?** They need the grader work in (1).
   They're also the least useful modules for an analyst job, which is mostly
   reading data, not writing it.

## The passes

1. **Architecture** — this doc. ✅
2. **Lesson grammar** — [LESSON-GRAMMAR.md](LESSON-GRAMMAR.md). ✅
3. **Pilot one module** — Foundations module 2 as unit `f2`
   (`lib/curriculum-foundations.ts`), reachable at `/learn/track/sql-foundations`
   and deliberately absent from the `/learn` catalog until the voice is signed
   off. ✅
4. **Voice review** — yours. Take the pilot, decide if it sounds like a person
   teaching you. Nothing scales until this is locked.
5. **Scale** — apply the locked grammar module by module, verifying keys each
   time. Order: finish Foundations 1–9 (the beginner spine), then Analytics 1–3
   (mental models, CTEs, windows), then the rest.
