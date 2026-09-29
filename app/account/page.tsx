"use client";

// Accounts, magic-link only — no passwords to manage, leak, or reset.
// An account is purely for portability: it carries progress between devices.
// Everything on the site works signed out, and always should during beta.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loadProgress, type Progress } from "@/lib/progress";
import { syncProgress } from "@/lib/progress-sync";
import Coach from "@/components/coach";
import AppNav from "@/components/app-nav";

type State = "loading" | "signed-out" | "sending" | "sent" | "signed-in";

const ERRORS: Record<string, string> = {
  missing_code: "That link was missing its sign-in code. Try requesting a new one.",
  link_expired: "That link has expired or was already used. Request a fresh one.",
  not_configured: "Accounts aren't switched on yet.",
};

export default function AccountPage() {
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");
  const [who, setWho] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  const boot = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setError(ERRORS[err] ?? "Something went wrong signing you in.");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProgress(loadProgress());
      setState("signed-out");
      return;
    }

    setWho(user.email ?? null);
    setState("signed-in");
    const merged = await syncProgress();
    setProgress(merged ?? loadProgress());
    setSynced(true);
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Signing in lands on the dashboard, not the account page: the reason to
        // log in is to get back to learning, not to look at settings.
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (signInError) {
      setError(signInError.message);
      setState("signed-out");
      return;
    }
    setState("sent");
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/account";
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-24 pt-6 sm:px-6">
        {error && (
          <p
            role="alert"
            className="mb-4 border border-gold/50 bg-gold/10 px-4 py-3 font-mono text-[12px] leading-relaxed text-gold"
          >
            {error}
          </p>
        )}

        <section className="surface border border-panel-border bg-panel/80 p-6">
          {state === "loading" && (
            <p className="font-mono text-xs text-ink-muted">Checking your locker…</p>
          )}

          {(state === "signed-out" || state === "sending") && (
            <>
              <div className="flex items-start gap-4">
                <div className="hidden shrink-0 sm:block">
                  <Coach mood="idle" size={96} />
                </div>
                <div>
                  <p className="label-broadcast text-turf">optional</p>
                  <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                    Keep your progress on every device.
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    Right now your XP and finished lessons live only in this
                    browser — clear it, or open the site on your phone, and
                    they&apos;re gone. An account carries them with you.
                  </p>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-muted">
                    No password. We email you a link, you click it, that&apos;s
                    the whole thing. Everything on the site keeps working signed
                    out.
                  </p>
                </div>
              </div>

              <form onSubmit={sendLink} className="mt-6 flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="account-email">
                  Email address
                </label>
                <input
                  id="account-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="min-w-0 flex-1 border border-panel-border bg-night px-3 py-2.5 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-turf"
                />
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="btn-turf shrink-0 border border-turf bg-turf px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors hover:bg-turf-dim disabled:opacity-50"
                >
                  {state === "sending" ? "Sending…" : "Email me a link"}
                </button>
              </form>
            </>
          )}

          {state === "sent" && (
            <div className="flex items-start gap-4">
              <div className="hidden shrink-0 sm:block">
                <Coach mood="happy" size={96} />
              </div>
              <div>
                <p className="label-broadcast text-turf">check your inbox</p>
                <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                  Link sent.
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  Open the email we just sent and click the link to finish signing
                  in. It expires shortly, and it only works once.
                </p>
                <p className="mt-2 font-mono text-[11px] text-ink-muted">
                  Nothing in your inbox after a minute? Check spam, then try
                  again.
                </p>
              </div>
            </div>
          )}

          {state === "signed-in" && (
            <>
              <p className="label-broadcast text-turf">signed in</p>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                {who}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {synced
                  ? "Progress synced. It'll follow you to any device you sign in on."
                  : "Syncing your progress…"}
              </p>

              {progress && (
                <div className="mt-5 grid grid-cols-3 gap-px border border-panel-border bg-panel-border">
                  <div className="bg-panel px-4 py-3">
                    <p className="label-broadcast text-[10px]">XP</p>
                    <p className="stat-number-turf mt-1 text-xl">{progress.xp}</p>
                  </div>
                  <div className="bg-panel px-4 py-3">
                    <p className="label-broadcast text-[10px]">Lessons</p>
                    <p className="stat-number-turf mt-1 text-xl">
                      {progress.completedLessons.length}
                    </p>
                  </div>
                  <div className="bg-panel px-4 py-3">
                    <p className="label-broadcast text-[10px]">Streak</p>
                    <p className="stat-number mt-1 text-xl">{progress.streak}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/learn"
                  className="btn-turf border border-turf bg-turf px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-night transition-colors hover:bg-turf-dim"
                >
                  Back to courses
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="border border-panel-border px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors hover:border-gold/50 hover:text-gold"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </section>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
          Accounts are free and optional during beta · we only store your email
          and your progress
        </p>
      </main>
    </>
  );
}
