"use client";

/**
 * The two plans side by side, the annual/monthly switch, and the button
 * that starts Stripe Checkout (docs/OFFER.md §2 and §5).
 *
 * Annual is the default and the founding price rides on it while it's open:
 * annual is what survives the fantasy season ending. The founding seat count
 * shows only when it's genuinely low; "through January 31" is always true,
 * and a counter stuck at 497 of 500 would be the kind of urgency we said we'd
 * never fake.
 */

import Link from "next/link";
import { useState } from "react";
import { FOUNDING, PASS_PLANS, type PassPlan } from "@/lib/season-pass";

type Billing = "annual" | "monthly";

const PASS_BULLETS = [
  "Every question in the bank, with solutions: SQL interview questions on real NFL data, plus Python, R and Excel",
  "The Query Doctor on every miss: why your query is wrong, without giving the answer away",
  "Timed mock SQL screens, graded like the real thing, with a report after",
  "Every course, every lesson, no daily limit",
  "The nine patterns analyst screens test, and where you stand on each",
  "Every case and every Draft Room season",
  "Coming to the Pass: a profile and certificates an employer can check",
];

const FREE_BULLETS = [
  "The daily question, in SQL, Python, R and Excel",
  "The Stat Duel and the Draft Room",
  "Chart it, and your own league's charts",
  "The first unit of every course",
  "The Practice Field and the Spreadsheet",
];

const longDate = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

export default function PricingPlans({ foundingOpen, foundingLeft }: { foundingOpen: boolean; foundingLeft: number }) {
  const [billing, setBilling] = useState<Billing>("annual");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const plan: PassPlan = billing === "monthly" ? "monthly" : foundingOpen ? "founding" : "annual";
  const shown = PASS_PLANS[plan];

  async function buy() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.status === 401) {
        window.location.href = "/account?next=/pricing";
        return;
      }
      if (res.ok && body.url) {
        window.location.href = body.url;
        return;
      }
      setNote(body.error ?? "Checkout didn't open. Try again in a moment.");
    } catch {
      setNote("Checkout didn't open. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <div>
      {foundingOpen && (
        <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-center text-sm text-ink">
          <strong className="text-gold">Founding price: {PASS_PLANS.founding.price} a year,</strong> kept for as long as
          you stay a member. Through {longDate(FOUNDING.lastDay)}
          {foundingLeft <= 100 ? `, and only ${foundingLeft} founding seats are left` : ""}.
        </div>
      )}

      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-xl border border-panel-border bg-night/60 p-1" role="radiogroup" aria-label="Billing">
          {(["annual", "monthly"] as Billing[]).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={billing === b}
              onClick={() => setBilling(b)}
              className={`rounded-lg px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                billing === b ? "bg-gold/15 text-gold" : "text-ink-soft hover:text-ink"
              }`}
            >
              {b === "annual" ? "Yearly · half off" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
        <section className="surface flex flex-col rounded-2xl border border-panel-border bg-panel p-6">
          <p className="label-broadcast text-turf">free</p>
          <p className="mt-2 font-display text-4xl font-bold text-ink">$0</p>
          <p className="mt-1 text-sm text-ink-soft">Every day, forever. The habit.</p>
          <ul className="mt-5 space-y-2 text-sm text-ink-soft">
            {FREE_BULLETS.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-turf" aria-hidden>✓</span>
                {b}
              </li>
            ))}
          </ul>
          <Link href="/questions" className="press mt-6 inline-flex justify-center rounded-xl border border-turf/60 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:bg-turf/10 md:mt-auto">
            Play today&apos;s question
          </Link>
        </section>

        <section className="surface flex flex-col rounded-2xl border border-gold/60 bg-panel p-6 shadow-scoreboard-gold">
          <p className="label-broadcast text-gold">★ season pass</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-ink">{shown.price}</span>
            <span className="text-sm text-ink-soft">/ {shown.per}</span>
            {plan === "founding" && (
              <span className="font-mono text-xs text-ink-muted line-through">{PASS_PLANS.annual.price}</span>
            )}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{shown.note}. For when you&apos;re going for the job.</p>
          <ul className="mt-5 space-y-2 text-sm text-ink">
            {PASS_BULLETS.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-gold" aria-hidden>★</span>
                {b}
              </li>
            ))}
          </ul>
          <button type="button" onClick={buy} disabled={busy} className="press btn-gold mt-6 justify-center py-3 text-base disabled:opacity-60">
            {busy ? "Opening checkout…" : plan === "founding" ? "Become a founding member" : "Get the Season Pass"}
          </button>
          <p className="mt-2 text-center font-mono text-[11px] text-ink-muted">
            14-day full refund · cancel in two clicks
          </p>
          {note && (
            <p role="alert" className="mt-2 text-center text-sm text-gold">
              {note}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
