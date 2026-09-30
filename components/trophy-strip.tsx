/**
 * What you're playing for — six of the badges, as a row of trophies.
 *
 * The full case on /learn shows progress bars against every badge for the
 * signed-in learner. This is the shop window: names, requirements and the
 * tier ring, nothing personalised, so it renders on the server and looks
 * the same to everyone.
 *
 * Picked by hand rather than "the first six" so the row spans the three
 * tiers and the three kinds of thing you can be good at — showing up,
 * being accurate, and keeping a streak alive.
 */

import Link from "next/link";
import { badgeById } from "@/lib/achievements";

const FEATURED = [
  "first-snap",
  "moving-chains",
  "perfect-drive",
  "hat-trick",
  "heater",
  "franchise",
];

export default function TrophyStrip() {
  const badges = FEATURED.map(badgeById).filter(
    (b): b is NonNullable<typeof b> => Boolean(b),
  );

  return (
    <section
      data-reveal-section
      className="wash-gold border-b border-panel-border"
    >
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="sequence text-center">
          <p className="reveal label-broadcast text-gold">the trophy case</p>
          <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
            Something to play for
          </h2>
          <p className="reveal mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            Badges are earned from what you actually did — lessons cleared,
            perfect drives, days in a row — never handed out for showing up to
            the page. An empty shelf tells you what to aim at.
          </p>
        </div>

        <div className="sequence mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {badges.map((b) => (
            <div
              key={b.id}
              className="reveal ring-lift surface flex flex-col items-center rounded-2xl border border-panel-border bg-panel px-3 py-5 text-center"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 bg-night/60 text-2xl tier-${b.tier}`}
                aria-hidden
              >
                {b.glyph}
              </span>
              <p className="mt-3 font-display text-[13px] font-bold leading-tight text-ink">
                {b.name}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-ink-muted">
                {b.requirement}
              </p>
              <span
                className={`mt-2 font-mono text-[9px] font-bold uppercase tracking-widest tier-${b.tier} border-0 shadow-none`}
              >
                {b.tier}
              </span>
            </div>
          ))}
        </div>

        <div className="reveal mt-8 text-center">
          <Link
            href="/learn#trophies"
            className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
          >
            See the whole case →
          </Link>
        </div>
      </div>
    </section>
  );
}
