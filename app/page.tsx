import Link from "next/link";
import SiteNav from "@/components/site-nav";
import SupportWidget from "@/components/support-widget";
import WaitlistForm from "@/components/waitlist-form";
import QotdPanel from "@/components/qotd-panel";
import SuccessStories from "@/components/success-stories";
import FieldBackdrop from "@/components/field-backdrop";
import CourseRail from "@/components/course-rail";
import WorkspaceShot from "@/components/workspace-shot";
import CountUp from "@/components/count-up";
import Reveal from "@/components/reveal";
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
 * you solve it without signing up. Everything else answers "and then what",
 * in the order people ask it — what can I practise, what does it look like,
 * what can I learn, what will I have at the end.
 *
 * Every section carries `data-reveal-section`, and things inside carry
 * `.reveal` (and `.sequence` where a row should arrive one card at a time).
 * See components/reveal.tsx — nothing hides until JavaScript arms it, so a
 * failed script costs the animation, never the content.
 */

// The day's question turns over at midnight Eastern, so this can't be baked
// at build time and doesn't need to be rendered per request.
export const revalidate = 3600;

/** The tiles drifting behind the languages band. */
const GLYPHS = [
  { label: "SELECT", left: "4%", top: "20%", delay: "0s", dur: "6s", tone: "turf" },
  { label: "groupby", left: "16%", top: "68%", delay: "1.2s", dur: "7.5s", tone: "ice" },
  { label: "dplyr", left: "27%", top: "14%", delay: "2.4s", dur: "6.8s", tone: "gold" },
  { label: "XLOOKUP", left: "70%", top: "22%", delay: "0.6s", dur: "7s", tone: "turf" },
  { label: "JOIN", left: "83%", top: "66%", delay: "3s", dur: "6.2s", tone: "ice" },
  { label: "SUMIFS", left: "92%", top: "34%", delay: "1.8s", dur: "8s", tone: "gold" },
] as const;

const WHY = [
  {
    title: "A domain that explains itself",
    blurb:
      "Nobody needs a primer on who scored more. Your energy goes into the code, not into decoding a made-up SaaS company with invented departments.",
    accent: "turf" as const,
  },
  {
    title: "Real data, real mess",
    blurb:
      "No Titanic.csv. Three seasons of actual NFL scoring — byes, injuries, weeks that simply aren't there — the same awkward shape you meet on the job.",
    accent: "gold" as const,
  },
  {
    title: "Useful before you're finished",
    blurb:
      "You don't have to complete anything to get value. Answer a real question about a real season in the next ninety seconds.",
    accent: "ice" as const,
  },
];

const TONE: Record<string, string> = {
  turf: "text-turf",
  ice: "text-ice",
  gold: "text-gold",
};

export default function Home() {
  const day = leagueDay();
  // SQL on the landing page, always: Python costs ~12 MB of Pyodide and R
  // ~30 MB of WebR on first run, and a front door does not get to spend that
  // before anyone has asked for anything.
  const qotd = questionOfTheDay(day, "sql");
  const liveCourses = COURSES.filter((c) => c.status === "live").length;
  // Lessons that exist, not the planned total across all ten courses.
  // Counting the plan puts a number on the front page nobody can go and find.
  const lessonCount = liveLessons(ALL_MODULE).length;
  const langs = ["sql", "python", "r", "excel"] as const;

  const WAYS = [
    {
      href: "/questions",
      name: "Questions",
      count: `${QUESTIONS.length} problems`,
      blurb:
        "One problem, one answer, no lesson wrapped around it. A fresh Question of the Day in every language, and a streak that only survives if you solve one.",
      accent: "gold" as const,
    },
    {
      href: "/learn",
      name: "Courses",
      count: `${liveCourses} live`,
      blurb:
        "Short lessons that carry you from your first SELECT to window functions, pandas and lookups — with the scoreboard on screen the whole way.",
      accent: "turf" as const,
    },
    {
      href: "/projects",
      name: "Projects",
      count: `${liveProjects().length + INTERVIEW_CASES.length} builds & cases`,
      blurb:
        "Pull your own fantasy league through the Sleeper API, or model raw nflverse data into a tested dbt warehouse you can hand to an interviewer.",
      accent: "ice" as const,
    },
  ];

  return (
    <div className="min-h-screen">
      <Reveal />
      <SiteNav />

      <main>
        {/* ── Hero ───────────────────────────────────────── */}
        <section
          data-reveal-section
          className="field-stage edge-fade-y border-b border-panel-border"
        >
          <FieldBackdrop />
          <div aria-hidden className="field-layer dot-field" />

          <div className="sequence relative mx-auto max-w-4xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-28">
            <p className="reveal inline-flex items-center gap-2 rounded-full border border-panel-border bg-panel/70 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft backdrop-blur">
              <span className="dot-glow-gold inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              Free beta · no account needed
            </p>

            <h1 className="reveal mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight text-pop sm:text-6xl lg:text-7xl">
              Data practice that
              <br />
              <span className="title-glow-turf text-turf">
                sounds like Sunday
              </span>
            </h1>

            <p className="reveal mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Get sharp at <span className="text-ink">SQL</span>,{" "}
              <span className="text-ink">Python</span>,{" "}
              <span className="text-ink">R</span> and{" "}
              <span className="text-ink">Excel</span> on three seasons of real
              NFL scoring. A new question every morning, courses that run your
              code for real, and projects worth putting your name on. You
              don&apos;t have to watch the games.
            </p>

            <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/questions" className="press btn-gold">
                Practice questions
              </Link>
              <Link href="/dashboard" className="press btn-turf">
                Start learning free →
              </Link>
            </div>

            <div className="reveal mt-14 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-panel-border bg-panel-border/60">
              {[
                { label: "Questions", value: QUESTIONS.length, suffix: "" },
                { label: "Lessons", value: lessonCount, suffix: "" },
                // 876 rows in week_results: one per game a player actually
                // played, across three seasons. Not 876 games — there are 815.
                { label: "Real stat lines", value: 876, suffix: "" },
              ].map((s) => (
                <div key={s.label} className="bg-panel/90 px-3 py-5 backdrop-blur">
                  <CountUp
                    to={s.value}
                    suffix={s.suffix}
                    className="stat-glow font-display text-3xl font-bold sm:text-4xl"
                  />
                  <p className="label-broadcast mt-1 text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Today's question, playable ─────────────────── */}
        <section
          data-reveal-section
          className="border-b border-panel-border bg-night/40"
        >
          <div className="sequence mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="reveal mb-6 text-center">
              <p className="label-broadcast text-gold">today&apos;s question</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                Don&apos;t take our word for it. Solve one.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                A real database, running in your browser, right here on this
                page. Everyone gets the same question today and it turns over
                at midnight Eastern.
              </p>
            </div>
            <div className="reveal">
              <QotdPanel question={qotd} />
            </div>
          </div>
        </section>

        {/* ── Four languages ─────────────────────────────── */}
        <section
          data-reveal-section
          className="relative overflow-hidden border-b border-panel-border"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 dot-field" />
            {GLYPHS.map((g, i) => (
              <span
                key={`${g.label}-${i}`}
                className={`glyph-float absolute hidden select-none rounded-xl border px-3 py-2 font-mono text-[11px] font-bold tracking-wider sm:block ${
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

          <div className="sequence relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <p className="reveal inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-5 py-2 font-display text-lg font-bold text-gold shadow-[0_0_40px_-10px_rgb(var(--c-gold)/0.5)] sm:text-xl">
              {QUESTIONS.length} hands-on questions
            </p>
            <h2 className="reveal mx-auto mt-6 max-w-2xl font-display text-2xl font-bold leading-snug sm:text-4xl">
              <span className="text-sheen">Four languages</span>
              <span className="text-ink">
                , real datasets, and an editor that actually runs what you
                write.
              </span>
            </h2>
            <p className="reveal mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
              Not multiple choice about code. Code.
            </p>
            <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-2">
              {langs.map((l) => (
                <Link
                  key={l}
                  href="/questions"
                  className="ring-lift rounded-xl border border-panel-border bg-panel/80 px-4 py-3 transition-colors hover:text-turf"
                >
                  <span className="block font-display text-lg font-bold text-ink">
                    {LANG_LABEL[l]}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                    {questionsIn(l).length} questions
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── What solving one looks like ────────────────── */}
        <section
          data-reveal-section
          className="border-b border-panel-border bg-night/40"
        >
          <div className="sequence mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="reveal mb-8 text-center">
              <p className="label-broadcast text-ice">the workspace</p>
              <h2 className="mx-auto mt-2 max-w-2xl font-display text-2xl font-bold leading-snug text-ink sm:text-4xl">
                Read the situation, write the query, hit submit.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                Graded on what your code produces, not how you phrased it — a
                CTE and a subquery both pass. Miss it and you get the answer
                and the reason, not a red X.
              </p>
            </div>
            <div className="reveal">
              <WorkspaceShot />
            </div>
          </div>
        </section>

        {/* ── The catalogue, going past ──────────────────── */}
        <section data-reveal-section className="border-b border-panel-border py-16 sm:py-24">
          <div className="sequence mx-auto mb-10 max-w-6xl px-4 text-center sm:px-6">
            <p className="reveal label-broadcast text-ice">the catalogue</p>
            <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
              Ten courses, one throughline
            </h2>
            <p className="reveal mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              Start at SELECT and finish somewhere useful. Every course runs on
              the same football data, so nothing you learn is trapped in the
              lesson that taught it.
            </p>
          </div>
          <CourseRail />
          <div className="mt-10 text-center">
            <Link
              href="/learn"
              className="rounded-xl border border-panel-border px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-turf/50 hover:text-turf"
            >
              Browse all courses →
            </Link>
          </div>
        </section>

        {/* ── Three ways in ──────────────────────────────── */}
        <section
          data-reveal-section
          className="border-b border-panel-border bg-night/40"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="reveal text-center font-display text-2xl font-bold text-ink sm:text-4xl">
              Three ways to get reps
            </h2>
            <div
              className="sequence mt-10 grid gap-4 sm:grid-cols-3"
              style={{ ["--reveal-delay-children" as string]: "0.1s" }}
            >
              {WAYS.map((w) => (
                <Link
                  key={w.href}
                  href={w.href}
                  className="reveal ring-lift surface group flex flex-col rounded-2xl border border-panel-border bg-panel p-6"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`font-display text-xl font-bold ${TONE[w.accent]}`}
                    >
                      {w.name}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                      {w.count}
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                    {w.blurb}
                  </p>
                  <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors group-hover:text-ink">
                    Open →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why this works ─────────────────────────────── */}
        <section data-reveal-section className="border-b border-panel-border">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="reveal text-center font-display text-2xl font-bold text-ink sm:text-4xl">
              Why football, of all things
            </h2>
            <div className="sequence mt-10 grid gap-8 sm:grid-cols-3">
              {WHY.map((p) => (
                <div key={p.title} className="reveal">
                  <span
                    aria-hidden
                    className={`block h-px w-10 ${
                      p.accent === "turf"
                        ? "bg-turf"
                        : p.accent === "ice"
                          ? "bg-ice"
                          : "bg-gold"
                    }`}
                  />
                  <p
                    className={`mt-4 font-display text-lg font-bold ${TONE[p.accent]}`}
                  >
                    {p.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {p.blurb}
                  </p>
                </div>
              ))}
            </div>
            <p className="reveal mt-12 text-center font-mono text-[11px] text-ink-muted">
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
        <section data-reveal-section className="border-t border-panel-border">
          <div className="sequence mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <p className="reveal label-broadcast text-ice">coming next</p>
            <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              A weekly challenge on the week that just happened
            </h2>
            <p className="reveal mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
              The daily questions run on three pinned seasons so the answers
              never move under you. The weekly one won&apos;t. Leave an email
              and we&apos;ll tell you when it lands.
            </p>
            <div className="reveal mx-auto mt-6 max-w-sm">
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
