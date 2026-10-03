/**
 * Server-only helpers for selling the Season Pass: which Stripe price each
 * plan uses, and how many founding seats are gone. Never import this from a
 * client component; it reaches for the service-role key.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { PassPlan } from "@/lib/season-pass";

/**
 * The Stripe price behind each plan, from the environment
 * (scripts/setup-stripe-products.mjs prints these). Null when unset, so a
 * missing price fails one request clearly instead of the build.
 */
export function priceIdFor(plan: PassPlan): string | null {
  const id =
    plan === "monthly"
      ? process.env.STRIPE_PRICE_MONTHLY
      : plan === "annual"
        ? process.env.STRIPE_PRICE_ANNUAL
        : process.env.STRIPE_PRICE_FOUNDING;
  return id?.trim() || null;
}

/**
 * Founding seats taken: every founding subscription ever written, whatever
 * its status, because a lapsed founding seat isn't re-sold. Zero when the
 * database isn't configured, so the pricing page still renders in
 * development.
 */
export async function foundingTaken(): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http")) return 0;
  try {
    const { count, error } = await createAdminClient()
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("plan", "founding");
    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    console.error("[pass] couldn't count founding seats", err);
    return 0;
  }
}
