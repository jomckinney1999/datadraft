/**
 * Landing-page Season Pass pitch (docs/OFFER.md §5).
 *
 * Prices are the approved ladder. Until PAYWALL_LIVE, the button captures a
 * waitlist email — nothing charges. Vercel Hobby is non-commercial; keep
 * Pro on the launch checklist before treating this as a live storefront.
 */

import Link from "next/link";
import PricingPlans from "@/components/pricing-plans";
import { leagueDay } from "@/lib/questions";
import { FOUNDING, foundingOpen, PASS_PLANS, PAYWALL_LIVE } from "@/lib/season-pass";
import { foundingTaken } from "@/lib/pass-server";

export default async function PricingSection() {
  const taken = await foundingTaken();
  const open = foundingOpen(leagueDay(), taken);

  return (
    <section
      id="pricing"
      data-reveal-section
      className="wash-gold scroll-mt-20 border-b border-panel-border py-16 sm:py-24"
    >
      <div className="sequence relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal mx-auto max-w-3xl text-center">
          <p className="label-broadcast text-gold">★ season pass</p>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-ink [text-wrap:balance] sm:text-5xl">
            Get the job. <span className="text-turf">Keep the league.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Free to play every day. The Season Pass is for when you&apos;re going for the job — every question, the
            Doctor, timed screens and every course. {PASS_PLANS.annual.price} a year, under $10 a month.
          </p>
          {!PAYWALL_LIVE && (
            <p className="mx-auto mt-3 max-w-lg rounded-lg border border-ice/40 bg-ice/10 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ice">
              Founding price opens soon · join the list · nothing charges yet
            </p>
          )}
        </div>

        <div className="reveal mt-10">
          <PricingPlans foundingOpen={open} foundingLeft={FOUNDING.cap - taken} />
        </div>

        <p className="reveal mt-6 text-center text-sm text-ink-muted">
          <Link href="/pricing" className="font-semibold text-gold hover:underline">
            Full comparison and FAQ →
          </Link>
        </p>
      </div>
    </section>
  );
}
