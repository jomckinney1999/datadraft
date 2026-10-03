"use client";

/**
 * Hiring prep → Season Pass. High-intent career path; capture the waitlist
 * while every Pass feature is still open in early access.
 */

import Link from "next/link";
import PassTag from "@/components/pass-tag";
import WaitlistForm from "@/components/waitlist-form";
import { PAYWALL_LIVE, PASS_PLANS } from "@/lib/season-pass";

export default function PrepPassBridge() {
  return (
    <section className="surface mt-10 overflow-hidden rounded-2xl border border-gold/40 bg-gold/5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="label-broadcast text-gold">when you&apos;re going for the job</p>
        <PassTag />
      </div>
      <h2 className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">
        Season Pass is the rest of the funnel
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Unlimited mock screens and Analyst Screens, the whole question bank with solutions, Query
        Doctor on every miss, every course with no daily limit, and the take-home when you&apos;re
        ready. Playing the patterns and the daily stays free forever.
      </p>
      {PAYWALL_LIVE ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/pricing?from=prep" className="press btn-gold">
            See the Season Pass
          </Link>
          <span className="font-mono text-[11px] text-ink-soft">
            {PASS_PLANS.annual.price}/yr · or {PASS_PLANS.monthly.price}/mo
          </span>
        </div>
      ) : (
        <div className="mt-4 max-w-md">
          <p className="mb-2 text-xs text-ink-soft">
            Founding price opens soon. Get on the list — early-access users get a head start.
          </p>
          <WaitlistForm interest="season-pass" source="prep" label="Notify me" compact />
          <Link
            href="/pricing"
            className="mt-3 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
          >
            See what&apos;s in the Pass →
          </Link>
        </div>
      )}
    </section>
  );
}
