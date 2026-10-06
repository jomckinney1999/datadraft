// Builds lib/shop-data.generated.ts: Gridiron Goods, an invented online
// fan store, the first schema in the question bank that isn't the league.
//
//   node scripts/build-shop-dataset.mjs
//
// Why invented: real screens hand you a schema you've never seen, and the
// classic one is a store (customers, products, orders, order items). There's
// no real store's data we could publish, so this one is made up and labelled
// that way everywhere it appears. Deterministic: a fixed seed, so the file is
// the same every run and the answer keys stay put. Run it only to change the
// store on purpose, then run verify-answer-keys.mjs.
//
// The mess is deliberate, because it's what the questions test:
//   - jersey prices rose on 2025-08-01, so revenue has to use the price on
//     the order line (order_items.unit_price), not today's products.price;
//   - team-less products (gift cards, trophies) have a NULL team;
//   - some customers never ordered, some have no state, some no favorite team;
//   - orders are delivered, shipped, cancelled or returned, and a cancelled
//     order isn't revenue;
//   - sales spike in September and December, the way a fan store's do.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20251005);
const pick = (xs) => xs[Math.floor(rand() * xs.length)];
function weighted(pairs) {
  const total = pairs.reduce((a, [, w]) => a + w, 0);
  let r = rand() * total;
  for (const [v, w] of pairs) {
    if ((r -= w) <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
}
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const day = (s) => new Date(`${s}T00:00:00Z`);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

const FIRST = ["Alex", "Jordan", "Taylor", "Casey", "Riley", "Morgan", "Jamie", "Avery", "Quinn", "Drew", "Sam", "Robin", "Jesse", "Devon", "Kai", "Reese", "Rowan", "Skyler", "Maria", "Luis", "Aisha", "Ken", "Priya", "Omar", "Lena", "Mateo", "Nina", "Theo", "Grace", "Ivan", "Zoe", "Elena", "Tariq", "Hana", "Diego", "Ruth", "Owen", "Mina", "Felix", "Iris"];
const LAST = ["Smith", "Lee", "Garcia", "Brown", "Davis", "Martinez", "Wilson", "Anderson", "Moore", "Martin", "White", "Lopez", "Harris", "Clark", "Lewis", "Walker", "Hall", "Young", "King", "Wright", "Scott", "Green", "Baker", "Nelson", "Hill", "Campbell", "Mitchell", "Roberts", "Phillips", "Evans", "Turner", "Torres", "Parker", "Collins", "Reyes", "Patel", "Kim", "Nguyen", "Okafor", "Silva"];
const STATES = [["CA", 12], ["TX", 10], ["FL", 8], ["NY", 7], ["PA", 5], ["OH", 5], ["IL", 5], ["MI", 4], ["GA", 4], ["NC", 4], ["NJ", 3], ["VA", 3], ["WA", 3], ["MO", 3], ["MN", 3], ["WI", 3], ["MA", 3], ["AZ", 3], ["CO", 3], ["TN", 3]];
const TEAMS = ["KC", "BUF", "PHI", "DET", "SF", "BAL", "DAL", "GB", "CIN", "MIA", "MIN", "PIT"];
const REFERRALS = [["search", 30], ["social", 28], ["friend", 18], ["podcast", 12], [null, 12]];

// ── Products ─────────────────────────────────────────────────────────
// [product_id, name, category, team, price (current)]
const products = [];
let pid = 1;
for (const team of TEAMS.slice(0, 8)) {
  products.push([pid++, `${team} home jersey`, "jersey", team, 119.99]);
  products.push([pid++, `${team} hoodie`, "apparel", team, 64.99]);
  products.push([pid++, `${team} cap`, "headwear", team, 29.99]);
}
for (const [name, category, price] of [
  ["League champion mug", "drinkware", 16.99],
  ["Draft night poster", "decor", 19.99],
  ["League trophy, small", "trophies", 39.99],
  ["League trophy, large", "trophies", 89.99],
  ["Gift card, $25", "gift_card", 25.0],
  ["Gift card, $50", "gift_card", 50.0],
  ["Sideline beanie", "headwear", 24.99],
  ["Rain poncho", "accessories", 9.99],
]) {
  products.push([pid++, name, category, null, price]);
}
const JERSEY_RAISE = "2025-08-01";
const priceOn = (p, date) => (p[2] === "jersey" && date < JERSEY_RAISE ? 109.99 : p[4]);

// ── Customers ────────────────────────────────────────────────────────
// [customer_id, name, state, signup_date, favorite_team, referral]
const customers = [];
const SIGNUP_FROM = day("2024-03-01");
for (let id = 1; id <= 520; id++) {
  // More sign-ups at the start of the season.
  let offset;
  do {
    offset = Math.floor(rand() * 640);
  } while (rand() > (addDays(SIGNUP_FROM, offset).getUTCMonth() + 1 >= 8 && addDays(SIGNUP_FROM, offset).getUTCMonth() + 1 <= 9 ? 1 : 0.55));
  const signup = iso(addDays(SIGNUP_FROM, offset));
  customers.push([
    id,
    `${pick(FIRST)} ${pick(LAST)}`,
    rand() < 0.04 ? null : weighted(STATES),
    signup,
    rand() < 0.15 ? null : pick(TEAMS),
    weighted(REFERRALS),
  ]);
}

// ── Orders and items ─────────────────────────────────────────────────
const MONTH_WEIGHT = [6, 9, 3, 3, 3, 3, 4, 8, 12, 10, 12, 16];
const draft = [];
for (const c of customers) {
  const n = weighted([[0, 12], [1, 35], [2, 20], [3, 12], [4, 7], [5, 5], [6, 3], [8, 4], [11, 2]]);
  for (let k = 0; k < n; k++) {
    let date = null;
    for (let tries = 0; tries < 12 && !date; tries++) {
      const month = weighted(MONTH_WEIGHT.map((w, i) => [i, w]));
      const dim = new Date(Date.UTC(2025, month + 1, 0)).getUTCDate();
      const d = iso(new Date(Date.UTC(2025, month, 1 + Math.floor(rand() * dim))));
      if (d >= c[3]) date = d;
    }
    if (date) draft.push({ customer: c, date });
  }
}
draft.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.customer[0] - b.customer[0]));

const orders = [];
const items = [];
const firstOrder = new Set();
let oid = 1001;
for (const o of draft) {
  const c = o.customer;
  const isFirst = !firstOrder.has(c[0]);
  firstOrder.add(c[0]);
  let status;
  if (o.date >= "2025-12-24") status = rand() < 0.7 ? "shipped" : "delivered";
  else status = weighted([["delivered", 87], ["returned", 7], ["cancelled", 6]]);
  const channel = rand() < 0.4 ? "app" : "web";
  let code = null;
  if (o.date >= "2025-09-01" && o.date <= "2025-09-14" && rand() < 0.35) code = "KICKOFF10";
  else if (o.date >= "2025-11-28" && o.date <= "2025-12-01" && rand() < 0.5) code = "BLACKFRIDAY20";
  else if (o.date >= "2025-12-02" && rand() < 0.15) code = "GIFT15";
  else if (isFirst && rand() < 0.2) code = "WELCOME5";

  const lines = weighted([[1, 55], [2, 30], [3, 10], [4, 5]]);
  const chosen = new Set();
  let subtotal = 0;
  const orderLines = [];
  for (let i = 0; i < lines; i++) {
    let p;
    for (let tries = 0; tries < 10; tries++) {
      const teamItems = c[4] ? products.filter((x) => x[3] === c[4]) : [];
      p = teamItems.length && rand() < 0.6 ? pick(teamItems) : pick(products);
      if (!chosen.has(p[0])) break;
    }
    if (chosen.has(p[0])) continue;
    chosen.add(p[0]);
    const qty = weighted([[1, 85], [2, 12], [3, 3]]);
    const unit = priceOn(p, o.date);
    subtotal += qty * unit;
    orderLines.push([oid, p[0], qty, unit]);
  }
  const shipping = subtotal >= 75 ? 0 : 6.99;
  orders.push([oid, c[0], o.date, status, channel, code, shipping]);
  items.push(...orderLines);
  oid++;
}

const json = (rows) => rows.map((r) => `  ${JSON.stringify(r)},`).join("\n");
const out = `// GENERATED by scripts/build-shop-dataset.mjs — do not edit by hand.
//
// Gridiron Goods: an INVENTED online fan store, for interview-style SQL on a
// schema that isn't the league. Not real customers, orders or sales. Seeded,
// so it's identical every build. See the builder for the deliberate mess.

/** [product_id, name, category, team (NULL when it isn't a team item), price today] */
export const SHOP_PRODUCTS: [number, string, string, string | null, number][] = [
${json(products)}
];

/** [customer_id, name, state, signup_date, favorite_team, referral] */
export const SHOP_CUSTOMERS: [number, string, string | null, string, string | null, string | null][] = [
${json(customers)}
];

/** [order_id, customer_id, order_date, status, channel, discount_code, shipping] */
export const SHOP_ORDERS: [number, number, string, string, string, string | null, number][] = [
${json(orders)}
];

/** [order_id, product_id, quantity, unit_price (the price on the day of the order)] */
export const SHOP_ORDER_ITEMS: [number, number, number, number][] = [
${json(items)}
];
`;
writeFileSync(path.join(root, "lib/shop-data.generated.ts"), out);

// The same rows as CSV, for /data's downloads. NULL is an empty field, which
// is how a CSV says it and how pandas, Excel and every database read it back.
const cell = (v) => {
  if (v === null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (header, rows) => [header, ...rows].map((r) => r.map(cell).join(",")).join("\n") + "\n";
const dir = path.join(root, "public/data/practice-store");
mkdirSync(dir, { recursive: true });
writeFileSync(path.join(dir, "customers.csv"), csv(["customer_id", "name", "state", "signup_date", "favorite_team", "referral"], customers));
writeFileSync(path.join(dir, "products.csv"), csv(["product_id", "name", "category", "team", "price"], products));
writeFileSync(path.join(dir, "orders.csv"), csv(["order_id", "customer_id", "order_date", "status", "channel", "discount_code", "shipping"], orders));
writeFileSync(path.join(dir, "order_items.csv"), csv(["order_id", "product_id", "quantity", "unit_price"], items));
console.log(`products ${products.length}, customers ${customers.length}, orders ${orders.length}, items ${items.length}, ${(out.length / 1024).toFixed(0)} KB`);
