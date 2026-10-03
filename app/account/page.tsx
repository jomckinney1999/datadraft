"use client";

// Accounts, magic-link only — no passwords to manage, leak, or reset.
// The free start on the homepage lands here so a learner becomes a user.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EMPTY_PROGRESS, loadProgress, type Progress } from "@/lib/progress";
import { readPass, syncProgress, type PassStatus } from "@/lib/progress-sync";
import { PASS_PLANS, PAYWALL_LIVE } from "@/lib/season-pass";
import Coach from "@/components/coach";
import AppNav from "@/components/app-nav";
import LockerCard from "@/components/locker-card";
import WaitlistForm from "@/components/waitlist-form";

type State = "loading" | "signed-out" | "sending" | "sent" | "signed-in";

const ERRORS: Record<string, string> = {
  missing_code: "That link was missing its sign-in code. Try requesting a new one.",
  link_expired: "That link has expired or was already used. Request a fresh one.",
  not_configured: "Accounts aren't switched on yet.",
};

/**
 * Where signing in returns you: the dashboard, or a page that sent you here
 * mid-task (?next=/pricing, from a checkout that needed an account). Only a
 * path on this site, so the link can't be used to bounce someone elsewhere.
 */
function nextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next") ?? "";
  return /^\/(?!\/)[\w\-/]*$/.test(next) ? next : "/dashboard";
}

export default function AccountPage() {
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");
  const [who, setWho] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const [pass, setPass] = useState<PassStatus | null>(null);
  const [justBought, setJustBought] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);

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

    if (!PAYWALL_LIVE) return;
    // Back from Stripe: the webhook that grants the Pass can land a few
    // seconds after the redirect, so wait for it briefly before saying so.
    const bought = params.get("checkout") === "success";
    setJustBought(bought);
    let status = await readPass(supabase, user.id);
    for (let i = 0; bought && !status.active && i < 6; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      status = await readPass(supabase, user.id);
    }
    setPass(status);
    if (bought && status.active) {
      const again = await syncProgress();
      if (again) setProgress(again);
    }
  }, []);

  async function openBilling() {
    setPortalBusy(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (body.url) {
        window.location.href = body.url;
        return;
      }
      setError(body.error ?? "Billing didn't open. Try again in a moment.");
    } catch {
      setError("Billing didn't open. Check your connection and try again.");
    }
    setPortalBusy(false);
  }

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
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`,
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

        <div className="mb-6">
          <LockerCard progress={progress} onChange={setProgress} />
        </div>

        {!PAYWALL_LIVE && (
          <section className="surface mb-6 rounded-2xl border border-gold/40 bg-gold/5 p-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
              ★ Season Pass · early access
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-ink">
              Every Pass feature is open right now
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              Founding members pay {PASS_PLANS.founding.price}/yr locked in. Get on the list for the
              head start when it opens — early-access users hear first.
            </p>
            <div className="mt-3 max-w-md">
              <WaitlistForm
                interest="season-pass"
                source={state === "signed-in" ? "account-signed-in" : "account"}
                label="Notify me"
                compact
              />
            </div>
            <Link
              href="/pricing"
              className="mt-3 inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
            >
              See the full offer →
            </Link>
          </section>
        )}

        <section className="surface border border-panel-border bg-panel/80 p-6">
          {state === "loading" && (
            <p className="font-mono text-xs text-ink-muted">Checking your account…</p>
          )}

          {(state === "signed-out" || state === "sending") && (
            <>
              <div className="flex items-start gap-4">
                <div className="hidden shrink-0 sm:block">
                  <Coach mood="idle" size={96} />
                </div>
                <div>
                  <p className="label-broadcast text-gold">your locker, everywhere</p>
                  <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                    Take your rank with you.
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    Sign in so your callsign, XP, streak and lessons follow you — not one
                    browser. We email a link. You click it. That&apos;s the sign-in.
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

              {PAYWALL_LIVE && pass && (
                <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">★ Season Pass</p>
                  {pass.active ? (
                    <p className="mt-1 text-sm text-ink">
                      {justBought ? "You're in. Welcome to the Season Pass. " : ""}
                      {pass.plan === "founding"
                        ? `Founding member, ${PASS_PLANS.founding.price} a year for as long as you stay.`
                        : pass.plan
                          ? `${PASS_PLANS[pass.plan].price} a ${PASS_PLANS[pass.plan].per}.`
                          : "Active."}
                      {pass.periodEnd ? ` Renews or ends ${new Date(pass.periodEnd).toLocaleDateString()}.` : ""}
                    </p>
                  ) : justBought ? (
                    <p className="mt-1 text-sm text-ink">
                      Payment received. Your Pass is still switching on; refresh this page in a minute.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-ink-soft">
                      Not a member.{" "}
                      <Link href="/pricing" className="text-gold hover:underline">
                        See the Season Pass
                      </Link>
                    </p>
                  )}
                  {pass.hasBilling && (
                    <button
                      type="button"
                      onClick={openBilling}
                      disabled={portalBusy}
                      className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-gold hover:underline disabled:opacity-60"
                    >
                      {portalBusy ? "Opening…" : "Manage or cancel →"}
                    </button>
                  )}
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
