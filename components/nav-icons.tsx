/**
 * Tiny sticker icons for the section menus — same night outline + accent
 * fills as the card art, so the dropdown feels like the rest of the site.
 */

import type { ReactNode } from "react";
import { c, Football, N, SANS, type Tone } from "@/components/art-kit";

function Frame({
  tone,
  small = false,
  children,
}: {
  tone: Tone;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`nav-icon shrink-0 ${small ? "h-8 w-8" : "h-10 w-10"}`}
      data-tone={tone}
      aria-hidden
    >
      <rect x="1" y="1" width="38" height="38" rx="11" fill={c("night")} stroke={N} strokeWidth="1.8" />
      <rect x="1" y="1" width="38" height="38" rx="11" fill={c(tone)} opacity="0.28" />
      <rect
        x="2.5"
        y="2.5"
        width="35"
        height="35"
        rx="9.5"
        fill="none"
        stroke={c(tone)}
        strokeWidth="1.2"
        opacity="0.55"
      />
      {children}
    </svg>
  );
}

const ICONS: Record<string, { tone: Tone; Scene: () => ReactNode }> = {
  "/dashboard": {
    tone: "gold",
    Scene: () => (
      <>
        <rect x="10" y="12" width="8" height="16" rx="2" fill={c("turf")} stroke={N} strokeWidth="1.2" />
        <rect x="20" y="8" width="8" height="20" rx="2" fill={c("gold")} stroke={N} strokeWidth="1.2" />
      </>
    ),
  },
  "/achievements": {
    tone: "gold",
    Scene: () => (
      <>
        <ellipse cx="20" cy="26" rx="9" ry="3" fill={N} opacity="0.35" />
        <path d="M14 22 L20 8 L26 22 Z" fill={c("gold")} stroke={N} strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="20" cy="18" r="3" fill={c("night")} />
      </>
    ),
  },
  "/questions": {
    tone: "turf",
    Scene: () => (
      <>
        <rect x="9" y="10" width="22" height="20" rx="3" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M13 16 H27 M13 21 H22" stroke={c("turf")} strokeWidth="2" strokeLinecap="round" />
        <circle cx="28" cy="26" r="5" fill={c("gold")} stroke={N} strokeWidth="1.2" />
        <text x="28" y="28.5" textAnchor="middle" fontSize="7" fontWeight="900" fill={N}>
          ?
        </text>
      </>
    ),
  },
  "/questions#interview": {
    tone: "ice",
    Scene: () => (
      <>
        <path d="M12 12 H28 V28 H12 Z" fill="none" stroke={c("ice")} strokeWidth="2" />
        <path d="M16 16 H24 M16 20 H22 M16 24 H20" stroke={c("ink")} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      </>
    ),
  },
  "/questions/prep": {
    tone: "gold",
    Scene: () => (
      <>
        <rect x="11" y="10" width="18" height="20" rx="2" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M15 16 H25 M15 21 H22" stroke={c("gold")} strokeWidth="2" strokeLinecap="round" />
        <circle cx="26" cy="26" r="4.5" fill={c("turf")} stroke={N} strokeWidth="1.2" />
      </>
    ),
  },
  "/questions/screen": {
    tone: "ice",
    Scene: () => (
      <>
        <rect x="8" y="11" width="24" height="16" rx="2" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M14 30 H26" stroke={N} strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="19" r="3" fill={c("ice")} />
      </>
    ),
  },
  "/questions/mock": {
    tone: "turf",
    Scene: () => (
      <>
        <rect x="13" y="8" width="14" height="24" rx="3" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <circle cx="20" cy="18" r="4" fill={c("turf")} stroke={N} strokeWidth="1.2" />
        <text x="20" y="20.5" textAnchor="middle" fontSize="6" fontWeight="900" fill={N}>
          20
        </text>
      </>
    ),
  },
  // A clipboard of names, two ticked: name everyone on the list.
  "/questions/roll-call": {
    tone: "ice",
    Scene: () => (
      <>
        <rect x="11" y="9" width="18" height="23" rx="2.5" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <rect x="16" y="7" width="8" height="4" rx="1.2" fill={c("ice")} stroke={N} strokeWidth="1.1" />
        <path d="M14 16 l1.6 1.6 l2.8 -3 M14 22 l1.6 1.6 l2.8 -3" fill="none" stroke={c("turf")} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.5 16 H26 M20.5 22 H26 M15 28 H26" stroke={c("ink-muted")} strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  // ── The languages in the Courses menu: each the idea its course's art
  // draws (components/course-art.tsx), at icon size. Software logos are
  // trademarks, so these draw the idea, never the logo.
  "/learn/track/sql-fundamentals": {
    tone: "turf",
    Scene: () => (
      <>
        <path d="M11 14 V27 Q20 31 29 27 V14" fill={c("panel")} stroke={N} strokeWidth="1.5" />
        <path d="M11 20.5 Q20 24 29 20.5" fill="none" stroke={c("turf")} strokeWidth="1.4" />
        <ellipse cx="20" cy="14" rx="9" ry="3.4" fill={c("turf")} stroke={N} strokeWidth="1.5" />
        <Football x={20} y={10} rx={5} rot={-12} />
      </>
    ),
  },
  "/learn/track/sql-advanced": {
    tone: "ice",
    Scene: () => (
      <>
        <rect x="7" y="9" width="13" height="12" rx="1.6" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M7 13 H20" stroke={c("ice")} strokeWidth="2.2" />
        <rect x="20" y="19" width="13" height="12" rx="1.6" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M20 23 H33" stroke={c("gold")} strokeWidth="2.2" />
        <path d="M16 21 Q17 25 22 25" fill="none" stroke={c("turf")} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  "/learn/track/python": {
    tone: "gold",
    Scene: () => (
      <>
        <path d="M11 28 Q11 21 18 21 H22 Q29 21 29 15 Q29 10 23 10" fill="none" stroke={N} strokeWidth="6.5" strokeLinecap="round" />
        <path d="M11 28 Q11 21 18 21 H22 Q29 21 29 15 Q29 10 23 10" fill="none" stroke={c("turf")} strokeWidth="4" strokeLinecap="round" />
        <circle cx="21.5" cy="10" r="3.6" fill={c("turf")} stroke={N} strokeWidth="1.4" />
        <circle cx="20.8" cy="9.2" r="0.9" fill={N} />
        <path d="M17.6 10.6 L15.6 11.6 M17.6 10.6 L15.8 9.4" stroke={c("gold")} strokeWidth="0.9" strokeLinecap="round" />
      </>
    ),
  },
  "/learn/track/r": {
    tone: "ice",
    Scene: () => (
      <>
        <path d="M20 8 L30.4 14 V26 L20 32 L9.6 26 V14 Z" fill={c("ice")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
        <text x="20" y="25.2" textAnchor="middle" fontSize="13" fontWeight="900" fill={N} fontFamily={SANS}>
          R
        </text>
      </>
    ),
  },
  "/learn/track/excel": {
    tone: "turf",
    Scene: () => (
      <>
        <rect x="8" y="9" width="24" height="22" rx="2" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <rect x="8" y="9" width="24" height="6" rx="2" fill={c("turf")} stroke={N} strokeWidth="1.4" />
        <text x="12" y="14" fontSize="5" fontWeight="900" fontStyle="italic" fill={N} fontFamily={SANS}>
          fx
        </text>
        <path d="M8 21 H32 M8 26 H32 M16 15 V31 M24 15 V31" stroke={c("ink", 0.4)} strokeWidth="0.9" />
        <rect x="16.4" y="21.4" width="7.2" height="4.2" fill={c("gold")} opacity="0.85" />
      </>
    ),
  },
  "/learn/track/stats": {
    tone: "turf",
    Scene: () => (
      <>
        <path d="M7 29 H33" stroke={N} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 28.5 Q14 28.5 16 21 Q20 6 24 21 Q26 28.5 32 28.5 Z" fill={c("turf", 0.45)} stroke={N} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M20 11 V29" stroke={c("gold")} strokeWidth="1.4" strokeDasharray="2 1.6" />
      </>
    ),
  },
  "/learn/track/viz": {
    tone: "gold",
    Scene: () => (
      <>
        <rect x="9" y="22" width="5" height="8" rx="1" fill={c("ice")} stroke={N} strokeWidth="1.2" />
        <rect x="17.5" y="17" width="5" height="13" rx="1" fill={c("turf")} stroke={N} strokeWidth="1.2" />
        <rect x="26" y="11" width="5" height="19" rx="1" fill={c("gold")} stroke={N} strokeWidth="1.2" />
        <path d="M8 19 L19 13 L29 7" fill="none" stroke={c("ink")} strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2.4 1.8" />
      </>
    ),
  },
  "/learn/track/tableau": {
    tone: "ice",
    Scene: () => (
      <>
        <rect x="8" y="8" width="11" height="11" rx="1.6" fill={c("panel")} stroke={N} strokeWidth="1.3" />
        <rect x="21" y="8" width="11" height="11" rx="1.6" fill={c("panel")} stroke={N} strokeWidth="1.3" />
        <rect x="8" y="21" width="24" height="11" rx="1.6" fill={c("panel")} stroke={N} strokeWidth="1.3" />
        <path d="M10.5 17 V13 M13.5 17 V11 M16.5 17 V14" stroke={c("ice")} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="26.5" cy="13.5" r="3.4" fill={c("gold")} stroke={N} strokeWidth="1" />
        <path d="M11 29 L17 24.5 L22 27 L29 23.5" fill="none" stroke={c("turf")} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  "/learn/track/powerbi": {
    tone: "gold",
    Scene: () => (
      <>
        <path d="M8 26 A12 12 0 0 1 32 26" fill="none" stroke={N} strokeWidth="5" strokeLinecap="round" />
        <path d="M8 26 A12 12 0 0 1 32 26" fill="none" stroke={c("panel")} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M8 26 A12 12 0 0 1 25 15.5" fill="none" stroke={c("gold")} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M20 26 L26 17" stroke={N} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="26" r="2" fill={c("ice")} stroke={N} strokeWidth="1" />
        <path d="M18 34 L21 29 H19 L22 24" fill="none" stroke={c("gold")} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      </>
    ),
  },
  "/learn/track/git": {
    tone: "turf",
    Scene: () => (
      <>
        <path d="M9 27 H31" stroke={N} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M13 27 Q15 15 20 15 Q25 15 27 27" fill="none" stroke={c("turf")} strokeWidth="2" strokeLinecap="round" />
        <circle cx="13" cy="27" r="2.6" fill={c("ice")} stroke={N} strokeWidth="1.2" />
        <circle cx="20" cy="15" r="2.6" fill={c("turf")} stroke={N} strokeWidth="1.2" />
        <circle cx="27" cy="27" r="2.6" fill={c("gold")} stroke={N} strokeWidth="1.2" />
      </>
    ),
  },
  "/learn/track/ai": {
    tone: "ice",
    Scene: () => (
      <>
        <path d="M20 9 V12" stroke={N} strokeWidth="1.4" />
        <circle cx="20" cy="8" r="1.8" fill={c("gold")} stroke={N} strokeWidth="1" />
        <rect x="10" y="12" width="20" height="16" rx="4" fill={c("panel")} stroke={N} strokeWidth="1.5" />
        <circle cx="16" cy="19" r="2.2" fill={c("ice")} stroke={N} strokeWidth="1" />
        <circle cx="24" cy="19" r="2.2" fill={c("ice")} stroke={N} strokeWidth="1" />
        <path d="M16 24 H24" stroke={N} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M31 30 l1 -2.4 l1 2.4 l2.4 1 l-2.4 1 l-1 2.4 l-1 -2.4 l-2.4 -1 Z" fill={c("gold")} stroke={N} strokeWidth="0.8" strokeLinejoin="round" />
      </>
    ),
  },
  "/questions/duel": {
    tone: "gold",
    Scene: () => (
      <>
        <Football x={14} y={20} rx={8} fill={c("gold")} />
        <Football x={26} y={20} rx={8} fill={c("ice")} />
      </>
    ),
  },
  "/draft": {
    tone: "turf",
    Scene: () => (
      <>
        <rect x="10" y="9" width="20" height="22" rx="2" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M14 14 H26 M14 19 H24 M14 24 H22" stroke={c("turf")} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="28" cy="28" r="5" fill={c("gold")} stroke={N} strokeWidth="1.2" />
      </>
    ),
  },
  "/learn/rapid": {
    tone: "ice",
    Scene: () => (
      <>
        <circle cx="20" cy="20" r="11" fill={c("panel")} stroke={N} strokeWidth="1.6" />
        <path d="M20 12 V20 L26 24" fill="none" stroke={c("ice")} strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  "/learn/arcade": {
    tone: "gold",
    Scene: () => (
      <>
        <rect x="9" y="14" width="22" height="14" rx="3" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <circle cx="15" cy="21" r="2.5" fill={c("turf")} />
        <circle cx="25" cy="21" r="2.5" fill={c("gold")} />
        <path d="M12 10 H28" stroke={c("ice")} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  "/learn": {
    tone: "turf",
    Scene: () => (
      <>
        <path d="M10 28 L20 10 L30 28 Z" fill={c("turf")} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
        <Football x={20} y={22} rx={7} />
      </>
    ),
  },
  "/field": {
    tone: "turf",
    Scene: () => (
      <>
        <rect x="8" y="12" width="24" height="16" rx="2" fill={c("turf")} opacity="0.35" stroke={N} strokeWidth="1.4" />
        <path d="M12 16 H28 M12 20 H28 M12 24 H28" stroke={c("ink")} strokeWidth="1" opacity="0.35" />
        <circle cx="20" cy="20" r="3" fill={c("gold")} stroke={N} strokeWidth="1.2" />
      </>
    ),
  },
  "/excel": {
    tone: "ice",
    Scene: () => (
      <>
        <rect x="9" y="10" width="22" height="20" rx="2" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M9 16 H31 M16 10 V30" stroke={N} strokeWidth="1.2" />
        <text x="24" y="26" textAnchor="middle" fontSize="8" fontWeight="900" fill={c("ice")}>
          fx
        </text>
      </>
    ),
  },
  "/data": {
    tone: "ice",
    Scene: () => (
      <>
        <ellipse cx="20" cy="14" rx="10" ry="4" fill={c("ice")} stroke={N} strokeWidth="1.2" />
        <path d="M10 14 V26 Q20 32 30 26 V14" fill={c("panel")} stroke={N} strokeWidth="1.2" />
        <ellipse cx="20" cy="26" rx="10" ry="4" fill={c("ice")} opacity="0.5" stroke={N} strokeWidth="1.2" />
      </>
    ),
  },
  "/projects/my-league-scorecard": {
    tone: "gold",
    Scene: () => (
      <>
        <rect x="9" y="22" width="5" height="8" rx="1" fill={c("turf")} stroke={N} strokeWidth="1" />
        <rect x="16" y="16" width="5" height="14" rx="1" fill={c("ice")} stroke={N} strokeWidth="1" />
        <rect x="23" y="12" width="5" height="18" rx="1" fill={c("gold")} stroke={N} strokeWidth="1" />
      </>
    ),
  },
  "/projects/nflverse-dbt-warehouse": {
    tone: "ice",
    Scene: () => (
      <>
        <path d="M10 26 L20 12 L30 26 Z" fill={c("ice")} stroke={N} strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="15" y="22" width="10" height="8" fill={c("panel")} stroke={N} strokeWidth="1.2" />
      </>
    ),
  },
  "/projects/fantasy-points-model": {
    tone: "turf",
    Scene: () => (
      <>
        <path d="M10 26 L16 20 L22 23 L30 12" fill="none" stroke={c("turf")} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="30" cy="12" r="3" fill={c("gold")} stroke={N} strokeWidth="1.2" />
      </>
    ),
  },
  "/projects#cases": {
    tone: "gold",
    Scene: () => (
      <>
        <rect x="11" y="10" width="18" height="20" rx="2" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M15 16 H25 M15 21 H23" stroke={c("gold")} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  "/projects/challenge": {
    tone: "gold",
    Scene: () => (
      <>
        <rect x="10" y="11" width="20" height="18" rx="2" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M14 17 H26 M14 22 H22" stroke={c("gold")} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="28" cy="26" r="4" fill={c("turf")} stroke={N} strokeWidth="1.1" />
      </>
    ),
  },
  "/resources": {
    tone: "ice",
    Scene: () => (
      <>
        <rect x="10" y="9" width="20" height="22" rx="2" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <path d="M14 15 H26 M14 20 H24 M14 25 H20" stroke={c("ice")} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  "/welcome": {
    tone: "turf",
    Scene: () => (
      <>
        <circle cx="20" cy="20" r="11" fill={c("panel")} stroke={N} strokeWidth="1.6" />
        <path d="M14 20 H26 M20 14 V26" stroke={c("turf")} strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  "/account": {
    tone: "gold",
    Scene: () => (
      <>
        <circle cx="20" cy="15" r="5" fill={c("gold")} stroke={N} strokeWidth="1.3" />
        <path d="M10 28 Q20 22 30 28" fill={c("panel")} stroke={N} strokeWidth="1.3" />
      </>
    ),
  },
  "/pricing": {
    tone: "gold",
    Scene: () => (
      <>
        <rect x="11" y="10" width="18" height="20" rx="3" fill={c("panel")} stroke={N} strokeWidth="1.4" />
        <text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill={c("gold")}>
          $
        </text>
      </>
    ),
  },
};

const FALLBACK: { tone: Tone; Scene: () => ReactNode } = {
  tone: "turf",
  Scene: () => <Football x={20} y={20} rx={10} />,
};

export function navTone(href: string): Tone {
  return (ICONS[href] ?? FALLBACK).tone;
}

export function NavIcon({ href, small = false }: { href: string; small?: boolean }) {
  const { tone, Scene } = ICONS[href] ?? FALLBACK;
  return (
    <Frame tone={tone} small={small}>
      <Scene />
    </Frame>
  );
}

export function badgeTone(badge: string): Tone {
  const b = badge.toLowerCase();
  if (b === "daily") return "gold";
  if (b === "prep" || b === "play") return "ice";
  if (b === "pass") return "gold";
  if (b === "free") return "turf";
  return "turf";
}
