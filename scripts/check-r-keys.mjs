// Runs every R question's answer key in a local R, with its own setup
// prelude, and prints what it printed.
//
//   node scripts/check-r-keys.mjs
//
// verify-answer-keys.mjs can't do this: there is no supported Node build of
// WebR, so it skips R keys and says so. This is the manual check to run
// after touching an R question, on a machine with R and dplyr installed
// (RSCRIPT=/path/to/Rscript if it isn't on the PATH). Look at the output, not
// just the exit code: a key that prints the wrong thing passes here too.
// First run (2026-10-05) covered all 12, including the three that had never
// been executed anywhere.

import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadTs } from "./load-ts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const q = await loadTs(path.join(root, "lib/questions.ts"), root);

const windowsDefault = "C:/Program Files/R/R-4.4.2/bin/Rscript.exe";
const rscript = process.env.RSCRIPT ?? (existsSync(windowsDefault) ? windowsDefault : "Rscript");
const dir = mkdtempSync(path.join(tmpdir(), "r-keys-"));

const keys = q.QUESTIONS.filter((x) => x.lang === "r");
let failed = 0;
for (const x of keys) {
  const file = path.join(dir, `${x.id}.R`);
  writeFileSync(file, `${x.setup ?? ""}\n${x.expected}\n`);
  try {
    const out = execFileSync(rscript, [file], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    console.log(`\n## ${x.id}\n${out.trim()}`);
    if (!out.trim()) {
      failed++;
      console.log("  !! printed nothing, so every learner answer would grade wrong");
    }
  } catch (e) {
    failed++;
    console.log(`\n## ${x.id} FAILED\n${String(e.stderr ?? e).slice(0, 400)}`);
  }
}
console.log(`\nR keys run: ${keys.length}, failed: ${failed}`);
process.exit(failed ? 1 : 0);
