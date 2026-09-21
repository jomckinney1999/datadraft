"use client";

/**
 * Duolingo-style celebration overlays for the lesson player.
 * Pure CSS/DOM — audio lives in lib/sfx.ts. Honours prefers-reduced-motion.
 */

import { useEffect, useState, type CSSProperties } from "react";

const BURST_COLORS = [
  "rgb(var(--c-turf))",
  "rgb(var(--c-gold))",
  "rgb(var(--c-ice))",
  "rgb(var(--c-turf-dim))",
  "rgb(var(--c-gold-dim))",
];

type Particle = {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
  dx: number;
};

export function ConfettiBurst({
  fireKey,
  active,
}: {
  /** Bump to re-fire. */
  fireKey: number;
  active: boolean;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active || fireKey === 0) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const next: Particle[] = Array.from({ length: 28 }, (_, i) => ({
      id: fireKey * 100 + i,
      x: 8 + Math.random() * 84,
      delay: Math.random() * 0.18,
      duration: 0.85 + Math.random() * 0.55,
      color: BURST_COLORS[i % BURST_COLORS.length],
      size: 5 + Math.random() * 7,
      rotate: Math.random() * 360,
      dx: (Math.random() - 0.5) * 140,
    }));
    setParticles(next);
    const t = window.setTimeout(() => setParticles([]), 1600);
    return () => window.clearTimeout(t);
  }, [fireKey, active]);

  if (particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="lesson-confetti absolute top-1/3 rounded-sm"
          style={
            {
              left: `${p.x}%`,
              width: p.size,
              height: p.size * 1.4,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--dx": `${p.dx}px`,
              transform: `rotate(${p.rotate}deg)`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function XpFloat({
  amount,
  yards,
  yardsLabel,
  show,
}: {
  amount: number;
  yards?: number;
  yardsLabel: string;
  show: boolean;
}) {
  if (!show || amount <= 0) return null;
  return (
    <div
      className="pointer-events-none fixed left-1/2 top-[28%] z-50 -translate-x-1/2 animate-xp-float"
      aria-hidden
    >
      <div className="rounded-2xl border-2 border-turf bg-turf px-4 py-2 font-display text-lg font-bold text-night shadow-scoreboard-turf">
        +{amount} XP
        {yards !== undefined && yards > 0 && (
          <span className="ml-2 text-sm opacity-80">
            · +{yards} {yardsLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function ComboRibbon({ combo }: { combo: number }) {
  if (combo < 2) return null;
  const label =
    combo >= 10
      ? "Unconscious"
      : combo >= 7
        ? "Can't be stopped"
        : combo >= 5
          ? "Heating up"
          : combo >= 3
            ? "In rhythm"
            : "On a roll";
  return (
    <div className="animate-celebrate inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-3 py-1">
      <span className="text-sm" aria-hidden>
        🔥
      </span>
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold">
        {label} · {combo}x
      </span>
    </div>
  );
}
