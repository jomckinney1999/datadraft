import Image from "next/image";
import Sandbox from "@/components/sandbox";
import SuccessStories from "@/components/success-stories";
import SupportWidget from "@/components/support-widget";
import SiteNav from "@/components/site-nav";
import ActionGallery from "@/components/action-gallery";

const STATS = [
  { label: "Skill phases", value: "4" },
  { label: "Dataset", value: "Full season" },
  { label: "New data", value: "Weekly" },
];

const WHY_PILLARS = [
  {
    title: "Useful before you're “done”",
    blurb:
      "You don't need to finish the roadmap to get value. Query your own league's data to make this week's lineup call while you're still learning — the skill pays for itself before the course does.",
    accent: "amber" as const,
  },
  {
    title: "You already know the domain",
    blurb:
      "Nobody has to explain what a WR route tree or a waiver claim is — you've lived it every Sunday for years. That's an entire layer of learning most courses make you fight through, gone before you write a single query.",
    accent: "teal" as const,
  },
  {
    title: "Real data, real mess",
    blurb:
      "No Titanic.csv, no invented SaaS company. Live NFL and fantasy data — byes, injuries, trades, ties — the same kind of imperfect data you'll actually query on the job.",
    accent: "amber" as const,
  },
  {
    title: "Practice rides a habit you already have",
    blurb:
      "You already check the standings obsessively, on the same weekly clock the season already runs on. SQL Sports turns that exact habit into query practice, instead of asking you to build a study habit from nothing.",
    accent: "teal" as const,
  },
  {
    title: "A portfolio story anyone gets instantly",
    blurb:
      "“I built an analytics tool on fantasy football data” needs zero setup in an interview. It's memorable, easy to talk through, and still real analytical work.",
    accent: "amber" as const,
  },
];

const WHY_COMPARISON = [
  {
    old: "Toy datasets you memorize, don't understand",
    now: "Real, living NFL & fantasy data",
  },
  {
    old: "Business scenarios you've never lived",
    now: "Questions you already ask out loud every week",
  },
  {
    old: "Practice that feels like homework",
    now: "Practice that piggybacks on a habit you already have",
  },
  {
    old: "A portfolio project that looks like everyone else's",
    now: "A capstone built on a domain any interviewer instantly gets",
  },
];

const ROADMAP = [
  {
    phase: "01",
    title: "Select & Filter",
    blurb: "Pull week results. Rank players. Learn WHERE before you memorize syntax.",
    accent: "teal" as const,
  },
  {
    phase: "02",
    title: "Joins & Matchups",
    blurb: "Connect rosters to schedules. One join at a time — defense vs. offense context.",
    accent: "amber" as const,
  },
  {
    phase: "03",
    title: "Aggregations",
    blurb: "Season totals, rolling averages, share of team targets. GROUP BY that earns its keep.",
    accent: "teal" as const,
  },
  {
    phase: "04",
    title: "Window Functions",
    blurb: "Rank within position. Compare to league median. See the play the way analysts do.",
    accent: "amber" as const,
  },
];

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    accent: "teal" as const,
    features: ["Limited SQL sandbox", "Free content library", "Sample season dataset"],
    cta: "Start free",
  },
  {
    name: "Practice",
    price: "15–30",
    period: "/mo",
    accent: "teal" as const,
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
    accent: "amber" as const,
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
    accent: "amber" as const,
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
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 50% 35% at 55% 18%, rgba(255,255,255,0.12), transparent 60%), radial-gradient(ellipse 40% 30% at 80% 25%, rgba(79,209,197,0.08), transparent 55%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.22]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(30,37,51,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(30,37,51,0.9) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage:
                  "radial-gradient(ellipse 75% 65% at 68% 42%, black 15%, transparent 75%)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
            {/* Broadcast lower-third label */}
            <p className="label-broadcast mb-4 text-amber animate-[fadeUp_0.4s_ease-out_forwards]">
              <span className="mr-2 inline-block h-1.5 w-1.5 bg-amber align-middle shadow-[0_0_8px_rgba(232,163,61,0.8)]" />
              Education platform · Fantasy football as the dataset
            </p>

            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
              {/* Copy column — brand-first, not a SaaS center stack */}
              <div className="lg:col-span-5 lg:pt-4">
                <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-pop sm:text-6xl animate-[fadeUp_0.45s_ease-out_0.05s_forwards] opacity-0">
                  SQL
                  <span className="text-teal drop-shadow-[0_0_28px_rgba(79,209,197,0.45)]">
                    Sports
                  </span>
                </h1>

                <p className="mt-6 max-w-md font-display text-2xl font-medium leading-snug text-pop sm:text-[1.75rem] animate-[fadeUp_0.45s_ease-out_0.1s_forwards] opacity-0">
                  Query the season.{" "}
                  <span className="text-amber">Think like an analyst.</span>
                </p>

                <p className="mt-4 max-w-sm text-base leading-relaxed text-[#C5CCD9] animate-[fadeUp_0.45s_ease-out_0.15s_forwards] opacity-0">
                  Learn SQL and data analytics against live fantasy football
                  data — the same questions you already ask on Sundays,
                  written as queries you can use for this week&apos;s lineup,
                  not just for someday.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3 animate-[fadeUp_0.45s_ease-out_0.2s_forwards] opacity-0">
                  <a
                    href="#sandbox"
                    className="inline-flex items-center gap-2 border border-teal bg-teal px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-teal-dim"
                  >
                    Try the sandbox
                  </a>
                  <a
                    href="#curriculum"
                    className="inline-flex items-center gap-2 border border-white/20 bg-night/40 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink transition-colors duration-150 hover:border-amber/70 hover:text-amber backdrop-blur-sm"
                  >
                    See curriculum
                  </a>
                </div>

                {/* Scoreboard strip */}
                <div className="mt-10 grid grid-cols-3 gap-px border border-amber/25 bg-amber/20 animate-[fadeUp_0.45s_ease-out_0.25s_forwards] opacity-0">
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
                <div className="relative shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                  {/* Teal frame — tech/data accent; sharp corners */}
                  <div className="pointer-events-none absolute -inset-px border border-teal/45" />
                  <div className="absolute -top-px left-4 h-px w-20 bg-teal shadow-[0_0_12px_rgba(79,209,197,0.8)]" />
                  <div className="absolute -left-px top-4 h-20 w-px bg-teal shadow-[0_0_12px_rgba(79,209,197,0.8)]" />
                  <Sandbox />
                </div>
                <p className="mt-3 font-mono text-[12px] font-medium text-[#C5CCD9]">
                  <span className="text-teal">→</span> Write real SQL, try a
                  preset, or check the schema. Runs against sample season
                  data, right in your browser — no account required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Action gallery ────────────────────────────── */}
        <ActionGallery />

        {/* ── Why SQL Sports ───────────────────────────── */}
        <section
          id="why"
          className="relative overflow-hidden border-t border-panel-border"
        >
          {/* Decorative energy backdrop — diagonal rays + jersey-number
              watermarks, no photography, evokes the broadcast-graphics
              look without depicting any real athlete. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, #4FD1C5 0px, #4FD1C5 2px, transparent 2px, transparent 64px)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, #E8A33D 32px, #E8A33D 34px, transparent 34px, transparent 96px)",
              }}
            />
            <span className="stat-number-teal absolute -right-6 -top-10 select-none font-display text-[260px] font-bold leading-none opacity-[0.05] sm:text-[320px]">
              07
            </span>
            <span className="stat-number absolute -bottom-16 -left-8 select-none font-display text-[220px] font-bold leading-none opacity-[0.05] sm:text-[280px]">
              18
            </span>
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-broadcast mb-3">
              <span className="mr-2 inline-block h-1.5 w-1.5 bg-teal align-middle" />
              Why SQL Sports
            </p>
            <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
              The fastest way to actually learn SQL
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#C5CCD9]">
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
                    pillar.accent === "teal"
                      ? "hover:border-teal/50"
                      : "hover:border-amber/50"
                  }`}
                >
                  <span
                    className={`mb-3 inline-block h-1.5 w-1.5 ${
                      pillar.accent === "teal" ? "bg-teal" : "bg-amber"
                    }`}
                  />
                  <h3 className="font-display text-lg font-semibold leading-snug text-pop">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#C5CCD9]">
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
                <div className="border-b border-panel-border bg-teal/5 px-4 py-3 sm:px-5">
                  <span className="label-broadcast text-[10px] text-teal">
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
                    className={`bg-teal/[0.03] px-4 py-4 text-sm leading-relaxed text-ink sm:px-5 ${
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
            <p className="mt-10 max-w-2xl text-base leading-relaxed text-[#C5CCD9]">
              A data analytics bootcamp runs $10,000–20,000. A specialized
              analytics master&apos;s can run $20,000–50,000. Both are
              betting that immersion works — dropping you into a domain
              until it clicks. SQL Sports makes the same bet, except it&apos;s
              a domain you&apos;ve already got years of immersion in. You&apos;re
              not paying to learn a new industry and a new skill at once.
              You&apos;re paying to learn one skill, faster, on a dataset
              that&apos;s been running in your head since you were a kid.
            </p>
          </div>
        </section>

        {/* ── Curriculum / roadmap ──────────────────────── */}
        <section
          id="curriculum"
          className="border-t border-panel-border bg-night/60"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-broadcast mb-3">
              <span className="mr-2 inline-block h-1.5 w-1.5 bg-teal align-middle" />
              Curriculum roadmap
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
              From SELECT to window functions
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#C5CCD9]">
              Four phases. Each one unlocks a real fantasy question you couldn&apos;t
              answer in a spreadsheet alone.
            </p>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2">
              {ROADMAP.map((step) => (
                <li
                  key={step.phase}
                  className={`group border border-panel-border bg-panel p-5 transition-colors duration-150 ${
                    step.accent === "teal"
                      ? "hover:border-teal/50"
                      : "hover:border-amber/50"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className={`text-2xl ${
                        step.accent === "teal"
                          ? "stat-number-teal"
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
                  <p className="mt-2 text-sm leading-relaxed text-[#C5CCD9]">
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
              <span className="mr-2 inline-block h-1.5 w-1.5 bg-amber align-middle" />
              Pricing
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
              From first query to career change
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#C5CCD9]">
              Practice for fun, follow the roadmap to get good, or go all the
              way with hands-on support landing a data role.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 border border-amber/30 bg-amber/5 px-3 py-2">
              <span className="inline-block h-1.5 w-1.5 shrink-0 bg-amber shadow-[0_0_8px_rgba(232,163,61,0.8)]" />
              <span className="font-mono text-[11px] leading-snug text-ink-soft">
                <span className="font-semibold uppercase tracking-wider text-amber">
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
                      ? "border-amber/40 hover:border-amber"
                      : "border-panel-border hover:border-teal/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="label-broadcast text-ink">{plan.name}</span>
                    {plan.badge && (
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-amber">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span
                      className={`text-4xl ${
                        plan.featured ? "stat-number" : "stat-number-teal"
                      }`}
                    >
                      ${plan.price}
                    </span>
                    <span className="font-mono text-xs font-medium text-[#C5CCD9]">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-2 text-sm text-[#C5CCD9]"
                      >
                        <span
                          className={
                            plan.accent === "amber" ? "text-amber" : "text-teal"
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
                        ? "border-amber bg-amber/10 text-amber hover:bg-amber/20"
                        : "border-teal/40 bg-teal/5 text-teal hover:border-teal hover:bg-teal/15"
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

        {/* ── Success stories ───────────────────────────── */}
        <SuccessStories />

        {/* ── NFL Stat Guru cross-promo ─────────────────── */}
        <section id="stat-guru" className="border-t border-panel-border bg-night/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="label-broadcast mb-6">
              <span className="mr-2 inline-block h-1.5 w-1.5 bg-amber align-middle" />
              From the same team
            </p>

            <div className="relative border border-panel-border bg-panel p-6 sm:p-10">
              <div className="pointer-events-none absolute -inset-px border border-amber/40" />
              <div className="absolute -top-px left-6 h-px w-20 bg-amber shadow-[0_0_12px_rgba(232,163,61,0.8)]" />
              <div className="absolute -left-px top-6 h-20 w-px bg-amber shadow-[0_0_12px_rgba(232,163,61,0.8)]" />

              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7">
                  <h2 className="font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
                    NFL Stat Guru
                  </h2>
                  <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-wider text-amber">
                    Ask any NFL question. Get an instant answer.
                  </p>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-[#C5CCD9]">
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
                      <li key={f} className="flex gap-2 text-sm text-[#C5CCD9]">
                        <span className="text-amber">▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a
                      href="https://gridiq-eight.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-amber bg-amber px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors duration-150 hover:bg-amber-dim"
                    >
                      Try NFL Stat Guru ↗
                    </a>
                    <span className="font-mono text-[11px] text-ink-muted">
                      Free to start — no card required
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="grid grid-cols-2 gap-px border border-amber/25 bg-amber/20">
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
              SQL<span className="text-teal">Sports</span>
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
