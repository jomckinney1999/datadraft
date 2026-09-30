/**
 * The two builds, with a drawing of what each one produces.
 *
 * A project card with only text asks the reader to imagine the artefact.
 * These draw it: your league flowing through an API into SQL and out as a
 * notebook, and raw CSVs flowing through staging into a tested warehouse.
 * Both are inline SVG on theme tokens — the same reason every other picture
 * on this site is drawn rather than photographed.
 */

import Link from "next/link";
import { liveProjects } from "@/lib/projects";

function Node({
  x,
  y,
  w,
  label,
  tone,
  small,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  tone: "turf" | "ice" | "gold" | "muted";
  small?: boolean;
}) {
  const c =
    tone === "turf"
      ? "var(--c-turf)"
      : tone === "ice"
        ? "var(--c-ice)"
        : tone === "gold"
          ? "var(--c-gold)"
          : "var(--c-ink-muted)";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={small ? 22 : 28}
        rx="6"
        fill="rgb(var(--c-night))"
        stroke={`rgb(${c})`}
        strokeWidth="1.5"
      />
      <text
        x={x + w / 2}
        y={y + (small ? 15 : 18)}
        textAnchor="middle"
        fill={`rgb(${c})`}
        fontSize={small ? 8.5 : 9.5}
        fontFamily="monospace"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  );
}

function Arrow({ d, tone = "muted" }: { d: string; tone?: "turf" | "muted" }) {
  const c = tone === "turf" ? "var(--c-turf)" : "var(--c-ink-muted)";
  return (
    <path
      d={d}
      fill="none"
      stroke={`rgb(${c})`}
      strokeWidth="1.5"
      strokeDasharray="3 3"
      opacity="0.8"
    />
  );
}

/** Your league → the Sleeper API → SQL → a notebook you can show. */
function LeagueFlow() {
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="lf-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgb(var(--c-gold))" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(var(--c-gold))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="120" fill="url(#lf-glow)" />
      {/* phone with the league */}
      <rect x="18" y="22" width="40" height="76" rx="7" fill="rgb(var(--c-night))" stroke="rgb(var(--c-gold))" strokeWidth="1.5" />
      {[34, 46, 58, 70, 82].map((y, i) => (
        <rect key={y} x="25" y={y} width={i % 2 ? 20 : 26} height="4" rx="2" fill="rgb(var(--c-gold))" opacity={0.35 + (i % 3) * 0.2} />
      ))}
      <Arrow d="M62 60 H96" tone="turf" />
      <Node x={98} y={46} w={64} label="Sleeper API" tone="ice" />
      <Arrow d="M164 60 H190" tone="turf" />
      <Node x={192} y={30} w={58} label="weekly_scores" tone="turf" small />
      <Node x={192} y={60} w={58} label="managers" tone="turf" small />
      <Arrow d="M252 60 H268" tone="turf" />
      {/* notebook */}
      <rect x="268" y="34" width="26" height="52" rx="4" fill="rgb(var(--c-night))" stroke="rgb(var(--c-gold))" strokeWidth="1.5" />
      <path d="M273 46h16M273 54h16M273 62h10" stroke="rgb(var(--c-gold))" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <text x="150" y="108" textAnchor="middle" fill="rgb(var(--c-ink-muted))" fontSize="8" fontFamily="monospace">
        YOUR LEAGUE → REAL SQL → PORTFOLIO NOTEBOOK
      </text>
    </svg>
  );
}

/** Raw releases → staging views → dimension + fact, with tests. */
function Lineage() {
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="ln-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgb(var(--c-turf))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="rgb(var(--c-turf))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="120" fill="url(#ln-glow)" />
      <Node x={10} y={26} w={64} label="stats_player" tone="muted" small />
      <Node x={10} y={70} w={64} label="games.csv" tone="muted" small />
      <Arrow d="M74 37 H104" />
      <Arrow d="M74 81 H104" />
      <Node x={106} y={26} w={74} label="stg_player_weeks" tone="ice" small />
      <Node x={106} y={70} w={74} label="stg_games" tone="ice" small />
      <Arrow d="M180 37 C200 37, 200 30, 214 30" tone="turf" />
      <Arrow d="M180 37 C200 37, 200 74, 214 74" tone="turf" />
      <Arrow d="M180 81 C200 81, 200 74, 214 74" tone="turf" />
      <Node x={216} y={19} w={74} label="dim_players" tone="turf" small />
      <Node x={216} y={63} w={74} label="fct_player_weeks" tone="turf" small />
      {/* test badge */}
      <rect x="236" y="92" width="54" height="16" rx="8" fill="rgb(var(--c-turf) / 0.15)" stroke="rgb(var(--c-turf))" strokeWidth="1" />
      <text x="263" y="103" textAnchor="middle" fill="rgb(var(--c-turf))" fontSize="8" fontFamily="monospace" fontWeight="700">
        ✓ 9 TESTS
      </text>
      <text x="90" y="108" textAnchor="middle" fill="rgb(var(--c-ink-muted))" fontSize="8" fontFamily="monospace">
        RAW → STAGING → MARTS
      </text>
    </svg>
  );
}

const ART: Record<string, () => JSX.Element> = {
  "my-league-scorecard": LeagueFlow,
  "nflverse-dbt-warehouse": Lineage,
};

const PITCH: Record<string, string> = {
  "my-league-scorecard":
    "Nobody else's portfolio has your league in it. Pull it through a free public API, load it into SQL, and answer the questions your group chat argues about every week.",
  "nflverse-dbt-warehouse":
    "Analytics engineering, for real: model three seasons of raw nflverse releases into a tested dbt warehouse. Runs on DuckDB — no cloud account, no card, no waiting.",
};

export default function ProjectsShowcase() {
  const builds = liveProjects();

  return (
    <section
      data-reveal-section
      className="wash-ice border-b border-panel-border"
    >
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="sequence text-center">
          <p className="reveal label-broadcast text-ice">projects</p>
          <h2 className="reveal mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
            Leave with something you can show
          </h2>
          <p className="reveal mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            Not a certificate. A repo, a notebook, a lineage graph — the kind
            of thing an interviewer clicks on and asks you about.
          </p>
        </div>

        <div className="sequence mt-10 grid gap-5 lg:grid-cols-2">
          {builds.map((p) => {
            const Art = ART[p.id];
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="reveal ring-lift surface group flex flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel"
              >
                <div className="h-40 border-b border-panel-border bg-night/40 p-3">
                  {Art ? <Art /> : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-widest ${
                        p.accent === "gold" ? "text-gold" : "text-turf"
                      }`}
                    >
                      Build · {p.hours}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                      {p.level}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-xl font-bold text-ink">
                    {p.title}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {PITCH[p.id] ?? p.blurb}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-panel-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 border-t border-panel-border pt-3 font-mono text-[11px] text-ink-muted">
                    You leave with:{" "}
                    <span className="text-ink">{p.artifact}</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="reveal mt-8 text-center">
          <Link
            href="/projects"
            className="rounded-xl border border-panel-border px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-ice/50 hover:text-ice"
          >
            All builds &amp; cases →
          </Link>
        </div>
      </div>
    </section>
  );
}
