import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

/**
 * Opens Stripe's billing portal for the signed-in member: change plan,
 * update the card, see receipts, and cancel. That last one is the "cancel in
 * two clicks" the offer promises (docs/OFFER.md), so it has to stay one
 * button on the account page and one in the portal.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // The member's own row, through their own session (RLS allows reading it).
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .eq("tier", "practice")
    .maybeSingle();
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No Season Pass on this account." }, { status: 404 });
  }

  const origin = request.headers.get("origin") ?? SITE_URL;
  const portal = await getStripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/account`,
  });
  return NextResponse.json({ url: portal.url });
}
