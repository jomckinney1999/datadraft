// One-time setup script: creates the Practice tier subscription product in
// Stripe (test mode by default — uses whatever key is in .env.local).
//
// Usage:
//   1. Add your real STRIPE_SECRET_KEY to .env.local first.
//   2. node --env-file=.env.local scripts/setup-stripe-products.mjs
//
// Prints the price ID to paste into NEXT_PUBLIC_STRIPE_PRACTICE_PRICE_ID.
// Safe to re-run — checks for an existing product by name before creating.

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set. Add it to .env.local first.");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });

async function main() {
  const existing = await stripe.products.search({
    query: `name:"SQL Sports — Practice" AND active:"true"`,
  });

  let product = existing.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: "SQL Sports — Practice",
      description:
        "Unlimited sandbox access, ongoing weekly problem sets, live season datasets.",
    });
    console.log(`Created product: ${product.id}`);
  } else {
    console.log(`Found existing product: ${product.id}`);
  }

  const prices = await stripe.prices.list({ product: product.id, active: true });
  let price = prices.data.find(
    (p) => p.recurring?.interval === "month" && p.unit_amount === 2000,
  );

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: 2000, // $20.00 — midpoint of the $15-30/mo range in docs/PLAN.md
      currency: "usd",
      recurring: { interval: "month" },
    });
    console.log(`Created price: ${price.id}`);
  } else {
    console.log(`Found existing price: ${price.id}`);
  }

  console.log(`\nSet this in .env.local:\nNEXT_PUBLIC_STRIPE_PRACTICE_PRICE_ID=${price.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
