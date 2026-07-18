import Stripe from "stripe";

let stripeClient: Stripe | null = null;

// Lazy singleton — avoids instantiating (and throwing on a missing key)
// at module load time, which would break the build/every route that merely
// imports this file before STRIPE_SECRET_KEY is configured.
export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-06-24.dahlia",
    });
  }
  return stripeClient;
}
