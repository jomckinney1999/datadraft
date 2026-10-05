import Link from "next/link";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import SupportWidget from "@/components/support-widget";
import QotdPanel from "@/components/qotd-panel";
import SuccessStories from "@/components/success-stories";
import FieldBackdrop from "@/components/field-backdrop";
import CourseRail from "@/components/course-rail";
import WorkspaceShot from "@/components/workspace-shot";
import CountUp from "@/components/count-up";
import GlowGrid from "@/components/glow-grid";
import HeadlineTile from "@/components/headline-tile";
import StickerLink from "@/components/sticker-cta";
import TitleGate from "@/components/title-gate";
import WhyArt from "@/components/why-art";
import ChartYourLeague from "@/components/chart-your-league";
import Reveal from "@/components/reveal";
import LiveWeekStrip from "@/components/live-week-strip";
import DriveExplainer from "@/components/drive-explainer";
import TrophyStrip from "@/components/trophy-strip";
import ProjectsShowcase from "@/components/projects-showcase";
import DataPeek from "@/components/data-peek";
import Faq from "@/components/faq";
import PricingSection from "@/components/pricing-section";
import FinalCta from "@/components/final-cta";
import {
  LANG_LABEL,
  QUESTIONS,
  leagueDay,
  frontDoorQuestion,
  questionsIn,
} from "@/lib/questions";
import { INTERVIEW_CASES } from "@/lib/interview-cases";
import { COURSES } from "@/lib/courses";
import { ALL_MODULE, liveLessons } from "@/lib/curriculum";
import { liveProjects } from "@/lib/projects";
import { getLiveWeek } from "@/lib/live-nfl";
import { FACTS } from "@/lib/lesson-facts.generated";
import DraftCard from "@/components/draft-card";
import PlayStrip from "@/components/play-strip";

/**
 * The landing page.
 *
 * A long scroll, on purpose, and every section on it earns its place by
 * answering the next question a sceptical visitor would ask:
 *
 *   is this real? → solve today's question, then save it on a free account
 *   is it football? → this week's actual scores and stat lines
 *   what languages? → four, running for real
 *   how does a lesson feel? → the drive, drawn with the real field
 *   what does solving look like? → the workspace
 *   what's in it? → the catalogue going past
 *   what do I get? → trophies, then projects
 *   why football? → because it explains itself
 *   is the data real? → here are the rows
 *   what happens to people? → illustrative paths, labelled as such
 *   anything else? → the FAQ
 *   ok → first snap's yours
 *
 * Every section carries `data-reveal-section`, and things inside carry
 * `.reveal` (and `.sequence` where a row should arrive one card at a time).
 * See components/reveal.tsx — nothing hides until JavaScript arms it, so a
 * failed script costs the animation, never the content.
 *
 * Every number on this page is counted, not planned, and there are no
 * learner counts because we do not have any yet worth stating.
 */

// The day's question turns over at midnight Eastern and the live panel
// parses a couple of megabytes of nflverse CSV, so this is rebuilt hourly:
// never per request, never baked forever.
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
    art: "explains-itself" as const,
  },
  {
    title: "Real data, real mess",
    blurb:
      `No Titanic.csv. Every week from ${FACTS.seasons[0]} to now of actual NFL scoring — byes, injuries, weeks that simply aren't there — the same awkward shape you meet on the job.`,
    accent: "gold" as const,
    art: "real-mess" as const,
  },
  {
    title: "Useful before you're finished",
    blurb:
      "You don't have to complete anything to get value. Answer a real question about a real season in the next ninety seconds.",
    accent: "ice" as const,
    art: "before-finished" as const,
  },
];

const HOVER_BORDER: Record<string, string> = {
  turf: "hover:border-turf/50",
  ice: "hover:border-ice/50",
  gold: "hover:border-gold/50",
};

const TONE: Record<string, string> = {
  turf: "text-turf",
  ice: "text-ice",
  gold: "text-gold",
};

const AUDIENCE =
  "the commissioner with the 40-tab spreadsheet · the one who brings stats to the group chat · Excel pros who know SQL is next · anyone who's said “I want to get into data” · ";

export default async function Home() {
  const day = leagueDay();
  // SQL on the landing page, always: Python costs ~12 MB of Pyodide and R
  // ~30 MB of WebR on first run, and a front door does not get to spend that
  // before anyone has asked for anything. And always an easy one: the daily
  // runs easy to hard, and a first visit shouldn't open on a hard one.
  const { question: qotd, isDaily: qotdIsDaily } = frontDoorQuestion(day);
  // Never throws: null when nflverse is unreachable, and the strip hides.
  const live = await getLiveWeek();

  // Count only what a visitor can open today — never the course-catalog plan totals.
  const liveCourses = COURSES.filter((c) => c.status === "live" && c.moduleId).length;
  const lessonCount = liveLessons(ALL_MODULE).length;
  const buildCount = liveProjects().length;
  const caseCount = INTERVIEW_CASES.length;
  const projectCount = buildCount + caseCount;
  const sqlCount = questionsIn("sql").length;
  const langs = ["sql", "python", "r", "excel"] as const;

  // Each number is also a door: hover lights it, a click goes to the thing
  // it counts. Tones rotate so no two neighbours glow the same colour.
  const PROOF: { value: number; label: string; note: string; href: string; tone: "turf" | "ice" | "gold" }[] = [
    {
      value: QUESTIONS.length,
      label: "Questions",
      note: `${sqlCount} SQL · ${questionsIn("python").length} Python · ${questionsIn("r").length} R · ${questionsIn("excel").length} Excel — graded on what your code produces.`,
      href: "/questions",
      tone: "gold",
    },
    {
      value: lessonCount,
      label: "Lessons",
      note: "Live drives across every course — one idea each, scoreboard on screen.",
      href: "/learn",
      tone: "turf",
    },
    {
      value: liveCourses,
      label: "Courses live",
      note: "SQL through Excel, plus stats, Git, viz and more — with lessons you can play.",
      href: "/learn",
      tone: "ice",
    },
    {
      value: projectCount,
      label: "Builds & cases",
      note: `${buildCount} afternoon builds · ${caseCount} half-hour cases.`,
      href: "/projects",
      tone: "gold",
    },
    {
      value: FACTS.seasons.length,
      label: "Real seasons",
      note: `${FACTS.seasons[0]} through week ${FACTS.latest.week} of ${FACTS.latest.season}, pinned so the answers hold still.`,
      href: "/data",
      tone: "turf",
    },
    {
      value: FACTS.rows,
      label: "Stat lines",
      note: "One per game a player actually played.",
      href: "/data",
      tone: "ice",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* First in the markup so its script decides before anything paints. */}
      <TitleGate />
      <Reveal />
      <SiteNav />

      <main>
        {/* ── Hero ───────────────────────────────────────── */}
        {/* Exactly one screen tall. The nav floats over the hero and only
            becomes a full bar after scroll, so we don't reserve a sticky
            strip here — the first composition is the headline alone.
            svh rather than vh so a phone's collapsing address bar doesn't
            push the buttons off the bottom. */}
        <section
          data-reveal-section
          className="field-stage edge-fade-y flex min-h-[100svh] flex-col justify-center border-b border-panel-border"
        >
          <FieldBackdrop />
          <div aria-hidden className="field-layer dot-field" />

          <div className="gate-pop sequence relative mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6">
            <Link
              href="/account"
              className="reveal inline-flex items-center gap-2 rounded-full border-2 border-gold/70 bg-gold/15 px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-gold shadow-[0_0_28px_-6px_rgb(var(--c-gold)/0.85)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="dot-glow-gold inline-block h-2 w-2 rounded-full bg-gold" />
              Free beta
            </Link>

            {/* One person, in their own words: the fantasy league's numbers
                person, who wants it to be their job (docs/PLAN.md, Target
                user). Not "everyone who might learn SQL". */}
            {/* A setup and a punchline, so the two lines are sized apart on
                purpose (about 1.5x at every width) and sit close together.
                Line 1 balances its break, so a phone never leaves "league."
                alone on a line. Line 2 never wraps — the tile belongs to the
                phrase — so on phones it's sized to the screen: the line runs
                about 9x its font size, hence (100vw - the gutters) / 9.1. */}
            <h1 className="reveal mt-6 font-display font-bold tracking-tight text-pop">
              <span className="mx-auto block max-w-3xl text-[1.6rem] leading-[1.12] [text-wrap:balance] sm:text-[2.4rem] md:text-[2.6rem] lg:text-[3.1rem]">
                You&apos;re already the numbers person in your league.
              </span>
              <span className="mt-2 block whitespace-nowrap text-[length:min(calc((100vw_-_2rem)/9.1),2.75rem)] leading-[1.05] sm:mt-3 sm:text-[3.6rem] md:text-6xl lg:text-7xl">
                <span className="title-glow-turf text-turf">Make it your job</span> <HeadlineTile />
              </span>
            </h1>

            <p className="reveal mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Practice <span className="text-ink">SQL</span>,{" "}
              <span className="text-ink">Python</span> and{" "}
              <span className="text-ink">Excel</span> on real NFL stats, the
              same ones you argue about every Sunday. Chart who got lucky in
              your own league, and build a portfolio an interviewer will
              actually remember.
            </p>

            <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-4">
              <StickerLink href={`/questions/${qotd.id}`} tone="gold" icon="question">
                Solve today&apos;s question
              </StickerLink>
              <StickerLink href="/projects/my-league-scorecard#your-league" tone="turf" icon="football" arrow>
                Chart your league
              </StickerLink>
            </div>
            <p className="reveal mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
              Easy · free · no signup · 90 seconds
            </p>
          </div>

          <a
            href="#by-the-numbers"
            className="scroll-cue absolute bottom-6 left-1/2 z-10 -ml-8 flex w-16 flex-col items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft transition-colors hover:text-turf"
          >
            Scroll
            <svg aria-hidden viewBox="0 0 16 10" className="h-2.5 w-4">
              <path
                d="M2 2 L8 8 L14 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </section>

        {/* ── Built for / by the numbers ─────────────────── */}
        <section
          id="by-the-numbers"
          data-reveal-section
          className="scroll-mt-14 border-b border-panel-border bg-night/40"
        >
          <div className="overflow-hidden border-b border-panel-border py-3">
            <div
              aria-hidden
              className="flex w-max animate-marquee whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted"
            >
              <span className="px-4">Built for {AUDIENCE}</span>
              <span className="px-4">Built for {AUDIENCE}</span>
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            {/* The reveal lives on the wrapper, the glow on the card: the
                reveal animation holds its last transform, which would
                silently cancel a hover lift on the same element. */}
            <GlowGrid className="sequence grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {PROOF.map((s) => (
                <div key={s.label} className="reveal">
                  <Link
                    href={s.href}
                    data-tone={s.tone}
                    className="glow-card surface block h-full rounded-2xl border border-panel-border bg-panel px-4 py-5 text-center"
                  >
                    <CountUp
                      to={s.value}
                      className="glow-num stat-glow font-display text-3xl font-bold sm:text-4xl"
                    />
                    <p className="label-broadcast mt-1 text-[10px]">{s.label}</p>
                    <p className="mt-2 text-[12px] leading-snug text-ink-muted">
                      {s.note}
                    </p>
                  </Link>
                </div>
              ))}
            </GlowGrid>
          </div>
        </section>

        {/* ── Today's question, playable ─────────────────── */}
        <section
          data-reveal-section
          className="wash-gold border-b border-panel-border"
        >
          <div className="sequence relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="reveal mb-6 text-center">
              <p className="label-broadcast text-gold">{qotdIsDaily ? "today's question" : "today's warm-up"}</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                A new question every morning. Like waivers, but for your
                career.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                A real database, running in your browser, right here on this
                page. Everyone who lands here gets the same easy one today, and
                it turns over at midnight Eastern. The harder daily lives in the{" "}
                <Link href="/questions" className="font-semibold text-gold hover:underline">
                  question bank
                </Link>
                .
              </p>
            </div>
            <div className="reveal">
              <QotdPanel question={qotd} isDaily={qotdIsDaily} />
            </div>
            <p className="reveal mt-5 text-center text-sm text-ink-soft">
              Not ready to write SQL?{" "}
              <Link href="/questions/duel" className="font-semibold text-gold hover:underline">
                Play today&apos;s Stat Duel
              </Link>{" "}
              — five head-to-heads, no code, every answer with the SQL that proves it.
            </p>
            <div className="reveal mx-auto mt-5 max-w-2xl">
              <DraftCard />
            </div>
            <div className="reveal mx-auto mt-8 max-w-4xl">
              <PlayStrip title="more ways to play · prep" />
            </div>
          </div>
        </section>

        {/* ── Chart your league ──────────────────────────── */}
        <ChartYourLeague />

        {/* ── This week in the league (live) ─────────────── */}
        <LiveWeekStrip live={live} />

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

        {/* ── A lesson is a drive ────────────────────────── */}
        <DriveExplainer />

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
        <section
          data-reveal-section
          className="wash-turf border-b border-panel-border py-16 sm:py-24"
        >
          <div className="sequence relative mx-auto mb-10 max-w-6xl px-4 text-center sm:px-6">
            <p className="reveal label-broadcast text-turf">the catalogue</p>
            <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
              From the spreadsheet you know to the SQL interviews ask for
            </h2>
            <p className="reveal mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              Start where you are, Excel or SELECT, and finish somewhere
              useful. Every course runs on the same football data, so nothing
              you learn is trapped in the lesson that taught it.
            </p>
          </div>
          <div className="relative">
            <CourseRail />
          </div>
          <div className="relative mt-10 text-center">
            <Link
              href="/learn"
              className="rounded-xl border border-panel-border px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-turf/50 hover:text-turf"
            >
              Browse all courses →
            </Link>
          </div>
        </section>

        {/* ── Something to play for ──────────────────────── */}
        <TrophyStrip />

        {/* ── Projects ───────────────────────────────────── */}
        <ProjectsShowcase />

        {/* ── Why football ───────────────────────────────── */}
        <section data-reveal-section className="border-b border-panel-border">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="reveal text-center font-display text-2xl font-bold text-ink sm:text-4xl">
              Why your league is the best dataset you&apos;ll ever learn on
            </h2>
            <div className="sequence mt-10 grid gap-5 sm:grid-cols-3">
              {WHY.map((p) => (
                // The reveal sits on a wrapper: reveal-rise holds its final
                // transform, which would cancel the card's hover lift.
                <div key={p.title} className="reveal">
                  <div
                    className={`lift surface group h-full overflow-hidden rounded-2xl border border-panel-border bg-panel transition-colors ${HOVER_BORDER[p.accent]}`}
                  >
                    <div className="h-44 overflow-hidden border-b border-panel-border bg-night/60">
                      <WhyArt
                        id={p.art}
                        className="h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-[1.07]"
                      />
                    </div>
                    <div className="p-5">
                      <p className={`font-display text-lg font-bold ${TONE[p.accent]}`}>
                        {p.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {p.blurb}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The data is real ───────────────────────────── */}
        <DataPeek />

        <SuccessStories />

        <PricingSection />

        <Faq />

        <FinalCta qotdId={qotd.id} />
      </main>

      <SiteFooter />
      <SupportWidget />
    </div>
  );
}
