# SQL Sports — 24-Week Launch Plan

Solo founder, ~20–30 hrs/week. Goal: a real, chargeable beta live for NFL kickoff (~8 weeks out), full v1 shipped by end of the NFL regular season (~24 weeks out). This is the schedule and the explicit scope tradeoffs to get there — not an aspirational everything-by-September plan, which isn't achievable solo at this capacity and would be dishonest to promise.

Start date: **Monday, July 20, 2026**. Dates below are real calendar weeks, aligned to the actual 2026 NFL season.

Last updated: 2026-07-16.

---

## The core bet

You cannot build the full 12-week certified program, real fantasy-platform integrations, a full autograder, and a staffed Career Track before September. Nobody could, solo, in 8 weeks. So the plan doesn't try.

Instead: **ship a real, honest, thin beta at kickoff, and let the weekly content-drop cadence — which is already your core engagement mechanic per `docs/PLAN.md` — cover for the fact that not all 12 weeks exist yet.** A new curriculum week and a new Weekly Challenge question drop every Monday, in sync with the live season, whether or not that week's content existed before this Monday. That's not a limitation you're hiding; per the "must-buy" strategy already documented, appointment-based weekly delivery *is* the product.

---

## What ships at beta (Week 8 / Sept 7–13) vs. what doesn't

**Live at beta:**
- Free tier (as-is) + **Practice tier** ($15–30/mo), real Stripe subscription checkout
- Real accounts (magic-link email — no passwords to manage)
- Weeks 1–3 (Phase 1: Select & Filter) fully real: written lessons + labs, checkable against the existing SQL sandbox engine
- Progress tracking (what a logged-in learner has completed)
- Weekly Challenge + Leaderboard v1 (real usernames, real persisted points — replacing the "Coming Soon" preview)

**Explicitly NOT live at beta (shown honestly as "waitlist" / "apply," not fake checkout):**
- **Roadmap** ($200–500 one-time) — the full 12-week content doesn't exist yet; selling it as complete would be dishonest. Waitlist instead.
- **Career Track** ($1–5K/yr) — this is a human service (you, doing reviews/mock interviews) with no operational process built yet. Waitlist/apply instead, consistent with the "intentionally small" positioning already in `docs/PLAN.md`.
- Any real fantasy-platform import (ESPN/Sleeper/Yahoo league sync) — a substantial OAuth-integration project on its own. **Cut from this 24-week window entirely**, not deferred-and-forgotten — revisit only after v1 ships.
- Server-side autograding with a golden-answer engine — betas use client-side result-set comparison against the same sql.js sandbox already built. Real, but lighter than the full vision in `docs/CURRICULUM.md`.
- Video lessons — text-first for v1. Video is a major production undertaking on its own; don't let it block shipping.

---

## Division of labor (what I can actually do vs. what's on you)

I can write code, lesson copy, docs, and marketing copy drafts, and I can execute anything that's a file change + deploy. I **cannot**: create your Stripe/Supabase accounts (needs your identity/banking info), appear on camera, do outreach/sales calls, give real legal sign-off on Terms of Service, or manually source that week's real NFL stat for the Weekly Challenge (someone has to actually look that up — that's a standing weekly task on you, not automatable without a real stats API, which is out of scope for now). Each week below flags which parts are "you" vs. "us."

---

## Phase 1 — Beta Sprint (Weeks 1–8, Jul 20 – Sep 13)

Priority order when time is short: **auth → payments → lesson/lab delivery → progress tracking → weekly challenge → QA/legal.** Content production for Weeks 1–3 runs in parallel at low weekly hours, not as a separate full-time track.

### Week 1 (Jul 20–26) — Stack decisions & foundations
- **Ships:** Backend stack locked and provisioned. Recommendation: **Supabase** (Postgres + built-in magic-link auth in one provider — minimizes integration surface for a solo dev) + **Stripe** (test mode).
- **You:** Create the Supabase and Stripe accounts (needs your identity/business info). Confirm business entity exists / decide on Terms of Service provider (e.g., Termly template, or a real lawyer review before charging real money — I can draft, I'm not a substitute for that review).
- **Us:** Schema design (users, subscriptions, progress, weekly_challenges, leaderboard_points), migrations written.

### Week 2 (Jul 27–Aug 2) — Auth
- **Ships:** Working magic-link sign-up/sign-in, session-aware nav, minimal account page.
- **Content (background, low hours):** Script the real Week 1 lesson (not just the syllabus bullet from `docs/CURRICULUM.md` — actual lesson text).

### Week 3 (Aug 3–9) — Payments
- **Ships:** Stripe Checkout for Practice subscription, webhook marking a user "active Practice" in the DB, Stripe-hosted billing portal link (handles cancel/card-update for free — don't build that yourself).
- **Content:** Week 1 lesson + labs written and checkable in the sandbox.

### Week 4 (Aug 10–16) — Lesson/lab delivery
- **Ships:** Lesson-page template pairing written content with the existing sandbox; a "check my answer" comparison against a stored expected result set (client-side, reusing sql.js — no new backend for correctness-checking).
- **Content:** Week 2 lesson + labs written.

### Week 5 (Aug 17–23) — Progress tracking
- **Ships:** `completions` table, a "My Progress" dashboard, persists across devices for logged-in users.
- **Content:** Week 3 lesson + labs written — **Phase 1 (Weeks 1–3) fully real as of this week.**

### Week 6 (Aug 24–30) — Weekly Challenge + Leaderboard v1
- **Ships:** `weekly_challenges` table (you author each question — start with a simple manually-edited config, no admin UI yet), a points/submissions table, a public leaderboard page. Replace the marketing site's "Coming Soon" preview with the real thing.
- **You:** Source and write the actual Week 8 kickoff-week challenge question (needs a real stat — this becomes your standing weekly task starting now).

### Week 7 (Aug 31–Sep 6) — QA & legal
- **Ships:** Full funnel tested end-to-end (signup → subscribe → complete Weeks 1–3 → leaderboard), mobile pass on new account/lesson pages, real Terms of Service / Privacy Policy / Refund Policy live.
- **You:** Legal review/sign-off on the policies before real money moves. Start posting launch-preview content on Free-tier channels (YouTube/LinkedIn/Substack) — building the audience that lands on launch day, not starting cold.

### Week 8 (Sep 7–13) — 🚀 BETA LAUNCH
- **Ships:** Public beta live for NFL kickoff week. Free + Practice tiers chargeable. Weeks 1–3 real. Weekly Challenge live with a real Week 1 question. Leaderboard live. Roadmap/Career Track shown honestly as waitlist.
- **You:** Launch push — personal network, relevant communities (mindful of self-promotion norms), first real Weekly Challenge question goes out Monday night.

---

## Phase 2 — In-Season Build-Out (Weeks 9–16, Sep 14 – Nov 8)

**The weekly rhythm starts now and doesn't stop:** every Monday, a new curriculum week's content drops and a new Weekly Challenge question posts, timed to the live season. This is no longer "a sprint task" — it's the standing operational commitment the whole business now runs on.

| Week | Dates | Ships | Notes |
|---|---|---|---|
| 9 | Sep 14–20 | Week 4 content (Joins & Matchups begins) + challenge | Establish the Monday rhythm as routine |
| 10 | Sep 21–27 | Week 5 content + challenge | Decide & document: real fantasy-platform (ESPN/Sleeper/Yahoo) import stays **cut** from this cycle — note it, don't half-build it |
| 11 | Sep 28–Oct 4 | Week 6 content + midterm checkpoint UI + challenge | |
| 12 | Oct 5–11 | Week 7 content + challenge | Start collecting real user feedback/quotes — first candidates to eventually replace the illustrative Success Stories examples |
| 13 | Oct 12–18 | Week 8 content + challenge | Evaluate: is there enough content to sell Roadmap for real yet? |
| 14 | Oct 19–25 | Week 9 content + challenge — **Phase 3 (Aggregations) complete** | Launch real Roadmap purchase if ready, framed honestly if Weeks 10–12 are still landing |
| 15 | Oct 26–Nov 1 | **Buffer week** (built in on purpose) | If on schedule: start Career Track ops — booking tool (Cal.com/Calendly), review rubric doc, application form |
| 16 | Nov 2–8 | Career Track soft-launch to a small hand-picked first cohort | You personally deliver reviews/mock interviews — matches the "intentionally small, doesn't scale" positioning already decided |

---

## Phase 3 — Harden & Full Ship (Weeks 17–24, Nov 9 – Jan 3)

| Week | Dates | Ships | Notes |
|---|---|---|---|
| 17 | Nov 9–15 | Week 10 content (Window Functions I) + challenge | |
| 18 | Nov 16–22 | Week 11 content + challenge | Build capstone submission flow (link + README submission, a review queue you check manually — no need for anything fancier yet) |
| 19 | Nov 23–29 | **Light week (Thanksgiving)** | Real NFL Thanksgiving games are a natural marketing moment (special challenge), but don't schedule build work this week |
| 20 | Nov 30–Dec 6 | Week 12 content + capstone studio support | First beta cohort (started ~Aug/Sep) hits their capstone right on schedule — nice cohort math, not a coincidence |
| 21 | Dec 7–13 | First real capstones reviewed; certificate issuance (even a simple generated PDF is fine for v1) | |
| 22 | Dec 14–20 | Full regression pass across all 12 weeks + all tier checkout flows; pricing calibration from real conversion data | Revisit the founding-cohort grandfathering mechanics flagged as an open question in `docs/PLAN.md` |
| 23 | Dec 21–27 | **Light week (Christmas)** | |
| 24 | Dec 28–Jan 3 | 🏁 **Full v1 ship**: all 12 weeks live and polished, all three tiers real (Career Track intentionally manual, documented as such), first graduates, real testimonials replacing illustrative ones, off-season plan drafted | Regular season ends right around here — a deliberate, natural full-ship line |

---

## Standing risks worth naming now

- **Bus factor / burnout:** this is a solo 20–30 hr/week plan with a recurring weekly content+challenge commitment starting Week 8 that does not pause. Missing even one Monday breaks the "appointment" mechanic the whole engagement thesis depends on. Build a buffer of 1–2 pre-written challenge questions ahead at all times, not week-of.
- **Manual weekly stat-sourcing is real ongoing labor**, not a one-time setup cost — there is no live stats API in this plan. If this becomes unsustainable, revisit sourcing a real feed (a genuine future project, not a Week-whatever afternoon task).
- **Content pace is the real constraint**, not engineering. If a week's content isn't ready by Monday, the honest move is to say so (or push a lighter/reused problem set) — not silently ship nothing and let the "weekly drop" promise quietly break.
- **Roadmap and Career Track going live mid-plan are conditional**, not guaranteed dates — they're gated on "is the content/process actually ready," and the schedule above says so explicitly rather than picking dates and hoping.

---

## What's cut from this cycle entirely (revisit after v1, not during)

- Real fantasy-platform (ESPN/Sleeper/Yahoo) league import/OAuth
- Server-side autograder with a golden-dataset engine
- Video lesson content
- Multi-sport / multi-language expansion (already deferred in `docs/PLAN.md`'s Big Picture Vision)
- A real live NFL stats API feed (Weekly Challenge stays manually authored for this cycle)

## How to use this doc

Update the phase/week tables as reality diverges from plan — a schedule nobody updates is worse than no schedule. If a week's ship slips, move it and say why, rather than silently letting later weeks absorb the debt.
