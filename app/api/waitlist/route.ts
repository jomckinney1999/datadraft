import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Waitlist signup.
 *
 * Runs server-side rather than inserting straight from the browser for two
 * reasons: a duplicate signup should read as success to the visitor (not a
 * 409), and the anon key never needs an UPDATE policy on this table — which
 * would otherwise let anyone overwrite someone else's row.
 *
 * The table has no SELECT policy at all, so the list can't be read back with
 * the public key even though it can be written to.
 */

export const runtime = "nodejs";

const MAX = { email: 320, interest: 64, sport: 32, source: 64 };

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Same lazy-init contract as lib/stripe.ts and middleware.ts: with
  // placeholder env values this route says so instead of throwing.
  if (!url?.startsWith("http") || !key) {
    return NextResponse.json(
      { error: "The waitlist isn't connected yet." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const email = clean(body.email, MAX.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That doesn't look like an email address." },
      { status: 400 },
    );
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("waitlist").insert({
    email,
    interest: clean(body.interest, MAX.interest) ?? "general",
    sport: clean(body.sport, MAX.sport),
    source: clean(body.source, MAX.source),
  });

  // 23505 = unique violation. They already signed up; that's a success to them.
  if (error && error.code !== "23505") {
    console.error("waitlist insert failed", error.code, error.message);
    return NextResponse.json(
      { error: "Couldn't save that. Try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, alreadyOn: error?.code === "23505" });
}
