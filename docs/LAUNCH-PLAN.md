# DataDraft — Full Launch Plan

No calendar dates in this version — this is every phase of work needed to build the complete, fully realized product, ordered by dependency (what has to exist before the next thing can be built), not by a deadline. Where the previous 8-week-beta framing of this doc cut something for time, it's called out explicitly below and folded back in as a real phase.

Last updated: 2026-07-16.

---

## What changed from the time-boxed version

The prior version of this doc scoped a thin beta for a September deadline and explicitly cut five things to hit it. All five are back in, as full phases:

- **Real fantasy-platform sync** (ESPN/Sleeper/Yahoo) — now **Phase 5**
- **Server-side autograder** with golden datasets — now folded into **Phase 4**
- **Video lesson content** — now folded into **Phase 4**
- **A real live NFL stats data pipeline** (replacing the sandbox's synthetic data) — now **Phase 3**
- **Multi-sport / multi-language expansion** — now **Phase 11**, still correctly last: it depends on the flagship having real traction, per the reasoning already in `docs/PLAN.md`'s Big Picture Vision. That's a dependency, not an arbitrary deadline cut, so it stays last even with the clock removed.

Career Track's "intentionally small" scope was never a time cutback — that's a permanent business-model decision in `docs/PLAN.md` (1:1 review doesn't scale, and pretending otherwise would undercut the reason people pay $1–5K for it). Phase 7 builds *real operational tooling* around it, not a plan to make it mass-scale.

---

## Division of labor

I can write code, lesson copy, docs, marketing copy, and data pipeline logic. I cannot: create accounts requiring your identity/banking info (Stripe, Supabase, a stats-data vendor, Sleeper/ESPN/Yahoo developer registrations), appear on camera for video lessons, do outreach/sales/partnership calls, give real legal sign-off on Terms of Service, or make the underlying business decisions each phase surfaces (pricing calibration, what Career Track applicants get accepted, what leaderboard perks actually are). Each phase below flags the real decisions that are yours to make, not mine to assume.

---

## Phase 0 — Foundation Decisions

**Goal:** lock the decisions that are expensive to reverse once other phases build on top of them.

- **Backend stack.** Recommendation: Supabase (Postgres + built-in auth + storage in one provider — minimizes integration surface). Alternative: custom Node/Postgres + a separate auth provider (Clerk/NextAuth) if you want more control later at the cost of more moving parts now.
- **Payments provider.** Stripe — the standard choice, handles PCI compliance and subscription billing for you.
- **Real stats data vendor** — this decision gates Phase 3 entirely:
  - **nflverse / nflfastR** (free, open-source, community-maintained play-by-play data, weekly updates in-season) — recommended starting point given cost.
  - **SportsDataIO / Sportradar** (paid, more polished/supported, includes projections) — revisit once revenue justifies the cost.
  - **ESPN's undocumented endpoints** (free but unsupported and can break without notice) — avoid as a primary source; fine as a backup/cross-check.
- **Fantasy-platform integration order** (gates Phase 5): **Sleeper first** — it has a fully public API with no OAuth required, by far the easiest integration. ESPN and Yahoo both require real OAuth app registration and are meaningfully more work; sequence them after Sleeper proves the feature out.
- **Business entity, banking, and tax setup** — needed before real revenue flows, if not already in place.
- **Terms of Service, Privacy Policy, Refund Policy** — I can draft these; they need your (or a real lawyer's) sign-off before any real charge happens. Not optional once Phase 2 goes live.

---

## Phase 1 — Backend & Accounts

**Goal:** real users can sign up, log in, and be recognized across sessions and devices.
**Depends on:** Phase 0 (stack decision).

- Provision the chosen backend; schema for `users`, `subscriptions`, `progress`, `weekly_challenges`, `leaderboard_points`, `capstones`, `fantasy_platform_links`.
- Magic-link email auth (no passwords to manage/leak).
- Account page: profile, subscription status, connected fantasy platform (once Phase 5 exists).
- Session-aware nav — extends the `SiteNav` component already on the marketing site.

---

## Phase 2 — Payments

**Goal:** real money moves for all three tiers, correctly gated by subscription/purchase status.
**Depends on:** Phase 1 (a user must exist before a payment can attach to one).

- Stripe Checkout: Practice (recurring subscription), Roadmap (one-time), Career Track (application-gated — likely a deposit or full charge *after* acceptance, not open self-serve checkout, matching Phase 7's intake process).
- Webhooks syncing subscription status (active/canceled/past_due) into the database.
- Stripe's hosted billing portal for self-serve cancel/card-update — don't build this yourself.
- Transactional emails (receipts, welcome, renewal reminders) via a provider like Resend or Postmark.
- **Your decision:** exact Career Track payment structure (deposit vs. full charge vs. milestone-based) — a real business-model call, not a technical one.

---

## Phase 3 — Real Data Pipeline

> **See [DATA-PIPELINE.md](DATA-PIPELINE.md) for the detailed plan** — tiering (pinned lesson data vs live surfaces), sources and licensing, cadence, validation gates, and a dependency-ordered phase list. This section is the summary; that document is the plan of record.

**Goal:** replace the sandbox's synthetic, generated dataset with a real, automatically refreshing NFL stats pipeline — this single pipeline becomes the source of truth for the sandbox, the curriculum labs, and the Weekly Challenge.
**Depends on:** Phase 0 (vendor decision).

- Integrate the chosen data vendor; build a scheduled ETL job (e.g., a cron function) that pulls each week's stats after Monday Night Football concludes.
- Data-quality checks on ingestion — row counts, no duplicate players, bye weeks handled correctly. This mirrors the "gotcha" pedagogy already built into `docs/CURRICULUM.md`, now applied to production data reliability instead of just teaching content.
- Historical backfill across multiple past seasons, so DataDraft has genuine multi-year depth (the kind NFL Stat Guru already advertises) instead of the current 3-season synthetic dataset.
- This is the one phase everything else quietly depends on: once real, it upgrades the sandbox, every curriculum lab's "correct answer," and the Weekly Challenge simultaneously.

---

## Phase 4 — Full Curriculum Production

**Goal:** all 12 weeks of `docs/CURRICULUM.md` exist as real, deliverable content — including the two production-heavy pieces the time-boxed plan deferred.
**Depends on:** Phase 1 (progress tracking needs accounts), Phase 3 (labs need real data to check answers against).

- Write all lesson content (12 weeks × ~5 lessons) as real lesson pages, not just the syllabus outline.
- Build all labs with checkable answers.
- **Server-side autograder** (previously cut): golden-answer datasets per lab, a grading service that runs a learner's submitted query against the golden dataset and diffs the result precisely (column order, rounding, unspecified row order handled correctly) — a real step up from simple client-side result comparison.
- **Video lesson content** (previously cut): script, record, edit, and host a video per lesson. Decide the production quality bar *before* starting so all 12 weeks are consistent rather than drifting from Week 1 to Week 12. This is real camera time on you — budget for it explicitly rather than assuming it happens "in the background."
- The "season notebook" tooling from `docs/CURRICULUM.md` — a persistent per-learner workspace of saved queries, not just pass/fail on individual labs.
- Exit quizzes, War Room challenge sets, and the Week 6 midterm checkpoint, all built as real interactive content, not placeholders.

---

## Phase 5 — Fantasy Platform Sync

**Goal:** a learner queries *their own* real team/league, not just the sample dataset — this is a major differentiator and the clearest possible expression of the "useful before you're done" positioning already in `docs/PLAN.md`.
**Depends on:** Phase 1 (accounts to attach a synced league to), Phase 3 (a real data pipeline the synced league data joins against).

- **Sleeper first** (public API, no OAuth) — link a username/league ID, pull real roster/league data into the learner's own queryable schema.
- **ESPN Fantasy** next (semi-official, cookie-based — more fragile; budget extra hardening time and expect it to need maintenance as ESPN changes things).
- **Yahoo Fantasy** last (official OAuth API — the most "proper" integration, but the most setup overhead: app registration, OAuth consent flow).
- Decide refresh cadence for synced leagues (real-time vs. daily vs. weekly) — a cost/complexity tradeoff, not just a technical one.
- Privacy/security review: this pulls a user's real league data, which may include league-mates' names/info. Handle access tokens properly and think through what you're storing about people who never signed up for DataDraft themselves.

---

## Phase 6 — Weekly Challenge & Leaderboard, Full Version

**Goal:** move from "founder manually writes and grades one question a week" (the beta-scope version) to a real, automated, scalable engagement system.
**Depends on:** Phase 1 (accounts), Phase 3 (real data to generate questions from), optionally Phase 5 (for personalization).

- Auto-generate challenge questions from the real data pipeline via templated question types ("who led the league in X in week Y"), with answers computed automatically — removes the standing manual weekly labor the beta version required.
- Points system with streaks and badges.
- **Your decision:** what points actually unlock (discounts, a free month, recognition, something else) — this is a real business/marketing call, not something to leave undefined once the system is live.
- Personalized challenges once Phase 5 exists ("beat your own league's average this week" — much stronger hook than a generic global question).
- Friends/league-only leaderboard views alongside the public one — competing within your actual fantasy league is a more natural social hook than a global leaderboard of strangers.
- Notifications (email, and push if there's an app) for the Monday-night drop.

---

## Phase 7 — Career Track Operational Build-Out

**Goal:** a real, well-run *and still intentionally small* paid service — this phase builds tooling, not headcount.
**Depends on:** Phase 1, Phase 2 (payment/application flow), Phase 4 (there needs to be a completed Roadmap to base Career Track on).

- Application/intake form with a real acceptance rubric — keeps quality high for a deliberately small cohort by design, not first-come-first-served.
- Booking/scheduling (Cal.com or similar) for 1:1 reviews and mock interviews.
- A documented review rubric and resume/portfolio feedback template, so quality stays consistent even before you'd ever consider bringing on a second reviewer.
- A structured mini-syllabus for "application strategy support" instead of unstructured ad-hoc calls.
- A real, verifiable credential: a unique public URL a graduate can link on LinkedIn, not just a PDF that can't be checked.

---

## Phase 8 — Capstone & Certification System

**Goal:** the capstone tracks already fully specified in `docs/CURRICULUM.md`'s Capstone Project Briefs get real submission, review, and graduation infrastructure.
**Depends on:** Phase 1, Phase 4.

- Submission flow: repo/notebook link + README + a short form.
- A review queue with rubric-assist scoring against the 100-point rubric already defined in the curriculum doc.
- A public, opt-in showcase of graduate capstones — this doubles as real marketing material, and is what finally lets the landing page's Success Stories section replace its clearly-labeled illustrative examples with real ones.
- Certificate generation plus a public verification page, tying into Phase 7's credential work.

---

## Phase 9 — Quality, Testing & Operations

**Goal:** the product is reliable enough that real paying customers don't lose progress or hit broken payment flows. The current codebase has zero automated tests — this phase is not optional once real money and real user data are involved, and it should run continuously alongside every other phase above, not as a single late pass.

- Automated test suite: unit tests for the data pipeline and grading logic, integration tests for signup → pay → learn flows.
- CI pipeline running tests on every push before deploy.
- Error monitoring (e.g. Sentry) and uptime/health monitoring specifically on the Phase 3 data pipeline — a silent Monday pipeline failure breaks the entire weekly-drop promise the business is built on.
- Real customer support: the support widget already on the marketing site is UI-only; wire it to a real inbox/ticketing flow now that a real backend exists.
- Backup and disaster-recovery plan for the database — it now holds real payment history and learner progress, not just marketing copy.

---

## Phase 10 — Marketing & Growth Engine

**Goal:** a repeatable growth motion, not a one-time launch spike.

- A real content calendar across the Free-tier channels (YouTube/LinkedIn/Substack) — consistent cadence beats launch-week bursts.
- SEO pass on the marketing site.
- A referral program — a natural fit given the leaderboard/competitive mechanics already in Phase 6.
- A community space (Discord or similar) for learners — this is the "cohort/community" element `docs/PLAN.md` already identifies as something Career Track buyers specifically want.
- Cross-promotion beyond NFL Stat Guru — other fantasy football creators and communities.

---

## Phase 11 — Expansion

**Goal:** prove the "sports as a teaching lens" thesis generalizes — per the Big Picture Vision already in `docs/PLAN.md`.
**Depends on:** real traction (paying users, retention, a working Career Track cohort) from Phases 0–10. This is a dependency, not a deadline — don't start this phase to fill time; start it when the flagship has proven itself.

- Additional language: Python is the natural next step — huge existing demand, reuses the same fantasy-football dataset built out in Phases 3–5.
- Additional sport (basketball, soccer) for learners whose "Sunday obsession" isn't football.
- AI/ML content eventually — predicting performance, not just querying it — the "coding, AI, tech" part of the long-term mission.
- Keep this off the public marketing site until it's real, consistent with the existing decision in `docs/PLAN.md` not to overpromise a platform before the first product has proven itself.

---

## How the phases relate

Phase 0 gates everything. Phases 1 and 3 can run in parallel (accounts and data pipeline are independent of each other) but both gate Phase 4. Phase 2 needs Phase 1. Phase 5 needs Phase 1 and Phase 3. Phase 6 needs Phase 1 and Phase 3, and gets stronger once Phase 5 exists. Phase 7 and Phase 8 both need Phase 4 to have real content to review and certify. Phase 9 isn't really a phase at all — it's a discipline that should run underneath every other phase from Phase 1 onward, not a cleanup pass at the end. Phase 10 can ramp throughout, growing as there's more to promote. Phase 11 is last on purpose: it's gated on proof, not patience.

## How to use this doc

This replaces the time-boxed version of the launch plan — if a calendar/deadline framing is useful again later (e.g., committing to a specific season), rebuild it from this phase list rather than starting over, so the dependency ordering isn't lost.
