import Image from "next/image";
import Sandbox from "@/components/sandbox";
import SuccessStories from "@/components/success-stories";
import SupportWidget from "@/components/support-widget";
import SiteNav from "@/components/site-nav";
import ActionGallery from "@/components/action-gallery";
import SportPicker from "@/components/sport-picker";
import RotatingRoles from "@/components/rotating-roles";
import CareerPlaybooks from "@/components/career-playbooks";
import WaitlistForm from "@/components/waitlist-form";

const STATS = [
  // Live course hours from lib/courses.ts (status: "live") — 10+6+14+11+10+6+9.
  { label: "Hours of content", value: "65+" },
  // BLS OEWS May 2025 median, Data Scientists (SOC 15-2051). Not a guarantee.
  { label: "Median DS salary", value: "$120k" },
  // Graded exercises across live lessons in lib/curriculum.ts.
  { label: "Hands-on drills", value: "270+" },
];

const WHY_PILLARS = [
  {
    title: "The whole toolkit, not one language",
    blurb:
      "SQL, Python, Excel, R, Git, stats, visualization — what’s actually on the job post, on one path. Not six random courses you have to stitch together.",
    accent: "gold" as const,
  },
  {
    title: "A domain that explains itself",
    blurb:
      "Nobody needs a primer on “who scored more.” Sports data is easy to picture — even if you don’t follow a team — so you spend energy on the tech, not decoding a fake SaaS company.",
    accent: "turf" as const,
  },
  {
    title: "Real data, real mess",
    blurb:
      "No Titanic.csv. Real NFL weekly fantasy points — byes, injuries, missing games — the same imperfect shape you’ll meet on the job.",
    accent: "gold" as const,
  },
  {
    title: "Useful before you’re “done”",
    blurb:
      "You don’t need to finish the roadmap to get value. Answer a real question about a real season while you’re still learning.",
    accent: "turf" as const,
  },
  {
    title: "A portfolio story anyone gets",
    blurb:
      "“I analyzed my fantasy league in SQL” needs zero setup in an interview. Memorable, easy to walk through, still real technical work.",
    accent: "gold" as const,
  },
];

const WHY_COMPARISON = [
  {
    old: "Toy datasets you memorize, don't understand",
    now: "Real NFL data you can query in the browser today",
  },
  {
    old: "One language, then start over somewhere else",
    now: "SQL, Python, Excel, R, Git & stats on one throughline",
  },
  {
    old: "Business scenarios you've never lived",
    now: "A domain that explains itself on sight",
  },
  {
    old: "A portfolio project that looks like everyone else's",
    now: "A capstone on a domain any interviewer instantly gets",
  },
];

// Mirrors the live skills path — keep in sync with /learn courses.
const ROADMAP = [
  {
    phase: "01",
    title: "SQL",
    blurb:
      "Select, filter, join, and window over real stat sheets. Fundamentals through Advanced — every query runs in your browser.",
    accent: "turf" as const,
  },
  {
    phase: "02",
    title: "Excel",
    blurb:
      "Real formulas against a live grid — lookups, logic, cleaning. The tool most first jobs still hand you on day one.",
    accent: "gold" as const,
  },
  {
    phase: "03",
    title: "Python & pandas",
    blurb:
      "Variables, loops, and DataFrames. Every SQL verb you know has a pandas twin — run for real with Pyodide.",
    accent: "turf" as const,
  },
  {
    phase: "04",
    title: "Statistical thinking",
    blurb:
      "Mean vs. median, sample size, regression to the mean. Stop reporting flukes as facts.",
    accent: "gold" as const,
  },
  {
    phase: "05",
    title: "Git & GitHub",
    blurb:
      "Commits, branches, pull requests — what turns a project into something a hiring manager can open.",
    accent: "turf" as const,
  },
  {
    phase: "06",
    title: "R & visualization",
    blurb:
      "dplyr / ggplot2 plus chart craft — pick the right chart, label it honestly, cut the junk.",
    accent: "gold" as const,
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
            <div className="hero-floodlight absolute inset-0 opacity-28" />
            <div className="hero-grid absolute inset-0 opacity-[0.14]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
            {/* Broadcast lower-third label */}
            <p className="label-broadcast mb-4 text-gold animate-[fadeUp_0.4s_ease-out_forwards]">
              <span className="mr-2 dot-glow-gold inline-block h-1.5 w-1.5 bg-gold align-middle" />
              Free beta · Data skills through sports
            </p>

            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-8">
              {/* Copy column — brand-first, not a SaaS center stack */}
              <div className="lg:col-span-5 lg:pt-4">
                <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-pop sm:text-6xl animate-[fadeUp_0.45s_ease-out_0.05s_forwards] opacity-0">
                  Data
                  <span className="title-glow-turf text-turf">
                    Draft
                  </span>
                </h1>

                <p className="mt-6 max-w-lg font-display text-2xl font-medium leading-snug text-pop sm:text-[1.75rem] animate-[fadeUp_0.45s_ease-out_0.1s_forwards] opacity-0">
                  Become <RotatingRoles />
                  <br />
                  <span className="text-gold">Sports are the lens.</span>
                </p>

                <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft animate-[fadeUp_0.45s_ease-out_0.15s_forwards] opacity-0">
                  Learn SQL, Python, Excel, and more on real NFL data — in your
                  browser, no account. Pick a job title, follow a clear path,
                  and ship portfolio work hiring managers actually understand.
                  You don&apos;t have to watch the games.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3 animate-[fadeUp_0.45s_ease-out_0.2s_forwards] opacity-0">
                  <a
                    href="/learn"
                    className="btn-turf inline-flex items-center gap-2 border border-turf/80 bg-turf px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-turf-dim"
                  >
                    Start learning free
                  </a>
                </div>
                <p className="mt-3 font-mono text-[11px] text-ink-muted animate-[fadeUp_0.45s_ease-out_0.22s_forwards] opacity-0">
                  Or{" "}
                  <a href="#curriculum" className="text-ink-soft underline underline-offset-2 hover:text-turf">
                    skim the skill roadmap
                  </a>
                  .
                </p>

                {/* Scoreboard strip */}
                <div className="mt-10 animate-[fadeUp_0.45s_ease-out_0.25s_forwards] opacity-0">
                  <div className="grid grid-cols-3 gap-px border border-panel-border bg-panel-border/60">
                    {STATS.map((stat) => (
                      <div
                        key={stat.label}
                        className="surface bg-panel/95 px-3 py-4 sm:px-4"
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
                  <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-muted">
                    Salary: U.S. median for Data Scientists, BLS OEWS May
                    2025 — not a placement promise.
                  </p>
                </div>
              </div>

              {/* Sandbox — hero feature, visually dominant */}
              <div
                id="sandbox"
                className="lg:col-span-7 animate-[fadeUp_0.5s_ease-out_0.15s_forwards] opacity-0"
              >
                <div className="shadow-hero-panel relative">
                  {/* Gradient hairline: turf into ice into gold, so the hero panel reads
                      as lit metal rather than as a green box. Corner ticks stay turf. */}
                  <div className="chrome pointer-events-none absolute -inset-px" />
                  <div className="absolute -top-px left-4 h-px w-20 bg-turf edge-glow-turf" />
                  <div className="absolute -left-px top-4 h-20 w-px bg-turf edge-glow-turf" />
                  <Sandbox />
                </div>
                <p className="mt-3 font-mono text-[12px] font-medium text-ink-soft">
                  <span className="text-turf">→</span> This is a real query.
                  Your first lesson is the same thing, shorter.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Action gallery ────────────────────────────── */}
        <ActionGallery />

        {/* ── Pick your sport ───────────────────────────── */}
        <SportPicker />

        {/* ── Why DataDraft ───────────────────────────── */}
        <section
          id="why"
          className="relative overflow-hidden border-t border-panel-border"
        >
          {/* Decorative energy backdrop — diagonal rays + jersey-number
              watermarks, no photography, evokes the broadcast-graphics
              look without depicting any real athlete. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="rays-turf absolute inset-0 opacity-[0.03]" />
            <div className="rays-gold absolute inset-0 opacity-[0.025]" />
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
              Why DataDraft
            </p>
            <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
              Learn data skills on data you already get
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
              Most people don&apos;t fail at code because the syntax is hard.
              They fail because they&apos;re learning new tools and an
              unfamiliar business world at the same time. Sports cuts that
              second problem — so the tech can finally click.
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

            {/* Old way vs. DataDraft comparison */}
            <div className="mt-12 overflow-hidden border border-panel-border">
              <div className="grid grid-cols-2">
                <div className="border-b border-r border-panel-border bg-panel/60 px-4 py-3 sm:px-5">
                  <span className="label-broadcast text-[10px] text-ink-muted">
                    The old way
                  </span>
                </div>
                <div className="border-b border-panel-border bg-turf/5 px-4 py-3 sm:px-5">
                  <span className="label-broadcast text-[10px] text-turf">
                    DataDraft
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

            {/* Beta close — no dollar figures on the page while checkout is off */}
            <p className="mt-10 max-w-2xl text-base leading-relaxed text-ink-soft">
              Bootcamps and degrees bet that immersion works. DataDraft makes
              the same bet — with a domain you already understand — and every
              live lesson is free while we&apos;re in beta.
            </p>

            {/* Non-fan reassurance */}
            <div className="mt-10 surface border border-panel-border bg-panel p-6 sm:p-8">
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
                  — filtering, ranking, modeling, and shipping on player stats
                  is the same code you&apos;ll run on sales, product, or
                  finance data at work. Only the column names change.
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
              One path of skills — not a random catalog. Each phase unlocks
              questions you couldn&apos;t answer in a spreadsheet alone. All of
              it is playable now, no account required.
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

            <div className="mt-10">
              <a
                href="/learn"
                className="btn-turf inline-flex items-center gap-2 border border-turf/80 bg-turf px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-turf-dim"
              >
                Pick a role and start →
              </a>
              <p className="mt-3 max-w-md font-mono text-[11px] leading-relaxed text-ink-muted">
                Free role paths on /learn build your course order automatically.
                Interview cases and Resources are ready when you want the
                job-hunt side.
              </p>
            </div>
          </div>
        </section>

        {/* ── Career Track playbooks ────────────────────── */}
        <CareerPlaybooks />

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
                <div className="surface relative h-full border border-panel-border bg-panel p-5">
                  <div className="flex items-center justify-between">
                    <span className="label-broadcast text-turf">
                      this week&apos;s challenge
                    </span>
                    <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">
                      preview
                    </span>
                  </div>
                  <p className="mt-5 font-mono text-sm leading-relaxed text-ink">
                    Which RB had the highest average PPG across the 2024
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
                <div className="surface h-full border border-panel-border bg-panel p-5">
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
              <div className="w-full max-w-md">
                <WaitlistForm
                  interest="weekly-challenge"
                  source="challenge"
                  label="Notify me"
                />
              </div>
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
              Sister product · optional
            </p>

            <div className="surface relative border border-panel-border bg-panel p-6 sm:p-10">
              <div className="pointer-events-none absolute -inset-px border border-gold/25" />
              <div className="absolute -top-px left-6 h-px w-20 bg-gold edge-glow-gold" />
              <div className="absolute -left-px top-6 h-20 w-px bg-gold edge-glow-gold" />

              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7">
                  <h2 className="font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
                    NFL Stat Guru
                  </h2>
                  <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-wider text-gold">
                    Separate app · ask NFL questions in plain English
                  </p>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
                    Built by the same team — not part of the DataDraft
                    curriculum. If you want instant NFL answers from play-by-play
                    data, it&apos;s over there. If you want to{" "}
                    <em className="not-italic text-ink">learn</em> the skills,
                    stay here and{" "}
                    <a href="/learn" className="text-turf underline underline-offset-2 hover:text-turf-dim">
                      start a lesson
                    </a>
                    .
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
                      className="btn-gold inline-flex items-center gap-2 border border-gold bg-gold px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-gold-dim"
                    >
                      Try NFL Stat Guru ↗
                    </a>
                    <span className="font-mono text-[11px] text-ink-muted">
                      Free to start — no card required
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="grid grid-cols-2 gap-px border border-panel-border bg-panel-border/60">
                    {[
                      { label: "Tracked plays", value: "2.8M+" },
                      { label: "Seasons covered", value: "1999–2024" },
                      { label: "Advanced metrics", value: "340+" },
                      { label: "Players profiled", value: "1,847" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="surface bg-panel px-3 py-4 sm:px-4"
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
              Data<span className="text-turf">Draft</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Code education · Sports as the hook
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <a
              href="/data"
              className="font-mono text-[11px] text-ink-muted underline underline-offset-2 transition-colors hover:text-turf"
            >
              Real NFL data from nflverse · source &amp; download
            </a>
            <p className="font-mono text-[11px] text-ink-muted">
              © {new Date().getFullYear()} DataDraft
            </p>
          </div>
        </div>
      </footer>

      <SupportWidget />
    </div>
  );
}
