# SQL Sports — Product & Pricing Plan

This is the source of truth for product structure, pricing, and positioning decisions. Update it whenever the business model changes, *before* or alongside code changes — this is what future Claude/Cursor sessions read to understand why the landing page is shaped the way it is.

Last updated: 2026-07-15.

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

The landing page has a dedicated "Why SQL Sports" section (`app/page.tsx`, `#why`, between the hero and the curriculum) making the explicit case for why learning SQL through sports is worth paying for. The argument, in order:

1. **You already know the domain** — most SQL courses make you learn unfamiliar syntax and an unfamiliar business scenario (fictional SaaS churn, etc.) at the same time. SQL Sports removes the second problem because the learner already understands fantasy football, so only the syntax is actually new.
2. **Real data, real mess** — live NFL/fantasy data (byes, injuries, trades) instead of toy datasets (Titanic, Iris), which is closer to what real analyst work looks like.
3. **Practice rides an existing habit** — checking standings/scores is a habit the learner already has; SQL Sports repurposes it instead of requiring a new study habit built from zero.
4. **A portfolio story anyone gets instantly** — "I built an analytics tool on fantasy football data" needs no setup in an interview, unlike a generic bootcamp project.
5. **Cheaper than the alternatives** — direct cost comparison to data analytics bootcamps ($10–20K) and specialized analytics master's programs ($20–50K), framed as the same "immersion" bet those make, minus the cost of also learning a brand-new industry.

This is the same reasoning as the Andy persona section above, generalized into on-page copy — keep the two in sync. Point 5 in particular is a direct restatement of Andy's math (see above) and should move together with any changes to that reasoning or to the bootcamp/master's price comparisons.

## Product ladder

| Tier | What's included | Price | Who it's for |
|---|---|---|---|
| **Free** | Free content (YouTube/LinkedIn/Substack), limited sandbox access | $0 | Top-of-funnel, everyone |
| **Practice** | Full sandbox subscription, ongoing problem sets, live season datasets | $15–30/mo | Hobbyists, casual skill-builders |
| **Roadmap** | Full Beginner → Advanced course pathway, portfolio capstone, completion credential | $200–500 one-time | Serious learners, not yet job-hunting |
| **Career Track** | Everything in Roadmap + resume/portfolio review + mock interview practice + application strategy support | $1,000–5,000/yr | Andy, once he's decided this is a career move, not a hobby |

This ladder is implemented on the landing page pricing section (`app/page.tsx`, `PLANS` array) and linked from the nav (`Career Track` tab → `#career-track` anchor on the Career Track card).

## Open questions / things to revisit

- Exact price points within each range (e.g. is Career Track $1.5K flat, or tiered by cohort vs. 1:1 support level?)
- What the cohort/community mechanism actually is (Discord? scheduled cohorts? always-on?)
- Whether "application strategy support" is self-serve async review or live calls — affects margin and how many Career Track seats can be supported at once
- Certification: self-issued badge vs. something with outside credibility

## How to use this doc

When asked to change pricing, positioning, or add/remove tiers on the site: update this document first (or in the same change) so it stays the single source of truth, then update `app/page.tsx` to match. If a requested change conflicts with something decided here (e.g. "make Career Track the popular default"), flag the conflict rather than silently overriding the documented reasoning.
