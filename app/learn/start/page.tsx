"use client";

/**
 * The "which course should I take" walkthrough.
 *
 * The catalogue shows ten courses and, before this page existed, offered no
 * help choosing between them. That is a genuinely hard decision for the person
 * this product is for — someone who does not yet know what an analytics
 * engineer is cannot be expected to know whether they want to become one.
 *
 * Two rules kept this honest:
 *
 * 1. The recommendation is nearly always SQL, and the page says so out loud
 *    rather than fake-branching across ten answers to look clever. What
 *    genuinely differs by situation is the *reasoning* and what comes second,
 *    so that is what changes.
 * 2. No invented statistics anywhere. The career notes in lib/career.ts are
 *    qualitative on purpose — a learner who checks a number we made up has
 *    every reason to stop trusting the rest.
 */

import { useState } from "react";
import Link from "next/link";
import { COURSES, type Course } from "@/lib/courses";
import { CAREER, type CareerNote } from "@/lib/career";
import HomeLink from "@/components/home-link";
import ThemeToggle from "@/components/theme-toggle";
import Coach from "@/components/coach";

type Goal = "job" | "level-up" | "curious";
type Start = "new" | "spreadsheets" | "some-code";

const GOALS: { id: Goal; label: string; sub: string }[] = [
  { id: "job", label: "Land a data job", sub: "Analyst, BI, or similar — I want to be hireable." },
  { id: "level-up", label: "Get better at the job I have", sub: "I already work with data and want to stop guessing." },
  { id: "curious", label: "See if I like this", sub: "No pressure, I want to find out what it is." },
];

const STARTS: { id: Start; label: string; sub: string }[] = [
  { id: "new", label: "Total beginner", sub: "I have never written code or a formula." },
  { id: "spreadsheets", label: "I live in spreadsheets", sub: "Comfortable in Excel or Sheets, no code." },
  { id: "some-code", label: "I have written some code", sub: "A bit of Python, SQL, or something else." },
];

type Plan = {
  first: string;
  reason: string;
  then: string;
  thenWhy: string;
};

/**
 * SQL is the answer in almost every case, and that is not a cop-out — it is
 * the most requested skill on analyst postings and the one most interviews
 * actually test. The branching that matters is why it is right *for you* and
 * what to put beside it.
 */
function plan(goal: Goal, start: Start): Plan {
  if (goal === "level-up" && start === "spreadsheets") {
    return {
      first: "excel",
      reason:
        "You already work this way, so the fastest return is getting genuinely good at the tool in front of you — lookups, pivots and workbooks other people can actually use. Most of the value is in the half of Excel people never learn.",
      then: "sql-fundamentals",
      thenWhy:
        "Then SQL, because the moment your data outgrows a spreadsheet you will need it, and pull with SQL then present in Excel is the daily loop of a huge number of analyst jobs.",
    };
  }
  if (goal === "level-up" && start === "some-code") {
    return {
      first: "sql-fundamentals",
      reason:
        "Start here even if you have written SQL before. Most self-taught SQL has holes in exactly the places interviews probe — JOIN behaviour, GROUP BY, and what HAVING is for. It is 20 lessons and you can move fast through what you know.",
      then: "sql-advanced",
      thenWhy:
        "Then Advanced SQL. Window functions and CTEs are what separate answering a question from owning the data model, and they are the most common senior-round question.",
    };
  }
  if (goal === "curious" && start === "some-code") {
    return {
      first: "python",
      reason:
        "You have written code, so start where it is most fun. Python runs live in the browser here, and going from a list to a DataFrame to a real answer in one sitting is the thing that tends to hook people.",
      then: "sql-fundamentals",
      thenWhy:
        "Add SQL when you want to be employable rather than just capable. It is the skill postings ask for by name.",
    };
  }
  if (goal === "curious") {
    return {
      first: "sql-fundamentals",
      reason:
        "SQL is the gentlest real start. You are reading and asking questions of a stat sheet rather than building anything, every query runs instantly in the browser, and you will answer a genuine question about actual NFL games inside the first lesson.",
      then: "excel",
      thenWhy:
        "Excel next if you want something immediately usable at work, or Python if you find you enjoy the writing part.",
    };
  }
  if (start === "spreadsheets") {
    return {
      first: "sql-fundamentals",
      reason:
        "Your spreadsheet instincts transfer directly — a table is a sheet, a filter is a WHERE, a pivot is a GROUP BY. You are learning new words for things you already understand, which is the easiest kind of learning there is. And SQL is the skill analyst postings ask for by name.",
      then: "excel",
      thenWhy:
        "Then finish Excel properly. You are already in it daily, and lookups plus PivotTables are what timed practical interviews actually test.",
    };
  }
  if (start === "some-code") {
    return {
      first: "sql-fundamentals",
      reason:
        "It is the shortest distance to hireable. Most analyst processes open with a live SQL round, and it is the round candidates most often fail — not on exotic syntax, but on JOINs and GROUP BY under mild pressure.",
      then: "python",
      thenWhy:
        "Then Python, for everything too awkward for one query: cleaning, automation, and anything heading toward machine learning.",
    };
  }
  return {
    first: "sql-fundamentals",
    reason:
      "Start here. SQL is the most requested skill on analyst job postings, it is the one nearly every interview tests, and it is genuinely the friendliest thing in this catalogue to learn cold — you are asking questions of a stat sheet, not building software.",
    then: "excel",
    thenWhy:
      "Then Excel, which appears on more job postings than any other tool here and is what a lot of analyst work is actually made of.",
  };
}

function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

function Choice({
  active,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`press lift w-full border p-4 text-left ${
        active
          ? "border-turf bg-turf/10"
          : "border-panel-border bg-panel/40 hover:border-turf/50"
      }`}
    >
      <span
        className={`block font-display text-base font-bold ${
          active ? "text-turf" : "text-ink"
        }`}
      >
        {label}
      </span>
      <span className="mt-1 block text-[13px] leading-snug text-ink-muted">
        {sub}
      </span>
    </button>
  );
}

function CourseCallout({
  course,
  note,
  reason,
  primary,
}: {
  course: Course;
  note?: CareerNote;
  reason: string;
  primary: boolean;
}) {
  return (
    <div
      className={`border p-5 ${
        primary ? "border-turf/60 bg-turf/5" : "border-panel-border bg-panel/40"
      }`}
    >
      <p className="label-broadcast text-turf">
        {primary ? "start here" : "then this"}
      </p>
      <h3 className="mt-1 font-display text-xl font-bold text-ink">
        {course.title}
      </h3>
      {note && (
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-gold">
          {note.headline}
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{reason}</p>
      {primary && course.moduleId && (
        <Link
          href={`/learn/track/${course.moduleId}`}
          className="press mt-4 inline-block border border-turf bg-turf/15 px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-turf hover:bg-turf/25"
        >
          Open {course.title} →
        </Link>
      )}
    </div>
  );
}

export default function StartPage() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [start, setStart] = useState<Start | null>(null);

  const ready = goal !== null && start !== null;
  const rec = ready ? plan(goal, start) : null;
  const first = rec ? courseById(rec.first) : undefined;
  const then = rec ? courseById(rec.then) : undefined;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-24 pt-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <HomeLink label="where to start" back="/learn" backLabel="all courses" />
        <ThemeToggle />
      </div>

      <header className="flex items-start gap-4">
        <div className="hidden shrink-0 sm:block">
          <Coach mood="happy" size={92} />
        </div>
        <div>
          <p className="label-broadcast text-turf">the depth chart</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Which course should you take?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Ten courses is a lot to choose between, especially if you are new
            enough that the job titles do not mean much yet. Two questions and
            we will give you a straight answer and the reasoning behind it.
          </p>
        </div>
      </header>

      {/* ── how the roadmap works ── */}
      <section className="mt-10 border border-panel-border bg-panel/40 p-5">
        <h2 className="font-display text-lg font-bold text-ink">
          First, how this is put together
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
          <p>
            <span className="font-semibold text-ink">A course</span> is one
            skill, like SQL or Excel. Open one and you land on its{" "}
            <span className="font-semibold text-ink">roadmap</span> — the list
            of everything in it, in the order it should be taken.
          </p>
          <p>
            <span className="font-semibold text-ink">A unit</span> is a chapter
            of that roadmap, and each unit is a handful of{" "}
            <span className="font-semibold text-ink">lessons</span>. A lesson is
            a drive: it opens with a brief that walks you in, then a run of
            drills, and every correct answer moves the ball down the field. Ten
            to fifteen minutes, one sitting.
          </p>
          <p>
            You do not have to finish one course before starting another, and
            nothing is locked. Your XP, streak and badges are one shared total
            across everything, so switching courses never costs you progress —
            which means the choice below is a starting point, not a commitment.
          </p>
        </div>
      </section>

      {/* ── the two questions ── */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink">
          1. What are you here for?
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {GOALS.map((g) => (
            <Choice
              key={g.id}
              active={goal === g.id}
              label={g.label}
              sub={g.sub}
              onClick={() => setGoal(g.id)}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink">
          2. Where are you starting from?
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {STARTS.map((s) => (
            <Choice
              key={s.id}
              active={start === s.id}
              label={s.label}
              sub={s.sub}
              onClick={() => setStart(s.id)}
            />
          ))}
        </div>
      </section>

      {/* ── the answer ── */}
      {rec && first && (
        <section className="animate-fade-up mt-10 space-y-3">
          <CourseCallout
            course={first}
            note={CAREER[first.id]}
            reason={rec.reason}
            primary
          />
          {then && (
            <CourseCallout
              course={then}
              note={CAREER[then.id]}
              reason={rec.thenWhy}
              primary={false}
            />
          )}
          <p className="pt-1 text-[13px] leading-relaxed text-ink-muted">
            If SQL keeps coming up no matter what you pick, that is not a bug in
            the quiz. It is the most requested skill on analyst postings and the
            one most interviews actually test, so it is the honest answer for
            most people most of the time.
          </p>
        </section>
      )}

      {/* ── why each one matters ── */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-ink">
          Why each skill is worth the hours
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The honest version, including who should skip what. No invented
          percentages — if we quote a number anywhere on this site, you can go
          and check it.
        </p>
        <div className="mt-5 space-y-3">
          {COURSES.filter((c) => CAREER[c.id]).map((course) => {
            const note = CAREER[course.id]!;
            return (
              <details
                key={course.id}
                className="lift group border border-panel-border bg-panel/30 p-4 open:bg-panel/60"
              >
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-display text-base font-bold text-ink">
                      {course.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">
                      {note.headline}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-muted group-open:hidden">
                    why →
                  </span>
                </summary>

                <div className="mt-4 space-y-3 border-t border-panel-border pt-4">
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {note.why}
                  </p>
                  <div>
                    <p className="label-broadcast text-turf">in interviews</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                      {note.inInterviews}
                    </p>
                  </div>
                  <div>
                    <p className="label-broadcast text-turf">pairs with</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                      {note.pairsWith}
                    </p>
                  </div>
                  <div>
                    <p className="label-broadcast text-turf">
                      roles that ask for it
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {note.roles.map((r) => (
                        <span
                          key={r}
                          className="border border-panel-border bg-panel px-2 py-0.5 font-mono text-[10px] text-ink-muted"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  {note.skipIf && (
                    <p className="border-l-2 border-gold/50 bg-gold/5 py-2 pl-3 pr-2 text-[13px] leading-relaxed text-ink-muted">
                      <span className="font-semibold text-gold">
                        Skip or defer this if:{" "}
                      </span>
                      {note.skipIf}
                    </p>
                  )}
                  {course.moduleId && course.status === "live" && (
                    <Link
                      href={`/learn/track/${course.moduleId}`}
                      className="press inline-block border border-panel-border px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted hover:border-turf/50 hover:text-turf"
                    >
                      Open the roadmap →
                    </Link>
                  )}
                  {course.status !== "live" && (
                    <p className="font-mono text-[11px] uppercase tracking-widest text-gold">
                      In build · not playable yet
                    </p>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-panel-border pt-6">
        <Link
          href="/learn"
          className="press border border-turf bg-turf/15 px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-turf hover:bg-turf/25"
        >
          See all courses
        </Link>
        <Link
          href="/data"
          className="press border border-panel-border px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted hover:border-turf/50 hover:text-turf"
        >
          Where the data comes from
        </Link>
      </div>
    </main>
  );
}
