"use client";

/**
 * A player's headshot, with a fallback that never looks broken.
 *
 * `src` is nflverse's `headshot_url`, which points at the NFL's own image
 * CDN. It is hotlinked as a plain <img> on purpose — not proxied through
 * next/image — so the photo is served from its source rather than from our
 * domain. Some URLs 404 (retired players, renamed assets), so a failed load
 * swaps to an initial in a team-neutral chip instead of a broken-image icon.
 *
 * Lifted out of the dashboard so the landing page's live strip renders the
 * same thing the same way.
 */

import { useState } from "react";

export default function Headshot({
  name,
  src,
  size = 32,
  className = "",
}: {
  name: string;
  src: string | null;
  /** Rendered diameter in px. */
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const show = Boolean(src) && !failed;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-panel-border bg-night ${className}`}
      style={{ width: size, height: size }}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="font-display font-bold text-ink-muted"
          style={{ fontSize: Math.max(10, Math.round(size * 0.38)) }}
        >
          {initial}
        </span>
      )}
    </span>
  );
}
