"use client";

/**
 * Query Doctor's verdict on a wrong or broken query: up to three findings,
 * each a one-line diagnosis and what to change. The diagnosis is local and
 * instant (lib/query-doctor.ts). "Ask Coach" sends the findings — never the
 * answer key — to /api/coach for a conversational version, and says plainly
 * when the coach isn't switched on rather than failing quietly.
 */

import { useState } from "react";
import PassTag from "@/components/pass-tag";
import type { Finding } from "@/lib/query-doctor";

export default function QueryDoctorPanel({
  findings,
  sql,
  prompt,
  returns,
}: {
  findings: Finding[];
  sql: string;
  prompt: string;
  returns: string;
}) {
  const [coach, setCoach] = useState<{ state: "idle" | "loading" | "done" | "off"; text?: string }>({ state: "idle" });

  if (!findings.length) return null;

  async function ask() {
    setCoach({ state: "loading" });
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "diagnose",
          exerciseType: "sql",
          prompt: `${prompt}\nReturn: ${returns}`,
          learnerAnswer: sql,
          findings: findings.map((f) => `${f.title} ${f.detail}`).join("\n"),
        }),
      });
      const body = (await res.json()) as { text?: string };
      setCoach(res.ok && body.text ? { state: "done", text: body.text } : { state: "off" });
    } catch {
      setCoach({ state: "off" });
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-ice/40 bg-night/40 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ice">
          <span aria-hidden>🩺</span> Query Doctor
        </p>
        <PassTag />
      </div>
      <ul className="mt-2 space-y-2">
        {findings.map((f, i) => (
          <li key={i} className="text-sm leading-relaxed">
            <Code text={f.title} className="font-semibold text-ink" />{" "}
            <Code text={f.detail} className="text-ink-soft" />
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-panel-border/70 pt-2.5">
        {coach.state === "idle" && (
          <button
            type="button"
            onClick={ask}
            className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
          >
            Still stuck? Ask Coach →
          </button>
        )}
        {coach.state === "loading" && <p className="font-mono text-[11px] text-ink-muted">Coach is reading your query…</p>}
        {coach.state === "done" && <p className="text-sm leading-relaxed text-ink">{coach.text}</p>}
        {coach.state === "off" && (
          <p className="text-xs text-ink-muted">
            Coach isn&apos;t switched on yet. The notes above are the whole diagnosis — and they never give the answer away.
          </p>
        )}
      </div>
    </div>
  );
}

/** Render `backticked` names as inline code. */
function Code({ text, className }: { text: string; className: string }) {
  const parts = text.split("`");
  return (
    <span className={className}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-panel px-1 py-px font-mono text-[12px] text-ice">
            {p}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}
