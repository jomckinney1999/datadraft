"use client";

import { useState } from "react";

type CoachMode = "hint" | "why_wrong";

type Props = {
  mode: CoachMode;
  prompt: string;
  exerciseType: string;
  learnerAnswer?: string;
  solution?: string;
  explain?: string;
  lessonId?: string;
  /** Label on the button. */
  label?: string;
};

/**
 * Optional AI assist. Failures fall back silently to the written tip —
 * the lesson never depends on the model being live.
 */
export default function CoachAssist(props: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function ask() {
    setOpen(true);
    if (text || loading) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: props.mode,
          prompt: props.prompt,
          exerciseType: props.exerciseType,
          learnerAnswer: props.learnerAnswer,
          solution: props.solution,
          explain: props.explain,
          lessonId: props.lessonId,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        setErr(
          data.error === "unavailable"
            ? "Coach is offline right now — use the tip above."
            : "Coach couldn’t answer — use the tip above.",
        );
        return;
      }
      setText(data.text);
    } catch {
      setErr("Coach couldn’t connect — use the tip above.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={ask}
        className="font-mono text-[11px] uppercase tracking-wider text-ice underline-offset-2 hover:underline"
      >
        {props.label ??
          (props.mode === "hint" ? "Ask Coach Blitz" : "Ask Coach why")}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-ice/30 bg-ice/5 px-3 py-2.5 text-sm leading-relaxed text-ink-soft">
          {loading && (
            <p className="font-mono text-[11px] text-ink-muted">Coach is thinking…</p>
          )}
          {!loading && text && <p>{text}</p>}
          {!loading && err && (
            <p className="font-mono text-[11px] text-ink-muted">{err}</p>
          )}
        </div>
      )}
    </div>
  );
}
