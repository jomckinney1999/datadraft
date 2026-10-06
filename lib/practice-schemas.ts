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
 *   plays  — REAL nflverse play-by-play, every snap of the 2025 regular
 *            season (2026-10-05). Rows fetched by lib/plays-dataset.ts.
 *   app    — Benchwarmer, an INVENTED fantasy football app's event log
 *            (2026-10-05), for product analytics. Rows fetched by
 *            lib/app-dataset.ts.
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

export const PLAYS_SCHEMA: { table: string; columns: string[] }[] = [
  {
    table: "plays",
    columns: [
      "game_id", "play_id", "week", "posteam", "defteam", "drive", "qtr",
      "game_seconds_remaining", "down", "ydstogo", "yardline_100",
      "score_differential", "play_type", "shotgun", "passer", "rusher",
      "receiver", "air_yards", "complete_pass", "yards_gained", "first_down",
      "touchdown", "td_team", "interception", "sack", "fumble_lost",
      "field_goal_result", "kick_distance", "epa",
    ],
  },
];
export const PLAYS_TABLES = PLAYS_SCHEMA.map((t) => t.table);

export const APP_SCHEMA: { table: string; columns: string[] }[] = [
  { table: "users", columns: ["user_id", "signup_date", "platform", "channel"] },
  { table: "events", columns: ["user_id", "event_time", "event_name", "platform"] },
  { table: "subscriptions", columns: ["user_id", "plan", "started", "ended", "monthly_price"] },
];
export const APP_TABLES = APP_SCHEMA.map((t) => t.table);

/** Schemas beyond the league, for the question bank's schema panel. */
export const EXTRA_SCHEMA = [...SHOP_SCHEMA, ...PLAYS_SCHEMA, ...APP_SCHEMA];

const INVENTED =
  "Invented. Gridiron Goods is a made-up online fan store, built so you can practise on a schema that isn't the league, the way a real screen hands you one.";

export const SHOP_PROVENANCE: TableProvenance[] = [
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

export const PLAYS_PROVENANCE: TableProvenance = {
  table: "plays",
  kind: "real",
  label: "real",
  note: "Real. nflverse's play-by-play for the 2025 regular season: one row per pass, run, punt and field goal (kickoffs, extra points, kneels, spikes and two-point tries left out). posteam is the offense and defteam the defense; yardline_100 is yards from the opponent's end zone; score_differential is the offense's score minus the defense's before the snap; first_down includes touchdowns; names are written the way the play-by-play writes them (J.Goff). epa is nflverse's expected points model, an estimate rather than a recorded stat. game_id matches the games table.",
};

const APP_INVENTED =
  "Invented. Benchwarmer is a made-up fantasy football app, built so you can practise the product-analytics questions screens ask (daily actives, retention, funnels, sessions, revenue).";

export const APP_PROVENANCE: TableProvenance[] = [
  {
    table: "users",
    kind: "invented",
    label: "invented",
    note: `${APP_INVENTED} One row per user who signed up between August and November 2025: the platform they signed up on (ios, android or web) and the channel that brought them (organic, paid_social, referral, search or podcast).`,
  },
  {
    table: "events",
    kind: "invented",
    label: "invented",
    note: `${APP_INVENTED} One row per thing a user did, through 2025-12-31: signup, app_open, join_league, view_player, set_lineup, send_message, claim_waiver, make_trade, upgrade, cancel. event_time is 'YYYY-MM-DD HH:MM:SS'. About 1% of rows are exact duplicates, the way a retrying app logs them.`,
  },
  {
    table: "subscriptions",
    kind: "invented",
    label: "invented",
    note: `${APP_INVENTED} One row per user who upgraded to Pro: when it started, when it ended (NULL while it's active), and the monthly price, which went from 4.99 to 5.99 for subscriptions started on or after 2025-10-01.`,
  },
];

/** Every table beyond the league, with its label. */
export const EXTRA_PROVENANCE: TableProvenance[] = [...SHOP_PROVENANCE, PLAYS_PROVENANCE, ...APP_PROVENANCE];

/** The credit line under a store question's tables, in place of the nflverse one. */
export const SHOP_CREDIT = "Invented data: Gridiron Goods is a made-up store";

/** The credit line under an app question's tables. */
export const APP_CREDIT = "Invented data: Benchwarmer is a made-up app";

/** The app as CSVs (written by scripts/build-app-dataset.mjs). */
export const APP_DOWNLOADS = APP_SCHEMA.map((t) => ({
  file: `/data/practice-app/${t.table}.csv`,
  label: `${t.table}.csv`,
}));

/** The store as CSVs (written by scripts/build-shop-dataset.mjs). */
export const SHOP_DOWNLOADS = SHOP_SCHEMA.map((t) => ({
  file: `/data/practice-store/${t.table}.csv`,
  label: `${t.table}.csv`,
}));

export function usesShop(tables: string[]): boolean {
  return tables.some((t) => SHOP_TABLES.includes(t));
}

export function usesApp(tables: string[]): boolean {
  return tables.some((t) => APP_TABLES.includes(t));
}

/**
 * The credit under a question's tables when every table it uses is invented,
 * or null when it touches real data (which is credited to nflverse).
 */
export function inventedCredit(tables: string[]): { text: string; href: string } | null {
  if (tables.length === 0 || !tables.every((t) => SHOP_TABLES.includes(t) || APP_TABLES.includes(t))) return null;
  return usesApp(tables)
    ? { text: APP_CREDIT, href: "/data#practice-app" }
    : { text: SHOP_CREDIT, href: "/data#practice-store" };
}

/** Rows that are fetched rather than bundled; a timed screen leaves these out. */
export function needsDownload(tables: string[]): boolean {
  return usesPlays(tables) || usesApp(tables);
}

/** A question on the play-by-play, which is fetched (~0.8 MB) only for it. */
export function usesPlays(tables: string[]): boolean {
  return tables.some((t) => PLAYS_TABLES.includes(t));
}

/** The databases a question can run on, for the bank's Data filter. */
export type DatasetId = "league" | "plays" | "store" | "app";
export const DATASETS: { id: DatasetId; label: string; invented: boolean; href: string }[] = [
  { id: "league", label: "League", invented: false, href: "/data" },
  { id: "plays", label: "Play-by-play", invented: false, href: "/data" },
  { id: "store", label: "Store", invented: true, href: "/data#practice-store" },
  { id: "app", label: "App", invented: true, href: "/data#practice-app" },
];

/** Which database a question runs on. Python, R and Excel are all league data. */
export function datasetOf(tables: string[]): DatasetId {
  if (usesApp(tables)) return "app";
  if (usesPlays(tables)) return "plays";
  if (usesShop(tables)) return "store";
  return "league";
}

/** A question on the league data only (the home page and lessons can run it). */
export function isLeagueOnly(tables: string[]): boolean {
  return tables.every((t) => LEAGUE_TABLES.includes(t));
}
