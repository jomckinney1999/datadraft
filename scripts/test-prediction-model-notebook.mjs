/**
 * Runs every code cell of notebooks/fantasy-points-model.ipynb, in order, in
 * Pyodide — the same pandas / scikit-learn / matplotlib a Colab session has —
 * against the real nflverse files, and fails if a cell errors or the model
 * does not beat the last-3-game baseline.
 *
 * The notebook reads its data from GitHub release URLs. Pyodide under Node
 * has no sockets, so this downloads the same files with Node's fetch, drops
 * them into Pyodide's filesystem, and points pandas.read_csv at the local
 * copies for those URLs only. Nothing else about the notebook changes.
 *
 * Usage: node scripts/test-prediction-model-notebook.mjs   (a few minutes)
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { loadPyodide } from "pyodide";

const root = process.cwd();
const nb = JSON.parse(readFileSync(path.join(root, "notebooks/fantasy-points-model.ipynb"), "utf8"));
const cells = nb.cells.filter((c) => c.cell_type === "code").map((c) => c.source.join(""));

const py = await loadPyodide();
await py.loadPackage(["pandas", "scikit-learn", "matplotlib"]);
py.FS.mkdirTree("/data");

const BASE = "https://github.com/nflverse/nflverse-data/releases/download";
const thisYear = new Date().getFullYear();
for (let season = 2021; season <= thisYear + 1; season++) {
  const res = await fetch(`${BASE}/stats_player/stats_player_week_${season}.csv`);
  if (!res.ok) {
    console.log(`${season}: ${res.status} (not published) — the notebook should skip it`);
    continue;
  }
  const text = await res.text();
  py.FS.writeFile(`/data/stats_player_week_${season}.csv`, text);
  console.log(`${season}: ${(text.length / 1e6).toFixed(1)} MB`);
}
const sched = await fetch(`${BASE}/schedules/games.csv`);
py.FS.writeFile("/data/games.csv", await sched.text());

await py.runPythonAsync(`
import os
import pandas as pd
import matplotlib
matplotlib.use("Agg")

_read_csv = pd.read_csv
def _local(path, *args, **kwargs):
    if isinstance(path, str) and path.startswith("https://github.com/nflverse/"):
        local = "/data/" + path.rsplit("/", 1)[-1]
        if not os.path.exists(local):
            raise FileNotFoundError(path)
        path = local
    return _read_csv(path, *args, **kwargs)
pd.read_csv = _local
`);

let out = "";
py.setStdout({ batched: (t) => (out += t + "\n") });
py.setStderr({ batched: (t) => (out += t + "\n") });

for (const [i, src] of cells.entries()) {
  out = "";
  const t0 = Date.now();
  try {
    await py.runPythonAsync(src);
  } catch (e) {
    console.log(`\n── cell ${i + 1} FAILED ──\n${out}\n${String(e).split("\n").slice(-6).join("\n")}`);
    process.exit(1);
  }
  console.log(`\n── cell ${i + 1} ok (${((Date.now() - t0) / 1000).toFixed(1)}s) ──\n${out.trim()}`);
}

const baseline = py.globals.get("baseline_mae");
const model = py.globals.get("model_mae");
if (!(model < baseline)) {
  console.log(`\nFAIL: model MAE ${model} does not beat baseline ${baseline}`);
  process.exit(1);
}
console.log(`\nAll ${cells.length} code cells ran. Model ${model.toFixed(2)} beats baseline ${baseline.toFixed(2)}.`);
