/**
 * The cutscene look without the cutscene, for places that have to stay fast
 * (a daily question is ninety seconds; a scene in front of it would cost more
 * than it gives). A character delivers the situation in a dialogue bubble,
 * and the task is an objective that ticks when it's done.
 *
 * Shares its bubble with components/cutscene.tsx (`.cutscene-bubble`), so a
 * case briefing and a question read as the same game.
 */

import type { ReactNode } from "react";
import Coach, { type CoachMood } from "@/components/coach";

export function SceneLine({
  mood = "idle",
  name = "Coach Blitz",
  children,
  className = "",
}: {
  mood?: CoachMood;
  name?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <div className="flex shrink-0 flex-col items-center pt-1">
        <Coach mood={mood} size={52} />
        <span className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-turf">{name.split(" ")[0]}</span>
      </div>
      <div className="cutscene-bubble relative min-w-0 flex-1 rounded-2xl border-[3px] border-night bg-ink px-4 py-3 text-night">
        {/* the tail, pointing at the speaker */}
        <span
          aria-hidden
          className="absolute -left-[11px] top-5 h-0 w-0 border-y-[8px] border-r-[10px] border-y-transparent border-r-night"
        />
        <span aria-hidden className="absolute -left-[6px] top-[22px] h-0 w-0 border-y-[6px] border-r-[7px] border-y-transparent border-r-ink" />
        <span className="sr-only">{name}: </span>
        <div className="text-[15px] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function Objective({ done, children, className = "" }: { done: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-xl border p-3 pl-11 transition-colors ${
        done ? "border-turf/60 bg-turf/10" : "border-gold/40 bg-gold/5"
      } ${className}`}
    >
      <span
        aria-hidden
        className={`absolute left-3 top-3.5 flex h-5 w-5 items-center justify-center rounded border-2 font-mono text-[11px] font-bold ${
          done ? "border-turf bg-turf text-night" : "border-gold/70 text-transparent"
        }`}
      >
        ✓
      </span>
      <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${done ? "text-turf" : "text-gold"}`}>
        {done ? "Objective complete" : "▸ Objective"}
      </p>
      <div className="mt-1 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}
