/**
 * The other person in a cutscene: a client on a case, an interviewer on a
 * mock screen. Drawn as a video-call tile, a silhouette in a headset with a
 * live dot, rather than a face, the way a game's radio call shows who's on
 * the line. A silhouette can't look like anyone real, and it never wears a
 * number, same as every other figure on the site.
 *
 * Every colour is a theme token (art-kit's `c()`).
 */

import { c, N } from "@/components/art-kit";

export type PortraitTone = "turf" | "ice" | "gold";

export default function CallerPortrait({
  tone = "ice",
  size = 72,
  className = "",
}: {
  tone?: PortraitTone;
  size?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className} aria-hidden role="presentation">
      <rect x="2" y="2" width="76" height="76" rx="14" fill={c("night-100")} stroke={N} strokeWidth="2.5" />
      <rect x="6" y="6" width="68" height="68" rx="11" fill={c(tone, 0.16)} />
      {/* shoulders, then head */}
      <path d="M14 74 Q16 54 40 52 Q64 54 66 74 Z" fill={c(tone)} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M33 52 L40 60 L47 52" fill="none" stroke={N} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="40" cy="34" r="14" fill={c("ink-soft")} stroke={N} strokeWidth="2.2" />
      {/* headset: band, ear cups, mic */}
      <path d="M25 34 Q25 16 40 16 Q55 16 55 34" fill="none" stroke={N} strokeWidth="5" strokeLinecap="round" />
      <path d="M25 34 Q25 16 40 16 Q55 16 55 34" fill="none" stroke={c("gold")} strokeWidth="2.6" strokeLinecap="round" />
      <rect x="21" y="30" width="7" height="11" rx="3" fill={c("gold")} stroke={N} strokeWidth="1.8" />
      <rect x="52" y="30" width="7" height="11" rx="3" fill={c("gold")} stroke={N} strokeWidth="1.8" />
      <path d="M25 40 Q27 48 36 46" fill="none" stroke={N} strokeWidth="2" strokeLinecap="round" />
      <circle cx="37" cy="46" r="2.4" fill={c("gold")} stroke={N} strokeWidth="1.4" />
      {/* the live dot */}
      <circle cx="66" cy="14" r="4" fill={c("turf")} stroke={N} strokeWidth="1.6" />
    </svg>
  );
}
