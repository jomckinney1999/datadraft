// One-time setup: creates the Season Pass product and its three prices in
// Stripe (docs/OFFER.md): $19.99 a month, $119 a year, and the founding
// $79 a year. Test mode or live mode depends on the key in .env.local.
//
// Usage:
//   1. Put STRIPE_SECRET_KEY in .env.local.
//   2. node --env-file=.env.local scripts/setup-stripe-products.mjs
//   3. Copy the three STRIPE_PRICE_* lines it prints into .env.local and the
//      Vercel project's environment variables.
//
// Safe to re-run: it finds the product and prices by lookup key instead of
// making duplicates. Founding members are on their own price, so when list
// prices rise they keep theirs by construction (that's the promise).
//
// Keep the amounts in step with PASS_PLANS in lib/season-pass.ts.

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set. Add it to .env.local first.");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });

const PRICES = [
  { env: "STRIPE_PRICE_MONTHLY", lookup: "season_pass_monthly", cents: 1999, interval: "month", nickname: "Season Pass, monthly" },
  { env: "STRIPE_PRICE_ANNUAL", lookup: "season_pass_annual", cents: 11900, interval: "year", nickname: "Season Pass, yearly" },
  { env: "STRIPE_PRICE_FOUNDING", lookup: "season_pass_founding", cents: 7900, interval: "year", nickname: "Season Pass, founding (yearly)" },
];

async function main() {
  const found = await stripe.products.search({ query: `metadata["datadraft"]:"season-pass" AND active:"true"` });
  let product = found.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: "DataDraft Season Pass",
      description:
        "The whole question bank with solutions, Query Doctor on every miss, timed mock SQL screens, and every course with no daily limit.",
      metadata: { datadraft: "season-pass" },
    });
    console.log(`Created product: ${product.id}`);
  } else {
    console.log(`Found product: ${product.id}`);
  }

  const lines = [];
  for (const p of PRICES) {
    const existing = await stripe.prices.list({ lookup_keys: [p.lookup], active: true });
    let price = existing.data[0];
    if (price && (price.unit_amount !== p.cents || price.recurring?.interval !== p.interval)) {
      console.error(`${p.lookup} exists at a different amount; archive it in Stripe before re-running.`);
      process.exit(1);
    }
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.cents,
        currency: "usd",
        recurring: { interval: p.interval },
        lookup_key: p.lookup,
        nickname: p.nickname,
      });
      console.log(`Created ${p.nickname}: ${price.id}`);
    } else {
      console.log(`Found ${p.nickname}: ${price.id}`);
    }
    lines.push(`${p.env}=${price.id}`);
  }

  console.log(`\nAdd to .env.local and to Vercel:\n${lines.join("\n")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
