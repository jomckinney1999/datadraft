/**
 * The rows and seed SQL for the schemas beyond the league (their shapes and
 * labels are in lib/practice-schemas.ts, which carries no data).
 *
 * The Oct 5 audit's main content gap: every question in the bank used the
 * same twenty players and four tables, while a real screen hands you a
 * schema you've never seen. These seed the other schemas wherever questions
 * run: the question page (only when its question needs them), the mock
 * screens and the Analyst Screen. Lessons never load them: the courses teach
 * on the league, and a lesson that says "our league keeps three sheets"
 * shouldn't find seven.
 */

import {
  SHOP_CUSTOMERS,
  SHOP_ORDER_ITEMS,
  SHOP_ORDERS,
  SHOP_PRODUCTS,
} from "@/lib/shop-data.generated";

const q = (v: string | number | null) =>
  v === null ? "NULL" : typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`;

function inserts(table: string, rows: (string | number | null)[][]): string {
  const out: string[] = [];
  // Batched so one statement never grows past SQLite's limits.
  for (let i = 0; i < rows.length; i += 400) {
    out.push(`INSERT INTO ${table} VALUES ${rows.slice(i, i + 400).map((r) => `(${r.map(q).join(", ")})`).join(", ")};`);
  }
  return out.join("\n");
}

/** CREATE + INSERT for Gridiron Goods. Run after the league seed, in the same database. */
export function buildShopSeedSql(): string {
  return [
    "CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL, state TEXT, signup_date TEXT NOT NULL, favorite_team TEXT, referral TEXT);",
    "CREATE TABLE products (product_id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, team TEXT, price REAL NOT NULL);",
    "CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, order_date TEXT NOT NULL, status TEXT NOT NULL, channel TEXT NOT NULL, discount_code TEXT, shipping REAL NOT NULL);",
    "CREATE TABLE order_items (order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, unit_price REAL NOT NULL);",
    inserts("customers", SHOP_CUSTOMERS),
    inserts("products", SHOP_PRODUCTS),
    inserts("orders", SHOP_ORDERS),
    inserts("order_items", SHOP_ORDER_ITEMS),
  ].join("\n");
}
