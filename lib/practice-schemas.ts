/**
 * The shape and the honesty labels of every schema the question bank can
 * use, with no data in it, so a page can know which tables a question needs
 * (and what to call them) without bundling the rows. The rows and the seed
 * builders live in lib/practice-datasets.ts and lib/fantasy-data.ts.
 *
 *   league — week_results, games, rosters, waiver_wire: the real NFL data
 *            every lesson uses (lib/fantasy-data.ts).
 *   shop   — Gridiron Goods, an INVENTED online fan store (2026-10-05): the
 *            classic interview schema, so the bank stops being one dataset.
 */

import type { TableProvenance } from "@/lib/data-source";

export const LEAGUE_TABLES = ["week_results", "games", "rosters", "waiver_wire"];

export const SHOP_SCHEMA: { table: string; columns: string[] }[] = [
  { table: "customers", columns: ["customer_id", "name", "state", "signup_date", "favorite_team", "referral"] },
  { table: "products", columns: ["product_id", "name", "category", "team", "price"] },
  { table: "orders", columns: ["order_id", "customer_id", "order_date", "status", "channel", "discount_code", "shipping"] },
  { table: "order_items", columns: ["order_id", "product_id", "quantity", "unit_price"] },
];
export const SHOP_TABLES = SHOP_SCHEMA.map((t) => t.table);

/** Schemas beyond the league, for the question bank's schema panel. */
export const EXTRA_SCHEMA = [...SHOP_SCHEMA];

const INVENTED =
  "Invented. Gridiron Goods is a made-up online fan store, built so you can practise on a schema that isn't the league, the way a real screen hands you one.";

export const EXTRA_PROVENANCE: TableProvenance[] = [
  {
    table: "customers",
    kind: "invented",
    label: "invented",
    note: `${INVENTED} One row per customer: where they live (sometimes missing), when they signed up, their favourite team (sometimes missing) and how they heard about the store.`,
  },
  {
    table: "products",
    kind: "invented",
    label: "invented",
    note: `${INVENTED} One row per product. price is today's price; gift cards and trophies have no team, so team is NULL for them.`,
  },
  {
    table: "orders",
    kind: "invented",
    label: "invented",
    note: `${INVENTED} One row per order in 2025: who placed it, when, its status (delivered, shipped, cancelled or returned), web or app, any discount code, and the shipping charged.`,
  },
  {
    table: "order_items",
    kind: "invented",
    label: "invented",
    note: `${INVENTED} One row per product on an order. unit_price is what was charged that day, which isn't always today's price: jerseys went up on 2025-08-01.`,
  },
];

/** The credit line under a store question's tables, in place of the nflverse one. */
export const SHOP_CREDIT = "Invented data: Gridiron Goods is a made-up store";

/** The store as CSVs (written by scripts/build-shop-dataset.mjs). */
export const SHOP_DOWNLOADS = SHOP_SCHEMA.map((t) => ({
  file: `/data/practice-store/${t.table}.csv`,
  label: `${t.table}.csv`,
}));

export function usesShop(tables: string[]): boolean {
  return tables.some((t) => SHOP_TABLES.includes(t));
}

/** A question on the league data only (the home page and lessons can run it). */
export function isLeagueOnly(tables: string[]): boolean {
  return tables.every((t) => LEAGUE_TABLES.includes(t));
}
