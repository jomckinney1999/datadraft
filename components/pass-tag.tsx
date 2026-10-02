/**
 * The small label on a Season Pass feature. While the paywall is off it says
 * so — "free in early access" — rather than implying a price nobody can pay
 * yet (lib/season-pass.ts).
 */

import { PAYWALL_LIVE } from "@/lib/season-pass";

export default function PassTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gold ${className}`}
      title={PAYWALL_LIVE ? "Part of the Season Pass" : "Part of the Season Pass — free while DataDraft is in early access"}
    >
      ★ Season Pass{PAYWALL_LIVE ? "" : " · free in early access"}
    </span>
  );
}
