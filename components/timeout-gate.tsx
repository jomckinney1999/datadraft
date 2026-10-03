"use client";

/**
 * Out of timeouts — soft gate before a graded drive. Practice Field stays free.
 */

import Link from "next/link";
import { useState } from "react";
import PassOffer from "@/components/pass-offer";
import {
  buyShopItem,
  COST_TIMEOUT_REFILL_FULL,
  COST_TIMEOUT_REFILL_ONE,
  FREE_DAILY_TIMEOUTS,
} from "@/lib/economy";
import { type Progress } from "@/lib/progress";
import Coach from "@/components/coach";

export default function TimeoutGate({
  progress,
  onRefill,
  backHref = "/learn",
}: {
  progress: Progress;
  onRefill: (p: Progress) => void;
  backHref?: string;
}) {
  const [err, setErr] = useState<string | null>(null);

  function buy(id: "timeout-1" | "timeout-full") {
    const result = buyShopItem(id);
    if (!result.ok) {
      setErr(result.reason);
      return;
    }
    onRefill(result.progress);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 pb-16 text-center">
      <Coach mood="angry" size={120} />
      <p className="label-broadcast mt-4 text-gold">out of timeouts</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
        Coach called the game
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        Free players get {FREE_DAILY_TIMEOUTS} timeouts a day — each one starts a
        graded drive. You&apos;re empty, and your streak&apos;s safe. Refill with
        scouting tickets, or come back tomorrow.
      </p>

      <div className="mt-2 font-mono text-[12px] text-gold">
        {progress.tickets} ✦ tickets in the bag
      </div>

      <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
        <button
          type="button"
          onClick={() => buy("timeout-1")}
          className="btn-turf rounded-xl border border-turf/80 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-night"
        >
          Buy 1 timeout · {COST_TIMEOUT_REFILL_ONE} ✦
        </button>
        <button
          type="button"
          onClick={() => buy("timeout-full")}
          className="rounded-xl border-2 border-panel-border border-b-4 bg-panel px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-ink-soft hover:border-gold/50 hover:text-gold"
        >
          Full board ({FREE_DAILY_TIMEOUTS}) · {COST_TIMEOUT_REFILL_FULL} ✦
        </button>
      </div>

      {err && (
        <p className="mt-3 font-mono text-[11px] text-gold" role="alert">
          {err}
        </p>
      )}

      <PassOffer moment="lessons" className="mt-8 w-full max-w-sm" />

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/field"
          className="font-mono text-[11px] uppercase tracking-wider text-turf hover:underline"
        >
          Practice Field is still free →
        </Link>
        <Link
          href={backHref}
          className="font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-ink-soft"
        >
          Back to board
        </Link>
      </div>
    </main>
  );
}
