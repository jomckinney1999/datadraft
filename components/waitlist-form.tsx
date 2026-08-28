"use client";

import { useState } from "react";
import { readStoredSport } from "@/lib/use-sport";

/**
 * Email capture, used anywhere the product can't deliver yet: the paid tiers,
 * the in-build sports, and the Weekly Challenge.
 *
 * It records WHAT the person was reaching for (`interest`) and which sport
 * lens they had picked, so the list is segmented from day one rather than
 * being one undifferentiated pile of addresses.
 */
export default function WaitlistForm({
  interest,
  source,
  label = "Get notified",
  compact = false,
}: {
  interest: string;
  source: string;
  label?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          interest,
          source,
          sport: readStoredSport(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "Couldn't save that. Try again in a moment.");
        return;
      }
      setState("done");
      setMessage(
        data.alreadyOn
          ? "You're already on the list — we'll be in touch."
          : "You're on the list. We'll email you when it opens.",
      );
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network hiccup. Try again in a moment.");
    }
  }

  if (state === "done") {
    return (
      <p
        className={`font-mono text-turf ${compact ? "text-[11px]" : "text-xs"}`}
        role="status"
      >
        ✓ {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className={`flex gap-2 ${compact ? "flex-row" : "flex-col sm:flex-row"}`}>
        <label className="sr-only" htmlFor={`waitlist-${interest}`}>
          Email address
        </label>
        <input
          id={`waitlist-${interest}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          className="min-w-0 flex-1 border border-panel-border bg-night px-3 py-2 font-mono text-xs text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-turf"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 border border-turf bg-turf/15 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-turf transition-colors hover:bg-turf/25 disabled:opacity-50"
        >
          {state === "sending" ? "Adding…" : label}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 font-mono text-[11px] text-gold" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
