"use client";

/**
 * Live clock to the next league day (midnight America/New_York), when every
 * daily turns over. Same source as Stat Duel and the share screens — one
 * countdown for the whole product.
 */

import { useEffect, useState } from "react";
import { formatCountdown, msUntilNextLeagueDay } from "@/lib/daily-share";

export default function DailyCountdown({
  className = "",
  prefix = "Next in",
}: {
  className?: string;
  prefix?: string;
}) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMs(msUntilNextLeagueDay());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (ms === null) {
    return (
      <span className={className} aria-hidden>
        {prefix} —:—:—
      </span>
    );
  }

  return (
    <span className={className} title="Until midnight Eastern, when the dailies turn over">
      {prefix}{" "}
      <span className="scorebug-digits tabular-nums">{formatCountdown(ms)}</span>
    </span>
  );
}
