# DataDraft — Product & Pricing Plan

This is the source of truth for product structure, pricing, and positioning decisions. Update it whenever the business model changes, *before* or alongside code changes — this is what future Claude/Cursor sessions read to understand why the landing page is shaped the way it is.

Last updated: 2026-10-06 (**a second sport**: MLB next, after a retention trigger and a licence check; see "A second sport"). Before that, 2026-10-03: pricing and the offer (two tiers plus a founding offer, launch gates; see Product ladder and `docs/OFFER.md`), and 2026-10-02: target user and messaging.

> **Read this first.** On 2026-09-30 the product narrowed (CLAUDE.md, "What this is"): four sections, football only, and no career kit, coaching playbooks or sport picker. Where this doc still describes those — the multi-sport vision, Career Track playbooks, `/resources` — it is history, kept for the reasoning, not the plan. The price ranges in the ladder are still the working assumption. Nothing is for sale yet.

## Big picture vision

**Decided 2026-08-10 (reverses the prior launch strategy):** DataDraft positions publicly as a **full data-skills platform with sports as the lens** — SQL, Python, R, Git, statistics, and visualization, taught through football (NFL), basketball (NBA), or baseball (MLB), which the learner picks as their base "language."

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

Decided 2026-07-16: the landing page cross-promotes **NFL Stat Guru** (`https://gridiq-eight.vercel.app/`, Vercel project `gridiq`) — a separate, already-live product from the same builder. It's an AI-powered NFL stats Q&A platform ("ask any NFL question in plain English"), not part of the DataDraft curriculum or codebase. It's linked via a nav tab (`#stat-guru`) and an on-page promo section (`app/page.tsx`) that links out to the external app — not embedded, not merged. Treat it as a distinct brand/business; don't fold its pricing or features into the DataDraft ladder above.

## Making DataDraft a "must buy" (not just a nice-to-have)

The mechanisms this plan leans on to make the product feel essential rather than optional, roughly in order of leverage:

1. **Utility before mastery.** The single biggest lever. Most courses only pay off after you finish them. DataDraft pays off mid-lesson: a learner can query their own league's data to make *this week's* lineup call before they've finished the roadmap. This turns "I should learn this eventually" into "I need this before Sunday." Reflected on-site as the lead pillar in the Why section.
2. **Appointment-based habit loop.** Fantasy football already has a weekly cadence (waivers, lineups, matchups). DataDraft rides that same clock — new problems/datasets drop weekly, in-season — instead of competing with it. This is what makes the product something people return to on their own, not something they have to force themselves back to.
3. **Honest trust over fabricated traction.** No fake usage numbers, no fake testimonials, no fake urgency countdowns. Pre-launch, credibility compounds faster than hype does, and a single caught fabrication (a stat, a review, a "3 spots left" that isn't true) undermines every other claim on the page. Where the site doesn't have real numbers yet, it says so plainly (see the success-stories section) or shows structural facts instead of invented usage metrics.
4. **Real, non-fake exclusivity at the top of the ladder.** Career Track stays intentionally small (see Volume expectations above) — not as a fake-scarcity trick, but because 1:1 review and mock interviews genuinely don't scale, and saying so plainly is more convincing than a countdown timer would be.
5. **Founding-cohort pricing.** Decided 2026-07-15: current prices across the ladder are framed on-site as founding/early pricing that will rise once DataDraft is out of early access. This is a real commitment, not just copy — whoever signs up now keeps their price; new sign-ups later pay more. Before raising prices, make sure existing members are actually grandfathered as promised.
6. **Production quality signals competence.** For a product whose whole pitch is "we'll make you good at working with data," the site itself has to look like it was built by people who are good at their craft — polished dark UI, considered motion, working mobile nav, real OG/share metadata. Sloppy production on the marketing site undercuts the pitch before a visitor ever reads a word of copy.

### Illustrative path to $100k/month (history)

An earlier mix leaned on Career Track (~100 members at ~$3k/yr) and Roadmap (~40 a month at ~$350). Both tiers were retired with coaching (see Product ladder), so that path is gone. The current math is in Market size below and in `docs/OFFER.md` §3: at ~$13 a member a month, $20k is ~1,500 Season Pass members.

## Business structure

DataDraft is **one business with a single pricing ladder** — not a separate education product plus a bolted-on coaching business. Career coaching lives inside DataDraft as the top rung of the ladder ("Career Track"), positioned explicitly as "for people using this to change careers," not as a distinct offering with its own brand or funnel.

Overall picture: **freelance work + DataDraft** — two things, not three. An earlier plan had career coaching as a third, standalone business; that was folded into DataDraft because it's cleaner to run and matches what the target user actually needs to justify paying for the top tier (see below).

## Target user (decided 2026-10-02)

**The fantasy league's numbers person who wants it to be their job.** One person, and everything on the site is written to them:

- **Who:** roughly 23–35, has played in a home league for years — often the commissioner, or the one who keeps the rankings spreadsheet.
- **Job:** works near data but not in it — operations, finance, marketing, sales ops, supply chain, teaching, or a recent business/econ grad. Comfortable in Excel; SQL is the wall.
- **History:** started an online SQL course or the Google Data Analytics certificate and stalled. Did a Titanic or fake-company project and felt nothing.
- **Goal:** a first data analyst job, or becoming the data person at their current company, within 6–12 months. On the side: win the league, settle arguments with numbers.
- **Pains:** practice feels like homework; no portfolio project anyone cares about; SQL interview questions are intimidating; long courses don't stick.
- **Where they are:** fantasy podcasts, r/fantasyfootball, the Sleeper app, advanced-stats sites; data-career YouTube, r/SQL, r/dataanalysis, LinkedIn.
- **When they're reachable:** August draft prep, midweek waivers in season, and January — the fantasy season ends just as job searches and resolutions start.
- **Objections:** "Will employers take a football project seriously?" · "I'm not technical." · "I don't have time." The FAQ answers these, in that order.

**Why this person and not a wider net.** The football lens only helps someone who already speaks football; for a non-fan, generic SQL sites do the same job with nothing extra to learn. Fandom is what brings them in; career intent is what makes them practise daily and pay — a pure hobbyist enjoys a question but won't grind SQL. Their week already runs on the NFL calendar, which is the retention bet. And they come with a group: a league is 10–12 friends in a chat, and Chart it gives them something to post there.

**Secondary (welcome, not built for):** working analysts who are fans and want daily reps (easiest to convert, best beta testers); college students who want a portfolio (volume, little money). **Not targeted:** non-fans (the reassurance lives in the FAQ, not the hero), hobby-only players (fine on free), anyone wanting career coaching (cut 2026-09-30), bettors (no gambling content, ever).

**This replaces "Andy".** The earlier persona was a career-changer paying $1–5K a year for coaching and application support. The person is the same — fan turning career-changer — but the product no longer sells coaching, so what they pay for is practice that sticks and projects worth showing, not a human reading their resume.

## Messaging (decided 2026-10-02)

The line everything ladders up to: **"You're already the numbers person in your league. Make it your job."** Three supporting ideas, in their words:

1. **Identity** — the commissioner with the 40-tab spreadsheet, the one who brings stats to the group chat. That is already analyst behaviour.
2. **Fun first** — practise on the stats you already argue about; chart who got lucky in your own league.
3. **Career payoff** — a portfolio an interviewer remembers ("I modelled my fantasy league"), built ninety seconds a day.

Rules: talk to one person, not four audiences. The two asks everywhere are **Solve today's question** (90 seconds, no signup) and **Chart your league**. Use their vocabulary — league, waivers, start/sit, the group chat, commissioner — and never promise a job; promise the skills and the story.

## Market size: can this avatar reach $20k/month? (2026-10-02)

Yes — at $20k a month the avatar is not the limit; reaching it is. Illustrative, with assumptions stated, not a forecast:

- **Payers:** at the prices proposed 2026-10-03 ($19.99/month or $119/year, about two-thirds on annual), a member averages ~$13 a month → **about 1,500 paying members.** (This line first assumed ~$15/$99 and ~2,000 members.)
- **Free base:** freemium learning products convert low single-digit percent of engaged users → **about 40,000–65,000 engaged free users** over time.
- **Steady state:** at ~5% monthly churn, ~100 payers to replace each month → **about 2,500 new free signups a month (~80 a day).**
- **Pool:** tens of millions of Americans play fantasy football. If even 1% work near spreadsheets and want a data career, that is hundreds of thousands of people, of whom 2,000 need to pay.

Where narrow caps out: somewhere past $50–100k/month (~10,000 payers) the plan would need to widen — non-fans, students, other sports, team sales. That is the normal order: win a beachhead, then expand; the product already serves the wider groups, only the marketing is narrow. The real risks are **distribution** (no audience yet: fantasy Reddit, fantasy Twitter via Chart it, a weekly chart we post ourselves), **seasonality** (peak September–January: sell annual at the draft; run "the season's over — now get the job" January–March) and **who pays** (the career-minded minority, so the paid tier has to be about the career). A possible second line later: a commissioner plan with weekly charts for the whole league.

## Core "why" argument (positioning)

The landing page has a dedicated "Why DataDraft" section (`app/page.tsx`, `#why`, between the hero and the curriculum) making the explicit case for why learning **code & data skills** through sports is worth paying for — not SQL alone. The argument, in order (utility-first — this is the must-buy lever, see above):

1. **Useful before you're "done."** You don't need to finish the roadmap to get value — answer a real question about a real season while you're still learning. The skill pays for itself before the course does.
2. **You already know the domain** — most tech courses make you learn unfamiliar syntax and an unfamiliar business scenario (fictional SaaS churn, etc.) at the same time. DataDraft removes the second problem because the learner already understands sports, so only the tech is actually new.
3. **Real data, real mess** — live NFL/fantasy (and eventually NBA/MLB) data (byes, injuries, trades) instead of toy datasets (Titanic, Iris), which is closer to what real analyst/engineering work looks like.
4. **Practice rides an existing habit** — checking standings/scores is a habit the learner already has, on the same weekly clock the season already runs on; DataDraft repurposes it instead of requiring a new study habit built from zero.
5. **A portfolio story anyone gets instantly** — "I built an analytics tool on fantasy football data" needs no setup in an interview, unlike a generic bootcamp project.
6. **Cheaper than the alternatives** — direct cost comparison to data analytics bootcamps ($10–20K) and specialized analytics master's programs ($20–50K), framed as the same "immersion" bet those make, minus the cost of also learning a brand-new industry.

This is the same reasoning as the Andy persona section above, generalized into on-page copy — keep the two in sync. Point 6 in particular is a direct restatement of Andy's math (see above) and should move together with any changes to that reasoning or to the bootcamp/master's price comparisons.

### Career Track playbooks (added 2026-08-10)

Career Track is no longer just a pricing card with "resume review" bullets. The landing page (`#career-track`, `components/career-playbooks.tsx`, data in `lib/career-playbooks.ts`) shows **role-specific playbooks**: Data Analyst, Data Scientist, AI Engineer, Software Engineer, Analytics Engineer, Forward Deployed Engineer.

Each playbook follows the same arc a first-job seeker needs — skills foundation → projects → portfolio/capstone → resume/LinkedIn → interviews → applications → 1:1 coaching — with stations renamed to the learner's sport lens (football: Training Camp / Scrimmages / The Combine / Draft Board; basketball: Summer League / Workouts / Free Agency; baseball: Spring Training / Showcase / Call-Up Board).

Most drills are honest `placeholder` stubs; Data Analyst foundation drills that already exist in `/learn` are marked `live`. Expanding a playbook means filling those placeholders, not inventing a second product.

## Product ladder (approved 2026-10-03; nothing is for sale yet)

**Two tiers and a launch offer.** The copy, the exact free/Pass line, the paywall moments, the launch emails, the calendar and the launch gates are in [`docs/OFFER.md`](OFFER.md).

| Tier | What's included | Price | Who it's for |
|---|---|---|---|
| **Free** | The daily question in every language, the Stat Duel, the Draft Room (current season), Chart it, your own league, the sandboxes, the first unit of every course (5 graded lessons a day), any question for 7 days after it was a daily | $0, forever | Everyone; the daily habit |
| **Season Pass** | The career tier: the whole question bank with solutions, every lesson with no limit, Query Doctor on every miss plus Ask Coach, unlimited mock screens, interview pattern tracking, all cases, every Draft Room season, and proof for employers when accounts land | **$19.99/mo or $119/yr** | The numbers person going for the job |
| **Founding Season Pass** (launch only) | Season Pass | **$79/yr, kept for as long as the membership is active**. First 500 members or Jan 31, whichever comes first; early-access users get a 7-day head start | The first believers |

- **Why two tiers:** one decision for the buyer (free or Pass), one thing to build and support. Monthly is priced at twice the annual rate per month so annual reads as half off, because annual survives the fantasy season ending and monthly doesn't.
- **Later, tested after launch:** Gift a Pass (December), a League Pass for commissioners (~$49 a season, everyone in the league gets the weekly charts), student pricing if students ask. Not at launch.
- **Retired (2026-10-03):** **Roadmap** ($200–500 one-time) and **Career Track** ($1–5k/yr, resume review, mock interviews with a human, application strategy). Coaching was cut on 2026-09-30, and a human reading your resume was the only thing that justified Career Track's price. The interview practice it promised now lives in the Season Pass as software (mock screens, Query Doctor). Don't bring either back without a conversation.
- **New launch gate found 2026-10-03:** Vercel's Hobby plan is non-commercial, and that covers advertising a product for sale, not just taking payment. The project moves to Pro (~$20/month) before prices appear on the site. Full gate list in `docs/OFFER.md` §9.

### Season Pass: the career tier (decided 2026-10-02)

The paid tier is about getting the job, not the hobby — hobbyists stay happy on free, and the career-minded minority is who pays. Proposed price **$19.99/month or $119/year** (about $10/month; sell the annual plan at the draft in August, because monthly-only churns when the fantasy season ends). Nothing is for sale until the launch gates in `docs/OFFER.md` §9 clear (HR sign-off first, and now Vercel Pro too); until then every feature below is built, labelled "Season Pass · free in early access", and open (`PAYWALL_LIVE` in `lib/season-pass.ts`).

| Feature | Status |
|---|---|
| **Query Doctor**: why your query is wrong, without the answer | Live |
| **Ask Coach**: the conversational version, on the doctor's diagnosis | Built; needs Vercel AI Gateway switched on |
| **Mock SQL screens**: timed phone and technical screens with a report | Live |
| **Interview patterns**: the nine SQL patterns screens test, with progress | Live; every pattern has at least 4 questions |
| **Depth**: the SQL bank grown towards ~150, solutions and explanations on each | In progress: 100 SQL of 152 questions (from 29 SQL on Oct 1), plus 20 Python, 12 R and 20 Excel |
| **Proof for employers**: public profile, verifiable certificates, add to LinkedIn | Needs accounts switched on (server-side progress) |
| **Weekly in-season drop + leaderboard** | Needs accounts and a weekly build of live data |
| **Interview cases** grown from 6 to ~25 | Not started |

**Never paywalled:** the daily question, the Stat Duel, the current Draft Room season, Chart it, your own league, and the first units of every course. They are how people find us.

### Positioning change: one-stop shop for data careers (2026-09-29)

DataDraft is no longer positioned as "a gamified way to learn to code". The gamified habit loop is **one playbook inside a complete kit** for someone trying to get a data job: skills practice, portfolio projects, interview prep, resumes, outreach scripts, an application tracker, and pay research.

**Decision: the whole self-serve kit is free during beta.** That is a deliberate change to the ladder above, not an oversight. The owner's call, 2026-09-29, on the reasoning that we haven't yet tested whether anyone pays for any of it, and a complete free kit is the strongest word-of-mouth position while the audience is being built.

What this means for the tiers:

- **Career Track's pitch narrows to what genuinely doesn't scale** — a human reading your resume, a human running a mock interview, a human helping with application strategy. Every *asset* (templates, scripts, checklists, tracker, prep material) is free.
- **Revisit before charging.** When pricing turns on, the question is whether to re-gate any of the kit. Re-gating things people already had free is expensive goodwill; prefer keeping them free and selling the human layer.
- This supersedes the earlier framing where the kit itself was Career Track's value. The rest of the ladder (Free / Practice / Roadmap) is unchanged.

Built so far (all free, all at `/resources`): resume outlines by role, 7 outreach and cover-letter scripts, LinkedIn checklists, behavioural interview prep + portfolio bar, a downloadable application tracker, and pay-research sources. **No invented salary figures anywhere** — we link to BLS, Levels.fyi, Glassdoor and pay-transparency postings instead, same standard as `lib/career.ts`.

**No gambling content, ever** (decided 2026-09-29): no betting lines, odds, spreads or wagering framing, in the curriculum or the marketing. It changes how app stores, ad networks and employers read a product aimed at career-changers.

This ladder is implemented on the landing page pricing section (`app/page.tsx`, `PLANS` array). Nav `Career Track` → `#career-track` anchors the playbooks section (`components/career-playbooks.tsx`). The pricing section also carries a **founding-cohort pricing badge** (see Must-buy mechanisms, #5) — all four tiers are framed as early/founding pricing.

### Free-tier sideline economy (added 2026-09-21)

Duo-shaped habit loop, football-named — lives in `lib/economy.ts` + progress fields, UI on the learn rail / status chips. **No Stripe checkout yet** (legal/business still blocked); Season Pass is a waitlist CTA (`interest: practice`) plus a local demo flag for QA.

| Duo idea | DataDraft name | Behavior |
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

## A second sport: MLB, after a trigger (decided 2026-10-06)

Football stays the only sport for now. This records which sport comes next, why, and what has to be true before it starts. It replaces the old "NBA/MLB in build" plan in Big picture vision.

- **The reason is the calendar, not a bigger audience.** The bet is that people come back every day, and every daily (Roll Call, the Stat Duel, the Draft Room) runs on the NFL season, so from February to August there's nothing new. MLB's regular season (late March to early October) is almost exactly the NFL off-season, and it's played nearly every day, which suits the dailies ("Name every player who homered yesterday").
- **Order:** MLB first. NBA second (October to June overlaps football for four months, but covers February to June). Soccer only as part of an international push around Fantasy Premier League. NHL and F1: no, small fantasy audiences among the people we're for, and unofficial data.
- **The licence decides it, before data depth.** nflverse is CC BY 4.0, which allows commercial use with a credit line, and that is why football was easy. Before committing to a sport, its source must allow a paid product to show, query and let people download its data. Current understanding, to be verified (by a lawyer before anything is sold):
  - MLB: Retrosheet (free with its required notice) and the Lahman database (CC BY-SA) look usable. Statcast / Baseball Savant belongs to MLB Advanced Media and needs checking before anything is built on it.
  - NBA: the NBA Stats API is unofficial and NBA.com's terms are restrictive; hoopR mostly reads ESPN. It needs a permitted source.
  - Soccer: FBref is Sports Reference, which doesn't allow redistribution. StatsBomb Open Data is free with credit, but it's mostly past competitions, not a weekly feed.
- **The trigger:** don't start until the football dailies show they keep people: a stated number of weekly returning players, held across a full NFL season, read from Vercel Analytics once it's switched on. The owner sets the number then. If it's met, starting the MLB pipeline in January has it ready for Opening Day.
- **Until then, fill the off-season inside football.** Throwback boards for Roll Call and the Stat Duel from past seasons (Roll Call needs the previous season's rows added), and the NFL's own off-season moments: free agency in March, the draft in April, which the Draft Room already rehearses. Far cheaper than a second sport, and it tests whether off-season dailies hold people at all.
- **Port order when it's time:** the dailies first (Roll Call and the Stat Duel are templates over one weekly-stats table plus SQL, days of work per sport), then a question batch, then art. Courses can stay football-flavoured for a long time. The `sport` column in Supabase already exists; build no more multi-sport plumbing ahead of the trigger.
- Keep it off the public site until it's real, the same rule as Phase 11 in `docs/LAUNCH-PLAN.md`.

## Jobs, matched to practice (planned 2026-10-07, not built)

The owner asked whether a job board, scraping analyst jobs for people to find and apply to, would be another reason to visit. The answer recorded here: yes to jobs, but not a scraped board, and not as a daily hook.

- **Not a scraper.** LinkedIn, Indeed and Glassdoor forbid scraping in their terms, and LinkedIn has sued scrapers. That's the wrong risk while legal review and the employer sign-off are still open. A plain list would also be a worse LinkedIn, the same "crowded shelf, no edge" reason the career kit was cut, and a generic feed is noisy: stale postings, duplicates, senior roles, and sportsbook jobs, which clash with the no-betting rule.
- **Weekly, not daily.** The person we're for wants the job in 6 to 12 months and would check a job list weekly at most. The daily games stay the daily habit; jobs are a weekly one.
- **Sourced from companies' own job-board feeds.** Greenhouse, Lever and Ashby publish public feeds that companies use to put listings on their own careers pages. Use a set list of about 100 to 300 companies: teams, leagues, sports media and fantasy apps (no sportsbooks), plus companies known to hire entry-level analysts. Check each provider's terms before building, the way the data licence was checked.
- **Show the minimum and link out:** title, company, location and date posted, with the company's own page to apply. Don't republish whole job descriptions.
- **The edge is matching each job to practice.** Tag each posting with the skills it asks for (SQL, window functions, Python, Tableau, A/B testing…) and link straight to them: "This one wants window functions → 12 questions and the guide." Add one line a week: "The skill most new postings asked for this week: joins (practise →)." No job board does this, and it is exactly our job.
- **Fresh the way the data is fresh:** a daily job drops closed postings, the same pattern as the weekly data workflow.
- **It's search traffic too.** "Entry-level data analyst jobs" and "sports analytics jobs" are big searches, like the interview guides.
- **Where it lives:** a page in the Questions menu beside interview prep, not a fifth tab. It is not the retired career kit: no résumé help and no coaching, just a list that points at practice.
- **Free, with the Pass later:** the list is free and sells the Season Pass's interview prep. "Jobs matched to what you've practised" could become a Pass feature.
- **Never** "we'll get you a job" (the copy rule), never a sportsbook, and no personal data collected to show the list.

**Order:**
1. Analytics on and the first testers through. Without those there's no way to tell whether jobs bring people back better than another game would.
2. A hand test: "5 analyst jobs this week, and the skill they share" in the weekly chart post and the newsletter, and ask the testers whether they'd use it.
3. If people click, build the automated free page.
4. Later, match jobs to each learner's own practice, as a Pass feature.

## Tools for the faceless channels (planned 2026-10-07, not built)

The content playbook (linked from Notion HQ) runs the brand anonymously, with Coach Blitz as the host. These are the site-side tools that make the weekly content batch faster, in build order:

1. **`/go/<channel>` links** for each bio (`/go/tiktok`, `/go/youtube`, `/go/x`, `/go/instagram`, `/go/linkedin`, `/go/newsletter`): a redirect to the home page that `components/site-analytics.tsx` counts as `/~go-<channel>`, the same marker pattern as `?ref=chart`. It's small, and it's how we learn which channel brings people who come back. Needs analytics switched on to read.
2. **Coach's pose pack:** every one of the sixteen moods as a transparent PNG, mouth closed and mouth open, plus the Rookie and the Ref, exported from the real components by a script (an unlinked `/brand` page and a headless browser, like the Notion cover). It feeds the PNGtuber rig described in the playbook.
3. **Export-safe social cards** of each day's Roll Call and Stat Duel at 1080×1920 and 1080×1350: the brand style, team colours and abbreviations in place of logos, no player photos, the daily number and the credit line. They're safe to post because they republish nothing that belongs to anyone else.
4. **A weekly brief:** after each data refresh, the newest week's ten most surprising numbers, each with the query that proves it, written as a Markdown file for Tuesday's chart post and the newsletter. The numbers come from the data, never typed, the same rule as `FACTS`.
5. **"Coach reads your league" intake, later:** a form where a follower sends their own league or a SQL question for the series. It waits on a privacy policy that covers it and a brand inbox; until then it's DMs. Only the sender's own league, with the league's OK before managers' names are shown.

**Posting waits on the anonymity fixes** in Notion: a brand inbox on our own domain, the business name instead of a home address in the legal drafts, and the code under a brand organization. Building the tools doesn't wait on them.

## Open questions / things to revisit

- Exact price points within each range (e.g. is Career Track $1.5K flat, or tiered by cohort vs. 1:1 support level?)
- What the cohort/community mechanism actually is (Discord? scheduled cohorts? always-on?)
- Whether "application strategy support" is self-serve async review or live calls — affects margin and how many Career Track seats can be supported at once
- Certification: self-issued badge vs. something with outside credibility
- **Founding-cohort mechanics**: what specifically triggers "out of early access" (a member count? a date? a funding/revenue milestone?), and how existing members get grandfathered in practice (a tagged account flag, a manually maintained list?). Decide before the first price increase, not after.
- **Live code execution (decided 2026-08-10):** Ship it. Python and R run in-browser via Pyodide and WebR (`lib/runtimes.ts`), lazy-loaded only when a `code` exercise opens. SQL keeps `query` result-set grading. Remaining follow-ups: seed shared fantasy DataFrames into Pyodide/WebR (today those drills use inline toy data), and broaden `code` coverage beyond the first drills in units 7 and 11. Git/stats/viz stay on `mc`/`fill` — they aren't languages with a single REPL.
- ~~Get a second sport's data in~~ and ~~what "in build" means for NBA/MLB~~: answered by "A second sport" above (2026-10-06). The sport picker is gone, so the site promises nothing.
- **The retention number that triggers MLB.** Set it once Vercel Analytics is on.
- **Whether jobs earn a page.** Decided by the hand test in "Jobs, matched to practice": clicks on the weekly five jobs, and whether testers say they'd come back for them.
- **Whether the name still fits.** "DataDraft" now sells Python, R, Git, and statistics too. Renaming is expensive (domain, Vercel project, Stripe, legal docs) and wasn't part of the pivot decision — but the mismatch is real and deserves an explicit keep-or-change call.
- Weekly Challenge & Leaderboard build-out (see above) — auth, database, content workflow, data source, and perks all still need real decisions.

## How to use this doc

When asked to change pricing, positioning, or add/remove tiers on the site: update this document first (or in the same change) so it stays the single source of truth, then update `app/page.tsx` to match. If a requested change conflicts with something decided here (e.g. "make Career Track the popular default"), flag the conflict rather than silently overriding the documented reasoning.

## Non-fan positioning (decided 2026-08-09)

"You don't have to watch football" is now stated explicitly across the funnel: a gold callout in the landing Why section ("Don't watch football? You're still in the right place."), plus one-liners on the Draft Day name screen, the /learn course card, and the Practice Field intro.

Reasoning: the fantasy hook remains the lead pitch (see Target user: Andy — it's what gets fans in the door), but requiring fandom was never real — CURRICULUM.md has always listed fantasy experience as "helpful but not required." This message removes a signup barrier for non-fans without repositioning the product. The claims are kept honest per the trust pillar: football context genuinely is taught in-line, one sentence at a time, and the SQL genuinely transfers unchanged to work data. Don't escalate this into a "sports-agnostic" pitch — that's the multi-sport expansion decision, which stays off the live site until the flagship proves itself.

**Updated 2026-10-02:** the reassurance moved out of the hero and into the FAQ ("Do I need to know a lot about football?"). It still removes the barrier for anyone who arrives; it just isn't the pitch any more, because non-fans aren't who the page is written to (see Target user).
