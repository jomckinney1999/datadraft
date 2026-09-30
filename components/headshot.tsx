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
 * **The URL as nflverse lists it is the master file: 3400×2450, ~4 MB.**
 * Three of those on the Question of the Day is 12 MB of download and about
 * 100 MB of decoded bitmap, which is enough to stall a phone. The CDN is
 * Cloudinary-shaped (`/image/upload/<transforms>/<id>`) and honours added
 * transforms, so `headshotSrc` asks for a face-detected square at twice the
 * rendered size — ~25 KB, cropped by the CDN's own face detection rather
 * than by a guess at where a head sits in a landscape frame. Anything that
 * is not that URL shape passes through untouched.
 *
 * Lifted out of the dashboard so every page renders it the same way.
 */

import { useState } from "react";

const NFL_CDN = /^(https:\/\/static\.www\.nfl\.com\/image\/upload\/)([^/]+)\/(.+)$/;

/**
 * Sizes are rounded up to a multiple of 48 so a handful of distinct
 * transforms cover every call site — each distinct transform is a separate
 * object in the CDN's cache, and a cache miss is a 4 MB render on their end.
 */
export function headshotSrc(url: string, renderedPx: number): string {
  const m = NFL_CDN.exec(url);
  if (!m) return url;
  const px = Math.min(480, Math.ceil((renderedPx * 2) / 48) * 48);
  const base = m[2].split(",").filter((t) => !/^(w|h|c|g)_/.test(t));
  const transforms = [...base, `w_${px}`, `h_${px}`, "c_thumb", "g_face"];
  return `${m[1]}${transforms.join(",")}/${m[3]}`;
}

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
          src={headshotSrc(src!, size)}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
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
