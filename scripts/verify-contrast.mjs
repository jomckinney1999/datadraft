#!/usr/bin/env node
/**
 * Measure the shipped palette against WCAG AA, in both themes.
 *
 * CLAUDE.md has said "every token pair clears 4.5:1 in both themes —
 * re-measure if you change them" since light mode landed, but re-measuring was
 * a manual job nobody was going to redo. This reads the real values out of
 * app/globals.css so the rule is checked rather than remembered.
 *
 * The pairings are the ones that actually occur in the UI, including the
 * tightest one: accent-coloured text sitting on a chip of its own accent at
 * 10% over a panel, which is a good deal harder than accent-on-background and
 * is what the light-mode accents were originally calibrated against.
 *
 *   node scripts/verify-contrast.mjs
 */
import { readFileSync } from "node:fs";

const CSS = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

/** Pull the "r g b" triplets out of one :root block. */
function themeTokens(startMarker) {
  const from = CSS.indexOf(startMarker);
  if (from === -1) throw new Error(`block not found: ${startMarker}`);
  const body = CSS.slice(from, CSS.indexOf("}", from));
  const out = {};
  for (const [, name, triplet] of body.matchAll(
    /(--c-[\w-]+):\s*(\d+\s+\d+\s+\d+)\s*;/g
  )) {
    out[name] = triplet.split(/\s+/).map(Number);
  }
  return out;
}

const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const over = (fg, bg, a) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));

const AA = 4.5;
const TEXT = ["--c-ink", "--c-ink-soft", "--c-ink-muted"];
const ACCENTS = ["--c-turf", "--c-gold", "--c-ice"];
const SYNTAX = [
  "--c-syn-keyword",
  "--c-syn-string",
  "--c-syn-number",
  "--c-syn-func",
  "--c-syn-comment",
  "--c-syn-punct",
];

function check(label, marker) {
  const t = themeTokens(marker);
  const night = t["--c-night"];
  const panel = t["--c-panel"];
  const rows = [];

  const add = (what, fg, bg) => rows.push([what, ratio(fg, bg)]);

  for (const k of [...TEXT, ...ACCENTS]) {
    add(`${k} on night`, t[k], night);
    add(`${k} on panel`, t[k], panel);
  }
  // Syntax colours are read against the editor's own surface.
  for (const k of SYNTAX) add(`${k} on panel`, t[k], panel);
  // Accent text on a chip of its own accent — the tightest real pairing.
  for (const k of ACCENTS) add(`${k} on ${k}/10 chip`, t[k], over(t[k], panel, 0.1));
  // Solid accent buttons carry night-coloured text.
  for (const k of ACCENTS) add(`night on ${k} fill`, night, t[k]);

  const failed = rows.filter(([, r]) => r < AA);
  console.log(`\n${label}`);
  const worst = [...rows].sort((a, b) => a[1] - b[1]).slice(0, 3);
  for (const [what, r] of worst) {
    console.log(`  tightest: ${what.padEnd(34)} ${r.toFixed(2)}`);
  }
  for (const [what, r] of failed) {
    console.log(`  FAIL      ${what.padEnd(34)} ${r.toFixed(2)}  (needs ${AA})`);
  }
  console.log(`  ${rows.length} pairings checked, ${failed.length} below AA`);
  return failed.length;
}

const bad =
  check("dark", ':root,\n:root[data-theme="dark"]') +
  check("light", ':root[data-theme="light"] {');

if (bad) {
  console.error(`\n${bad} pairing(s) below WCAG AA 4.5:1.`);
  process.exit(1);
}
console.log("\nAll pairings clear WCAG AA 4.5:1 in both themes.");
