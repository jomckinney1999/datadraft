"use client";

/**
 * Career-role picker cards — one visual identity per title so the grid
 * isn’t six identical blurbs. Accent color + mark pull the eye; course
 * chips and progress sit underneath.
 */

import Link from "next/link";
import type { CareerRole, PathStep } from "@/lib/career-paths";
import { roleHours } from "@/lib/career-paths";

type Accent = "turf" | "ice" | "gold";

function MarkAnalyst({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect
        x="12"
        y="18"
        width="56"
        height="48"
        rx="4"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M20 52 V36 H28 V52 M34 52 V28 H42 V52 M48 52 V40 H56 V52"
        fill="currentColor"
      />
      <circle cx="58" cy="24" r="8" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

function MarkBusiness({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect
        x="18"
        y="28"
        width="44"
        height="36"
        rx="3"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M30 28 V22 H50 V28"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <rect x="34" y="40" width="12" height="10" rx="1" fill="currentColor" />
      <line
        x1="24"
        y1="48"
        x2="56"
        y2="48"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.5"
      />
    </svg>
  );
}

function MarkEngineer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <circle cx="40" cy="40" r="18" fill="currentColor" fillOpacity="0.15" />
      <path
        d="M40 18 L44 28 L55 28 L46 35 L50 46 L40 40 L30 46 L34 35 L25 28 L36 28 Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <circle cx="40" cy="40" r="6" fill="rgb(var(--c-night))" />
    </svg>
  );
}

function MarkScientist({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <path
        d="M30 16 H50 L44 36 C52 42 54 52 40 62 C26 52 28 42 36 36 Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="34" cy="48" r="3" fill="currentColor" />
      <circle cx="44" cy="52" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="38" cy="56" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function MarkBI({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect
        x="10"
        y="14"
        width="60"
        height="52"
        rx="4"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <rect
        x="16"
        y="22"
        width="22"
        height="16"
        rx="2"
        fill="currentColor"
        fillOpacity="0.45"
      />
      <rect
        x="42"
        y="22"
        width="22"
        height="16"
        rx="2"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path
        d="M18 54 L28 44 L38 48 L50 36 L62 42"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <circle cx="62" cy="42" r="3" fill="currentColor" />
    </svg>
  );
}

function MarkPipeline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <circle cx="18" cy="40" r="8" fill="currentColor" fillOpacity="0.35" />
      <circle cx="40" cy="40" r="8" fill="currentColor" fillOpacity="0.55" />
      <circle cx="62" cy="40" r="8" fill="currentColor" fillOpacity="0.8" />
      <path
        d="M26 40 H32 M48 40 H54"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M58 34 L64 40 L58 46"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  );
}

const ROLE_LOOK: Record<
  string,
  {
    accent: Accent;
    tag: string;
    Mark: (props: { className?: string }) => JSX.Element;
  }
> = {
  "data-analyst": {
    accent: "turf",
    tag: "Most common first job",
    Mark: MarkAnalyst,
  },
  "business-analyst": {
    accent: "ice",
    tag: "Ops & stakeholders",
    Mark: MarkBusiness,
  },
  "analytics-engineer": {
    accent: "gold",
    tag: "Models others query",
    Mark: MarkEngineer,
  },
  "data-scientist": {
    accent: "ice",
    tag: "Code · stats · SQL",
    Mark: MarkScientist,
  },
  "bi-analyst": {
    accent: "gold",
    tag: "Dashboards that decide",
    Mark: MarkBI,
  },
  "data-engineer": {
    accent: "turf",
    tag: "Pipelines & warehouses",
    Mark: MarkPipeline,
  },
};

const ACCENT = {
  turf: {
    border: "border-turf/35 hover:border-turf",
    wash: "from-turf/25 via-turf/5 to-transparent",
    glow: "group-hover:shadow-[0_0_32px_-8px_rgb(var(--c-turf)/0.55)]",
    text: "text-turf",
    chip: "border-turf/40 bg-turf/15 text-turf",
    bar: "bg-turf",
    soft: "bg-turf/10",
    titleHover: "text-ink group-hover:text-turf",
  },
  ice: {
    border: "border-ice/35 hover:border-ice",
    wash: "from-ice/25 via-ice/5 to-transparent",
    glow: "group-hover:shadow-[0_0_32px_-8px_rgb(var(--c-ice)/0.55)]",
    text: "text-ice",
    chip: "border-ice/40 bg-ice/15 text-ice",
    bar: "bg-ice",
    soft: "bg-ice/10",
    titleHover: "text-ink group-hover:text-ice",
  },
  gold: {
    border: "border-gold/40 hover:border-gold",
    wash: "from-gold/25 via-gold/5 to-transparent",
    glow: "group-hover:shadow-[0_0_32px_-8px_rgb(var(--c-gold)/0.5)]",
    text: "text-gold",
    chip: "border-gold/40 bg-gold/15 text-gold",
    bar: "bg-gold",
    soft: "bg-gold/10",
    titleHover: "text-ink group-hover:text-gold",
  },
} as const;

export default function RolePathCard({
  role,
  steps,
  index = 0,
  onSelect,
}: {
  role: CareerRole;
  steps: PathStep[];
  index?: number;
  onSelect?: () => void;
}) {
  const look = ROLE_LOOK[role.id] ?? ROLE_LOOK["data-analyst"];
  const a = ACCENT[look.accent];
  const live = steps.filter((s) => s.course.status === "live" && s.total > 0);
  const cleared = live.filter((s) => s.complete).length;
  const pct =
    live.length === 0 ? 0 : Math.round((cleared / live.length) * 100);
  const Mark = look.Mark;

  return (
    <Link
      href={`/learn/path/${role.id}`}
      onClick={onSelect}
      style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-panel transition-all duration-200 lift animate-fade-up ${a.border} ${a.glow}`}
    >
      <div
        className={`relative h-28 overflow-hidden bg-gradient-to-br ${a.wash}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 yard-lines opacity-30"
        />
        <div className={`absolute -right-2 -top-2 ${a.text} opacity-90`}>
          <Mark className="h-28 w-28 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
        </div>
        <div className="absolute left-4 top-4 flex flex-col gap-1.5">
          <span
            className={`inline-flex w-fit rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${a.chip}`}
          >
            {look.tag}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            ~{roleHours(role)}h path
          </span>
        </div>
        <span
          className={`absolute bottom-3 right-4 font-display text-4xl font-bold tabular-nums opacity-20 ${a.text}`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h2
          className={`font-display text-xl font-bold transition-colors sm:text-2xl ${a.titleHover}`}
        >
          {role.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{role.blurb}</p>

        <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
          {steps.map((s, idx) => (
            <div key={s.course.id} className="flex shrink-0 items-center gap-1">
              {idx > 0 && (
                <span
                  className="px-0.5 font-mono text-[10px] text-ink-muted"
                  aria-hidden
                >
                  →
                </span>
              )}
              <span
                className={`rounded-lg border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                  s.complete
                    ? a.chip
                    : s.course.status === "building"
                      ? "border-panel-border/80 text-ink-muted"
                      : `${a.soft} border-panel-border text-ink-soft`
                }`}
                title={s.course.title}
              >
                {s.course.mark}
                {s.course.status === "building" ? " ·" : ""}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              {cleared > 0
                ? `${cleared}/${live.length} courses cleared`
                : `${live.length} live courses`}
            </span>
            {cleared > 0 && (
              <span className={`font-mono text-[11px] font-bold ${a.text}`}>
                {pct}%
              </span>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-night/80">
            <div
              className={`h-full rounded-full transition-all ${a.bar}`}
              style={{ width: `${Math.max(pct, cleared > 0 ? 6 : 0)}%` }}
            />
          </div>
        </div>

        <p
          className={`mt-4 font-mono text-[11px] font-bold uppercase tracking-widest ${a.text}`}
        >
          Open board →
        </p>
      </div>
    </Link>
  );
}
