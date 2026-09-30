/**
 * The product shot: what solving a question actually looks like.
 *
 * A picture of the workspace rather than the workspace itself. The real one
 * is two screens down and costs a WebAssembly database to boot; this is
 * static markup that renders on the server and weighs nothing, so the
 * landing page can show the product without becoming the product.
 *
 * Everything in it is real — the prompt, the SQL and the rows are lifted
 * from an actual question in the bank, not invented for the mockup. A
 * fabricated screenshot is the kind of small lie that gets found the first
 * time someone clicks through.
 *
 * The language tabs are decoration and are marked `aria-hidden`: they
 * describe the product rather than operating it, and a tab that cannot be
 * pressed is worse than no tab at all for anyone on a keyboard.
 */

import Link from "next/link";

/** Straight from lib/questions.ts — `week-3-hammer`. */
const LINES: { n: number; tokens: [string, string][] }[] = [
  {
    n: 1,
    tokens: [
      ["SELECT", "kw"],
      [" player, team, fantasy_pts", "id"],
    ],
  },
  {
    n: 2,
    tokens: [
      ["FROM", "kw"],
      [" week_results", "id"],
    ],
  },
  {
    n: 3,
    tokens: [
      ["WHERE", "kw"],
      [" season ", "id"],
      ["=", "op"],
      [" 2024", "num"],
      [" AND", "kw"],
      [" week ", "id"],
      ["=", "op"],
      [" 3", "num"],
    ],
  },
  {
    n: 4,
    tokens: [
      ["ORDER BY", "kw"],
      [" fantasy_pts ", "id"],
      ["DESC", "kw"],
    ],
  },
  {
    n: 5,
    tokens: [
      ["LIMIT", "kw"],
      [" 1", "num"],
      [";", "op"],
    ],
  },
];

const TOKEN_CLASS: Record<string, string> = {
  kw: "text-[rgb(var(--c-syn-keyword))]",
  id: "text-ink",
  num: "text-[rgb(var(--c-syn-number))]",
  op: "text-ink-muted",
};

const TABS = ["SQL", "Python", "R", "Excel"];

export default function WorkspaceShot() {
  return (
    <div className="screen-frame overflow-hidden rounded-2xl bg-panel">
      {/* Chrome */}
      <div className="flex items-center gap-3 border-b border-panel-border bg-night/70 px-4 py-2.5">
        <div aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gold/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-turf/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-ice/60" />
        </div>
        <div aria-hidden className="ml-2 flex gap-1">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                i === 0
                  ? "bg-turf/15 text-turf"
                  : "text-ink-muted"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        <div aria-hidden className="ml-auto flex gap-1.5">
          <span className="rounded-lg border border-panel-border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            Run
          </span>
          <span className="rounded-lg border border-turf/60 bg-turf/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-turf">
            Submit
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {/* The problem */}
        <div className="border-b border-panel-border p-5 md:border-b-0 md:border-r">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
              Question of the day
            </span>
            <span className="rounded-full border border-turf/50 bg-turf/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-turf">
              Easy
            </span>
          </div>
          <p className="mt-3 font-display text-xl font-bold text-ink">
            Week 3 Hammer
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Your league chat is arguing about who had the biggest week 3 of the
            2024 season. Settle it.
          </p>
          <div className="mt-4 rounded-xl border border-ice/30 bg-ice/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ice">
              Return
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              One row: player, team, fantasy_pts.
            </p>
          </div>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-ink-muted">
            <span className="text-ink">week_results</span>(player, team,
            position, season, week, fantasy_pts)
          </p>
        </div>

        {/* The editor + what it returns */}
        <div className="bg-night/50">
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-relaxed">
            {LINES.map((line) => (
              <div key={line.n} className="flex gap-4">
                <span
                  aria-hidden
                  className="w-4 shrink-0 select-none text-right text-ink-muted/60"
                >
                  {line.n}
                </span>
                <span className="whitespace-pre">
                  {line.tokens.map(([text, kind], i) => (
                    <span key={i} className={TOKEN_CLASS[kind]}>
                      {text}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </pre>

          <div className="border-t border-panel-border px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-turf">
              ✓ Correct · 1 row
            </p>
            <table className="mt-2 w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="text-ink-muted">
                  <th className="pb-1 font-semibold uppercase tracking-wider">
                    player
                  </th>
                  <th className="pb-1 font-semibold uppercase tracking-wider">
                    team
                  </th>
                  <th className="pb-1 font-semibold uppercase tracking-wider">
                    fantasy_pts
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-ink">
                  <td className="pt-1">Saquon Barkley</td>
                  <td className="pt-1">PHI</td>
                  <td className="pt-1 text-turf">33.6</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="border-t border-panel-border bg-night/70 px-4 py-3 text-center">
        <Link
          href="/questions"
          className="font-mono text-[11px] font-bold uppercase tracking-wider text-turf hover:underline"
        >
          Open the real thing →
        </Link>
      </div>
    </div>
  );
}
