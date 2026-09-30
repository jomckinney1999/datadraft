import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

// Creates a Stripe Checkout session for the Practice tier subscription.
// Roadmap/Career Track checkout can follow this same pattern once their
// content/process is ready (see docs/LAUNCH-PLAN.md Phase 2).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const origin = request.headers.get("origin") ?? SITE_URL;

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [
      {
        price: process.env.NEXT_PUBLIC_STRIPE_PRACTICE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${origin}/account?checkout=success`,
    cancel_url: `${origin}/#pricing`,
  });

  return NextResponse.json({ url: session.url });
}
