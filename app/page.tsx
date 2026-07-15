import Image from "next/image";
import Sandbox from "@/components/sandbox";

const STATS = [
  { label: "Queries run", value: "12.4k" },
  { label: "Lessons", value: "48" },
  { label: "Avg. time to first join", value: "18m" },
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
    name: "Scout",
    price: "0",
    period: "forever",
    accent: "teal" as const,
    features: ["Live SQL sandbox", "First 8 lessons", "Sample season dataset"],
    cta: "Start free",
  },
  {
    name: "Analyst",
    price: "29",
    period: "/mo",
    accent: "amber" as const,
    features: [
      "Full curriculum",
      "Weekly live datasets",
      "Query notebooks",
      "Certificate track",
    ],
    cta: "Go Analyst",
    featured: true,
  },
  {
    name: "War Room",
    price: "79",
    period: "/mo",
    accent: "teal" as const,
    features: [
      "Everything in Analyst",
      "Team seats (5)",
      "Private league data import",
      "Office hours",
    ],
    cta: "Contact sales",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="relative z-20 border-b border-panel-border/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-pop">
              SQL<span className="text-teal">Sports</span>
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:inline">
              v0.1
            </span>
          </a>
          <nav className="flex items-center gap-6">
            <a
              href="#curriculum"
              className="hidden font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors duration-150 hover:text-teal sm:inline"
            >
              Curriculum
            </a>
            <a
              href="#pricing"
              className="hidden font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors duration-150 hover:text-teal sm:inline"
            >
              Pricing
            </a>
            <a
              href="#sandbox"
              className="border border-teal/50 bg-teal/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-teal transition-colors duration-150 hover:border-teal hover:bg-teal/20"
            >
              Open sandbox
            </a>
          </nav>
        </div>
      </header>

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
                  data — the same questions you already ask on Sundays, written
                  as queries.
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
                  <span className="text-teal">→</span> Edit the query. Hit run.
                  Results are sample season data — no account required.
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
              Pick your seat in the booth
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#C5CCD9]">
              Start in the free sandbox. Upgrade when you want the full season
              track.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col border bg-panel p-5 transition-colors duration-150 ${
                    plan.featured
                      ? "border-amber/40 hover:border-amber"
                      : "border-panel-border hover:border-teal/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="label-broadcast text-ink">{plan.name}</span>
                    {plan.featured && (
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-amber">
                        popular
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
                </div>
              ))}
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
    </div>
  );
}
