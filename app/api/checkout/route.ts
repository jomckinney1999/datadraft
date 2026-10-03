import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { leagueDay } from "@/lib/questions";
import { FOUNDING, PAYWALL_LIVE, foundingOpen, type PassPlan } from "@/lib/season-pass";
import { foundingTaken, priceIdFor } from "@/lib/pass-server";

/**
 * Starts a Stripe Checkout for the Season Pass: monthly, annual, or the
 * founding plan while it's open (docs/OFFER.md).
 *
 * Refuses outright while the paywall is off, so nothing can be bought by
 * accident before the launch gates clear. The buyer must be signed in: the
 * subscription belongs to an account, and the webhook writes it there by the
 * user id carried in the session and on the subscription itself.
 */

const PLANS: PassPlan[] = ["monthly", "annual", "founding"];

export async function POST(request: Request) {
  if (!PAYWALL_LIVE) {
    return NextResponse.json({ error: "The Season Pass isn't on sale yet." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { plan?: string };
  const plan = PLANS.find((p) => p === body.plan);
  if (!plan) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (plan === "founding" && !foundingOpen(leagueDay(), await foundingTaken())) {
    return NextResponse.json(
      { error: `Founding pricing has closed (${FOUNDING.cap} seats or ${FOUNDING.lastDay}, whichever came first).` },
      { status: 409 },
    );
  }

  const price = priceIdFor(plan);
  if (!price) {
    console.error(`[checkout] no Stripe price configured for ${plan}`);
    return NextResponse.json({ error: "Checkout isn't configured." }, { status: 500 });
  }

  // A returning member keeps their Stripe customer, so their billing history
  // and saved card stay in one place.
  const { data: existing } = await createAdminClient()
    .from("subscriptions")
    .select("stripe_customer_id, status")
    .eq("user_id", user.id)
    .eq("tier", "practice")
    .maybeSingle();
  if (existing?.status === "active") {
    return NextResponse.json({ error: "You already have the Season Pass." }, { status: 409 });
  }

  const origin = request.headers.get("origin") ?? SITE_URL;
  const meta = { user_id: user.id, plan };
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    ...(existing?.stripe_customer_id
      ? { customer: existing.stripe_customer_id }
      : { customer_email: user.email }),
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    metadata: meta,
    subscription_data: { metadata: meta },
    allow_promotion_codes: true,
    success_url: `${origin}/account?checkout=success`,
    cancel_url: `${origin}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
