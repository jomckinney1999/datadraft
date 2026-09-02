import Link from "next/link";
import type { Metadata } from "next";
import Coach from "@/components/coach";
import ThemeToggle from "@/components/theme-toggle";
import HomeLink from "@/components/home-link";
import WaitlistForm from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "AI Mock Interview — SQL Sports",
  description:
    "A live, conversational SQL interview against a real business scenario — coming to SQL Sports.",
};

const FEATURES = [
  {
    title: "A real scenario, not a quiz bank",
    text: "You're a product analyst at a company that just handed you a question — not a multiple-choice prompt. The interviewer explains the business context first, the same way a real hiring manager would.",
  },
  {
    title: "Explore the schema like it's your first day",
    text: "No brief, no preview query handed to you. Pull up the tables, poke around, and figure out what a row actually means before you write a line of SQL — exactly like an unfamiliar production database.",
  },
  {
    title: "Talk through your approach",
    text: "Explain your plan before you code, ask a clarifying question, or ask for a nudge without giving up the whole answer. The interviewer responds in the moment, not from a script.",
  },
  {
    title: "Feedback on the reasoning, not just the query",
    text: "Real interviews grade how you think as much as whether the SELECT runs. This does too — including catching the same shortcuts and blind spots a human interviewer would flag.",
  },
];

export default function InterviewComingSoonPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-12">
      <div className="mb-8">
        <HomeLink label="mock interview" />
      </div>

      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="label-broadcast text-gold">declaring next season</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            AI Mock Interview
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Every lesson so far has graded a query against a known answer. This
            is the opposite: a live conversation with an AI interviewer running
            a real SQL business case, the way an actual analyst interview
            works — no starter code, no rubric shown up front.
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <ThemeToggle />
        </div>
      </header>

      <div className="mt-6 flex items-center gap-4 border border-gold/40 bg-gold/5 p-5">
        <Coach mood="think" size={72} className="shrink-0" />
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-display font-bold text-ink">
            Coach is still drawing this one up.
          </span>{" "}
          The full curriculum comes first — an interview mode is only useful
          once there&rsquo;s a body of real SQL knowledge behind it to
          interview you on. Leave your email and you&rsquo;ll hear the moment
          it opens.
        </p>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="border border-panel-border bg-panel/40 p-5"
          >
            <h2 className="font-display text-base font-bold text-ink">
              {f.title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {f.text}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-10 border border-panel-border bg-panel/40 p-5">
        <h2 className="font-display text-lg font-bold text-ink">
          Get notified when it opens
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          No spam — one email, the day this ships.
        </p>
        <div className="mt-4">
          <WaitlistForm
            interest="ai-interview"
            source="interview-page"
            label="Notify me"
          />
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-panel-border pt-6">
        <Link
          href="/learn"
          className="border border-turf bg-turf/15 px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-turf transition-colors hover:bg-turf/25"
        >
          Back to courses
        </Link>
        <Link
          href="/field"
          className="border border-panel-border px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted transition-colors hover:border-turf/50 hover:text-turf"
        >
          Practice Field
        </Link>
      </div>
    </main>
  );
}
