import Link from "next/link";
import { NavIcon, badgeTone } from "@/components/nav-icons";

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
    badge: "Play",
    tone: "turf" as const,
  },
  {
    href: "/learn/rapid",
    name: "Rapid Fire",
    blurb: "Twelve seconds a snap.",
    badge: "Play",
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
    badge: "Pass",
    tone: "turf" as const,
  },
];

const BADGE: Record<string, string> = {
  gold: "border-gold/50 bg-gold/15 text-gold",
  ice: "border-ice/50 bg-ice/15 text-ice",
  turf: "border-turf/50 bg-turf/15 text-turf",
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
            data-tone={g.tone}
            className="pop-tile surface group flex items-start gap-3 rounded-xl border border-panel-border bg-panel p-3.5"
          >
            <NavIcon href={g.href} />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`font-display text-base font-bold ${
                    g.tone === "gold" ? "text-gold" : g.tone === "ice" ? "text-ice" : "text-turf"
                  }`}
                >
                  {g.name}
                </span>
                {g.badge && (
                  <span
                    className={`rounded-full border px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-wider ${BADGE[badgeTone(g.badge)]}`}
                  >
                    {g.badge}
                  </span>
                )}
              </span>
              <span className="mt-1 block text-sm leading-snug text-ink-soft">{g.blurb}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
