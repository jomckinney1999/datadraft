import Link from "next/link";
import SiteNav from "@/components/site-nav";
import SupportWidget from "@/components/support-widget";
import WaitlistForm from "@/components/waitlist-form";
import QotdPanel from "@/components/qotd-panel";
import SuccessStories from "@/components/success-stories";
import FieldBackdrop from "@/components/field-backdrop";
import CourseRail from "@/components/course-rail";
import {
  LANG_LABEL,
  QUESTIONS,
  leagueDay,
  questionOfTheDay,
  questionsIn,
} from "@/lib/questions";
import { INTERVIEW_CASES } from "@/lib/interview-cases";
import { COURSES } from "@/lib/courses";
import { ALL_MODULE, liveLessons } from "@/lib/curriculum";
import { liveProjects } from "@/lib/projects";

/**
 * The landing page.
 *
 * It used to open with a free-form SQL sandbox beside five reasons to trust
 * us, a sport picker for two sports with no data behind them, a four-phase
 * career roadmap and a set of job-title playbooks — seventeen phone screens
 * before the footer.
 *
 * Now it does one thing: put the day's real question in front of you and let
 * you solve it without signing up. Everything else on the page exists to
 * answer "and then what", in the order people ask it: what can I practise,
 * what can I learn, what will I have at the end, does it work for anyone.
 */

// The day's question turns over at midnight Eastern, so this can't be baked
// at build time and doesn't need to be rendered per request.
export const revalidate = 3600;

/** The tiles drifting behind the languages band. */
const GLYPHS = [
  { label: "SQL", left: "6%", top: "22%", delay: "0s", dur: "6s", tone: "turf" },
  { label: "PY", left: "17%", top: "64%", delay: "1.2s", dur: "7.5s", tone: "ice" },
  { label: "R", left: "29%", top: "18%", delay: "2.4s", dur: "6.8s", tone: "gold" },
  { label: "XL", left: "72%", top: "26%", delay: "0.6s", dur: "7s", tone: "turf" },
  { label: "SQL", left: "84%", top: "62%", delay: "3s", dur: "6.2s", tone: "ice" },
  { label: "PY", left: "94%", top: "30%", delay: "1.8s", dur: "8s", tone: "gold" },
] as const;

const WHY = [
  {
    title: "A domain that explains itself",
    blurb:
      "Nobody needs a primer on who scored more. You spend your energy on the code, not on decoding a made-up SaaS company.",
    accent: "turf" as const,
  },
  {
    title: "Real data, real mess",
    blurb:
      "No Titanic.csv. Three seasons of actual NFL scoring — byes, injuries, missing games — the same shape you meet on the job.",
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
  // SQL on the landing page, always: Python costs ~12 MB of Pyodide and R
  // ~30 MB of WebR on first run, and a front door does not get to spend that
  // before anyone has asked for anything.
  const qotd = questionOfTheDay(day, "sql");
  const liveCourses = COURSES.filter((c) => c.status === "live").length;
  // Lessons that actually exist, not the planned total across all ten
  // courses. Counting the plan would put a number on the front page that
  // nobody can go and find.
  const lessonCount = liveLessons(ALL_MODULE).length;

  const WAYS = [
    {
      href: "/questions",
      name: "Questions",
      count: `${QUESTIONS.length} problems`,
      blurb:
        "One problem, one answer, no lesson around it. A new Question of the Day in every language, and a streak that only survives if you solve one.",
      accent: "gold" as const,
    },
    {
      href: "/learn",
      name: "Courses",
      count: `${liveCourses} live`,
      blurb:
        "Short lessons that build from your first SELECT to window functions, pandas and lookups — with the scoreboard on screen the whole way.",
      accent: "turf" as const,
    },
    {
      href: "/projects",
      name: "Projects",
      count: `${liveProjects().length + INTERVIEW_CASES.length} builds & cases`,
      blurb:
        "Pull your own fantasy league through the Sleeper API, or model raw nflverse data into a tested dbt warehouse you can show someone.",
      accent: "ice" as const,
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main>
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="field-stage border-b border-panel-border">
          <FieldBackdrop />

          <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-28">
            <p className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel/70 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft backdrop-blur">
              <span className="dot-glow-gold inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              Free beta · no account needed
            </p>

            <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight text-pop sm:text-6xl lg:text-7xl">
              Data practice that
              <br />
              <span className="title-glow-turf text-turf">
                sounds like Sunday
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Master{" "}
              <span className="text-ink">SQL, Python, R and Excel</span> on
              three real NFL seasons — daily questions, hands-on courses and
              projects you can put your name on. You don&apos;t have to watch
              the games.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/questions" className="press btn-gold">
                Practice questions
              </Link>
              <Link href="/dashboard" className="press btn-turf">
                Start learning free →
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-panel-border bg-panel-border/60">
              {[
                { label: "Questions", value: String(QUESTIONS.length) },
                { label: "Lessons", value: `${lessonCount}+` },
                // 876 rows in week_results: one per game a player actually
                // played, across three seasons. Not 876 games.
                { label: "Real stat lines", value: "876" },
              ].map((s) => (
                <div key={s.label} className="bg-panel/90 px-3 py-4 backdrop-blur">
                  <p className="stat-number text-2xl sm:text-3xl">{s.value}</p>
                  <p className="label-broadcast mt-1 text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Today's question, playable ─────────────────── */}
        <section className="border-b border-panel-border bg-night/40">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="mb-5 text-center">
              <p className="label-broadcast text-gold">today&apos;s question</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                Solve it right here
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
                A real database, running in your browser. Everyone gets the
                same question today, and it changes at midnight Eastern.
              </p>
            </div>
            <QotdPanel question={qotd} />
          </div>
        </section>

        {/* ── Four languages ─────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-panel-border">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="edge-glow-gold absolute inset-x-0 top-0 h-px" />
            {GLYPHS.map((g, i) => (
              <span
                key={`${g.label}-${i}`}
                className={`glyph-float absolute hidden select-none rounded-xl border px-3 py-2 font-mono text-[11px] font-bold tracking-widest sm:block ${
                  g.tone === "turf"
                    ? "border-turf/30 bg-turf/10 text-turf/70"
                    : g.tone === "ice"
                      ? "border-ice/30 bg-ice/10 text-ice/70"
                      : "border-gold/30 bg-gold/10 text-gold/70"
                }`}
                style={{
                  left: g.left,
                  top: g.top,
                  animationDelay: g.delay,
                  animationDuration: g.dur,
                }}
              >
                {g.label}
              </span>
            ))}
          </div>

          <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
            <p className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-5 py-2 font-display text-lg font-bold text-gold sm:text-xl">
              {QUESTIONS.length} hands-on questions
            </p>
            <h2 className="mx-auto mt-5 max-w-xl font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">
              in {(["sql", "python", "r", "excel"] as const).map((l, i, a) => (
                <span key={l} className="text-turf">
                  {LANG_LABEL[l]}
                  {i < a.length - 2 ? ", " : i === a.length - 2 ? " and " : ""}
                </span>
              ))}
              , with real datasets and a built-in editor that actually runs
              your code.
            </h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {(["sql", "python", "r", "excel"] as const).map((l) => (
                <Link
                  key={l}
                  href="/questions"
                  className="rounded-lg border border-panel-border bg-panel/80 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-turf/50 hover:text-turf"
                >
                  {LANG_LABEL[l]} · {questionsIn(l).length}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── The catalogue, going past ──────────────────── */}
        <section className="border-b border-panel-border bg-night/40 py-14 sm:py-20">
          <div className="mx-auto mb-8 max-w-6xl px-4 text-center sm:px-6">
            <p className="label-broadcast text-ice">the catalogue</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Ten courses, one throughline
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              Start at SELECT and finish somewhere useful. Every course runs on
              the same football data, so nothing you learn is trapped in the
              lesson that taught it.
            </p>
          </div>
          <CourseRail />
          <div className="mt-8 text-center">
            <Link
              href="/learn"
              className="rounded-xl border border-panel-border px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-turf/50 hover:text-turf"
            >
              Browse all courses →
            </Link>
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
              The daily questions run on three pinned seasons so the answers
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
              SQL · Python · R · Excel · Football as the lens
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
