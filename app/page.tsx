import Image from "next/image";
import Sandbox from "@/components/sandbox";
import SuccessStories from "@/components/success-stories";
import SupportWidget from "@/components/support-widget";
import SiteNav from "@/components/site-nav";
import ActionGallery from "@/components/action-gallery";
import SportPicker from "@/components/sport-picker";

const STATS = [
  { label: "Skills taught", value: "6" },
  { label: "Sports", value: "3" },
  { label: "New data", value: "Weekly" },
];

const WHY_PILLARS = [
  {
    title: "The whole toolkit, not one language",
    blurb:
      "SQL, Python, R, Git, statistics, visualization — the actual list on a data analyst job posting, on one throughline. Not six disconnected courses you have to stitch together yourself.",
    accent: "gold" as const,
  },
  {
    title: "A domain that explains itself",
    blurb:
      "Nobody needs a primer on “who scored more points.” Sports data is legible on sight, whether you follow a team or not — that's an entire layer of learning most courses make you fight through, gone before you write a single query.",
    accent: "turf" as const,
  },
  {
    title: "Real data, real mess",
    blurb:
      "No Titanic.csv, no invented SaaS company. Live sports data — byes, injuries, trades, mid-season roster moves — the same kind of imperfect data you'll actually query on the job.",
    accent: "gold" as const,
  },
  {
    title: "Useful before you're “done”",
    blurb:
      "You don't need to finish the roadmap to get value. Answer a real question about a real season while you're still learning — the skill pays for itself before the course does.",
    accent: "turf" as const,
  },
  {
    title: "A portfolio story anyone gets instantly",
    blurb:
      "“I built an analytics tool on NBA shot data” needs zero setup in an interview. It's memorable, easy to talk through, and still real analytical work.",
    accent: "gold" as const,
  },
];

const WHY_COMPARISON = [
  {
    old: "Toy datasets you memorize, don't understand",
    now: "Real, living NFL, NBA & MLB data",
  },
  {
    old: "One language, then start over somewhere else",
    now: "SQL, Python, R, Git & stats on one throughline",
  },
  {
    old: "Business scenarios you've never lived",
    now: "A domain that explains itself on sight",
  },
  {
    old: "A portfolio project that looks like everyone else's",
    now: "A capstone built on a domain any interviewer instantly gets",
  },
];

// Mirrors the live units in lib/curriculum.ts — keep the two in sync.
const ROADMAP = [
  {
    phase: "01",
    title: "SQL",
    blurb:
      "Select, filter, rank, and aggregate real stat sheets. Four units, written against live data.",
    accent: "turf" as const,
  },
  {
    phase: "02",
    title: "Python & pandas",
    blurb:
      "Variables, loops, and DataFrames. Every SQL verb you know has a pandas twin.",
    accent: "gold" as const,
  },
  {
    phase: "03",
    title: "Statistical thinking",
    blurb:
      "Mean vs. median, sample size, regression to the mean. Stop reporting flukes.",
    accent: "turf" as const,
  },
  {
    phase: "04",
    title: "Visualization",
    blurb:
      "Pick the right chart, label it honestly, cut everything that isn't the argument.",
    accent: "gold" as const,
  },
  {
    phase: "05",
    title: "Git & GitHub",
    blurb:
      "Commits, branches, pull requests — what turns your capstone into something hiring managers can open.",
    accent: "turf" as const,
  },
  {
    phase: "06",
    title: "R & the tidyverse",
    blurb:
      "dplyr and ggplot2. A huge share of public sports analytics is written in R.",
    accent: "gold" as const,
  },
];

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    accent: "turf" as const,
    features: ["Limited SQL sandbox", "Free content library", "Sample season dataset"],
    cta: "Start free",
  },
  {
    name: "Practice",
    price: "15–30",
    period: "/mo",
    accent: "turf" as const,
    features: [
      "Unlimited sandbox access",
      "Ongoing weekly problem sets",
      "Live season datasets",
    ],
    cta: "Start practicing",
  },
  {
    name: "Roadmap",
    price: "200–500",
    period: "one-time",
    accent: "gold" as const,
    features: [
      "Full Beginner → Advanced pathway",
      "Portfolio capstone project",
      "Completion credential",
    ],
    cta: "Unlock the Roadmap",
  },
  {
    name: "Career Track",
    price: "1k–5k",
    period: "/yr",
    accent: "gold" as const,
    badge: "premium",
    features: [
      "Everything in Roadmap",
      "Resume & portfolio review",
      "Mock interview practice",
      "Application strategy support",
    ],
    cta: "Apply for Career Track",
    featured: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ─────────────────────────────────────────── */}
      <SiteNav />

      <main>
        {/* ── HERO ──────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Full-bleed stadium night — sports atmosphere */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Image
              src="/hero-stadium-night.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_35%]"
            />
            <div className="hero-media-scrim absolute inset-0" />
            {/* Floodlight wash + scoreboard grid */}
            <div className="hero-floodlight absolute inset-0 opacity-40" />
            <div className="hero-grid absolute inset-0 opacity-[0.22]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
            {/* Broadcast lower-third label */}
            <p className="label-broadcast mb-4 text-gold animate-[fadeUp_0.4s_ease-out_forwards]">
              <span className="mr-2 dot-glow-gold inline-block h-1.5 w-1.5 bg-gold align-middle" />
              Tech education · Sports as the lens
            </p>

            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
              {/* Copy column — brand-first, not a SaaS center stack */}
              <div className="lg:col-span-5 lg:pt-4">
                <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-pop sm:text-6xl animate-[fadeUp_0.45s_ease-out_0.05s_forwards] opacity-0">
                  SQL
                  <span className="title-glow-turf text-turf">
                    Sports
                  </span>
                </h1>

                <p className="mt-6 max-w-md font-display text-2xl font-medium leading-snug text-pop sm:text-[1.75rem] animate-[fadeUp_0.45s_ease-out_0.1s_forwards] opacity-0">
                  Become a data analyst.{" "}
                  <span className="text-gold">Sports are the lens.</span>
                </p>

                <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft animate-[fadeUp_0.45s_ease-out_0.15s_forwards] opacity-0">
                  SQL, Python, R, Git, statistics — the whole toolkit an
                  aspiring data analyst or data scientist actually needs, taught
                  through football, basketball, or baseball. Pick your sport;
                  the tech is the only new thing. You don&apos;t have to watch
                  the games.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3 animate-[fadeUp_0.45s_ease-out_0.2s_forwards] opacity-0">
                  <a
                    href="#sandbox"
                    className="inline-flex items-center gap-2 border border-turf bg-turf px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-turf-dim"
                  >
                    Try the sandbox
                  </a>
                  <a
                    href="#curriculum"
                    className="inline-flex items-center gap-2 border border-white/20 bg-night/40 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink transition-colors duration-150 hover:border-gold/70 hover:text-gold backdrop-blur-sm"
                  >
                    See curriculum
                  </a>
                </div>

                {/* Scoreboard strip */}
                <div className="mt-10 grid grid-cols-3 gap-px border border-gold/25 bg-gold/20 animate-[fadeUp_0.45s_ease-out_0.25s_forwards] opacity-0">
                  {STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-panel/90 px-3 py-4 backdrop-blur-sm sm:px-4"
                    >
                      <p className="label-broadcast mb-1.5 text-[10px]">
                        {stat.label}
                      </p>
                      <p className="stat-number text-2xl sm:text-3xl">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sandbox — hero feature, visually dominant */}
              <div
                id="sandbox"
                className="lg:col-span-7 animate-[fadeUp_0.5s_ease-out_0.15s_forwards] opacity-0"
              >
                <div className="shadow-hero-panel relative">
                  {/* Teal frame — tech/data accent; sharp corners */}
                  <div className="pointer-events-none absolute -inset-px border border-turf/45" />
                  <div className="absolute -top-px left-4 h-px w-20 bg-turf edge-glow-turf" />
                  <div className="absolute -left-px top-4 h-20 w-px bg-turf edge-glow-turf" />
                  <Sandbox />
                </div>
                <p className="mt-3 font-mono text-[12px] font-medium text-ink-soft">
                  <span className="text-turf">→</span> Write real SQL, try a
                  preset, or check the schema. Runs against sample season
                  data, right in your browser — no account required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Action gallery ────────────────────────────── */}
        <ActionGallery />

        {/* ── Pick your sport ───────────────────────────── */}
        <SportPicker />

        {/* ── Why SQL Sports ───────────────────────────── */}
        <section
          id="why"
          className="relative overflow-hidden border-t border-panel-border"
        >
          {/* Decorative energy backdrop — diagonal rays + jersey-number
              watermarks, no photography, evokes the broadcast-graphics
              look without depicting any real athlete. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="rays-turf absolute inset-0 opacity-[0.05]" />
            <div className="rays-gold absolute inset-0 opacity-[0.04]" />
            <span className="stat-number-turf absolute -right-6 -top-10 select-none font-display text-[260px] font-bold leading-none opacity-[0.05] sm:text-[320px]">
              07
            </span>
            <span className="stat-number absolute -bottom-16 -left-8 select-none font-display text-[220px] font-bold leading-none opacity-[0.05] sm:text-[280px]">
              18
            </span>
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-broadcast mb-3">
              <span className="mr-2 inline-block h-1.5 w-1.5 bg-turf align-middle" />
              Why SQL Sports
            </p>
            <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
              The fastest way to actually learn SQL
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
              Most people don&apos;t fail at SQL because it&apos;s hard. They
              fail because they&apos;re learning new syntax and an unfamiliar
              business scenario at the same time, on data they don&apos;t
              care about. Remove the second problem, and the syntax stops
              being the hard part.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_PILLARS.map((pillar) => (
                <div
                  key={pillar.title}
                  className={`border border-panel-border bg-panel p-5 transition-colors duration-150 ${
                    pillar.accent === "turf"
                      ? "hover:border-turf/50"
                      : "hover:border-gold/50"
                  }`}
                >
                  <span
                    className={`mb-3 inline-block h-1.5 w-1.5 ${
                      pillar.accent === "turf" ? "bg-turf" : "bg-gold"
                    }`}
                  />
                  <h3 className="font-display text-lg font-semibold leading-snug text-pop">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {pillar.blurb}
                  </p>
                </div>
              ))}
            </div>

            {/* Old way vs. SQL Sports comparison */}
            <div className="mt-12 overflow-hidden border border-panel-border">
              <div className="grid grid-cols-2">
                <div className="border-b border-r border-panel-border bg-panel/60 px-4 py-3 sm:px-5">
                  <span className="label-broadcast text-[10px] text-ink-muted">
                    The old way
                  </span>
                </div>
                <div className="border-b border-panel-border bg-turf/5 px-4 py-3 sm:px-5">
                  <span className="label-broadcast text-[10px] text-turf">
                    SQL Sports
                  </span>
                </div>
              </div>
              {WHY_COMPARISON.map((row, i) => (
                <div key={row.old} className="grid grid-cols-2">
                  <div
                    className={`border-r border-panel-border px-4 py-4 text-sm leading-relaxed text-ink-muted sm:px-5 ${
                      i !== WHY_COMPARISON.length - 1
                        ? "border-b border-panel-border/60"
                        : ""
                    }`}
                  >
                    {row.old}
                  </div>
                  <div
                    className={`bg-turf/[0.03] px-4 py-4 text-sm leading-relaxed text-ink sm:px-5 ${
                      i !== WHY_COMPARISON.length - 1
                        ? "border-b border-panel-border/60"
                        : ""
                    }`}
                  >
                    {row.now}
                  </div>
                </div>
              ))}
            </div>

            {/* Worth-the-money close */}
            <p className="mt-10 max-w-2xl text-base leading-relaxed text-ink-soft">
              A data analytics bootcamp runs $10,000–20,000. A specialized
              analytics master&apos;s can run $20,000–50,000. Both are
              betting that immersion works — dropping you into a domain
              until it clicks. SQL Sports makes the same bet, except it&apos;s
              a domain you&apos;ve already got years of immersion in. You&apos;re
              not paying to learn a new industry and a new skill at once.
              You&apos;re paying to learn one skill, faster, on a dataset
              that&apos;s been running in your head since you were a kid.
            </p>

            {/* Non-fan reassurance */}
            <div className="mt-10 border border-gold/40 bg-gold/[0.04] p-6 sm:p-8">
              <p className="label-broadcast text-gold">
                Don&apos;t watch sports?
              </p>
              <h3 className="mt-2 max-w-xl font-display text-2xl font-bold tracking-tight text-pop">
                You&apos;re still in the right place.
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <p className="text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">
                    The football is just the dataset
                  </span>{" "}
                  — rows, columns, and numbers. If you can read &ldquo;this
                  player scored 22.4 points in week 5,&rdquo; you already know
                  all the football this course requires.
                </p>
                <p className="text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">
                    Context arrives when it matters
                  </span>{" "}
                  — one plain sentence at a time, right in the lesson. What a
                  quarterback is, what fantasy points measure. No homework, no
                  jargon walls.
                </p>
                <p className="text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">
                    The skill transfers one-to-one
                  </span>{" "}
                  — filtering, ranking, and aggregating player stats is the
                  exact SQL you&apos;ll run on sales, product, or finance data
                  at work. Only the column names change.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Curriculum / roadmap ──────────────────────── */}
        <section
          id="curriculum"
          className="border-t border-panel-border bg-night/60"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-broadcast mb-3">
              <span className="mr-2 inline-block h-1.5 w-1.5 bg-turf align-middle" />
              Curriculum roadmap
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
              From your first SELECT to a portfolio anyone can open
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
              Six skills, one roadmap. Each phase unlocks a real question you
              couldn&apos;t answer in a spreadsheet alone — and all of it is
              playable now, no account required.
            </p>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2">
              {ROADMAP.map((step) => (
                <li
                  key={step.phase}
                  className={`group border border-panel-border bg-panel p-5 transition-colors duration-150 ${
                    step.accent === "turf"
                      ? "hover:border-turf/50"
                      : "hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className={`text-2xl ${
                        step.accent === "turf"
                          ? "stat-number-turf"
                          : "stat-number"
                      }`}
                    >
                      {step.phase}
                    </span>
                    <span className="label-broadcast">phase</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold text-pop">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {step.blurb}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────── */}
        <section id="pricing" className="border-t border-panel-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-broadcast mb-3">
              <span className="mr-2 dot-glow-gold inline-block h-1.5 w-1.5 bg-gold align-middle" />
              Pricing
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
              From first query to career change
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
              Practice for fun, follow the roadmap to get good, or go all the
              way with hands-on support landing a data role.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 border border-gold/30 bg-gold/5 px-3 py-2">
              <span className="dot-glow-gold inline-block h-1.5 w-1.5 shrink-0 bg-gold" />
              <span className="font-mono text-[11px] leading-snug text-ink-soft">
                <span className="font-semibold uppercase tracking-wider text-gold">
                  Founding cohort pricing
                </span>{" "}
                — locked in for early members, rises once we&apos;re out of
                early access.
              </span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  id={plan.name === "Career Track" ? "career-track" : undefined}
                  className={`flex scroll-mt-20 flex-col border bg-panel p-5 transition-colors duration-150 ${
                    plan.featured
                      ? "border-gold/40 hover:border-gold"
                      : "border-panel-border hover:border-turf/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="label-broadcast text-ink">{plan.name}</span>
                    {plan.badge && (
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-gold">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span
                      className={`text-4xl ${
                        plan.featured ? "stat-number" : "stat-number-turf"
                      }`}
                    >
                      ${plan.price}
                    </span>
                    <span className="font-mono text-xs font-medium text-ink-soft">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-2 text-sm text-ink-soft"
                      >
                        <span
                          className={
                            plan.accent === "gold" ? "text-gold" : "text-turf"
                          }
                        >
                          ▸
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#sandbox"
                    className={`mt-6 block border px-4 py-2.5 text-center font-mono text-xs uppercase tracking-wider transition-colors duration-150 ${
                      plan.featured
                        ? "border-gold bg-gold/10 text-gold hover:bg-gold/20"
                        : "border-turf/40 bg-turf/5 text-turf hover:border-turf hover:bg-turf/15"
                    }`}
                  >
                    {plan.cta}
                  </a>
                  {plan.name === "Career Track" && (
                    <p className="mt-3 text-center font-mono text-[10px] leading-relaxed text-ink-muted">
                      Kept intentionally small — 1:1 review and mock
                      interviews don&apos;t scale, so we don&apos;t pretend
                      they do.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Weekly Challenge & Leaderboard (preview) ──── */}
        <section id="challenge" className="border-t border-panel-border bg-night/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-broadcast mb-3">
              <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse bg-turf align-middle" />
              Coming soon
            </p>
            <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
              Weekly Challenge &amp; Leaderboard
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
              Every Monday night, that week&apos;s live stats drop as a new
              SQL challenge. Answer correctly, earn points, climb the board.
              What&apos;s below is a preview of the idea — not live data yet.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              {/* Challenge card preview */}
              <div className="lg:col-span-7">
                <div className="relative h-full border border-panel-border bg-panel p-5">
                  <div className="flex items-center justify-between">
                    <span className="label-broadcast text-turf">
                      this week&apos;s challenge
                    </span>
                    <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">
                      preview
                    </span>
                  </div>
                  <p className="mt-5 font-mono text-sm leading-relaxed text-ink">
                    Which RB had the highest average PPG across the 2018
                    season?
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-panel-border pt-4">
                    <span className="stat-number text-lg">+50</span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                      points
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-ink-muted">
                      Drops Monday nights
                    </span>
                  </div>
                </div>
              </div>

              {/* Leaderboard skeleton preview — no fake usernames/scores */}
              <div className="lg:col-span-5">
                <div className="h-full border border-panel-border bg-panel p-5">
                  <div className="flex items-center justify-between">
                    <span className="label-broadcast text-turf">
                      leaderboard
                    </span>
                    <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">
                      preview
                    </span>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {[1, 2, 3, 4].map((rank) => (
                      <li key={rank} className="flex items-center gap-3">
                        <span className="w-4 font-mono text-xs text-ink-muted">
                          {rank}
                        </span>
                        <span className="h-3 flex-1 animate-pulse bg-panel-hover" />
                        <span className="h-3 w-10 animate-pulse bg-panel-hover" />
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                    Real usernames, once this is live
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="mailto:jomckinney1999@gmail.com?subject=Notify%20me%20%E2%80%94%20Weekly%20Challenge&body=Let%20me%20know%20when%20the%20Weekly%20Challenge%20%26%20Leaderboard%20launches!"
                className="inline-flex items-center gap-2 border border-turf bg-turf px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-turf-dim"
              >
                Notify me when this launches
              </a>
            </div>
          </div>
        </section>

        {/* ── Success stories ───────────────────────────── */}
        <SuccessStories />

        {/* ── NFL Stat Guru cross-promo ─────────────────── */}
        <section id="stat-guru" className="border-t border-panel-border bg-night/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-broadcast mb-6">
              <span className="mr-2 dot-glow-gold inline-block h-1.5 w-1.5 bg-gold align-middle" />
              From the same team
            </p>

            <div className="relative border border-panel-border bg-panel p-6 sm:p-10">
              <div className="pointer-events-none absolute -inset-px border border-gold/40" />
              <div className="absolute -top-px left-6 h-px w-20 bg-gold edge-glow-gold" />
              <div className="absolute -left-px top-6 h-20 w-px bg-gold edge-glow-gold" />

              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7">
                  <h2 className="font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
                    NFL Stat Guru
                  </h2>
                  <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-wider text-gold">
                    Ask any NFL question. Get an instant answer.
                  </p>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
                    Our sister platform for the truly obsessed — the questions
                    ESPN can&apos;t answer, answered in plain English. Ask a
                    question, get a real answer, pulled straight from decades
                    of NFL play-by-play data.
                  </p>

                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {[
                      "AI-powered search — ask in plain English",
                      "340+ advanced metrics: EPA, YPRR, CPOE",
                      "Route tracking & coverage data",
                      "Prospect profiles with grades & comps",
                    ].map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-ink-soft">
                        <span className="text-gold">▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a
                      href="https://gridiq-eight.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-gold bg-gold px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-gold-dim"
                    >
                      Try NFL Stat Guru ↗
                    </a>
                    <span className="font-mono text-[11px] text-ink-muted">
                      Free to start — no card required
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="grid grid-cols-2 gap-px border border-gold/25 bg-gold/20">
                    {[
                      { label: "Tracked plays", value: "2.8M+" },
                      { label: "Seasons covered", value: "1999–2024" },
                      { label: "Advanced metrics", value: "340+" },
                      { label: "Players profiled", value: "1,847" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-night/60 px-3 py-4 backdrop-blur-sm sm:px-4"
                      >
                        <p className="label-broadcast mb-1.5 text-[10px]">
                          {stat.label}
                        </p>
                        <p className="stat-number text-xl sm:text-2xl">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-panel-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="font-display text-sm font-semibold text-ink">
              SQL<span className="text-turf">Sports</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Code education · Sports as the hook
            </p>
          </div>
          <p className="font-mono text-[11px] text-ink-muted">
            © {new Date().getFullYear()} SQL Sports
          </p>
        </div>
      </footer>

      <SupportWidget />
    </div>
  );
}
