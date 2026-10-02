/**
 * "Chart it": turn a query result into a chart worth posting.
 *
 * Fantasy Twitter runs on charts — a scatter of two stats with the average
 * drawn through each, players labelled, a quadrant you'd rather not be in.
 * Anyone who can write the SELECT can now make one in a click, and the image
 * carries the site's name and the data credit wherever it gets posted.
 *
 * Two halves:
 *   - this file decides what can be drawn (which columns are numbers, which
 *     name a team, which chart a result wants) — pure, no DOM;
 *   - lib/chart-draw.ts paints it onto a canvas at 1600×900, the shape X
 *     shows in full. The preview on screen IS that canvas, so what you see
 *     is byte-for-byte the PNG you download, fonts included.
 *
 * Everything works on the `{ columns, values }` shape sql.js returns, so a
 * question, the Practice Field and a learner's own league all chart the same
 * way.
 */

import { isTeamColumn } from "@/components/team-chip";
import { TEAM_COLORS } from "@/lib/team-colors.generated";

export type Cell = string | number | Uint8Array | null;
export type Grid = { columns: string[]; values: Cell[][] };
export type ChartKind = "bar" | "scatter" | "line";

/** Top-left, top-right, bottom-left, bottom-right. */
export type Quadrants = [string, string, string, string];

export type ChartSpec = {
  kind: ChartKind;
  title: string;
  subtitle: string;
  /** Scatter and line: the x axis. Bar: unused. */
  x: number;
  /** The value: y axis for scatter and line, bar length for bar. */
  y: number;
  /** Names each mark — dot labels, bar categories, one line per value. */
  label: number | null;
  /** A column of team abbreviations, to colour marks in team colours. */
  team: number | null;
  /** Scatter only: captions for the four corners the averages make. */
  quadrants: Quadrants | null;
  /** Bottom-right of the image. Required by CC BY when the data is nflverse. */
  credit: string;
};

export type ColumnInfo = {
  index: number;
  name: string;
  numeric: boolean;
  /** An id, a season, a week: a number, but not a measurement. */
  idLike: boolean;
  /** A week or season — the natural x axis for a line. */
  timeLike: boolean;
  team: boolean;
  distinct: number;
};

const TEAM_ABBRS = new Set(TEAM_COLORS.map((t) => t.abbr));

export const NFLVERSE_CREDIT = "Data: nflverse-data · CC BY 4.0";
export const SLEEPER_CREDIT = "Data: your league, via Sleeper";

export function describeColumns(grid: Grid): ColumnInfo[] {
  return grid.columns.map((name, index) => {
    const vals = grid.values.map((r) => r[index]).filter((v) => v !== null && v !== "");
    const numeric = vals.length > 0 && vals.every((v) => typeof v === "number");
    const lower = name.toLowerCase();
    const timeLike = numeric && /(^|_)(week|wk|season|year)$/.test(lower);
    const idLike = numeric && (timeLike || /(^|_)id$/.test(lower) || lower === "rank");
    const team =
      !numeric &&
      vals.length > 0 &&
      (isTeamColumn(lower) || vals.every((v) => TEAM_ABBRS.has(String(v))));
    return {
      index,
      name,
      numeric,
      idLike,
      timeLike,
      team,
      distinct: new Set(vals.map(String)).size,
    };
  });
}

export type ChartOptions = {
  columns: ColumnInfo[];
  kinds: ChartKind[];
  /** Columns that can be a value. */
  measures: ColumnInfo[];
};

export function chartOptions(grid: Grid): ChartOptions {
  const columns = describeColumns(grid);
  if (grid.values.length < 2) return { columns, kinds: [], measures: [] };
  const numeric = columns.filter((c) => c.numeric);
  const measures = numeric.filter((c) => !c.idLike);
  const kinds: ChartKind[] = [];
  if (numeric.length >= 1) kinds.push("bar");
  if (numeric.length >= 2) kinds.push("scatter");
  if (numeric.some((c) => c.timeLike) && measures.length >= 1) kinds.push("line");
  return { columns, kinds, measures: measures.length ? measures : numeric };
}

/** "points_for" → "Points For"; "ppr" → "PPR". */
export function prettyName(col: string): string {
  const SHOUT = new Set(["ppr", "pf", "pa", "epa", "adp", "qb", "rb", "wr", "te", "yds", "td", "tds", "id"]);
  return col
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      const lw = w.toLowerCase();
      if (lw === "pct") return "%";
      return SHOUT.has(lw) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/**
 * The chart a result most likely wants:
 *   two or more measurements → a scatter of the first two;
 *   a week or season plus a measurement → a line, one per name;
 *   otherwise → ranked bars.
 */
export function suggestSpec(
  grid: Grid,
  base: { title: string; subtitle?: string; credit: string },
): ChartSpec | null {
  const { columns, kinds, measures } = chartOptions(grid);
  if (!kinds.length) return null;
  const text = columns.filter((c) => !c.numeric);
  const label = (text.find((c) => !c.team) ?? text[0])?.index ?? null;
  const team = columns.find((c) => c.team)?.index ?? null;
  const time = columns.find((c) => c.timeLike);
  const spec = {
    title: base.title,
    subtitle: base.subtitle ?? "",
    credit: base.credit,
    label,
    team,
    quadrants: null,
  };

  if (measures.length >= 2) {
    return { ...spec, kind: "scatter", x: measures[0].index, y: measures[1].index };
  }
  if (time && measures.length >= 1 && kinds.includes("line")) {
    // Only worth a line if each name has a run of weeks (or there is one
    // name). A top-ten-games list where one player appears twice is a bar
    // chart, not two-point lines.
    const series = label;
    const runs =
      series === null ||
      grid.values.length / Math.max(1, columns[series].distinct) >= 2;
    if (runs && time.distinct >= 2) {
      return { ...spec, kind: "line", x: time.index, y: measures[0].index };
    }
  }
  const value = measures[0] ?? columns.find((c) => c.numeric);
  if (!value) return null;
  return {
    ...spec,
    kind: "bar",
    x: value.index,
    y: value.index,
    label: label ?? time?.index ?? null,
  };
}

/** Keep a spec valid when the user switches chart type. */
export function respec(spec: ChartSpec, kind: ChartKind, grid: Grid): ChartSpec {
  const { columns, measures } = chartOptions(grid);
  const numeric = columns.filter((c) => c.numeric);
  const isNum = (i: number) => columns[i]?.numeric;
  if (kind === "scatter") {
    const x = isNum(spec.x) && spec.x !== spec.y ? spec.x : (measures[0] ?? numeric[0]).index;
    const y = isNum(spec.y) && spec.y !== x ? spec.y : (measures.find((c) => c.index !== x) ?? numeric.find((c) => c.index !== x) ?? numeric[0]).index;
    return { ...spec, kind, x, y };
  }
  if (kind === "line") {
    const time = columns.find((c) => c.timeLike) ?? numeric[0];
    const y = isNum(spec.y) && spec.y !== time.index ? spec.y : (measures.find((c) => c.index !== time.index) ?? numeric[0]).index;
    return { ...spec, kind, x: time.index, y };
  }
  const y = isNum(spec.y) ? spec.y : (measures[0] ?? numeric[0]).index;
  return { ...spec, kind, x: y, y };
}

export type Mark = {
  label: string;
  x: number;
  y: number;
  team: string | null;
  series: string | null;
};

const num = (v: Cell): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: Cell): string => (v === null ? "" : v instanceof Uint8Array ? "" : String(v));

/**
 * The rows as marks. When names repeat (the same player in two weeks), the
 * label gains the week or season so two dots are never both just "Lamar
 * Jackson".
 */
export function marksFor(grid: Grid, spec: ChartSpec): Mark[] {
  const cols = describeColumns(grid);
  const time = cols.filter((c) => c.timeLike);
  const labelCol = spec.label;
  const counts = new Map<string, number>();
  if (labelCol !== null) {
    for (const r of grid.values) counts.set(str(r[labelCol]), (counts.get(str(r[labelCol])) ?? 0) + 1);
  }
  const out: Mark[] = [];
  grid.values.forEach((r, i) => {
    const y = num(r[spec.y]);
    const x = spec.kind === "bar" ? y : num(r[spec.x]);
    if (y === null || x === null) return;
    let label = labelCol !== null ? str(r[labelCol]) : `#${i + 1}`;
    if (spec.kind !== "line" && labelCol !== null && (counts.get(label) ?? 0) > 1) {
      // Same name twice: say which week, or failing that which team (a
      // player traded mid-season groups into two rows).
      if (time.length) {
        label += ` · ${time.map((t) => `${t.name.toLowerCase().startsWith("w") ? "W" : ""}${str(r[t.index])}`).join(" ")}`;
      } else if (spec.team !== null && str(r[spec.team])) {
        label += ` · ${str(r[spec.team])}`;
      }
    }
    out.push({
      label,
      x,
      y,
      team: spec.team !== null ? str(r[spec.team]) || null : null,
      series: spec.kind === "line" && labelCol !== null ? str(r[labelCol]) : null,
    });
  });
  return out;
}

/** "Lucky Breaks" → "lucky-breaks", for the PNG's filename. */
export function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "datadraft-chart"
  );
}
