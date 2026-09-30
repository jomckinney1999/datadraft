/**
 * This week in the league, on the front page.
 *
 * The one section here that is not about us. Real scores and real stat lines
 * from the week that just happened, straight from nflverse. It is the fastest
 * possible answer to "is this actually a football site or a SQL site wearing
 * a helmet".
 *
 * Renders nothing at all when the fetch fails — `getLiveWeek()` never throws
 * — rather than a panel apologising for itself. The page is complete without
 * it; it is a bonus, not a load-bearing wall.
 *
 * Score tiles carry team crests and performer rows carry headshots — both
 * hotlinked from the sources nflverse lists, never proxied through our
 * domain, each with a fallback (colour swatch, initial) so a dead URL never
 * leaves a broken-image icon in a score line. Decided 2026-09-30; before
 * that the strip was colours-only.
 */

import Link from "next/link";
import TeamChip from "@/components/team-chip";
import TeamLogo from "@/components/team-logo";
import Headshot from "@/components/headshot";
import type { LiveWeek } from "@/lib/live-nfl";
import { SHORT_CREDIT } from "@/lib/data-source";

export default function LiveWeekStrip({ live }: { live: LiveWeek | null }) {
  if (!live) return null;

  const games = live.games.slice(0, 8);
  const board = live.boards[0] ?? {
    id: "fantasy",
    label: "Top fantasy scorers",
    decimals: 1,
    rows: live.performers,
  };
  const rows = board.rows.slice(0, 5);
  if (games.length === 0 && rows.length === 0) return null;

  return (
    <section
      data-reveal-section
      className="wash-ice border-b border-panel-border"
    >
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="sequence text-center">
          <p className="reveal label-broadcast text-ice">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ice align-middle" />
            live · week {live.week}, {live.season}
          </p>
          <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
            This week, around the league
          </h2>
          <p className="reveal mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            Not a demo dataset. The scores from this week and the players who
            carried it, refreshed hourly. You can query every row of it
            yourself.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {/* Scores */}
          {games.length > 0 && (
            <div className="reveal surface rounded-2xl border border-panel-border bg-panel p-5 lg:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ice">
                Scores
              </p>
              <div className="sequence mt-3 grid gap-2 sm:grid-cols-2">
                {games.map((g) => (
                  <div
                    key={g.id}
                    className="reveal flex items-center justify-between gap-3 rounded-xl border border-panel-border bg-night/40 px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2 font-mono text-[12px] text-ink">
                      <TeamLogo abbr={g.away} />
                      <span className="text-ink-muted">@</span>
                      <TeamLogo abbr={g.home} />
                    </span>
                    <span className="font-mono text-[12px] text-ink-soft">
                      {g.final
                        ? `${g.awayScore}–${g.homeScore}`
                        : `${g.day} ${g.kickoff}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top performers */}
          {rows.length > 0 && (
            <div className="reveal surface rounded-2xl border border-panel-border bg-panel p-5 lg:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
                {board.label}
              </p>
              <ol className="sequence mt-3 space-y-2.5">
                {rows.map((p, i) => (
                  <li
                    key={`${p.player}-${i}`}
                    className="reveal flex items-center gap-3"
                  >
                    <span className="w-4 shrink-0 font-mono text-[11px] text-ink-muted">
                      {i + 1}
                    </span>
                    <Headshot name={p.player} src={p.headshot} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[15px] font-bold text-ink">
                        {p.player}
                      </span>
                      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                        {p.position} · <TeamChip abbr={p.team} /> vs {p.opponent}
                      </span>
                    </span>
                    <span className="stat-number shrink-0 text-base">
                      {p.value.toFixed(board.decimals)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="reveal mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-panel-border pt-4">
          <Link
            href="/field"
            className="font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:underline"
          >
            Query this week yourself on the Practice Field →
          </Link>
          <span className="font-mono text-[10px] text-ink-muted">
            {SHORT_CREDIT}
          </span>
        </div>
      </div>
    </section>
  );
}
