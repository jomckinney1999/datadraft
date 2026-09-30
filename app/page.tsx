import Link from "next/link";
import SiteNav from "@/components/site-nav";
import SupportWidget from "@/components/support-widget";
import WaitlistForm from "@/components/waitlist-form";
import QotdPanel from "@/components/qotd-panel";
import SuccessStories from "@/components/success-stories";
import { leagueDay, questionOfTheDay, QUESTIONS } from "@/lib/questions";
import { INTERVIEW_CASES } from "@/lib/interview-cases";
import { COURSES } from "@/lib/courses";

/**
 * The landing page.
 *
 * It used to open with a free-form SQL sandbox beside five reasons to trust
 * us, a sport picker for two sports that had no data behind them, a
 * four-phase career roadmap and a set of job-title playbooks — seventeen
 * phone screens before the footer.
 *
 * Now it does one thing: put the day's real question in front of you and let
 * you solve it without signing up. Everything below the fold is there to say
 * what happens after you do.
 */

// The day's question turns over at midnight Eastern, so this can't be baked
// at build time and doesn't need to be rendered per request.
export const revalidate = 3600;

const WHY = [
  {
    title: "A domain that explains itself",
    blurb:
      "Nobody needs a primer on who scored more. You spend your energy on the SQL, not on decoding a made-up SaaS company.",
    accent: "turf" as const,
  },
  {
    title: "Real data, real mess",
    blurb:
      "No Titanic.csv. Three seasons of actual NFL weekly scoring — byes, injuries, missing games — the same shape you meet on the job.",
    accent: "gold" as const,
  },
  {
    title: "Useful before you're done",
    blurb:
      "You don't have to finish anything to get value. Answer a real question about a real season on day one.",
    accent: "ice" as const,
  },
];

export default function Home() {
  const day = leagueDay();
  const qotd = questionOfTheDay(day);
  const liveCourses = COURSES.filter((c) => c.status === "live").length;

  const WAYS = [
    {
      href: "/questions",
      name: "Questions",
      count: `${QUESTIONS.length} problems`,
      blurb:
        "One problem, one answer, no lesson around it. A new Question of the Day every morning and a streak that only survives if you solve it.",
      accent: "gold" as const,
    },
    {
      href: "/learn",
      name: "Courses",
      count: `${liveCourses} live`,
      blurb:
        "Short lessons that build from SELECT to window functions, with the football scoreboard on screen the whole way.",
      accent: "turf" as const,
    },
    {
      href: "/projects",
      name: "Projects",
      count: `${INTERVIEW_CASES.length + 2} builds & cases`,
      blurb:
        "Pull your own fantasy league through the Sleeper API, or model raw nflverse data into a dbt warehouse you can show someone.",
      accent: "ice" as const,
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main>
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-panel-border">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="hero-floodlight absolute inset-0 opacity-25" />
            <div className="hero-grid absolute inset-0 opacity-[0.12]" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
            <p className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              <span className="dot-glow-gold inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              Free beta · no account needed
            </p>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.02] tracking-tight text-pop sm:text-6xl">
              SQL practice that
              <br />
              <span className="title-glow-turf text-turf">sounds like Sunday</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              LeetCode for football data. Real NFL scoring from 2022&ndash;2024,
              a new question every day, and courses that take you from your
              first SELECT to window functions. You don&apos;t have to watch the
              games.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/questions" className="press btn-gold">
                Practice questions
              </Link>
              <Link href="/dashboard" className="press btn-turf">
                Start learning free →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Today's question, playable ─────────────────── */}
        <section className="border-b border-panel-border bg-night/40">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="mb-5 text-center">
              <p className="label-broadcast text-gold">today&apos;s question</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                Try it right here
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
                Real database, running in your browser. Everyone gets the same
                question today, and it changes at midnight Eastern.
              </p>
            </div>
            <QotdPanel question={qotd} />
          </div>
        </section>

        {/* ── Three ways in ──────────────────────────────── */}
        <section className="border-b border-panel-border">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <h2 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">
              Three ways to get reps
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {WAYS.map((w) => (
                <Link
                  key={w.href}
                  href={w.href}
                  className="lift surface group flex flex-col rounded-2xl border border-panel-border bg-panel p-6 transition-colors hover:border-turf/40"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`font-display text-xl font-bold ${
                        w.accent === "turf"
                          ? "text-turf"
                          : w.accent === "ice"
                            ? "text-ice"
                            : "text-gold"
                      }`}
                    >
                      {w.name}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                      {w.count}
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {w.blurb}
                  </p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors group-hover:text-ink">
                    Open →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why this works ─────────────────────────────── */}
        <section className="border-b border-panel-border bg-night/40">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid gap-6 sm:grid-cols-3">
              {WHY.map((p) => (
                <div key={p.title}>
                  <p
                    className={`font-display text-lg font-bold ${
                      p.accent === "turf"
                        ? "text-turf"
                        : p.accent === "ice"
                          ? "text-ice"
                          : "text-gold"
                    }`}
                  >
                    {p.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {p.blurb}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center font-mono text-[11px] text-ink-muted">
              Every number on this site is a real NFL result you can check
              against a box score.{" "}
              <Link href="/data" className="text-turf hover:underline">
                Where the data comes from
              </Link>
            </p>
          </div>
        </section>

        <SuccessStories />

        {/* ── Weekly challenge waitlist ──────────────────── */}
        <section className="border-t border-panel-border">
          <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
            <p className="label-broadcast text-ice">coming next</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">
              A weekly challenge on live scoring
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
              The daily question runs on three pinned seasons so the answers
              never move under you. The weekly one will run on the week that
              just happened. Leave an email and we&apos;ll tell you when it
              lands.
            </p>
            <div className="mx-auto mt-5 max-w-sm">
              <WaitlistForm
                interest="weekly-challenge"
                source="home"
                label="Notify me"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-panel-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="font-display text-sm font-semibold text-ink">
              Data<span className="text-turf">Draft</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              SQL practice · Football as the lens
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Link
              href="/data"
              className="font-mono text-[11px] text-ink-muted underline underline-offset-2 transition-colors hover:text-turf"
            >
              Real NFL data from nflverse · source &amp; download
            </Link>
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
