"use client";

/**
 * Downs-and-distance field for the lesson drive.
 *
 * Reads as a mini football field (thick turf pill, white hashes, gold chains)
 * rather than a thin progress bar — Duolingo clarity, sports material.
 */

import {
  ballOnLabel,
  downAndDistance,
  type DriveState,
  type PlayKind,
} from "@/lib/drive-sim";

export type FieldBurst = {
  id: number;
  label: string;
  explosive?: boolean;
  negative?: boolean;
  kind?: PlayKind;
};

export default function DriveField({
  drive,
  heat,
  burst,
}: {
  drive: DriveState;
  heat: string | null;
  burst: FieldBurst | null;
}) {
  const ball = Math.max(0, Math.min(100, drive.ballOn));
  const stick = Math.max(0, Math.min(100, drive.firstDownAt));
  const inRedZone = ball >= 80;
  const shake = burst?.negative || burst?.kind === "incomplete";

  const statusLabel =
    drive.status === "touchdown"
      ? "Touchdown!"
      : drive.status === "turnover"
        ? "Turnover"
        : downAndDistance(drive);

  return (
    <div className={`min-w-0 flex-1 ${shake ? "animate-shake" : ""}`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider ${
            drive.status === "touchdown"
              ? "border border-turf/50 bg-turf/20 text-turf"
              : drive.status === "turnover"
                ? "border border-gold/50 bg-gold/15 text-gold"
                : "border border-turf/40 bg-turf/15 text-turf"
          }`}
        >
          {statusLabel}
        </span>
        <span className="font-mono text-[11px] font-medium text-ink-soft">
          {ballOnLabel(ball)}
        </span>
      </div>

      <div className="relative h-9">
        <div className="drive-field-track absolute inset-x-0 top-2">
          {/* hashes */}
          <div className="pointer-events-none absolute inset-0 flex justify-between px-[6%]">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="h-full w-px bg-ink/20"
              />
            ))}
          </div>
          {/* ground gained */}
          <div
            className={`drive-field-gain absolute inset-y-0 left-0 transition-all duration-700 ease-out motion-reduce:transition-none ${
              inRedZone ? "drive-field-gain-redzone" : ""
            }`}
            style={{ width: `${Math.max(ball, 3)}%` }}
          />
          {/* end zone stripe */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[10%] border-l-2 border-dashed border-turf/50 bg-turf/20" />
        </div>

        {/* first-down stick */}
        {drive.status === "live" && stick > ball + 1 && (
          <div
            className="absolute top-1 z-10 -translate-x-1/2 transition-all duration-700 ease-out motion-reduce:transition-none"
            style={{ left: `${stick}%` }}
            aria-hidden
          >
            <span className="block h-7 w-1 rounded-full bg-gold shadow-scoreboard-gold" />
          </div>
        )}

        {/* ball */}
        <div
          className="absolute top-0.5 z-20 -translate-x-1/2 transition-all duration-700 ease-out motion-reduce:transition-none"
          style={{ left: `${ball}%` }}
          aria-hidden
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-panel text-lg shadow-scoreboard-turf ring-2 ring-turf/40">
            🏈
          </span>
        </div>

        {burst && (
          <div
            key={burst.id}
            className="pointer-events-none absolute -top-1 z-30 -translate-x-1/2 animate-yard-pop"
            style={{ left: `${ball}%` }}
          >
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold shadow-scoreboard ${
                burst.negative
                  ? "border border-gold/50 bg-gold/20 text-gold"
                  : burst.explosive
                    ? "border border-gold/50 bg-gold/20 text-gold"
                    : "border border-turf/50 bg-turf/20 text-turf"
              }`}
            >
              {burst.label}
            </span>
          </div>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {drive.status === "live"
            ? inRedZone
              ? "Red zone"
              : `1st-down marker · ${ballOnLabel(stick)}`
            : drive.status === "touchdown"
              ? "In the end zone"
              : "Drive over"}
        </span>
        {heat && drive.status === "live" && (
          <span className="animate-heat-pulse rounded-full border border-gold/50 bg-gold/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
            {heat}
          </span>
        )}
      </div>
    </div>
  );
}

export function burstFromPlay(
  kind: PlayKind,
  yards: number,
  id: number,
  explosive = false,
): FieldBurst {
  if (kind === "incomplete") {
    return { id, label: "INCOMPLETE", negative: true, kind };
  }
  if (kind === "sack") {
    return { id, label: `SACK ${yards}`, negative: true, kind };
  }
  if (kind === "turnover") {
    return {
      id,
      label: yards < 0 ? `TURNOVER ${yards}` : "TURNOVER",
      negative: true,
      kind,
    };
  }
  if (kind === "td") {
    return { id, label: `TD · +${yards}`, explosive: true, kind };
  }
  if (kind === "first_down") {
    return {
      id,
      label: `+${yards} · 1ST DOWN`,
      explosive: explosive || yards >= 10,
      kind,
    };
  }
  return {
    id,
    label: `+${yards} YDS`,
    explosive,
    kind,
  };
}
