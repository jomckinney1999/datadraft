// Builds public/practice/benchwarmer-2025.json: Benchwarmer, an INVENTED
// fantasy football app, for the product-analytics questions every analyst
// screen asks (daily actives, retention, funnels, sessions, MRR).
//
//   node scripts/build-app-dataset.mjs
//
// Invented because no real app's event log could be published, and labelled
// that way everywhere it appears. Deterministic: a fixed seed, so the file is
// the same every run and the answer keys stay put. Run it only to change the
// app on purpose, then run verify-answer-keys.mjs.
//
// The shape is the one real product data has, on purpose:
//   - users sign up in a draft-season rush (late August, early September),
//     then a long tail through November;
//   - activity spikes on Sundays (games) and Wednesdays (waivers), fades with
//     time since signup, and stops when a user quits;
//   - referral users stick around best and paid-social users worst, so
//     "which channel is worth paying for" has an answer;
//   - the funnel leaks: signup → join_league → set_lineup → upgrade;
//   - Pro went from 4.99 to 5.99 a month on 2025-10-01, for new subscribers;
//   - about 1% of events arrive twice (a client retrying), exactly duplicated.

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
const rand = mulberry32(20251006);
const chance = (p) => rand() < p;
const between = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
function weighted(pairs) {
  const total = pairs.reduce((a, [, w]) => a + w, 0);
  let r = rand() * total;
  for (const [v, w] of pairs) {
    if ((r -= w) <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
}
const pad = (n) => String(n).padStart(2, "0");
const DAY = 86400;
const EPOCH = Date.UTC(2025, 0, 1) / 1000; // seconds
const dayNum = (s) => Math.round((Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 1000 - EPOCH) / DAY);
function stamp(dayIdx, secs) {
  const d = new Date((EPOCH + dayIdx * DAY + secs) * 1000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}
const dateOf = (dayIdx) => stamp(dayIdx, 0).slice(0, 10);
const weekday = (dayIdx) => new Date((EPOCH + dayIdx * DAY) * 1000).getUTCDay(); // 0 = Sunday

const FIRST_DAY = dayNum("2025-08-01");
const LAST_SIGNUP = dayNum("2025-11-30");
const LAST_DAY = dayNum("2025-12-31");
const PRICE_RISE = dayNum("2025-10-01");
const N_USERS = 420;

// ── Users ───────────────────────────────────────────────────────────
// [user_id, signup_date, platform, channel]
const CHANNELS = [["organic", 34], ["paid_social", 26], ["referral", 18], ["search", 16], ["podcast", 6]];
const PLATFORMS = [["ios", 50], ["android", 35], ["web", 15]];
// How much each channel's users stick around (multiplies daily activity).
const CHANNEL_STICK = { organic: 1.0, paid_social: 0.62, referral: 1.35, search: 0.95, podcast: 1.15 };
const LEVELS = [
  // [name, weight, base daily activity, upgrade chance, two-session chance]
  ["heavy", 15, 0.62, 0.42, 0.35],
  ["regular", 35, 0.32, 0.16, 0.15],
  ["casual", 30, 0.13, 0.04, 0.05],
  ["one_and_done", 20, 0, 0, 0],
];

function signupDay() {
  // Draft-season rush: most signups between Aug 15 and Sep 10, then a tail.
  const r = rand();
  if (r < 0.12) return between(FIRST_DAY, dayNum("2025-08-14"));
  if (r < 0.72) return between(dayNum("2025-08-15"), dayNum("2025-09-10"));
  if (r < 0.9) return between(dayNum("2025-09-11"), dayNum("2025-10-15"));
  return between(dayNum("2025-10-16"), LAST_SIGNUP);
}

const WEEKDAY_FACTOR = [1.7, 1.05, 0.95, 1.3, 1.1, 0.6, 0.85]; // Sun..Sat

const users = [];
const events = []; // [user_id, event_time, event_name, platform]
const subscriptions = []; // [user_id, plan, started, ended, monthly_price]

for (let uid = 1; uid <= N_USERS; uid++) {
  const signup = signupDay();
  const platform = weighted(PLATFORMS);
  const channel = weighted(CHANNELS);
  users.push([uid, dateOf(signup), platform, channel]);

  // Paid social brings more one-and-done users; referrals fewer.
  const levelPairs = LEVELS.map(([n, w]) => [n, n === "one_and_done" ? w * (channel === "paid_social" ? 1.8 : channel === "referral" ? 0.5 : 1) : w]);
  const level = weighted(levelPairs);
  const [, , base, upgradeChance, twoSessions] = LEVELS.find(([n]) => n === level);
  const stick = CHANNEL_STICK[channel];
  // The day they stop opening the app (some never do).
  const quit = level === "one_and_done" ? signup + (chance(0.3) ? 1 : 0) : chance(0.45) ? signup + between(5, 90) : LAST_DAY;
  const usesWeb = platform !== "web" && chance(0.18);

  const signupSecs = between(9 * 3600, 23 * 3600);
  events.push([uid, stamp(signup, signupSecs), "signup", platform]);

  // When (if ever) they join a league.
  const joinRoll = rand();
  const joinDay = level === "one_and_done" ? (joinRoll < 0.35 ? signup : null) : joinRoll < 0.72 ? signup : joinRoll < 0.88 ? signup + between(1, 14) : null;
  // When (if ever) they upgrade, and whether they cancel.
  const upgradeDay = joinDay !== null && chance(upgradeChance * (channel === "referral" ? 1.3 : channel === "paid_social" ? 0.7 : 1)) ? Math.max(joinDay, signup) + between(2, 45) : null;
  let cancelDay = null;
  if (upgradeDay !== null && chance(0.35)) cancelDay = upgradeDay + between(20, 80);
  if (cancelDay !== null && cancelDay > LAST_DAY) cancelDay = null;

  let joined = false;
  let lineupSet = false;
  for (let d = signup; d <= Math.min(quit, LAST_DAY); d++) {
    const isSignupDay = d === signup;
    const age = d - signup;
    const decay = Math.max(0.35, 1 - age / 160);
    const season = d > dayNum("2025-12-28") ? 0.35 : 1;
    const p = isSignupDay ? 1 : Math.min(0.97, base * stick * decay * WEEKDAY_FACTOR[weekday(d)] * season);
    const mustAppear = d === joinDay || d === upgradeDay || d === cancelDay;
    if (!mustAppear && !chance(p)) continue;

    const sessions = isSignupDay ? 1 : chance(twoSessions) ? 2 : 1;
    let lastStart = isSignupDay ? signupSecs : -1;
    for (let s = 0; s < sessions; s++) {
      // Evenings mostly; Sunday mornings for lineups before kickoff.
      let start;
      if (isSignupDay && s === 0) start = signupSecs + between(20, 90);
      else {
        const hour = weekday(d) === 0 && chance(0.5) ? between(9, 12) : weighted([[7, 1], [8, 2], [12, 3], [13, 2], [18, 4], [19, 6], [20, 7], [21, 6], [22, 3]]);
        start = hour * 3600 + between(0, 3599);
        if (lastStart >= 0 && start < lastStart + 2 * 3600) start = lastStart + 2 * 3600 + between(0, 3600);
        if (start > 23 * 3600 + 59 * 60) start = 23 * 3600 + between(0, 3000);
      }
      lastStart = start;
      const plat = usesWeb && chance(0.15) ? "web" : platform;
      let t = start;
      if (!(isSignupDay && s === 0)) events.push([uid, stamp(d, t), "app_open", plat]);

      if (!joined && joinDay !== null && d >= joinDay) {
        t += between(30, 240);
        events.push([uid, stamp(d, t), "join_league", plat]);
        joined = true;
      }
      const actions = between(1, level === "heavy" ? 5 : 3);
      for (let a = 0; a < actions; a++) {
        t += between(25, 300);
        const wd = weekday(d);
        const options = [["view_player", 10]];
        if (joined) {
          options.push(["set_lineup", wd === 0 || wd === 6 ? 7 : 2]);
          options.push(["send_message", 3]);
          options.push(["claim_waiver", wd === 2 || wd === 3 ? 4 : 0.3]);
          options.push(["make_trade", 0.4]);
        }
        const name = weighted(options);
        if (name === "set_lineup") lineupSet = true;
        events.push([uid, stamp(d, t), name, plat]);
      }
      if (s === sessions - 1 && d === upgradeDay) {
        t += between(30, 200);
        events.push([uid, stamp(d, t), "upgrade", plat]);
        subscriptions.push([uid, "pro", dateOf(d), null, d >= PRICE_RISE ? 5.99 : 4.99]);
      }
      if (s === sessions - 1 && d === cancelDay) {
        t += between(30, 200);
        events.push([uid, stamp(d, t), "cancel", plat]);
        const sub = subscriptions.find((x) => x[0] === uid);
        if (sub) sub[3] = dateOf(d);
      }
    }
  }
  void lineupSet;
}

// A client that retries: about 1% of events arrive twice, exactly.
const withDupes = [];
for (const e of events) {
  withDupes.push(e);
  if (e[2] !== "signup" && chance(0.01)) withDupes.push([...e]);
}
// Stored in time order, the way an event log is.
withDupes.sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[0] - b[0]));

const out = {
  name: "Benchwarmer",
  invented: true,
  tables: [
    {
      table: "users",
      columns: ["user_id", "signup_date", "platform", "channel"],
      types: ["INTEGER", "TEXT", "TEXT", "TEXT"],
      rows: users,
    },
    {
      table: "events",
      columns: ["user_id", "event_time", "event_name", "platform"],
      types: ["INTEGER", "TEXT", "TEXT", "TEXT"],
      rows: withDupes,
    },
    {
      table: "subscriptions",
      columns: ["user_id", "plan", "started", "ended", "monthly_price"],
      types: ["INTEGER", "TEXT", "TEXT", "TEXT", "REAL"],
      rows: subscriptions,
    },
  ],
};
const dir = path.join(root, "public/practice");
mkdirSync(dir, { recursive: true });
const json = JSON.stringify(out);
writeFileSync(path.join(dir, "benchwarmer-2025.json"), json);

// The same rows as CSV, for /data's downloads. NULL is an empty field.
const cell = (v) => {
  if (v === null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvDir = path.join(root, "public/data/practice-app");
mkdirSync(csvDir, { recursive: true });
for (const t of out.tables) {
  const text = [t.columns, ...t.rows].map((r) => r.map(cell).join(",")).join("\n") + "\n";
  writeFileSync(path.join(csvDir, `${t.table}.csv`), text);
}
console.log(
  `users ${users.length}, events ${withDupes.length} (${withDupes.length - events.length} duplicates), subscriptions ${subscriptions.length} (${subscriptions.filter((s) => s[3]).length} cancelled), ${(json.length / 1024).toFixed(0)} KB`,
);
