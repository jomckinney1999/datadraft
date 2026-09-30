/**
 * The data is real — shown, not asserted.
 *
 * Five actual rows from `week_results`, exactly as `SELECT * … LIMIT 5`
 * returns them, next to three facts about the table that anyone can go and
 * verify against a box score. The rows are hard-coded here rather than
 * queried at render so the section costs nothing, but they are the real
 * first five and they were read out of the database, not typed.
 *
 * The generated file is ordered season → week → points so this exact query
 * shows five different players. It used to show the same player five times,
 * and a learner noticed.
 */

import Link from "next/link";
import TeamChip from "@/components/team-chip";
import { SHORT_CREDIT } from "@/lib/data-source";
import { FACTS as DATA } from "@/lib/lesson-facts.generated";

const TOP = DATA.maxGame.games;
const topWho = TOP.map((g) => `${g.player} in week ${g.week} of ${g.season}`);

/** `SELECT * FROM week_results LIMIT 5`, verbatim. */
const ROWS: [string, string, string, number, number, number][] = [
  ["Justin Jefferson", "MIN", "WR", 2022, 1, 39.4],
  ["Patrick Mahomes", "KC", "QB", 2022, 1, 34.9],
  ["Saquon Barkley", "NYG", "RB", 2022, 1, 33.4],
  ["Josh Allen", "BUF", "QB", 2022, 1, 31.5],
  ["Davante Adams", "LV", "WR", 2022, 1, 30.1],
];

const FACTS = [
  {
    value: String(DATA.rows),
    label: "real stat lines",
    body: `One row per game a player actually played, ${DATA.seasons[0]} through week ${DATA.latest.week} of ${DATA.latest.season}. ${DATA.players} players, eighteen weeks a season.`,
  },
  {
    value: String(DATA.maxGame.pts),
    label: "the biggest single game in the table",
    body:
      TOP.length > 1
        ? `It has happened ${TOP.length} times: ${topWho.join(" and ")}. You will find both with an ORDER BY before your first lesson is over.`
        : `${topWho[0]}. You will find it with an ORDER BY before your first lesson is over.`,
  },
  {
    value: String(DATA.gamesPlayed["Christian McCaffrey"]),
    label: `games for Christian McCaffrey, not ${DATA.possibleGames}`,
    body: "Missed games are absent, not zero. Real data has gaps, and the lessons teach you to see them instead of pretending they are not there.",
  },
];

export default function DataPeek() {
  return (
    <section
      data-reveal-section
      className="wash-turf border-b border-panel-border"
    >
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="sequence text-center">
          <p className="reveal label-broadcast text-turf">the data</p>
          <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
            Every number is real. Go and check.
          </h2>
          <p className="reveal mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            No synthetic seasons, no players on teams they never played for.
            Weekly scoring from nflverse, pinned so the answer keys never move
            under you, and free to download.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-5">
          <div className="reveal surface overflow-hidden rounded-2xl border border-panel-border bg-panel lg:col-span-3">
            <div className="flex items-center justify-between border-b border-panel-border bg-night/60 px-4 py-2.5">
              <span className="font-mono text-[11px] text-ink-soft">
                <span className="text-[rgb(var(--c-syn-keyword))]">SELECT</span>{" "}
                * <span className="text-[rgb(var(--c-syn-keyword))]">FROM</span>{" "}
                week_results{" "}
                <span className="text-[rgb(var(--c-syn-keyword))]">LIMIT</span>{" "}
                <span className="text-[rgb(var(--c-syn-number))]">5</span>;
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-turf">
                5 rows
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[12px]">
                <thead>
                  <tr className="border-b border-panel-border text-ink-muted">
                    {["player", "team", "position", "season", "week", "fantasy_pts"].map(
                      (c) => (
                        <th
                          key={c}
                          className="whitespace-nowrap px-4 py-2 font-semibold uppercase tracking-wider"
                        >
                          {c}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="sequence">
                  {ROWS.map((r) => (
                    <tr
                      key={r[0]}
                      className="reveal border-b border-panel-border/50 text-ink"
                    >
                      <td className="whitespace-nowrap px-4 py-2">{r[0]}</td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <TeamChip abbr={r[1]} />
                      </td>
                      <td className="px-4 py-2">{r[2]}</td>
                      <td className="px-4 py-2">{r[3]}</td>
                      <td className="px-4 py-2">{r[4]}</td>
                      <td className="px-4 py-2 text-turf">{r[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-panel-border px-4 py-2.5 font-mono text-[10px] text-ink-muted">
              {SHORT_CREDIT} · the league tables come from Sleeper: its real
              waiver wire, and a draft run on its real ADP
            </div>
          </div>

          <div className="sequence space-y-5 lg:col-span-2">
            {FACTS.map((f) => (
              <div key={f.label} className="reveal">
                <p className="stat-glow font-display text-3xl font-bold">
                  {f.value}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  {f.label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {f.body}
                </p>
              </div>
            ))}
            <div className="reveal">
              <Link
                href="/data"
                className="font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:underline"
              >
                Where it comes from, and the download →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
