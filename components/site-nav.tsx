"use client";

import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "#pick-your-sport", label: "Your sport", accent: "turf" as const },
  { href: "#why", label: "Why SQL Sports", accent: "turf" as const },
  { href: "/field", label: "Practice Field", accent: "gold" as const },
  { href: "#curriculum", label: "Curriculum", accent: "turf" as const },
  { href: "#pricing", label: "Pricing", accent: "turf" as const },
  { href: "#career-track", label: "Career Track", accent: "gold" as const },
  { href: "#challenge", label: "Challenge", accent: "turf" as const },
  { href: "#stat-guru", label: "NFL Stat Guru", accent: "gold" as const },
];

/** Primary skill tracks shown in the Learn dropdown. */
const LEARN_TRACKS = [
  {
    id: "all",
    label: "All-in-one pathway",
    blurb: "SQL → Python → stats → viz → Git → R",
  },
  { id: "sql", label: "SQL", blurb: "Select, filter, rank, aggregate" },
  { id: "python", label: "Python", blurb: "pandas — code that runs live" },
  { id: "r", label: "R", blurb: "tidyverse — executed in-browser" },
  {
    id: "ai",
    label: "AI",
    blurb: "Prompts, evals, shipping AI features — in camp soon",
  },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const learnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!learnOpen) return;
    function onPointer(e: MouseEvent) {
      if (learnRef.current && !learnRef.current.contains(e.target as Node)) {
        setLearnOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLearnOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [learnOpen]);

  return (
    <header className="relative z-20 border-b border-panel-border/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-pop">
            SQL<span className="text-turf">Sports</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:inline">
            v0.1
          </span>
        </a>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`font-mono text-[11px] uppercase tracking-wider text-ink-muted transition-colors duration-150 ${
                link.accent === "gold" ? "hover:text-gold" : "hover:text-turf"
              }`}
            >
              {link.label}
            </a>
          ))}

          <div className="relative" ref={learnRef}>
            <button
              type="button"
              aria-expanded={learnOpen}
              aria-haspopup="menu"
              onClick={() => setLearnOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 border border-turf/50 bg-turf/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-turf transition-colors duration-150 hover:border-turf hover:bg-turf/20"
            >
              Learn
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className={`h-2.5 w-2.5 transition-transform duration-150 ${
                  learnOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  d="M2 4l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {learnOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-2 w-64 border border-panel-border bg-night/95 py-1 shadow-scoreboard backdrop-blur-sm"
              >
                {LEARN_TRACKS.map((track) => (
                  <a
                    key={track.id}
                    role="menuitem"
                    href={`/learn?module=${track.id}`}
                    onClick={() => setLearnOpen(false)}
                    className="block px-3 py-2.5 transition-colors duration-150 hover:bg-turf/10"
                  >
                    <span className="block font-mono text-[11px] uppercase tracking-wider text-turf">
                      {track.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-ink-muted">
                      {track.blurb}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center text-ink transition-colors duration-150 hover:text-turf"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-panel-border/80 bg-night/95 px-4 py-4 backdrop-blur-sm sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-2 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors duration-150 ${
                  link.accent === "gold" ? "hover:text-gold" : "hover:text-turf"
                }`}
              >
                {link.label}
              </a>
            ))}

            <p className="mt-3 px-2 label-broadcast text-[10px] text-ink-muted">
              Learn
            </p>
            {LEARN_TRACKS.map((track) => (
              <a
                key={track.id}
                href={`/learn?module=${track.id}`}
                onClick={() => setOpen(false)}
                className="px-2 py-2.5 font-mono text-xs uppercase tracking-wider text-turf transition-colors duration-150 hover:bg-turf/10"
              >
                {track.label}
                <span className="mt-0.5 block font-sans text-[11px] normal-case tracking-normal text-ink-muted">
                  {track.blurb}
                </span>
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
