/**
 * Smoke-test the real lib/drive-sim.ts rules (not a re-implementation).
 * Run: node scripts/drive-sim-selftest.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTs } from "./load-ts.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sim = await loadTs(join(root, "lib", "drive-sim.ts"), root);

let d = sim.startDrive();
d = sim.applyCorrect(d, 6, "slant");
if (!(d.down === 1 && d.distance === 4 && d.ballOn === 31)) {
  throw new Error(`expected 1st & 4 at 31, got down=${d.down} dist=${d.distance} ball=${d.ballOn}`);
}

d = sim.applyCorrect(d, 4, "chains");
if (!(d.down === 1 && d.distance === 10 && d.ballOn === 35)) {
  throw new Error(`expected first-down reset, got down=${d.down} dist=${d.distance} ball=${d.ballOn}`);
}

d = sim.applyMiss(d, 0, "Incomplete");
if (!(d.down === 2 && d.downsBurned === 1 && d.ballOn === 35)) {
  throw new Error(`expected 2nd & 10 at 35, got down=${d.down} burned=${d.downsBurned}`);
}

d = sim.applyMiss(d, 1, "Incomplete");
d = sim.applyMiss(d, 2, "Incomplete");
d = sim.applyMiss(d, 3, "Incomplete");
if (d.status !== "turnover") {
  throw new Error(`expected turnover, got ${d.status}`);
}

d = sim.startDrive();
d = sim.applyCorrect(d, 80, "bomb");
if (d.status !== "touchdown") {
  throw new Error(`expected touchdown, got ${d.status}`);
}

d = sim.startDrive();
d = sim.applyMiss(d, 2, "Sacked for a loss");
if (!(d.lastPlay?.kind === "sack" && d.down === 2 && d.ballOn < 25)) {
  throw new Error(`expected sack on 2nd, got kind=${d.lastPlay?.kind} down=${d.down} ball=${d.ballOn}`);
}

// Soft path: scoring helpers must not throw
const scored = sim.scoreCorrectPlay(sim.startDrive(), "mc", true, 1, 0);
if (scored.yards < 6) throw new Error("mc should gain at least base yards");
const missed = sim.scoreMissPlay(sim.startDrive(), 0);
if (missed.state.downsBurned !== 1) throw new Error("miss should burn a down");

console.log("drive-sim selftest ok");
