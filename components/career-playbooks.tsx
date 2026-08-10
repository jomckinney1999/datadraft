"use client";

import { useState } from "react";
import {
  CAREER_PLAYBOOKS,
  SPORT_LEXICON,
  type CareerPlaybook,
} from "@/lib/career-playbooks";
import { useSport } from "@/lib/use-sport";
import { sportById, type SportId } from "@/lib/sports";

function StatusChip({
  status,
  comingSoonLabel,
}: {
  status: CareerPlaybook["status"];
  comingSoonLabel: string;
}) {
  if (status === "in-camp") {
    return (
      <span className="border border-turf/40 bg-turf/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-turf">
        In camp
      </span>
    );
  }
  return (
    <span className="border border-panel-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
      {comingSoonLabel}
    </span>
  );
}

export default function CareerPlaybooks() {
  const { sport, hydrated } = useSport();
  const sportId: SportId = hydrated && sport ? sport : "football";
  const lex = SPORT_LEXICON[sportId];
  const sportMeta = sportById(sportId);
  const [activeId, setActiveId] = useState(CAREER_PLAYBOOKS[0].id);
  const active = CAREER_PLAYBOOKS.find((p) => p.id === activeId) ?? CAREER_PLAYBOOKS[0];

  return (
    <section
      id="career-track"
      className="relative scroll-mt-20 overflow-hidden border-t border-panel-border"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="rays-gold absolute inset-0 opacity-[0.04]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="label-broadcast mb-3 text-gold">
          <span className="mr-2 inline-block h-1.5 w-1.5 bg-gold align-middle" />
          Career Track · {lex.playbooks}
        </p>
        <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-pop sm:text-4xl">
          Pick your {lex.playbook.toLowerCase()}. We&apos;ll run the rest of the
          season with you.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
          Career Track isn&apos;t one generic course with a resume checkbox at
          the end. It&apos;s a role-specific {lex.playbook.toLowerCase()} — from{" "}
          {lex.foundation.toLowerCase()} through {lex.applications.toLowerCase()}{" "}
          — built for people using this to land the job. Stations below are the
          map; drills marked placeholder are being written. Your sport lens
          right now:{" "}
          <span className="text-ink">
            {sportMeta.icon} {sportMeta.name}
          </span>
          .
        </p>

        {/* Playbook picker */}
        <div
          role="tablist"
          aria-label="Career playbooks"
          className="mt-8 flex gap-2 overflow-x-auto pb-1"
        >
          {CAREER_PLAYBOOKS.map((pb) => {
            const selected = pb.id === active.id;
            return (
              <button
                key={pb.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveId(pb.id)}
                className={`shrink-0 border px-3 py-2 text-left transition-colors duration-150 ${
                  selected
                    ? pb.accent === "gold"
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-turf bg-turf/15 text-turf"
                    : "border-panel-border bg-panel/60 text-ink-muted hover:border-panel-border hover:text-ink"
                }`}
              >
                <span className="block font-mono text-[11px] uppercase tracking-wider">
                  {pb.role}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active playbook */}
        <div
          role="tabpanel"
          className="mt-6 border border-panel-border bg-panel/80 p-5 shadow-scoreboard sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="label-broadcast text-ink-muted">
                {lex.playbook} · {active.role}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-pop">
                {active.role} {lex.playbook}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                {active.tagline}
              </p>
            </div>
            <StatusChip
              status={active.status}
              comingSoonLabel={lex.comingSoon}
            />
          </div>

          <ol className="mt-8 space-y-4">
            {active.stations.map((station, i) => {
              const sportsName = lex[station.lexKey];
              const liveCount = station.drills.filter(
                (d) => d.status === "live",
              ).length;
              return (
                <li
                  key={station.id}
                  className="border border-panel-border bg-night/40 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-3">
                      <span
                        className={
                          active.accent === "gold"
                            ? "stat-number text-lg"
                            : "stat-number-turf text-lg"
                        }
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h4 className="font-display text-lg font-semibold text-pop">
                          {sportsName}
                        </h4>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                          {station.plainTitle}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                      {liveCount}/{station.drills.length} live
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                    {station.blurb}
                  </p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {station.drills.map((drill) => (
                      <li
                        key={drill.label}
                        className="flex gap-2 border border-panel-border/60 bg-panel/40 px-3 py-2 text-sm text-ink-soft"
                      >
                        <span
                          className={
                            drill.status === "live" ? "text-turf" : "text-ink-muted"
                          }
                        >
                          {drill.status === "live" ? "▸" : "○"}
                        </span>
                        <span>
                          {drill.label}
                          {drill.status === "placeholder" && (
                            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                              placeholder
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-panel-border pt-6">
            <a
              href="#pricing"
              className="inline-flex items-center border border-gold bg-gold/10 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-gold transition-colors duration-150 hover:bg-gold/20"
            >
              See Career Track pricing
            </a>
            <p className="font-mono text-[11px] leading-relaxed text-ink-muted">
              Kept intentionally small — 1:1 {lex.coaching.toLowerCase()}{" "}
              doesn&apos;t scale, so we don&apos;t pretend it does.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
