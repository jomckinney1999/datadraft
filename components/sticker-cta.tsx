/**
 * The front door's two buttons, drawn like the art.
 *
 * Every picture on the site is a sticker: a bright flat fill, a dark outline,
 * a hard shadow underneath. The buttons were the one thing on the hero that
 * did not match — small mono capitals on a smooth gradient, a different
 * design language from the drawings right above them. These use the same
 * outline colour as the art (`night`), the headline's display face, and a
 * little sticker icon of their own. The look lives in `.btn-sticker` in
 * globals.css; this component only supplies the icon and the arrow.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { c, Football, N, SANS } from "@/components/art-kit";

/** A speech bubble with a question mark: "questions", said as a picture. */
function QuestionBubble() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="h-full w-full">
      <path
        d="M8 4 H24 A5 5 0 0 1 29 9 V17 A5 5 0 0 1 24 22 H14 L8 28 V22 A5 5 0 0 1 3 17 V9 A5 5 0 0 1 8 4 Z"
        fill={c("ink")}
        stroke={N}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <text
        x="16"
        y="18.6"
        textAnchor="middle"
        fontFamily={SANS}
        fontSize="15"
        fontWeight="800"
        fill={N}
      >
        ?
      </text>
    </svg>
  );
}

function Ball() {
  return (
    <svg viewBox="-17 -13 34 26" aria-hidden className="h-full w-full">
      <Football x={0} y={0} rx={15} rot={-18} fill={c("gold")} />
    </svg>
  );
}

const ICONS = { question: QuestionBubble, football: Ball } as const;

export default function StickerLink({
  href,
  tone,
  icon,
  arrow = false,
  children,
}: {
  href: string;
  tone: "turf" | "gold";
  icon: keyof typeof ICONS;
  arrow?: boolean;
  children: ReactNode;
}) {
  const Icon = ICONS[icon];
  return (
    <Link href={href} className={`btn-sticker sticker-${tone}`}>
      <span className="sticker-icon">
        <Icon />
      </span>
      <span>{children}</span>
      {arrow && (
        <svg viewBox="0 0 20 20" aria-hidden className="sticker-arrow">
          <path
            d="M3 10 H15 M10 4.5 L15.5 10 L10 15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Link>
  );
}
