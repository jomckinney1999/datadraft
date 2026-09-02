"use client";

/**
 * The lesson's progress bar, drawn as field position.
 *
 * A bar that fills left to right tells you how much is left. A ball moving
 * toward an end zone tells you the same thing and also *where you are*, which
 * is the difference between a status indicator and a game. The yardage chip
 * that pops on a completion is the reward moment — it is the thing that makes
 * a correct answer feel like an event rather than a row turning green.
 *
 * Purely presentational: every number is passed in, so the drive logic stays
 * in lib/gameplay.ts and this file can be reasoned about as a picture.
 */

import { DRIVE_START_PCT, yardLine } from "@/lib/gameplay";

export default function DriveField({
  pct,
  heat,
  burst,
}: {
  /** Field position, 0–100. */
  pct: number;
  /** Combo label, shown as a flame chip when hot. */
  heat: string | null;
  /** Yards just gained — renders the floating chip, then clears. */
  burst: { yards: number; id: number; explosive: boolean } | null;
}) {
  const clamped = Math.max(DRIVE_START_PCT, Math.min(100, pct));
  const inRedZone = clamped >= 80;

  return (
    <div className="min-w-0 flex-1">
      <div className="relative h-7">
        {/* the field */}
        <div className="surface absolute inset-x-0 top-2 h-3 overflow-hidden rounded-full border border-panel-border bg-panel">
          {/* yard hashes every 10% — the texture that makes it read as a field */}
          <div className="absolute inset-0 flex justify-between px-[6%]">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="h-full w-px bg-panel-border/70" />
            ))}
          </div>
          {/* ground gained */}
          <div
            className={`relative h-full rounded-full transition-all duration-700 ease-out ${
              inRedZone ? "bg-gold" : "bg-turf"
            }`}
            style={{ width: `${clamped}%` }}
          />
          {/* end zone */}
          <div className="absolute inset-y-0 right-0 w-[8%] border-l border-turf/50 bg-turf/20" />
        </div>

        {/* the ball */}
        <div
          className="absolute top-0 -translate-x-1/2 transition-all duration-700 ease-out"
          style={{ left: `${clamped}%` }}
          aria-hidden
        >
          <span className="block text-[15px] leading-7">🏈</span>
        </div>

        {/* yardage chip — keyed on id so an identical gain still re-animates */}
        {burst && (
          <div
            key={burst.id}
            className="pointer-events-none absolute -top-1 -translate-x-1/2 animate-yard-pop"
            style={{ left: `${clamped}%` }}
          >
            <span
              className={`whitespace-nowrap font-mono text-[11px] font-bold ${
                burst.explosive ? "text-gold" : "text-turf"
              }`}
            >
              +{burst.yards} YDS
            </span>
          </div>
        )}
      </div>

      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-muted">
          {yardLine(clamped)}
        </span>
        {heat && (
          <span className="animate-heat-pulse whitespace-nowrap border border-gold/50 bg-gold/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-widest text-gold">
            🔥 {heat}
          </span>
        )}
      </div>
    </div>
  );
}
