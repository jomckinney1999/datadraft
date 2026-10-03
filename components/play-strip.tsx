import Link from "next/link";

/**
 * The Play menu as a strip — daily games plus prep arcade — for the home
 * page and the locker. Same destinations as lib/nav.ts Play group.
 */

const GAMES = [
  {
    href: "/questions/duel",
    name: "Stat Duel",
    blurb: "Five head-to-heads. No code.",
    badge: "Daily",
    tone: "gold" as const,
  },
  {
    href: "/draft",
    name: "Draft Room",
    blurb: "Scout with SQL, then watch the season.",
    tone: "turf" as const,
  },
  {
    href: "/learn/rapid",
    name: "Rapid Fire",
    blurb: "Twelve seconds a snap.",
    tone: "ice" as const,
  },
  {
    href: "/learn/arcade",
    name: "Arcade",
    blurb: "Pattern Call, Foul Call, Film Room.",
    badge: "Prep",
    tone: "gold" as const,
  },
  {
    href: "/questions/mock",
    name: "Mock screen",
    blurb: "20 or 45 minutes, then a report.",
    badge: "Prep",
    tone: "ice" as const,
  },
  {
    href: "/questions/screen",
    name: "Analyst Screen",
    blurb: "Timed OA: SQL plus MC.",
    badge: "Prep",
    tone: "turf" as const,
  },
];

const TONE: Record<(typeof GAMES)[number]["tone"], string> = {
  gold: "hover:border-gold/50 text-gold",
  turf: "hover:border-turf/50 text-turf",
  ice: "hover:border-ice/50 text-ice",
};

export default function PlayStrip({
  title = "Play",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="label-broadcast text-gold">{title}</p>
        <Link
          href="/questions/prep"
          className="font-mono text-[10px] uppercase tracking-widest text-ink-muted hover:text-gold"
        >
          Hiring funnel →
        </Link>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className={`lift surface flex flex-col rounded-xl border border-panel-border bg-panel p-3.5 transition-colors ${TONE[g.tone]}`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-display text-base font-bold text-ink">{g.name}</span>
              {g.badge && (
                <span className="rounded-full border border-current/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider opacity-90">
                  {g.badge}
                </span>
              )}
            </span>
            <span className="mt-1 text-sm leading-snug text-ink-soft">{g.blurb}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
