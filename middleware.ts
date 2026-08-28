import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session so magic-link sessions stay alive across
 * page loads. Required by @supabase/ssr — without it, sessions silently expire.
 *
 * Two guards here are load-bearing:
 *
 * 1. **Skip anonymous visitors.** This used to call getUser() on every request
 *    from everyone. During a beta almost nobody is signed in, so that was a
 *    blocking network round trip per page view for no benefit. No Supabase
 *    auth cookie means no session to refresh — return immediately.
 *
 * 2. **Never block forever.** getUser() was awaited with no timeout, so a slow
 *    or unreachable auth server would take the whole site down instead of
 *    degrading to signed-out — every page view blocks on this call. It's now
 *    raced against a short deadline; missing it just means this request
 *    proceeds without a refreshed session, which the client recovers from.
 */

const AUTH_TIMEOUT_MS = 2500;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Same lazy-init contract as lib/stripe.ts: with placeholder env values,
  // skip session refresh instead of crashing every request.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!/^https?:\/\//.test(url) || !key) return response;

  // Supabase keeps its session in cookies prefixed `sb-`. No cookie, no
  // session, nothing to refresh — don't pay for a network call.
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
  if (!hasSession) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("auth refresh timed out")),
          AUTH_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch {
    // Degrade to signed-out for this request rather than hanging the page.
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
