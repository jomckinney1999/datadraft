import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe → the subscriptions table, which is what grants the Season Pass
 * (lib/progress-sync.ts reads it; a browser flag never does).
 *
 * Register this URL (<site>/api/stripe/webhook) in Stripe Dashboard >
 * Developers > Webhooks for: checkout.session.completed,
 * customer.subscription.created, customer.subscription.updated,
 * customer.subscription.deleted. Its signing secret goes in
 * STRIPE_WEBHOOK_SECRET.
 *
 * Events can arrive in any order, so every handler upserts on the member
 * (user_id + tier) using the user id and plan that checkout stamped on both
 * the session and the subscription's metadata. Re-delivery is harmless.
 */

type Status = "active" | "past_due" | "canceled" | "pending";

function statusOf(s: Stripe.Subscription.Status): Status {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due" || s === "unpaid") return "past_due";
  if (s === "incomplete") return "pending";
  return "canceled"; // canceled, incomplete_expired, paused
}

const PLANS = new Set(["monthly", "annual", "founding"]);
const planOf = (meta: Stripe.Metadata | null | undefined) =>
  meta?.plan && PLANS.has(meta.plan) ? meta.plan : null;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const supabase = createAdminClient();
  const upsert = async (row: Record<string, unknown>) => {
    const { error } = await supabase
      .from("subscriptions")
      .upsert({ tier: "practice", updated_at: new Date().toISOString(), ...row }, { onConflict: "user_id,tier" });
    // A failed write must fail the delivery, so Stripe retries it.
    if (error) throw new Error(error.message);
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.user_id;
        if (!userId || !session.subscription || !session.customer) break;
        await upsert({
          user_id: userId,
          status: "active",
          plan: planOf(session.metadata),
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        const periodEnd = sub.items.data[0]?.current_period_end;
        const row = {
          status: event.type === "customer.subscription.deleted" ? "canceled" : statusOf(sub.status),
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          stripe_subscription_id: sub.id,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          ...(planOf(sub.metadata) ? { plan: planOf(sub.metadata) } : {}),
        };
        if (userId) {
          await upsert({ user_id: userId, ...row });
        } else {
          // A subscription made before metadata carried the user id.
          const { error } = await supabase
            .from("subscriptions")
            .update({ ...row, updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", sub.id);
          if (error) throw new Error(error.message);
        }
        break;
      }

      default:
        // Unhandled event types are fine to ignore.
        break;
    }
  } catch (err) {
    console.error(`[stripe] ${event.type} failed`, err);
    return NextResponse.json({ error: "Write failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
