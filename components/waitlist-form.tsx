"use client";

import { useEffect, useState } from "react";
import { markWaitlistJoined, waitlistJoined } from "@/lib/waitlist-memory";

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
  gold = false,
  onJoined,
}: {
  interest: string;
  source: string;
  label?: string;
  compact?: boolean;
  /** The primary call to action on a card (the Season Pass): a full-width
   *  gold button under a roomy field, rather than the inline mono pair. */
  gold?: boolean;
  /** Fires after a successful signup (or already-on). */
  onJoined?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (waitlistJoined()) {
      setState("done");
      setMessage("You're already on the list — we'll be in touch.");
    }
  }, []);

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
          // One sport. The column stays so the segment is still readable
          // in the dashboard if a second one ever ships.
          sport: "football",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "Couldn't save that. Try again in a moment.");
        return;
      }
      markWaitlistJoined();
      onJoined?.();
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
        className={
          gold
            ? "rounded-xl border border-turf/50 bg-turf/10 px-4 py-3 text-center text-sm font-semibold text-turf"
            : `font-mono text-turf ${compact ? "text-[11px]" : "text-xs"}`
        }
        role="status"
      >
        ✓ {message}
      </p>
    );
  }

  if (gold) {
    return (
      <form onSubmit={submit} className="w-full">
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
          className="w-full rounded-xl border border-gold/40 bg-night/70 px-4 py-3 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-gold"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="press btn-gold mt-2 w-full py-3.5 text-sm disabled:opacity-60"
        >
          {state === "sending" ? "Adding…" : label}
        </button>
        {state === "error" && (
          <p className="mt-2 text-center font-mono text-[11px] text-gold" role="alert">
            {message}
          </p>
        )}
      </form>
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
