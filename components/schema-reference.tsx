"use client";

/**
 * The tables, available at any point during a lesson.
 *
 * Exercise prompts name tables and columns constantly — filter waiver_wire,
 * join on player, sum fantasy_pts — and until this existed there was nowhere
 * to look them up mid-drill. The learner had either memorised the schema or
 * had to quit the lesson to go and check, which is a bad choice to force on
 * someone three questions into a drive.
 *
 * Collapsed by default so it never competes with the question, and it carries
 * the provenance labels from lib/data-source.ts rather than a second
 * copy of that claim, plus a link out to the full provenance page.
 */

import { useState } from "react";
import Link from "next/link";
import { SCHEMA } from "@/lib/fantasy-data";
import { PROVENANCE } from "@/lib/data-source";

const PROV = new Map(PROVENANCE.map((p) => [p.table, p]));

export default function SchemaReference() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-panel-border bg-panel/40">
      <p className="border-b border-panel-border px-3 py-2 font-mono text-[10px] leading-snug text-ink-muted">
        Stuck on a column name? Open the tables here on the left — every column
        you can query is listed under each sheet.
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="press flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="min-w-0">
          <span className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-turf">
            Tables &amp; columns
          </span>
          <span className="mt-0.5 block truncate font-mono text-[10px] text-ink-muted">
            {SCHEMA.map((t) => t.table).join(" · ")}
          </span>
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          {open ? "hide ↑" : "show ↓"}
        </span>
      </button>

      {open && (
        <div className="animate-fade-up space-y-2 border-t border-panel-border px-3 py-3">
          {SCHEMA.map((t) => {
            const prov = PROV.get(t.table);
            return (
              <div key={t.table}>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] font-semibold text-gold">
                    {t.table}
                  </span>
                  {prov && (
                    <span
                      className={`border px-1.5 font-mono text-[9px] uppercase tracking-widest ${
                        prov.kind === "real"
                          ? "border-turf/50 text-turf"
                          : "border-gold/50 text-gold"
                      }`}
                    >
                      {prov.label}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-ink-muted">
                  {t.columns.join(", ")}
                </p>
              </div>
            );
          })}
          <Link
            href="/data"
            target="_blank"
            className="inline-block pt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted underline underline-offset-2 hover:text-turf"
          >
            where this data comes from ↗
          </Link>
        </div>
      )}
    </div>
  );
}
