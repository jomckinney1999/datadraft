/**
 * A small Tableau, for the Tableau course and the /viz builder.
 *
 * Tableau doesn't run in a browser, and for a while the course taught it with
 * multiple choice alone. This is the part that transfers: fields split into
 * dimensions (blue, they slice) and measures (green, they aggregate), shelves
 * for Columns, Rows, Color and Detail, a mark type, filters and a sort. A
 * view is a `VizSpec`; `specToSql` turns it into the one query the view
 * needs, which is what Tableau's VizQL does too, and the builder shows it.
 *
 * Pure and DOM-free, like lib/chart.ts: the builder (components/viz-builder.tsx)
 * draws, this decides. Runs against the lesson database, so the numbers are
 * the same real nflverse rows the SQL course uses.
 *
 * **Graded on what the view shows, not how it was built.** A drill compares
 * the learner's result grid with the key's (same normaliser as SQL) and the
 * mark type. Player on Columns with points on Rows and the same two flipped
 * draw the same bars, so both pass.
 */

export type VizSource = "week_results" | "games";
export type VizAgg = "SUM" | "AVG" | "COUNT" | "COUNTD" | "MIN" | "MAX";
export type VizMark = "bar" | "line" | "circle" | "text";
export type VizShelf = "columns" | "rows" | "color" | "detail";

/** A pill on a shelf. A measure carries its aggregation; a dimension doesn't. */
export type VizPill = { field: string; agg?: VizAgg };

/** Keep only these values of a dimension (Tableau's "Filter… > select values"). */
export type VizFilter = { field: string; values: (string | number)[] };

export type VizSpec = {
  source: VizSource;
  columns: VizPill[];
  rows: VizPill[];
  color: VizPill[];
  detail: VizPill[];
  mark: VizMark;
  filters: VizFilter[];
  /** Sort the view by its first measure. */
  sort?: "asc" | "desc";
  /** Keep the top N marks by the first measure (after sorting). */
  top?: number;
};

export type VizField = {
  name: string;
  kind: "dimension" | "measure";
  /** What the field is, in a word, for the data pane's tooltip. */
  note: string;
};

/** The data pane: what each source offers, in the order Tableau would list it. */
export const VIZ_FIELDS: Record<VizSource, VizField[]> = {
  week_results: [
    { name: "player", kind: "dimension", note: "Player name" },
    { name: "team", kind: "dimension", note: "NFL team that week" },
    { name: "position", kind: "dimension", note: "QB, RB, WR or TE" },
    { name: "season", kind: "dimension", note: "Year" },
    { name: "week", kind: "dimension", note: "Week of the season" },
    { name: "fantasy_pts", kind: "measure", note: "PPR fantasy points in that game" },
  ],
  games: [
    { name: "season", kind: "dimension", note: "Year" },
    { name: "week", kind: "dimension", note: "Week of the season" },
    { name: "weekday", kind: "dimension", note: "Day the game was played" },
    { name: "home_team", kind: "dimension", note: "Home team" },
    { name: "away_team", kind: "dimension", note: "Away team" },
    { name: "roof", kind: "dimension", note: "outdoors, dome or closed" },
    { name: "surface", kind: "dimension", note: "Playing surface" },
    { name: "home_score", kind: "measure", note: "Home team's points" },
    { name: "away_score", kind: "measure", note: "Away team's points" },
    { name: "temp", kind: "measure", note: "Kickoff temperature (blank indoors)" },
  ],
};

export const VIZ_SOURCE_LABEL: Record<VizSource, string> = {
  week_results: "week_results · one row per player-game",
  games: "games · one row per NFL game",
};

export const AGGS: VizAgg[] = ["SUM", "AVG", "COUNT", "COUNTD", "MIN", "MAX"];
export const MARKS: VizMark[] = ["bar", "line", "circle", "text"];

export function emptySpec(source: VizSource = "week_results"): VizSpec {
  return { source, columns: [], rows: [], color: [], detail: [], mark: "bar", filters: [] };
}

export function fieldKind(source: VizSource, name: string): "dimension" | "measure" {
  return VIZ_FIELDS[source].find((f) => f.name === name)?.kind ?? "dimension";
}

/** How a pill reads on a shelf: SUM(fantasy_pts), or just player. */
export function pillLabel(p: VizPill): string {
  return p.agg ? `${p.agg}(${p.field})` : p.field;
}

const SHELVES: VizShelf[] = ["columns", "rows", "color", "detail"];

/** Every pill in shelf order, tagged with where it sits. */
function allPills(spec: VizSpec): { shelf: VizShelf; pill: VizPill }[] {
  return SHELVES.flatMap((shelf) => spec[shelf].map((pill) => ({ shelf, pill })));
}

export function dimensionsOf(spec: VizSpec): { shelf: VizShelf; pill: VizPill }[] {
  return allPills(spec).filter((x) => !x.pill.agg);
}

export function measuresOf(spec: VizSpec): { shelf: VizShelf; pill: VizPill }[] {
  return allPills(spec).filter((x) => !!x.pill.agg);
}

const quoteIdent = (s: string) => `"${s.replace(/"/g, '""')}"`;
const literal = (v: string | number) => (typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

function aggSql(p: VizPill): string {
  const col = quoteIdent(p.field);
  switch (p.agg) {
    case "COUNTD":
      return `COUNT(DISTINCT ${col})`;
    case "AVG":
      return `ROUND(AVG(${col}), 2)`;
    case "SUM":
      return `ROUND(SUM(${col}), 2)`;
    default:
      return `${p.agg}(${col})`;
  }
}

/**
 * The one query a view needs: the dimensions it's sliced by, each measure
 * aggregated, the filters in WHERE, the sort and Top N. Null when there's
 * nothing on the shelves yet.
 */
export function specToSql(spec: VizSpec, opts: { canonical?: boolean } = {}): string | null {
  const dims = dimensionsOf(spec).map((d) => d.pill.field);
  const uniqueDims = dims.filter((d, i) => dims.indexOf(d) === i);
  const measures = measuresOf(spec).map((m) => m.pill);
  // For grading: which shelf a field sits on changes the column order but
  // not the data, so sort both lists and compare like with like.
  if (opts.canonical) {
    uniqueDims.sort();
    measures.sort((a, b) => pillLabel(a).localeCompare(pillLabel(b)));
  }
  if (uniqueDims.length === 0 && measures.length === 0) return null;

  const select = [
    ...uniqueDims.map(quoteIdent),
    ...measures.map((m) => `${aggSql(m)} AS ${quoteIdent(pillLabel(m))}`),
  ];
  const where = spec.filters
    .filter((f) => f.values.length > 0)
    .map((f) => `${quoteIdent(f.field)} IN (${f.values.map(literal).join(", ")})`);

  let sql = `SELECT ${select.join(", ")}\nFROM ${spec.source}`;
  if (where.length) sql += `\nWHERE ${where.join("\n  AND ")}`;
  if (uniqueDims.length) sql += `\nGROUP BY ${uniqueDims.map(quoteIdent).join(", ")}`;

  const first = measures[0];
  const order: string[] = [];
  if (spec.sort && first) order.push(`${quoteIdent(pillLabel(first))} ${spec.sort === "desc" ? "DESC" : "ASC"}`);
  order.push(...uniqueDims.map(quoteIdent));
  if (order.length) sql += `\nORDER BY ${order.join(", ")}`;
  if (spec.top && spec.top > 0 && first) sql += `\nLIMIT ${Math.floor(spec.top)}`;
  return sql + ";";
}

/** The view in words, for a drill's solution line. */
export function describeSpec(spec: VizSpec): string {
  const shelf = (name: string, pills: VizPill[]) => (pills.length ? `${name}: ${pills.map(pillLabel).join(", ")}` : null);
  return [
    shelf("Columns", spec.columns),
    shelf("Rows", spec.rows),
    shelf("Color", spec.color),
    shelf("Detail", spec.detail),
    `Mark: ${spec.mark}`,
    ...spec.filters.map((f) => `Filter: ${f.field} = ${f.values.join(", ")}`),
    spec.sort ? `Sort: ${spec.sort === "desc" ? "highest first" : "lowest first"}` : null,
    spec.top ? `Top ${spec.top}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

// ── From a result grid to something drawable ───────────────────────

export type VizResult = { columns: string[]; values: (string | number | null)[][] };

export type VizPlot =
  | { kind: "empty"; reason: string }
  | { kind: "table"; columns: string[]; rows: (string | number | null)[][] }
  | {
      kind: "bars" | "lines" | "dots";
      /** Bars run along x (categories on Columns) or along y (categories on Rows). */
      horizontal: boolean;
      measure: string;
      points: { label: string; series: string | null; value: number }[];
    }
  | { kind: "scatter"; x: string; y: string; points: { label: string; series: string | null; x: number; y: number }[] };

/**
 * Decide what the view draws. Tableau's rule of thumb, kept small: two
 * measures on opposite shelves make a scatter; one measure makes bars, lines
 * or dots along the dimensions on the other shelf; Text is a crosstab.
 */
export function plotFor(spec: VizSpec, result: VizResult | null): VizPlot {
  if (!result) return { kind: "empty", reason: "Drag a field onto Columns or Rows to start." };
  if (result.values.length === 0) return { kind: "empty", reason: "No rows: check the filters." };

  const idx = (name: string) => result.columns.indexOf(name);
  const dims = dimensionsOf(spec);
  const measures = measuresOf(spec);
  if (spec.mark === "text" || measures.length === 0) {
    return { kind: "table", columns: result.columns, rows: result.values };
  }

  const colorDim = dims.find((d) => d.shelf === "color")?.pill.field ?? null;
  const labelDims = dims.filter((d) => d.shelf !== "color").map((d) => d.pill.field);
  const labelOf = (row: (string | number | null)[]) =>
    labelDims.length ? labelDims.map((d) => String(row[idx(d)] ?? "")).join(" · ") : "All";
  const seriesOf = (row: (string | number | null)[]) => (colorDim ? String(row[idx(colorDim)] ?? "") : null);

  const onCols = measures.find((m) => m.shelf === "columns");
  const onRows = measures.find((m) => m.shelf === "rows");
  if (onCols && onRows) {
    const xi = idx(pillLabel(onCols.pill));
    const yi = idx(pillLabel(onRows.pill));
    return {
      kind: "scatter",
      x: pillLabel(onCols.pill),
      y: pillLabel(onRows.pill),
      points: result.values.map((r) => ({ label: labelOf(r), series: seriesOf(r), x: Number(r[xi] ?? 0), y: Number(r[yi] ?? 0) })),
    };
  }

  const m = measures[0];
  const mi = idx(pillLabel(m.pill));
  return {
    kind: spec.mark === "line" ? "lines" : spec.mark === "circle" ? "dots" : "bars",
    horizontal: m.shelf === "columns",
    measure: pillLabel(m.pill),
    points: result.values.map((r) => ({ label: labelOf(r), series: seriesOf(r), value: Number(r[mi] ?? 0) })),
  };
}

/** Does the learner's view match the key's? Data via the SQL normaliser, plus the mark. */
export function sameMark(a: VizSpec, b: VizSpec): boolean {
  // A scatter is circles whatever the dropdown says, the way Tableau's
  // Automatic mark picks one, so two measures on opposite shelves only need
  // the data to match.
  const scatter = (s: VizSpec) => measuresOf(s).some((m) => m.shelf === "columns") && measuresOf(s).some((m) => m.shelf === "rows");
  if (scatter(a) && scatter(b)) return true;
  return a.mark === b.mark;
}
