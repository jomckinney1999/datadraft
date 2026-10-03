"use client";

/**
 * Sideline shop + Season Pass waitlist — Duo gems shop, football-framed.
 */

import { useState } from "react";
import Link from "next/link";
import PassOffer from "@/components/pass-offer";
import {
  buyShopItem,
  COST_BYE_WEEK,
  COST_TIMEOUT_REFILL_FULL,
  COST_TIMEOUT_REFILL_ONE,
  FREE_DAILY_TIMEOUTS,
  type ShopItemId,
} from "@/lib/economy";
import { type Progress } from "@/lib/progress";

const ITEMS: {
  id: ShopItemId;
  title: string;
  blurb: string;
  price: number;
  icon: string;
}[] = [
  {
    id: "timeout-1",
    title: "One timeout",
    blurb: "Call one more drive today",
    price: COST_TIMEOUT_REFILL_ONE,
    icon: "⏱️",
  },
  {
    id: "timeout-full",
    title: "Full timeout board",
    blurb: `Top back up to ${FREE_DAILY_TIMEOUTS}`,
    price: COST_TIMEOUT_REFILL_FULL,
    icon: "📋",
  },
  {
    id: "bye-week",
    title: "Bye week",
    blurb: "Protect your heater for one missed day",
    price: COST_BYE_WEEK,
    icon: "🛡️",
  },
];

export default function SidelineShop({
  progress,
  onChange,
}: {
  progress: Progress;
  onChange?: (p: Progress) => void;
}) {
  const [msg, setMsg] = useState<string | null>(null);

  function buy(id: ShopItemId) {
    const result = buyShopItem(id);
    if (!result.ok) {
      setMsg(result.reason);
      return;
    }
    setMsg(id === "bye-week" ? "Bye week locked in." : "Timeouts refreshed.");
    onChange?.(result.progress);
  }

  return (
    <div className="section-card border-gold/30">
      <p className="label-broadcast text-gold">sideline shop</p>
      <p className="mt-1 font-display text-base font-bold text-ink">
        Spend scouting tickets
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
        Earn tickets by clearing drives. Free tier gets {FREE_DAILY_TIMEOUTS}{" "}
        timeouts a day — Season Pass never runs out.
      </p>

      <ul className="mt-4 space-y-2">
        {ITEMS.map((item) => {
          const can = progress.tickets >= item.price;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => buy(item.id)}
                disabled={
                  !can || (progress.seasonPass && item.id !== "bye-week")
                }
                className="flex w-full items-center gap-3 rounded-xl border-2 border-panel-border border-b-4 bg-panel/60 px-3 py-2.5 text-left transition-colors hover:border-gold/40 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-bold text-ink">
                    {item.title}
                  </span>
                  <span className="block text-[11px] text-ink-muted">
                    {item.blurb}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] font-bold text-gold">
                  {item.price} ✦
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {msg && (
        <p className="mt-3 font-mono text-[11px] text-turf" role="status">
          {msg}
        </p>
      )}

      <div className="mt-5">
        {progress.seasonPass ? (
          <p className="rounded-xl border border-turf/40 bg-turf/10 p-3 font-mono text-[11px] text-turf">
            ★ Season Pass on: unlimited lessons.
          </p>
        ) : (
          <PassOffer moment="shop" />
        )}
        <Link
          href="/learn"
          className="mt-2 inline-block font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-turf"
        >
          Back to learning →
        </Link>
      </div>
    </div>
  );
}
