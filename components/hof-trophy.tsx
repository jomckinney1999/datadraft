/**
 * A Hall of Fame trophy, drawn in the art kit's sticker style — one shape per
 * tier, so a shelf reads at a glance:
 *
 *   gold   — a championship trophy: a football standing on a tapered stand
 *   silver — a two-handled cup
 *   bronze — a medal on its ribbon
 *
 * The gold one is in the spirit of the trophy every fan pictures, not a copy
 * of it: that design is the league's mark, so this is a football on a stand
 * and nothing more specific.
 *
 * Metal comes from the palette: gold from gold and gold-dim, silver from the
 * ink neutrals, bronze from the three `--c-bronze` tokens, which exist for
 * these trophies alone (a medal of dimmed gold read as gold on the bronze
 * shelf).
 * Locked trophies are a dark silhouette with a padlock: the empty spot on the
 * shelf is the thing to aim at.
 */

import type { CSSProperties, ReactNode } from "react";
import { c, N, r1 } from "@/components/art-kit";
import type { Badge } from "@/lib/achievements";

export type TrophyTier = "bronze" | "silver" | "gold";

const METAL: Record<TrophyTier, { hi: string; mid: string; lo: string }> = {
  gold: { hi: c("ink", 0.95), mid: c("gold"), lo: c("gold-dim") },
  silver: { hi: c("ink"), mid: c("ink-soft"), lo: c("ink-muted") },
  bronze: { hi: c("bronze-hi"), mid: c("bronze"), lo: c("bronze-dim") },
};

function Defs({ tier }: { tier: TrophyTier }) {
  const m = METAL[tier];
  return (
    <defs>
      {/* Brushed metal: bright edge, body, dark turn — left to right. */}
      <linearGradient id={`hof-${tier}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={m.lo} />
        <stop offset="0.28" stopColor={m.mid} />
        <stop offset="0.45" stopColor={m.hi} />
        <stop offset="0.62" stopColor={m.mid} />
        <stop offset="1" stopColor={m.lo} />
      </linearGradient>
      <linearGradient id="hof-plinth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={c("night-100")} />
        <stop offset="1" stopColor={c("night")} />
      </linearGradient>
    </defs>
  );
}

const OUT = { stroke: N, strokeWidth: 3, strokeLinejoin: "round" as const };

function Plinth({ fill }: { fill: string }) {
  return (
    <g>
      <rect x="28" y="120" width="64" height="15" rx="3" fill={fill} {...OUT} />
      <rect x="44" y="124.5" width="32" height="6" rx="1.5" fill={c("gold-dim", 0.8)} />
    </g>
  );
}

function Champion({ fill, earned }: { fill: string; earned: boolean }) {
  // A football tipped back as if waiting for the kick, on a tall stand with
  // concave sides — the shape every fan pictures, without copying anyone's
  // trophy. Tipped about the point where it meets the collar, so it stays
  // seated whatever the angle.
  const ball = "M60 4 C90 20 90 62 60 78 C30 62 30 20 60 4 Z";
  return (
    <g>
      <path d="M38 121 Q54 104 53 82 L67 82 Q66 104 82 121 Z" fill={fill} {...OUT} />
      {earned && (
        <path d="M57 88 Q56 104 47 116" stroke={c("ink", 0.6)} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      )}
      <rect x="49" y="75" width="22" height="9" rx="3" fill={fill} {...OUT} />
      <g transform="rotate(24 60 77)">
        <path d={ball} fill={fill} {...OUT} />
        {earned ? (
          <>
            {/* the end stripes and laces, pressed into the metal */}
            <path d="M46 18 Q60 25 74 18" stroke={c("night", 0.4)} strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M46 64 Q60 57 74 64" stroke={c("night", 0.4)} strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M60 30 V52" stroke={c("night", 0.55)} strokeWidth="2.6" strokeLinecap="round" />
            {[33, 38.5, 44, 49.5].map((y) => (
              <path key={y} d={`M55.5 ${y} H64.5`} stroke={c("night", 0.55)} strokeWidth="2.2" strokeLinecap="round" />
            ))}
            <path d="M44 24 Q38 40 43 58" stroke={c("ink", 0.75)} strokeWidth="3.4" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <path d="M60 30 V52" stroke={c("ink", 0.12)} strokeWidth="2.6" strokeLinecap="round" />
        )}
      </g>
    </g>
  );
}

function Cup({ fill, earned }: { fill: string; earned: boolean }) {
  return (
    <g>
      {/* handles behind the bowl */}
      <path d="M36 44 Q18 44 20 62 Q22 76 40 78" fill="none" stroke={N} strokeWidth="8" strokeLinecap="round" />
      <path d="M36 44 Q18 44 20 62 Q22 76 40 78" fill="none" stroke={fill} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M84 44 Q102 44 100 62 Q98 76 80 78" fill="none" stroke={N} strokeWidth="8" strokeLinecap="round" />
      <path d="M84 44 Q102 44 100 62 Q98 76 80 78" fill="none" stroke={fill} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 34 H88 Q88 82 64 92 L64 104 Q74 106 76 120 H44 Q46 106 56 104 L56 92 Q32 82 32 34 Z" fill={fill} {...OUT} />
      <ellipse cx="60" cy="34" rx="28" ry="5" fill={fill} {...OUT} />
      {earned && (
        <>
          <path d="M42 44 Q42 70 54 82" stroke={c("ink", 0.7)} strokeWidth="3.4" strokeLinecap="round" fill="none" />
          <path d="M48 112 H72" stroke={c("night", 0.35)} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

function Medal({ fill, earned }: { fill: string; earned: boolean }) {
  const star = Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * (Math.PI / 180);
    const rad = i % 2 === 0 ? 13 : 5.5;
    return `${r1(60 + rad * Math.cos(a))} ${r1(80 + rad * Math.sin(a))}`;
  });
  return (
    <g>
      {/* ribbon: two straps meeting behind the medal */}
      <path d="M40 18 L54 18 L66 62 L52 62 Z" fill={earned ? c("turf") : c("night-100")} {...OUT} />
      <path d="M80 18 L66 18 L54 62 L68 62 Z" fill={earned ? c("ice") : c("night-100")} {...OUT} />
      {/* a small stand so it sits on the shelf like the others */}
      <path d="M52 104 L48 120 H72 L68 104 Z" fill={c("night-100")} {...OUT} />
      <circle cx="60" cy="80" r="26" fill={fill} {...OUT} />
      <circle cx="60" cy="80" r="19" fill="none" stroke={c("night", 0.35)} strokeWidth="2" />
      <path d={`M${star.join(" L")} Z`} fill={earned ? c("night", 0.3) : c("night", 0.5)} />
      {earned && <path d="M43 72 Q44 62 52 58" stroke={c("ink", 0.7)} strokeWidth="3" strokeLinecap="round" fill="none" />}
    </g>
  );
}

function Padlock() {
  return (
    <g transform="translate(60 66)">
      <path d="M-7 -4 V-10 Q-7 -18 0 -18 Q7 -18 7 -10 V-4" fill="none" stroke={c("ink", 0.35)} strokeWidth="3.4" strokeLinecap="round" />
      <rect x="-11" y="-5" width="22" height="17" rx="3.5" fill={c("ink", 0.22)} stroke={N} strokeWidth="2" />
      <circle cx="0" cy="3" r="2.4" fill={N} />
    </g>
  );
}

export default function HofTrophy({
  tier,
  earned,
  className = "",
}: {
  tier: TrophyTier;
  earned: boolean;
  className?: string;
}) {
  const fill = earned ? `url(#hof-${tier})` : c("night-100");
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden>
      <Defs tier={tier} />
      <g opacity={earned ? 1 : 0.9}>
        {tier === "gold" && <Champion fill={fill} earned={earned} />}
        {tier === "silver" && <Cup fill={fill} earned={earned} />}
        {tier === "bronze" && <Medal fill={fill} earned={earned} />}
        <Plinth fill="url(#hof-plinth)" />
      </g>
      {!earned && <Padlock />}
    </svg>
  );
}

/**
 * The display case itself: a night frame with gold trim, a brass crown plate
 * across the top edge, a lit back wall, and a pane of glass over the front
 * that catches a slow sweep of light. Everything visual is `.hof-*` in
 * globals.css; this only arranges it.
 */
export function HofCabinet({
  crown = "DataDraft Hall of Fame",
  children,
  className = "",
}: {
  crown?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`hof-cabinet ${className}`}>
      <div className="hof-crown" aria-hidden>
        <span className="hof-star">★</span>
        {crown}
        <span className="hof-star">★</span>
      </div>
      <div className="hof-interior">
        {children}
        <div className="hof-glass" aria-hidden />
      </div>
    </div>
  );
}

/**
 * One spot on a shelf: the spotlight, the trophy and its reflection, the
 * glass ledge it stands on, and the nameplate. Slots sit edge to edge, so
 * their ledges join into one shelf at any column count.
 */
export function HofSlot({
  badge,
  have,
  need,
  index = 0,
  stamp = "Enshrined",
}: {
  badge: Badge;
  have: number;
  need: number;
  /** Position in the case, to stagger the sparkle. */
  index?: number;
  /** The line under an earned plate. The home page's window uses the wing. */
  stamp?: string;
}) {
  const earned = have >= need;
  return (
    <li
      className="hof-slot"
      data-tier={badge.tier}
      data-earned={earned ? "true" : "false"}
      style={{ "--i": index } as CSSProperties}
    >
      <div className="hof-stage">
        <HofTrophy tier={badge.tier} earned={earned} className="hof-trophy" />
        {earned && <span className="hof-sparkle" aria-hidden />}
      </div>
      <div className="hof-ledge" aria-hidden />
      <div className="hof-plate">
        <p className="hof-plate-name">
          <span aria-hidden>{badge.glyph} </span>
          {badge.name}
        </p>
        <p className="hof-plate-req">{badge.requirement}</p>
        {earned ? (
          <p className="hof-plate-stamp">{stamp}</p>
        ) : (
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-night">
              <div
                className="h-full rounded-full bg-turf/70"
                style={{ width: `${need > 0 ? (have / need) * 100 : 0}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-[10px] text-ink-muted">
              {have.toLocaleString()}/{need.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}
