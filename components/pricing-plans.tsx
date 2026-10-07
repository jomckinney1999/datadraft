"use client";

/**
 * The two plans side by side, the annual/monthly switch, and the button
 * that starts Stripe Checkout (docs/OFFER.md §2 and §5).
 *
 * The Season Pass is the card the page is for, so it leads (first in the
 * row and first on a phone, so reading order and tab order agree), it's
 * bigger, and it's lit: `.pass-card` in globals.css. Free sits beside it,
 * quieter, and says plainly what it doesn't have. Every number on the Pass
 * card is worked out from PASS_PLANS (the saving against paying monthly, the
 * price a month), never typed, so a price change can't leave a stale claim.
 *
 * Annual is the default and the founding price rides on it while it's open:
 * annual is what survives the fantasy season ending. The founding seat count
 * shows only when it's genuinely low; "through January 31" is always true,
 * and a counter stuck at 497 of 500 would be the kind of urgency we said we'd
 * never fake.
 */

import Link from "next/link";
import { useRef, useState } from "react";
import WaitlistForm from "@/components/waitlist-form";
import { FOUNDING, PASS_PLANS, PAYWALL_LIVE, type PassPlan } from "@/lib/season-pass";

type Billing = "annual" | "monthly";

/** What the Pass adds, led by the thing you get. */
const PASS_BULLETS: [string, string][] = [
  ["Every question in the bank, with solutions", "SQL interview questions on real NFL data, plus Python, R and Excel"],
  ["The Query Doctor on every miss", "why your query is wrong, without giving the answer away"],
  ["The Film Room", "replay any query clause by clause, in the order the database runs it"],
  ["Unlimited timed mock SQL screens", "graded like the real thing, with a report after"],
  ["Every course, every lesson", "no daily limit"],
  ["All nine interview patterns", "the ones analyst screens test, and where you stand on each"],
  ["Every case and every Draft Room season", ""],
  ["Coming to the Pass", "a profile and certificates an employer can check"],
];

const FREE_BULLETS = [
  "The daily question, in SQL, Python, R and Excel",
  "The Stat Duel and the Draft Room",
  "Chart it, and your own league's charts",
  "The first unit of every course",
  "The Practice Field and the Spreadsheet",
];

/** The Pass-only lines from /pricing's comparison, said from Free's side. */
const FREE_LIMITS = [
  "Solutions to the whole bank",
  "The Query Doctor on every miss",
  "Unlimited mock screens",
  "Lessons past each course's first unit",
];

const longDate = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

/** $79, $6.58, $160.88: whole dollars lose the cents. */
const money = (cents: number) => (cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`);

/** Twelve months paid monthly: what yearly is measured against. */
const MONTHLY_FOR_A_YEAR = PASS_PLANS.monthly.cents * 12;

function Lock() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden className="mt-[3px] shrink-0">
      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function PricingPlans({ foundingOpen, foundingLeft }: { foundingOpen: boolean; foundingLeft: number }) {
  const [billing, setBilling] = useState<Billing>("annual");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const switches = useRef<(HTMLButtonElement | null)[]>([]);

  const yearly: PassPlan = foundingOpen ? "founding" : "annual";
  const plan: PassPlan = billing === "monthly" ? "monthly" : yearly;
  const shown = PASS_PLANS[plan];

  const saveCents = MONTHLY_FOR_A_YEAR - PASS_PLANS[yearly].cents;
  const savePct = Math.round((saveCents / MONTHLY_FOR_A_YEAR) * 100);
  const perMonth = money(Math.round(PASS_PLANS[yearly].cents / 12));

  const ribbon = plan === "founding" ? "Founding member price" : plan === "annual" ? "Best value" : "Everything unlocked";

  function onSwitchKey(e: React.KeyboardEvent) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const next: Billing = billing === "annual" ? "monthly" : "annual";
    setBilling(next);
    switches.current[next === "annual" ? 0 : 1]?.focus();
  }

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
      <div className="mb-10 flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing"
          onKeyDown={onSwitchKey}
          className="relative grid grid-cols-2 rounded-2xl border border-panel-border bg-night/60 p-1"
        >
          <span
            aria-hidden
            className={`pass-thumb absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-xl ${
              billing === "monthly" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          {(["annual", "monthly"] as Billing[]).map((b, i) => (
            <button
              key={b}
              ref={(el) => {
                switches.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={billing === b}
              tabIndex={billing === b ? 0 : -1}
              onClick={() => setBilling(b)}
              className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors sm:px-6 ${
                billing === b ? "text-gold" : "text-ink-soft hover:text-ink"
              }`}
            >
              {b === "annual" ? "Yearly" : "Monthly"}
              {b === "annual" && (
                <span className="rounded-full bg-turf px-1.5 py-0.5 text-[10px] leading-none text-night">
                  Save {savePct}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center md:gap-5">
        <section aria-label="Season Pass" className="pass-card flex flex-col rounded-3xl p-6 pt-8 sm:p-8 sm:pt-10">
          <p className="pass-ribbon absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider">
            ★ {ribbon}
          </p>

          <p className="label-broadcast text-gold">★ season pass</p>
          <p className="mt-1 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
            For when you&apos;re going for the job.
          </p>

          <div key={plan} className="pass-price-in mt-5">
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-6xl font-bold tracking-tight text-ink sm:text-7xl">{shown.price}</span>
              <span className="text-base text-ink-soft">/ {shown.per}</span>
              {plan === "founding" && (
                <span className="font-mono text-base text-ink-muted line-through">
                  <span className="sr-only">usually </span>
                  {PASS_PLANS.annual.price}
                </span>
              )}
            </p>

            {billing === "annual" ? (
              <>
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                  <span className="rounded-full bg-gold/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-gold ring-1 ring-gold/40">
                    {perMonth} a month
                  </span>
                  <span className="text-ink-soft">
                    You save <strong className="text-ink">{money(saveCents)}</strong> a year against monthly
                  </span>
                </p>
                {plan === "founding" && (
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft [text-wrap:pretty]">
                    The founding price is kept for as long as you stay a member. Through {longDate(FOUNDING.lastDay)}
                    {foundingLeft <= 100 ? `, and only ${foundingLeft} founding seats are left` : ""}.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-ink-soft">{shown.note}.</p>
                <button
                  type="button"
                  onClick={() => setBilling("annual")}
                  className="press mt-3 w-full rounded-xl border border-dashed border-gold/50 bg-gold/5 px-4 py-2.5 text-left text-sm text-ink-soft transition-colors hover:bg-gold/10"
                >
                  <strong className="text-gold">Go yearly and save {money(saveCents)}</strong>: {PASS_PLANS[yearly].price} a
                  year, {perMonth} a month{foundingOpen ? ", at the founding price" : ""} →
                </button>
              </>
            )}
          </div>

          <div className="mt-6 border-t border-gold/20 pt-5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted">
              Everything in Free, plus
            </p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {PASS_BULLETS.map(([lead, rest]) => (
                <li key={lead} className="flex gap-3">
                  <span
                    className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-[11px] font-bold text-gold ring-1 ring-gold/40"
                    aria-hidden
                  >
                    ★
                  </span>
                  <span className="leading-snug text-ink-soft">
                    <strong className="font-semibold text-ink">{lead}</strong>
                    {rest ? `: ${rest}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {PAYWALL_LIVE ? (
            <div className="mt-7">
              <button
                type="button"
                onClick={buy}
                disabled={busy}
                className="press btn-gold w-full py-3.5 text-sm disabled:opacity-60"
              >
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
            </div>
          ) : (
            <div className="mt-7">
              <p className="mb-3 text-center text-sm text-ink-soft">
                The Pass isn&apos;t on sale yet. Join the list and you&apos;ll hear the moment it opens.
              </p>
              <WaitlistForm
                interest="practice"
                source={`pricing-${plan}`}
                label={plan === "founding" ? `Get first dibs at ${PASS_PLANS.founding.price}/yr` : "Join the waitlist"}
                gold
              />
              <p className="mt-3 text-center font-mono text-[11px] text-ink-muted">
                Every Pass feature is free in early access · nothing charges from this page
              </p>
              <p className="mt-1 text-center text-sm">
                <Link href="/questions/mock" className="font-semibold text-gold underline-offset-2 hover:underline">
                  Try a timed mock screen now →
                </Link>
              </p>
            </div>
          )}
        </section>

        <section aria-label="Free" className="flex flex-col rounded-2xl border border-panel-border bg-panel/50 p-6">
          <p className="label-broadcast text-ink-muted">free</p>
          <p className="mt-2 font-display text-4xl font-bold text-ink-soft">$0</p>
          <p className="mt-1 text-sm text-ink-muted">Every day, forever. The habit.</p>
          <ul className="mt-5 space-y-2 text-sm text-ink-soft">
            {FREE_BULLETS.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-ink-muted" aria-hidden>
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            Only with the Pass
          </p>
          <ul className="mt-2 space-y-2 text-sm text-ink-muted">
            {FREE_LIMITS.map((b) => (
              <li key={b} className="flex gap-2">
                <Lock />
                {b}
              </li>
            ))}
          </ul>
          <Link
            href="/questions"
            className="press mt-6 inline-flex justify-center rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-ink-muted hover:text-ink"
          >
            Play today&apos;s question
          </Link>
        </section>
      </div>
    </div>
  );
}
