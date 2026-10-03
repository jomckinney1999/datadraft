"use client";

/**
 * The Season Pass offer, at the moment someone reaches for a Pass feature.
 * One card, the approved copy for each moment (docs/OFFER.md §5).
 *
 * Where it may appear: at a limit, after a solve, or when someone opens a
 * Pass feature. Never before or during the daily question, the Stat Duel, a
 * chart or a league; those are how people find us.
 *
 * While the paywall is off there's nothing to buy, so the card offers the
 * waitlist instead (the timeout gate and the shop use it today). Once it's
 * on, the button goes to /pricing with the moment attached, which the
 * analytics turns into /pricing/~from-<moment> so we can see which moment
 * sells.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import WaitlistForm from "@/components/waitlist-form";
import { PASS_PLANS, PAYWALL_LIVE } from "@/lib/season-pass";
import { waitlistJoined } from "@/lib/waitlist-memory";

export type OfferMoment =
  | "lessons"
  | "course-unit"
  | "question"
  | "doctor"
  | "coach"
  | "mock"
  | "mock-technical"
  | "screen"
  | "challenge"
  | "case"
  | "draft-season"
  | "after-daily"
  | "shop";

const COPY: Record<OfferMoment, string> = {
  lessons: "That's your five for today, and your streak's safe. Season Pass makes lessons unlimited.",
  "course-unit":
    "The first unit of every course is free. The rest of this one is in the Season Pass: every lesson, no daily limit.",
  question:
    "This one's in the Season Pass. Today's question is free, and so is any question for a week after it was the daily.",
  doctor: "That's today's free diagnosis. With the Season Pass, the Doctor reads every miss.",
  coach: "Ask Coach is in the Season Pass, on top of the Doctor's diagnosis.",
  mock: "You've tried the phone screen. The Season Pass has unlimited screens, including the technical round.",
  "mock-technical":
    "The phone screen is free to try. The technical round, and as many screens as you want, are in the Season Pass.",
  screen: "The quick screen is free to try. The seventy-minute online assessment, and as many screens as you want, are in the Season Pass.",
  challenge: "The Data Challenge is a take-home with a rubric. It's in the Season Pass, along with every case.",
  case: "The first case is free. Every case is in the Season Pass.",
  "draft-season": "This season is free to draft. Every season on file is in the Season Pass.",
  "after-daily":
    "Going for an analyst job? The Season Pass is the prep: the whole bank, the Doctor on every miss, timed mock screens.",
  shop: "Unlimited lessons, the whole question bank, Query Doctor on every miss and timed mock screens.",
};

export default function PassOffer({
  moment,
  onDismiss,
  className = "",
}: {
  moment: OfferMoment;
  /** For the soft moments: a way to say "not now". */
  onDismiss?: () => void;
  className?: string;
}) {
  const [onList, setOnList] = useState(false);
  useEffect(() => {
    setOnList(waitlistJoined());
  }, []);

  return (
    <div className={`rounded-xl border border-gold/50 bg-gold/10 p-4 text-left ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">★ Season Pass</p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="font-mono text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            Not now
          </button>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink">{COPY[moment]}</p>
      {PAYWALL_LIVE ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href={`/pricing?from=${moment}`} className="press btn-gold !px-4 !py-2 text-sm">
            See the Season Pass
          </Link>
          <span className="font-mono text-[11px] text-ink-soft">
            {PASS_PLANS.annual.price} a year · or {PASS_PLANS.monthly.price} a month
          </span>
        </div>
      ) : onList ? (
        <p className="mt-3 font-mono text-[11px] text-turf" role="status">
          ✓ You&apos;re on the founding list. We&apos;ll email you when it opens.
        </p>
      ) : (
        <div className="mt-3">
          <p className="mb-2 text-[12px] text-ink-soft">
            Founding price opens soon — get on the list for the head start.
          </p>
          <WaitlistForm
            interest="season-pass"
            source={`pass-${moment}`}
            label="Join waitlist"
            compact
            onJoined={() => setOnList(true)}
          />
        </div>
      )}
    </div>
  );
}
