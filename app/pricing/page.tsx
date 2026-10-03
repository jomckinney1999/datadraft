/**
 * /pricing — the Season Pass offer (docs/OFFER.md, approved 2026-10-03).
 *
 * Live as a pitch: prices and the Free / Pass line are public so the offer
 * can convert waitlist interest. Checkout still 403s until PAYWALL_LIVE.
 * Vercel Pro remains a launch gate before treating this as a storefront
 * (Hobby is non-commercial). Every claim is the approved copy: no job
 * promises, no learner counts, no betting words.
 */

import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import PricingPlans from "@/components/pricing-plans";
import { leagueDay } from "@/lib/questions";
import { FOUNDING, PASS_PLANS, PAYWALL_LIVE, foundingOpen } from "@/lib/season-pass";
import { foundingTaken } from "@/lib/pass-server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Season Pass — DataDraft",
  description:
    "The SQL interview, rehearsed on the stats you already argue about. Every question, the Query Doctor, timed mock screens and every course.",
};

const COMPARE: [string, string, string][] = [
  ["Daily question, every language", "✓", "✓"],
  ["Stat Duel, Draft Room (this season), Chart it, your own league", "✓", "✓"],
  ["Practice Field and Spreadsheet", "✓", "✓"],
  ["Courses", "First unit of each (5 graded lessons a day)", "Every lesson, no daily limit"],
  ["Question bank", "Today's, any question for 7 days after it was the daily, and a starter set", "The whole bank, with solutions"],
  ["Query Doctor", "1 diagnosis a day", "Every miss, plus Ask Coach"],
  ["Film Room replays", "On the free questions", "Every query, every question"],
  ["Mock SQL screens", "1 phone screen to try", "Unlimited, phone and technical"],
  ["Analyst Screen (timed OA)", "Quick screen to try", "Full online assessment, unlimited"],
  ["Data Challenge (take-home)", "", "Included, with the rubric"],
  ["Interview patterns", "See them", "Track all nine"],
  ["Cases", "The first one", "All of them"],
  ["Draft Room", "This season", "Every season"],
  ["Profile and certificates for employers", "", "Included when they ship"],
];

const FAQ: [string, string][] = [
  [
    "Will employers take a football project seriously?",
    "They take SQL seriously. Football is why you practised every day, and a league you modelled is a story an interviewer remembers.",
  ],
  [
    "I only know Excel.",
    "That's where most people start. The Excel course meets you there, and SQL is the next step, one question a day.",
  ],
  ["I don't have time.", "Ninety seconds a day is the habit. The Pass is there for the weeks you go deeper."],
  [
    "There are free SQL sites.",
    "There are, and the daily question here is free too. The Pass is real data you care about, a doctor that explains your mistakes, and screens graded like the real thing.",
  ],
  ["What if it's not for me?", "Full refund within 14 days of paying, no questions asked. Cancel any time in two clicks."],
  ["My league's not on Sleeper.", "The League Scorecard notebook takes an ESPN or Yahoo CSV."],
  [
    "Does it get me a job?",
    "Nobody can promise that. It gives you the skills a SQL screen tests, practice under a clock, and a project worth talking about.",
  ],
];

export default async function PricingPage() {
  const taken = await foundingTaken();
  const open = foundingOpen(leagueDay(), taken);

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        {!PAYWALL_LIVE && (
          <p className="mx-auto mb-6 max-w-3xl rounded-lg border border-ice/40 bg-ice/10 px-4 py-2 text-center font-mono text-[11px] uppercase tracking-wider text-ice">
            Founding price opens soon · join the waitlist · every Pass feature is free in early access
          </p>
        )}

        <header className="mx-auto max-w-3xl text-center">
          <p className="label-broadcast text-gold">★ season pass</p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-ink [text-wrap:balance] sm:text-6xl">
            Get the job. <span className="text-turf">Keep the league.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            The SQL interview, rehearsed on the stats you already argue about. {PASS_PLANS.annual.price} a year, under
            $10 a month.
          </p>
        </header>

        <div className="mt-10">
          <PricingPlans foundingOpen={open} foundingLeft={FOUNDING.cap - taken} />
        </div>

        <section className="surface mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-panel-border bg-panel">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-panel-border">
                <th className="px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted"> </th>
                <th className="px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-turf">Free</th>
                <th className="px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">Season Pass</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([what, free, pass]) => (
                <tr key={what} className="border-b border-panel-border/60 last:border-0 align-top">
                  <td className="px-4 py-3 text-ink">{what}</td>
                  <td className="px-4 py-3 text-ink-soft">{free}</td>
                  <td className="px-4 py-3 text-ink">{pass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="surface mx-auto mt-12 max-w-3xl rounded-2xl border border-panel-border bg-panel p-5 sm:p-6">
          <p className="label-broadcast text-turf">practise the funnel first</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">Hiring prep is free to start</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Drill the nine SQL patterns, then try a screen and a take-home. The Pass unlocks the rest
            when you&apos;re going for the job.
          </p>
          <Link href="/questions/prep" className="press btn-turf mt-4 inline-block">
            Open hiring prep →
          </Link>
        </section>

        <section className="mx-auto mt-12 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-ink">Questions people ask first</h2>
          <div className="mt-4 space-y-2">
            {FAQ.map(([q, a]) => (
              <details key={q} className="surface rounded-xl border border-panel-border bg-panel px-4 py-3">
                <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
