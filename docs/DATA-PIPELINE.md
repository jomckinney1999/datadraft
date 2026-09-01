# Data Pipeline Plan

How SQL Sports gets real NFL data, keeps it fresh, and makes it fantasy-relevant
without breaking the lessons.

This is the plan for everything data-ingestion. `docs/LAUNCH-PLAN.md` Phase 3
gestures at "a real stats data pipeline"; this document is what that actually
means. Dependency-ordered, no calendar dates.

---

## 1. The one rule: pinned data and live data are different tiers

**Lesson data must never auto-update. Everything else should.**

This is the single most important decision in the document, and it is not
theoretical. When the lesson dataset was swapped from synthetic to real
(2022–2024 nflverse), the change broke:

- **12 lesson explanations** that quoted numbers true of the old data
  ("45 rows", "2,160 rows", "Tyreek Hill is WR1")
- **4 Excel answer keys** whose lookup targets were no longer on the roster
- one LEFT JOIN lesson whose premise (a bye week) no longer existed

Every one of those was silent. The SQL still ran; it just returned different
numbers than the prose claimed. An automated weekly refresh pointed at the
lesson database would reintroduce that failure **every single week**, and
learners would be the ones to find it.

| Tier | Surfaces | Update mechanism | Failure if stale |
|---|---|---|---|
| **Pinned** | Lesson player (`week_results`), Excel workbook | Manual rebuild: `scripts/build-lesson-dataset.mjs` → verifier → prose audit → commit | Cosmetic. A 2024 example still teaches JOINs fine. |
| **Live** | Practice Field, landing sandbox, Weekly Challenge, leaderboard | Scheduled cron → Supabase | Real. A "this week's challenge" on last month's data is broken. |

**Rule of thumb:** if a wrong number costs a learner a heart, it belongs in the
pinned tier. If a stale number just makes the product feel dead, it belongs in
the live tier.

Promoting a new pinned snapshot is a deliberate, reviewed act:

```bash
node scripts/build-lesson-dataset.mjs   # rebuild from source
node scripts/verify-answer-keys.mjs     # every key still runs and returns rows
# then: audit prose that quotes numbers (see §6, still manual today)
```

---

## 2. Current state — honest inventory

**What works:**

- `scripts/build-lesson-dataset.mjs` — pinned tier. Pulls nflverse
  `stats_player` weekly CSVs, writes `lib/lesson-data.generated.ts` and the
  learner CSVs in `public/data/`.
- `scripts/build-field-dataset.mjs` — Practice Field seed
  (`public/field-data.json`), same source, baked at build time.
- `app/api/cron/ingest-stats/route.ts` — the live tier's only job. Upserts into
  `nfl_player_stats` on `(player_id, season, week)`, so **re-running it is
  already safe**. Chunked at 500 rows for the PostgREST payload limit.
- `vercel.json` — one cron, Tuesdays 10:00 UTC. Correct instinct: nflverse
  publishes final weekly numbers after Monday night.
- `lib/data/sleeper.ts` — Sleeper wrappers (state, leagues, rosters, players),
  no auth needed.
- `lib/data-source.ts` — attribution and the real/invented labelling that `/data`
  renders.

**Two defects found while writing this — both real, neither urgent:**

1. **The cron is pointed at a dead release tag.** `lib/data/nflverse.ts` uses
   nflverse's older `player_stats` release, which stops at 2024. The two build
   scripts use the current `stats_player` tag. So the scheduled job would
   silently ingest nothing for 2025+ while appearing to succeed. Fix before any
   live surface depends on it (Phase A).
2. **Cron failures are silent.** The route returns an error payload; nothing
   reads it. A month of failed ingests looks identical to a month of no games.

**What does not exist yet:** freshness tracking, validation gates, alerting, any
projection or ownership data, and any use of Sleeper beyond type definitions.

---

## 3. Sources, and what each is actually good for

| Source | Gives us | Auth | Licence | Cost |
|---|---|---|---|---|
| **nflverse-data** | Weekly player stats, computed standard + PPR points, play-by-play, rosters, schedules | None | CC BY 4.0 (**attribution required**) | Free |
| **Sleeper API** | Player directory w/ injury status, **trending adds/drops**, leagues, rosters, matchups | None | Public API, no formal licence — respect their documented rate guidance | Free |
| **ESPN / Yahoo** | A user's own league | OAuth | ToS-restricted | Free tier |
| **Projections** | Weekly point projections | Varies | **Unresolved — see §8** | Varies |

**nflverse is the backbone.** It is free, complete, well-maintained, and already
credited on `/data`. Attribution is a licence obligation, not a courtesy — keep
`SHORT_CREDIT` wherever data is shown.

**Sleeper is the fantasy-relevance layer.** Raw stats tell you what happened.
Fantasy players care about what to *do*, and Sleeper's trending endpoint is the
closest free proxy for that:

```
GET https://api.sleeper.app/v1/players/nfl/trending/add?lookback_hours=24&limit=25
GET https://api.sleeper.app/v1/players/nfl/trending/drop?lookback_hours=24&limit=25
```

This is what finally makes `waiver_wire` a real table instead of an invented
one — see Phase B.

**Caution:** the Sleeper player directory is several MB of JSON and their docs
ask integrators to fetch it at most once per day and cache it. `lib/data/sleeper.ts`
already documents this. Honour it — it is the difference between a good
integration citizen and getting blocked.

---

## 4. What "fantasy relevant" concretely requires

Ranked by value-to-effort:

1. **Trending adds/drops** (Sleeper, free, easy) — powers a genuine waiver-wire
   surface and a weekly "who should you pick up" challenge.
2. **Injury status** (Sleeper player directory, free, easy) — makes any roster
   view feel current. A player list with no injury flags reads as a database
   dump.
3. **Current-week schedule and game state** (nflverse/Sleeper) — needed for
   anything that says "this week".
4. **Ownership %** — Sleeper trending is a proxy, not the real figure. True
   rostered% is platform-specific and not freely available. Label any derived
   number as a proxy rather than implying precision we do not have.
5. **Projections** — the biggest gap and the one with a licensing problem (§8).

**The honesty constraint carries over from `/data`:** anything derived or
proxied gets labelled as such, the same way `rosters` and `waiver_wire` are
labelled invented today. `PROVENANCE` in `lib/data-source.ts` is the mechanism
that already exists for this — extend it rather than inventing a second one.

---

## 5. Cadence and the freshness contract

Nothing should claim to be live without being able to say *how* live.

| Job | In-season | Off-season | Why |
|---|---|---|---|
| nflverse weekly stats | Tue + Wed 10:00 UTC | Weekly | Final numbers settle after MNF; Wed catches corrections |
| Sleeper trending | Every 6h | Off | Waiver activity is worthless if it is a week old |
| Sleeper player directory | Daily | Weekly | Their documented guidance |
| Pinned lesson snapshot | Manual, ~annually | — | §1 |

**Ship a freshness row, and show it.** A `data_freshness` table
(`source, season, week, fetched_at, row_count, status`) written by every job,
surfaced in the UI as "Stats through Week 7 · updated 2 hours ago". Two
benefits: learners trust it, and *we* can see a stalled pipeline without
reading logs.

Vercel Cron on the current plan allows limited invocations — a 6-hourly job is
fine, per-minute is not. Confirm the plan's cron limits before scheduling
anything tighter (§8).

---

## 6. Reliability: how this fails, and what stops it

Ingestion is where quiet corruption happens. Four gates, cheapest first:

**Gate 1 — Idempotency.** Already met: the cron upserts on
`(player_id, season, week)`. Preserve this property in every new job. Never
`insert` on a schedule.

**Gate 2 — Validation before promotion.** A job should refuse to publish
obviously-wrong data rather than upserting it. Concrete assertions:

- row count within a tolerance band of the same week last season
- no `fantasy_points_ppr` outside a sane range (the real 2022–24 range is
  −0.1 to 55.4)
- a handful of known-active players present
- week and season match what was requested

A bad upstream file is a real event, not a hypothetical: this codebase already
carries a comment about nflverse changing release tags mid-life.

**Gate 3 — Staging, then promote.** Write to `nfl_player_stats_staging`, run
the assertions, then promote in a transaction. Prevents a half-ingested week
being visible to learners mid-run.

**Gate 4 — Alerting.** The current job can fail silently forever. Minimum
viable: on failure, write a `status: "failed"` freshness row and send one email.
Do this before any user-visible surface depends on the live tier.

**Extend the existing verifier rather than adding a second one.**
`scripts/verify-answer-keys.mjs` already executes every SQL, Python and Excel
answer key against the real seeded data. The gap it does not cover is prose:
the 12 broken explanations in §1 were found by a manual audit. A
`scripts/audit-lesson-prose.mjs` that extracts numeric claims from `explain`
strings and re-checks them against query results would close the loop and make
a pinned-tier refresh routine instead of risky.

---

## 7. Phases

Dependency-ordered. Each one is shippable on its own.

**Phase A — Make the existing job correct.** Point `lib/data/nflverse.ts` at
the `stats_player` release tag so it does not silently stop at 2024. Add the
`data_freshness` table and write a row on every run. Add failure alerting.
*Unblocks everything else; nothing new is user-visible.*

**Phase B — Real waiver wire.** Add `getTrendingPlayers()` to
`lib/data/sleeper.ts`, a 6-hourly cron, and a `trending_players` table. Replace
the invented `waiver_wire` in the **live** surfaces only — the pinned lesson
table keeps its labelled, invented version so answer keys stay valid.
*First genuinely fantasy-relevant feature.*

**Phase C — Freshness in the UI.** Surface "stats through Week N" on `/field`,
the sandbox and `/data`. Cheap, and it is what makes the product feel alive.

**Phase D — Validation gates + staging/promote.** §6 gates 2 and 3. Do this
before the Weekly Challenge, which is the first surface where wrong data is
publicly embarrassing.

**Phase E — Weekly Challenge on live data.** The landing page already advertises
one. It needs C and D first, plus a defined scoring window and a tie-break rule.

**Phase F — Prose auditor.** `scripts/audit-lesson-prose.mjs` (§6), making
pinned-tier refreshes routine.

**Phase G — User league sync.** Sleeper first (no OAuth), ESPN/Yahoo later. This
is LAUNCH-PLAN Phase 5 and depends on accounts being real.

**Phase H — Other sports.** Basketball and baseball are labelled "building"
everywhere today and that is honest. Do not flip a sport to live until a
pipeline actually backs it — the same rule `CLAUDE.md` already states.

---

## 8. Open questions

1. **Projections licensing.** FantasyPros and similar have restrictive terms;
   Sleeper's projections endpoint is undocumented and could vanish. Options:
   ship without projections, compute our own naive baseline from trailing
   averages (defensible, transparent, and arguably a *better* teaching artefact
   because learners can build it themselves), or pay for a feed. **Leaning
   toward computing our own and being explicit that it is naive.**
2. **Vercel cron limits** on the current plan — confirm before scheduling
   6-hourly jobs.
3. **How much history to keep live.** Full play-by-play is large; weekly
   aggregates are small. Start with weekly only.
4. **Who is the Weekly Challenge for** — is it scored, ranked and public, or a
   solo prompt? Changes the data requirements substantially.
5. **In-season vs off-season detection.** Sleeper's `/state/nfl` gives week and
   season type; use it rather than hardcoding dates.

---

## Related

- [LAUNCH-PLAN.md](LAUNCH-PLAN.md) — Phase 3 is the parent of this document
- [`lib/data-source.ts`](../lib/data-source.ts) — attribution and provenance labels
- [`/data`](../app/data/page.tsx) — the learner-facing version of §3
