/**
 * The Hall of Fame's front window — six of the trophies, lit, on one shelf of
 * the same glass case /learn shows in full.
 *
 * Nothing personalised, so it renders on the server and looks the same to
 * everyone. The trophies are shown lit on purpose: this is the case as it
 * looks once you've earned them, which is the thing to want.
 *
 * Picked by hand rather than "the first six": two from each wing, arranged
 * bronze, silver, gold, gold, silver, bronze so the Inner Circle stands in
 * the middle of the window, and spanning the three kinds of thing you can be
 * good at — showing up, being accurate, and keeping a streak alive.
 */

import Link from "next/link";
import { WINGS, badgeById } from "@/lib/achievements";
import { HofCabinet, HofSlot } from "@/components/hof-trophy";

const FEATURED = [
  "first-snap",
  "iron-man",
  "franchise",
  "mvp",
  "hat-trick",
  "heater",
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
          <p className="reveal label-broadcast text-gold">the hall of fame</p>
          <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
            Earn your place in the Hall
          </h2>
          <p className="reveal mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            Twelve trophies in three wings, from the Rookie Wing to the Inner
            Circle. No committee, no vote, nothing handed out for showing up —
            every one is earned on the field.
          </p>
        </div>

        <div className="reveal mt-12">
          <HofCabinet>
            <div className="hof-shelf">
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {badges.map((b, i) => (
                  <HofSlot
                    key={b.id}
                    badge={b}
                    have={1}
                    need={1}
                    index={i}
                    stamp={WINGS.find((w) => w.tier === b.tier)?.name}
                  />
                ))}
              </ul>
            </div>
          </HofCabinet>
        </div>

        <div className="reveal mt-8 text-center">
          <Link
            href="/learn#trophies"
            className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
          >
            Walk the Hall →
          </Link>
        </div>
      </div>
    </section>
  );
}
