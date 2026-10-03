"use client";

/**
 * A whole page that's in the Season Pass: a case after the first, a lesson
 * past a course's first unit. Renders its children for a member, for
 * anything marked free, and for everyone while the paywall is off; otherwise
 * Coach, the offer and a way back.
 *
 * Before the page knows (the paywall is on and progress hasn't loaded), it
 * renders nothing rather than flashing the content and then taking it away.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import Coach from "@/components/coach";
import PassOffer, { type OfferMoment } from "@/components/pass-offer";
import { usePass } from "@/lib/use-pass";

export function PassGateScreen({
  moment,
  backHref,
  backLabel,
  title,
}: {
  moment: OfferMoment;
  backHref: string;
  backLabel: string;
  title: string;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 pb-16 text-center">
      <Coach mood="whistle" size={110} />
      <p className="label-broadcast mt-4 text-gold">season pass</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      <PassOffer moment={moment} className="mt-5 w-full" />
      <Link
        href={backHref}
        className="mt-6 font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-ink-soft"
      >
        ← {backLabel}
      </Link>
    </main>
  );
}

export default function PassGate({
  free,
  moment,
  backHref,
  backLabel,
  title,
  children,
}: {
  free: boolean;
  moment: OfferMoment;
  backHref: string;
  backLabel: string;
  title: string;
  children: ReactNode;
}) {
  const pass = usePass();
  if (free || pass === true) return <>{children}</>;
  if (pass === null) return null;
  return <PassGateScreen moment={moment} backHref={backHref} backLabel={backLabel} title={title} />;
}
