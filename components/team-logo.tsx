"use client";

/**
 * A team's logo beside its code, for scoreboards.
 *
 * Logos are trademarks and this product ran on colours alone until
 * 2026-09-30, when the decision was made to show them on score tiles — a
 * scoreboard without crests reads as a spreadsheet. They are hotlinked from
 * nflverse's listed source (ESPN's CDN) as a plain <img>, never proxied
 * through next/image, so the mark is served from its source and not from
 * our domain. Dense SQL result grids keep the colour swatch (`TeamChip`);
 * this is for the handful of places that are actually a scoreboard.
 *
 * A failed load falls back to the swatch, so a missing logo never leaves a
 * broken-image icon in a score line.
 */

import { useState } from "react";
import { teamAccent, teamLogo, teamName } from "@/lib/team-colors";

export default function TeamLogo({
  abbr,
  size = 22,
  showCode = true,
  className = "",
}: {
  abbr: string;
  /** Rendered logo size in px. */
  size?: number;
  /** Render the three-letter code after the mark. */
  showCode?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!abbr) return null;
  const src = teamLogo(abbr);
  const show = Boolean(src) && !failed;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={teamName(abbr)}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={showCode ? "" : teamName(abbr)}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="shrink-0 object-contain"
          style={{ width: size, height: size }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-hidden
          className="inline-block shrink-0 rounded-sm"
          style={{
            width: Math.round(size * 0.5),
            height: Math.round(size * 0.5),
            backgroundColor: teamAccent(abbr),
          }}
        />
      )}
      {showCode && abbr}
    </span>
  );
}
