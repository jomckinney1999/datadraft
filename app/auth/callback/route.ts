import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Magic-link landing. Supabase redirects here with a one-time `code`, which we
 * exchange for a session cookie and then bounce the learner to `next`.
 *
 * `next` is validated as a same-site path before use — taking it raw would be
 * an open redirect, letting anyone send a DataDraft magic link that lands on
 * a page they control.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") ?? "/account";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//")
    ? rawNext
    : "/account";

  if (!code) {
    return NextResponse.redirect(new URL("/account?error=missing_code", url.origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl?.startsWith("http") || !supabaseKey) {
    return NextResponse.redirect(new URL("/account?error=not_configured", url.origin));
  }

  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { data: session, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/account?error=link_expired", url.origin));
  }

  // A missing team means this member has never completed the account draft.
  // Route through /account for the cutscene, then return to the page they
  // originally asked for. Existing members with a team skip it entirely.
  if (session.user) {
    const { data: progress, error: progressError } = await supabase
      .from("learner_progress")
      .select("favorite_team")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!progressError && !progress?.favorite_team) {
      const onboarding = new URL("/account", url.origin);
      onboarding.searchParams.set("onboard", "1");
      onboarding.searchParams.set("next", next);
      return NextResponse.redirect(onboarding);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
