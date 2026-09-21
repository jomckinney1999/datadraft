# SQL Sports — Product & Pricing Plan

This is the source of truth for product structure, pricing, and positioning decisions. Update it whenever the business model changes, *before* or alongside code changes — this is what future Claude/Cursor sessions read to understand why the landing page is shaped the way it is.

Last updated: 2026-08-10 (**positioning pivot** — the narrow single-language/single-sport launch strategy was reversed by owner decision; see Big picture vision).

## Big picture vision

**Decided 2026-08-10 (reverses the prior launch strategy):** SQL Sports positions publicly as a **full data-skills platform with sports as the lens** — SQL, Python, R, Git, statistics, and visualization, taught through football (NFL), basketball (NBA), or baseball (MLB), which the learner picks as their base "language."

The public value proposition is now: *everything an aspiring data analyst or data scientist needs, through the lens of sports.* The differentiator is the lens, not the subject.

### What this replaced, and the risk that came with it

The previous version of this plan committed to **one course, one sport, one language** — SQL through fantasy football — and deliberately kept the multi-sport/multi-language vision *off* the live site, reasoning that "publicly promising a multi-sport, multi-language platform before the first product has proven itself would dilute the pitch and create expectations the business can't yet back up."

That risk didn't disappear with the decision; it's now something to actively manage:

- **Only football has a real dataset.** NBA and MLB are labeled "In build" in `lib/sports.ts` and on the picker, not presented as finished. Don't flip a sport to `live` until a pipeline backs it — the same honesty principle as #3 under Must-buy mechanisms, applied to sport availability.
- **The non-SQL skills now have real lessons** (added 2026-08-10): `lib/curriculum.ts` units 7–11 cover Python/pandas, statistical thinking, visualization, Git/GitHub, and R/tidyverse — 15 lessons, ~60 exercises, graded and XP-earning like the SQL units. The breadth promised on the landing page is backed. **Live code execution shipped 2026-08-10** for Python (Pyodide + pandas) and R (WebR + dplyr) via `lib/runtimes.ts` — `code` exercises run the learner's program in-browser and grade printed output. SQL still uses result-set `query` grading. One honest limit remains: every dataset is still football.
- **Breadth multiplies the production bill.** Six skills × three sports is a far larger content surface than one syllabus; `docs/LAUNCH-PLAN.md` Phase 4 was scoped for a single 12-week SQL curriculum and Phase 11 (Expansion) is largely pulled forward into the core product.

This decision is reversible, and the narrow version is documented above if it needs to come back. Revisit once there's real traffic data on whether the broader pitch converts better.

### Sport selection ("your lens")

The learner picks one sport; the skills taught are identical across all three and only the dataset changes. Implemented in `lib/sports.ts`, `components/sport-picker.tsx` (the landing page's `#pick-your-sport` section), and `lib/use-sport.ts` (localStorage, no account required). Move it onto the user profile when accounts land (`docs/LAUNCH-PLAN.md` Phase 1) so it follows people across devices.

### Sister product: NFL Stat Guru

Decided 2026-07-16: the landing page cross-promotes **NFL Stat Guru** (`https://gridiq-eight.vercel.app/`, Vercel project `gridiq`) — a separate, already-live product from the same builder. It's an AI-powered NFL stats Q&A platform ("ask any NFL question in plain English"), not part of the SQL Sports curriculum or codebase. It's linked via a nav tab (`#stat-guru`) and an on-page promo section (`app/page.tsx`) that links out to the external app — not embedded, not merged. Treat it as a distinct brand/business; don't fold its pricing or features into the SQL Sports ladder above.

## Making SQL Sports a "must buy" (not just a nice-to-have)

The mechanisms this plan leans on to make the product feel essential rather than optional, roughly in order of leverage:

1. **Utility before mastery.** The single biggest lever. Most courses only pay off after you finish them. SQL Sports pays off mid-lesson: a learner can query their own league's data to make *this week's* lineup call before they've finished the roadmap. This turns "I should learn this eventually" into "I need this before Sunday." Reflected on-site as the lead pillar in the Why section.
2. **Appointment-based habit loop.** Fantasy football already has a weekly cadence (waivers, lineups, matchups). SQL Sports rides that same clock — new problems/datasets drop weekly, in-season — instead of competing with it. This is what makes the product something people return to on their own, not something they have to force themselves back to.
3. **Honest trust over fabricated traction.** No fake usage numbers, no fake testimonials, no fake urgency countdowns. Pre-launch, credibility compounds faster than hype does, and a single caught fabrication (a stat, a review, a "3 spots left" that isn't true) undermines every other claim on the page. Where the site doesn't have real numbers yet, it says so plainly (see the success-stories section) or shows structural facts instead of invented usage metrics.
4. **Real, non-fake exclusivity at the top of the ladder.** Career Track stays intentionally small (see Volume expectations above) — not as a fake-scarcity trick, but because 1:1 review and mock interviews genuinely don't scale, and saying so plainly is more convincing than a countdown timer would be.
5. **Founding-cohort pricing.** Decided 2026-07-15: current prices across the ladder are framed on-site as founding/early pricing that will rise once SQL Sports is out of early access. This is a real commitment, not just copy — whoever signs up now keeps their price; new sign-ups later pay more. Before raising prices, make sure existing members are actually grandfathered as promised.
6. **Production quality signals competence.** For a product whose whole pitch is "we'll make you good at working with data," the site itself has to look like it was built by people who are good at their craft — polished dark UI, considered motion, working mobile nav, real OG/share metadata. Sloppy production on the marketing site undercuts the pitch before a visitor ever reads a word of copy.

### Illustrative path to $100k/month (not a forecast)

A rough, illustrative mix showing which tier does the heavy lifting — useful for prioritizing where to spend growth effort, not a commitment:

- ~3,000 active **Practice** subscribers @ ~$20/mo ≈ $60k/mo — the volume tier; growth here is mostly top-of-funnel/conversion work.
- ~100 active **Career Track** members @ ~$3k/yr (~$250/mo equivalent) ≈ $25k/mo — low volume, high leverage; a handful of members moves this number meaningfully.
- ~40 **Roadmap** purchases/mo @ ~$350 ≈ $14k/mo — the one-time-purchase middle rung.

Total ≈ $99k/mo. Takeaway: Practice-tier volume is the main lever at this scale, but Career Track's per-unit economics mean it's worth disproportionate product investment (see must-buy mechanisms above) even though it'll never be the biggest tier by headcount.

## Business structure

SQL Sports is **one business with a single pricing ladder** — not a separate education product plus a bolted-on coaching business. Career coaching lives inside SQL Sports as the top rung of the ladder ("Career Track"), positioned explicitly as "for people using this to change careers," not as a distinct offering with its own brand or funnel.

Overall picture: **freelance work + SQL Sports** — two things, not three. An earlier plan had career coaching as a third, standalone business; that was folded into SQL Sports because it's cleaner to run and matches what the target user actually needs to justify paying for the top tier (see below).

## Target user: "Andy"

Andy is the persona the pricing ladder is built against — specifically, the question "what would Andy pay $1,000–5,000/year for?"

Key insight: the sports-themed hook (fantasy football as the dataset) is what gets Andy in the door, but it is not what gets him to spend real money. Nobody pays $1–5K/year for "make fantasy football more fun." He pays that much when the calculation shifts from **hobby** to **career investment**.

Andy's math: if this genuinely helps him land a data analyst role (even at the entry-level $55–70K range), spending $2–3K is a trivial, obviously-worth-it bet compared to the alternative paths to the same outcome — a bootcamp ($10–20K+) or an online analytics master's ($20–50K). He isn't comparing the price to a $20/month app; he's comparing it to those other paths, and SQL Sports is radically cheaper than all of them. That comparison is what makes $1–5K feel reasonable to him, not the sandbox itself.

What Andy actually wants at that price point (an annual "Career Track" membership):

- Full structured roadmap access — Beginner through Advanced/Portfolio, not piecemeal
- Unlimited sandbox practice — not rate-limited like the cheap tier
- A real portfolio capstone built on actual NFL/fantasy data — resume-ready, interview-talkable. This is the single biggest thing separating "I took a course" from "I can do the job."
- A cohort/community element — peers on the same roadmap, accountability, momentum. Solo online learning has notoriously high dropout, and Andy knows this about himself.
- A certification/completion credential — something concrete for LinkedIn
- Application support — resume/portfolio review, mock interview practice using the material he built. This is where the offering brushes right up against career coaching.

### The honest tension

At $1–5K, Andy is functionally expecting something adjacent to career coaching — portfolio review, interview readiness — even without calling it that. The decision made here: **include a light version of career support inside the top tier** rather than keeping "education only" and carving career coaching out as a separate paid business. This blurs the line slightly between "education platform" and "career coach," but it matches what Andy actually needs to justify the spend, and it's simpler to run as one business.

### Volume expectations

Career Track is a **small, high-value slice** of the user base, not the bulk of it. Most users will stay in the cheap/free tiers for the hobby use case. Career Track is a few hundred serious career-changers paying a lot, not thousands of casual fans paying a little. Both segments matter for revenue, but they serve different motivations within the same audience — pricing and messaging for each tier should reflect that (don't sell Career Track to casual hobbyists, don't gate the fun stuff behind it).

## Core "why" argument (positioning)

The landing page has a dedicated "Why SQL Sports" section (`app/page.tsx`, `#why`, between the hero and the curriculum) making the explicit case for why learning **code & data skills** through sports is worth paying for — not SQL alone. The argument, in order (utility-first — this is the must-buy lever, see above):

1. **Useful before you're "done."** You don't need to finish the roadmap to get value — answer a real question about a real season while you're still learning. The skill pays for itself before the course does.
2. **You already know the domain** — most tech courses make you learn unfamiliar syntax and an unfamiliar business scenario (fictional SaaS churn, etc.) at the same time. SQL Sports removes the second problem because the learner already understands sports, so only the tech is actually new.
3. **Real data, real mess** — live NFL/fantasy (and eventually NBA/MLB) data (byes, injuries, trades) instead of toy datasets (Titanic, Iris), which is closer to what real analyst/engineering work looks like.
4. **Practice rides an existing habit** — checking standings/scores is a habit the learner already has, on the same weekly clock the season already runs on; SQL Sports repurposes it instead of requiring a new study habit built from zero.
5. **A portfolio story anyone gets instantly** — "I built an analytics tool on fantasy football data" needs no setup in an interview, unlike a generic bootcamp project.
6. **Cheaper than the alternatives** — direct cost comparison to data analytics bootcamps ($10–20K) and specialized analytics master's programs ($20–50K), framed as the same "immersion" bet those make, minus the cost of also learning a brand-new industry.

This is the same reasoning as the Andy persona section above, generalized into on-page copy — keep the two in sync. Point 6 in particular is a direct restatement of Andy's math (see above) and should move together with any changes to that reasoning or to the bootcamp/master's price comparisons.

### Career Track playbooks (added 2026-08-10)

Career Track is no longer just a pricing card with "resume review" bullets. The landing page (`#career-track`, `components/career-playbooks.tsx`, data in `lib/career-playbooks.ts`) shows **role-specific playbooks**: Data Analyst, Data Scientist, AI Engineer, Software Engineer, Analytics Engineer, Forward Deployed Engineer.

Each playbook follows the same arc a first-job seeker needs — skills foundation → projects → portfolio/capstone → resume/LinkedIn → interviews → applications → 1:1 coaching — with stations renamed to the learner's sport lens (football: Training Camp / Scrimmages / The Combine / Draft Board; basketball: Summer League / Workouts / Free Agency; baseball: Spring Training / Showcase / Call-Up Board).

Most drills are honest `placeholder` stubs; Data Analyst foundation drills that already exist in `/learn` are marked `live`. Expanding a playbook means filling those placeholders, not inventing a second product.

## Product ladder

| Tier | What's included | Price | Who it's for |
|---|---|---|---|
| **Free** | Free content, limited graded drives (**5 timeouts/day**), scouting tickets + bye weeks (streak freezes), unlimited Practice Field | $0 | Top-of-funnel, everyone |
| **Practice** (**Season Pass** in-product) | Unlimited timeouts, ongoing problem sets, live season datasets | $15–30/mo | Hobbyists, casual skill-builders |
| **Roadmap** | Full Beginner → Advanced course pathway, portfolio capstone, completion credential | $200–500 one-time | Serious learners, not yet job-hunting |
| **Career Track** | Everything in Roadmap + role-specific playbook (DA / DS / AI Eng / SWE / AE / FDE) + resume/portfolio review + mock interview practice + application strategy support | $1,000–5,000/yr | Andy, once he's decided this is a career move, not a hobby |

This ladder is implemented on the landing page pricing section (`app/page.tsx`, `PLANS` array). Nav `Career Track` → `#career-track` anchors the playbooks section (`components/career-playbooks.tsx`). The pricing section also carries a **founding-cohort pricing badge** (see Must-buy mechanisms, #5) — all four tiers are framed as early/founding pricing.

### Free-tier sideline economy (added 2026-09-21)

Duo-shaped habit loop, football-named — lives in `lib/economy.ts` + progress fields, UI on the learn rail / status chips. **No Stripe checkout yet** (legal/business still blocked); Season Pass is a waitlist CTA (`interest: practice`) plus a local demo flag for QA.

| Duo idea | SQL Sports name | Behavior |
|---|---|---|
| Hearts | **Timeouts** | 5 graded lesson starts per day on Free. Season Pass = unlimited. Practice Field never spends one. |
| Gems | **Scouting tickets** | Earned clearing drives (bonus for perfect + heater). Spent in the Sideline Shop. |
| Streak freeze | **Bye week** | Inventory item; auto-covers exactly one missed calendar day so the heater survives. |
| Instant replay / challenge | **Instant replay** (12 ✦) / **Challenge flag** (25 ✦) | Rewind a hard miss (or 4th-down turnover) and re-take the same snap. Answer key stays hidden until they peek. |
| Super | **Season Pass** | Maps to Practice tier — waitlist until billing is live. |

Shop prices and ticket payouts are constants in `lib/economy.ts`. Change them there, not in components. When Stripe lands, flip `seasonPass` from the subscription webhook instead of the testing toggle.

## Weekly Challenge & Leaderboard (planned, not built)

The vision: every Monday night, that week's live NFL stats drop as a new SQL challenge (tied to the "ongoing weekly problem sets" already promised in the Practice tier). Users answer for points and perks; a leaderboard shows real usernames.

Decided 2026-07-16: **this needs a real backend the site doesn't have yet** — persistent accounts, a database, and a real content-authoring workflow — so rather than fake it with hardcoded usernames/scores (the same fabricated-social-proof problem as the testimonials section), the site currently shows an honestly-labeled "Coming Soon" preview instead (`app/page.tsx`, `#challenge`): a mocked-up challenge card and a skeleton-style leaderboard (no invented names/scores), plus a "notify me" mailto link. Nav tab: "Challenge".

Before building the real version, these need real decisions (not made yet):

- **Auth**: how do people log in? (email magic-link vs. username+PIN vs. full OAuth — tradeoffs are security/complexity vs. friction)
- **Database/hosting**: adds ongoing cost/maintenance to what's currently a zero-backend static site (e.g. Vercel Postgres, Supabase, Vercel KV)
- **Content-authoring workflow**: who writes/grades each week's question, and how? A manually-edited config file (fast, matches the `PLANS`/`ROADMAP` pattern already in the codebase) vs. a real admin UI (more work, nicer long-term)
- **Data source**: is there a real live NFL stats feed to grade answers against, or are questions manually authored/verified each week using stats you look up yourself? (Note: the SQL sandbox's `week_results` data is entirely synthetic/generated — not a real stats feed — so it can't be the source of truth for a real weekly challenge without separate work.)
- **Perks**: what do points actually unlock? (Free month of Practice, a badge, something else?)

## Open questions / things to revisit

- Exact price points within each range (e.g. is Career Track $1.5K flat, or tiered by cohort vs. 1:1 support level?)
- What the cohort/community mechanism actually is (Discord? scheduled cohorts? always-on?)
- Whether "application strategy support" is self-serve async review or live calls — affects margin and how many Career Track seats can be supported at once
- Certification: self-issued badge vs. something with outside credibility
- **Founding-cohort mechanics**: what specifically triggers "out of early access" (a member count? a date? a funding/revenue milestone?), and how existing members get grandfathered in practice (a tagged account flag, a manually maintained list?). Decide before the first price increase, not after.
- **Live code execution (decided 2026-08-10):** Ship it. Python and R run in-browser via Pyodide and WebR (`lib/runtimes.ts`), lazy-loaded only when a `code` exercise opens. SQL keeps `query` result-set grading. Remaining follow-ups: seed shared fantasy DataFrames into Pyodide/WebR (today those drills use inline toy data), and broaden `code` coverage beyond the first drills in units 7 and 11. Git/stats/viz stay on `mc`/`fill` — they aren't languages with a single REPL.
- **Get a second sport's data in.** Every lesson example across all 11 units is football. The sport picker offers three. NBA/MLB need a real pipeline (`scripts/build-field-dataset.mjs` is the football template) before the picker means anything beyond a label.
- **What "in build" means in calendar terms for NBA/MLB.** The site tells visitors those sports are coming; that's a promise with no date behind it. Decide the trigger for starting each.
- **Whether the name still fits.** "SQL Sports" now sells Python, R, Git, and statistics too. Renaming is expensive (domain, Vercel project, Stripe, legal docs) and wasn't part of the pivot decision — but the mismatch is real and deserves an explicit keep-or-change call.
- Weekly Challenge & Leaderboard build-out (see above) — auth, database, content workflow, data source, and perks all still need real decisions.

## How to use this doc

When asked to change pricing, positioning, or add/remove tiers on the site: update this document first (or in the same change) so it stays the single source of truth, then update `app/page.tsx` to match. If a requested change conflicts with something decided here (e.g. "make Career Track the popular default"), flag the conflict rather than silently overriding the documented reasoning.

## Non-fan positioning (decided 2026-08-09)

"You don't have to watch football" is now stated explicitly across the funnel: a gold callout in the landing Why section ("Don't watch football? You're still in the right place."), plus one-liners on the Draft Day name screen, the /learn course card, and the Practice Field intro.

Reasoning: the fantasy hook remains the lead pitch (see Target user: Andy — it's what gets fans in the door), but requiring fandom was never real — CURRICULUM.md has always listed fantasy experience as "helpful but not required." This message removes a signup barrier for non-fans without repositioning the product. The claims are kept honest per the trust pillar: football context genuinely is taught in-line, one sentence at a time, and the SQL genuinely transfers unchanged to work data. Don't escalate this into a "sports-agnostic" pitch — that's the multi-sport expansion decision, which stays off the live site until the flagship proves itself.
