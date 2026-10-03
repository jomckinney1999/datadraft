/**
 * Tiny sticker icons for the section menus — same night outline + accent
 * fills as the card art, so the dropdown feels like the rest of the site.
 */

import type { ReactNode } from "react";
import { c, Football, N, type Tone } from "@/components/art-kit";

function Frame({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className="nav-icon h-10 w-10 shrink-0"
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
};

const FALLBACK: { tone: Tone; Scene: () => ReactNode } = {
  tone: "turf",
  Scene: () => <Football x={20} y={20} rx={10} />,
};

export function navTone(href: string): Tone {
  return (ICONS[href] ?? FALLBACK).tone;
}

export function NavIcon({ href }: { href: string }) {
  const { tone, Scene } = ICONS[href] ?? FALLBACK;
  return (
    <Frame tone={tone}>
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
