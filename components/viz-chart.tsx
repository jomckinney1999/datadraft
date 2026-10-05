/**
 * Draws a VizPlot (lib/viz.ts): bars, lines, dots, a scatter, or a crosstab.
 *
 * SVG on a fixed 600×320 viewBox that scales to its box, so the same view is
 * legible in a lesson's right pane and full width on /viz. Colours are theme
 * tokens; a single series is turf (Tableau draws measures green), and a
 * dimension on Color cycles turf, ice, gold. Anything computed for a
 * coordinate is rounded so server and client print the same attributes.
 */

import type { VizPlot } from "@/lib/viz";

const W = 600;
const H = 320;
const PALETTE = ["turf", "ice", "gold", "ink-soft", "turf-dim", "ice-dim", "gold-dim"];
const r1 = (v: number) => Math.round(v * 10) / 10;
const tok = (t: string) => `rgb(var(--c-${t}))`;
const MAX_MARKS = 40;

function fmt(v: number): string {
  if (!Number.isFinite(v)) return "";
  return Math.abs(v) >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : String(Math.round(v * 10) / 10);
}

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

function seriesColors(series: (string | null)[]): Map<string | null, string> {
  const keys = Array.from(new Set(series));
  return new Map(keys.map((k, i) => [k, tok(k === null ? "turf" : PALETTE[i % PALETTE.length])]));
}

function Legend({ colors }: { colors: Map<string | null, string> }) {
  const items = Array.from(colors.entries()).filter(([k]) => k !== null);
  if (!items.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
      {items.slice(0, 12).map(([k, c]) => (
        <span key={String(k)} className="flex items-center gap-1.5 font-mono text-[10px] text-ink-soft">
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
            <rect width="10" height="10" rx="2" fill={c} />
          </svg>
          {k}
        </span>
      ))}
    </div>
  );
}

export default function VizChart({ plot }: { plot: VizPlot }) {
  if (plot.kind === "empty") {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-panel-border text-center text-sm text-ink-muted">
        {plot.reason}
      </div>
    );
  }

  if (plot.kind === "table") {
    return (
      <div className="max-h-72 overflow-auto rounded-xl border border-panel-border">
        <table className="w-full text-left font-mono text-[12px]">
          <thead className="sticky top-0 bg-panel">
            <tr>
              {plot.columns.map((c) => (
                <th key={c} className="border-b border-panel-border px-3 py-2 text-[10px] uppercase tracking-wider text-ink-muted">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plot.rows.slice(0, 200).map((r, i) => (
              <tr key={i} className="border-b border-panel-border/50 last:border-0">
                {r.map((v, j) => (
                  <td key={j} className={`px-3 py-1.5 ${typeof v === "number" ? "text-right text-ink" : "text-ink-soft"}`}>
                    {v === null ? "" : typeof v === "number" ? fmt(v) : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (plot.kind === "scatter") {
    const pts = plot.points.slice(0, 400);
    const xMax = niceMax(Math.max(...pts.map((p) => p.x), 0));
    const yMax = niceMax(Math.max(...pts.map((p) => p.y), 0));
    const L = 56;
    const B = 40;
    const sx = (v: number) => r1(L + (v / xMax) * (W - L - 16));
    const sy = (v: number) => r1(H - B - (v / yMax) * (H - B - 16));
    const colors = seriesColors(pts.map((p) => p.series));
    return (
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Scatter of ${plot.y} against ${plot.x}`}>
          <path d={`M${L} 16 V${H - B} H${W - 16}`} fill="none" stroke="rgb(var(--c-ink-muted))" strokeWidth="1.5" />
          {[0.5, 1].map((f) => (
            <g key={f}>
              <text x={L - 6} y={sy(yMax * f) + 4} textAnchor="end" fontSize="11" fill="rgb(var(--c-ink-muted))">{fmt(yMax * f)}</text>
              <text x={sx(xMax * f)} y={H - B + 16} textAnchor="middle" fontSize="11" fill="rgb(var(--c-ink-muted))">{fmt(xMax * f)}</text>
            </g>
          ))}
          <text x={W - 16} y={H - 6} textAnchor="end" fontSize="11" fill="rgb(var(--c-ink-soft))">{plot.x}</text>
          <text x={L} y={10} fontSize="11" fill="rgb(var(--c-ink-soft))">{plot.y}</text>
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={sx(p.x)} cy={sy(p.y)} r="6" fill={colors.get(p.series)} stroke="rgb(var(--c-night))" strokeWidth="1.5" opacity="0.9" />
              {pts.length <= 20 && (
                <text x={sx(p.x) + 9} y={sy(p.y) + 4} fontSize="10" fill="rgb(var(--c-ink-soft))">{p.label}</text>
              )}
            </g>
          ))}
        </svg>
        <Legend colors={colors} />
      </div>
    );
  }

  // bars, lines, dots: categories along one axis, the measure along the other
  const pts = plot.points.slice(0, plot.kind === "lines" ? 400 : MAX_MARKS);
  const labels = Array.from(new Set(pts.map((p) => p.label)));
  const series = Array.from(new Set(pts.map((p) => p.series)));
  const colors = seriesColors(series);
  const max = niceMax(Math.max(...pts.map((p) => p.value), 0));
  const clipped = plot.points.length > pts.length;
  const short = (s: string) => (s.length > 16 ? `${s.slice(0, 15)}…` : s);

  if (plot.horizontal && plot.kind !== "lines") {
    const L = 128;
    const rowH = Math.min(26, (H - 24) / Math.max(1, labels.length));
    const h = Math.max(H, Math.round(labels.length * rowH + 30));
    const sx = (v: number) => r1(L + (v / max) * (W - L - 48));
    const perLabel = Math.max(1, series.length);
    return (
      <div>
        <svg viewBox={`0 0 ${W} ${h}`} className="w-full" role="img" aria-label={`${plot.measure} by category`}>
          {labels.map((lab, i) => {
            const y = r1(12 + i * rowH);
            return (
              <g key={lab}>
                <text x={L - 8} y={r1(y + rowH / 2 + 4)} textAnchor="end" fontSize="11" fill="rgb(var(--c-ink-soft))">{short(lab)}</text>
                {series.map((s, j) => {
                  const p = pts.find((q) => q.label === lab && q.series === s);
                  if (!p) return null;
                  const bh = r1((rowH - 6) / perLabel);
                  const by = r1(y + 3 + j * bh);
                  return plot.kind === "dots" ? (
                    <circle key={String(s)} cx={sx(p.value)} cy={r1(by + bh / 2)} r="5" fill={colors.get(s)} stroke="rgb(var(--c-night))" strokeWidth="1.2" />
                  ) : (
                    <g key={String(s)}>
                      <rect x={L} y={by} width={Math.max(1, r1(sx(p.value) - L))} height={Math.max(2, bh - 1)} rx="2" fill={colors.get(s)} />
                      {labels.length <= 16 && series.length === 1 && (
                        <text x={sx(p.value) + 5} y={r1(by + bh / 2 + 4)} fontSize="10" fill="rgb(var(--c-ink))">{fmt(p.value)}</text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        <Legend colors={colors} />
        {clipped && <p className="mt-1 font-mono text-[10px] text-ink-muted">Showing the first {MAX_MARKS} marks. Filter or use Top N to narrow it.</p>}
      </div>
    );
  }

  const L = 52;
  const B = labels.length > 6 ? 78 : 36;
  const band = (W - L - 16) / Math.max(1, labels.length);
  const cx = (i: number) => r1(L + band * i + band / 2);
  const sy = (v: number) => r1(H - B - (v / max) * (H - B - 16));
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${plot.measure} by category`}>
        <path d={`M${L} 16 V${H - B} H${W - 16}`} fill="none" stroke="rgb(var(--c-ink-muted))" strokeWidth="1.5" />
        {[0.5, 1].map((f) => (
          <g key={f}>
            <path d={`M${L} ${sy(max * f)} H${W - 16}`} stroke="rgb(var(--c-ink-muted))" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.6" />
            <text x={L - 6} y={sy(max * f) + 4} textAnchor="end" fontSize="11" fill="rgb(var(--c-ink-muted))">{fmt(max * f)}</text>
          </g>
        ))}
        {labels.map((lab, i) =>
          labels.length > 6 ? (
            <text key={lab} transform={`translate(${cx(i)} ${H - B + 10}) rotate(-38)`} textAnchor="end" fontSize="10" fill="rgb(var(--c-ink-soft))">{short(lab)}</text>
          ) : (
            <text key={lab} x={cx(i)} y={H - B + 16} textAnchor="middle" fontSize="11" fill="rgb(var(--c-ink-soft))">{short(lab)}</text>
          ),
        )}
        {plot.kind === "lines"
          ? series.map((s) => {
              const line = labels
                .map((lab, i) => {
                  const p = pts.find((q) => q.label === lab && q.series === s);
                  return p ? `${cx(i)},${sy(p.value)}` : null;
                })
                .filter(Boolean)
                .join(" ");
              return (
                <g key={String(s)}>
                  <polyline points={line} fill="none" stroke={colors.get(s)} strokeWidth="2.5" strokeLinejoin="round" />
                  {labels.map((lab, i) => {
                    const p = pts.find((q) => q.label === lab && q.series === s);
                    return p ? <circle key={lab} cx={cx(i)} cy={sy(p.value)} r="3.2" fill={colors.get(s)} /> : null;
                  })}
                </g>
              );
            })
          : labels.map((lab, i) => {
              const group = series.map((s) => pts.find((q) => q.label === lab && q.series === s));
              const bw = r1(Math.min(44, (band * 0.72) / Math.max(1, series.length)));
              return group.map((p, j) => {
                if (!p) return null;
                const x = r1(cx(i) - (bw * series.length) / 2 + j * bw);
                return plot.kind === "dots" ? (
                  <circle key={`${lab}-${j}`} cx={r1(x + bw / 2)} cy={sy(p.value)} r="5.5" fill={colors.get(p.series)} stroke="rgb(var(--c-night))" strokeWidth="1.2" />
                ) : (
                  <g key={`${lab}-${j}`}>
                    <rect x={x} y={sy(p.value)} width={Math.max(2, bw - 2)} height={Math.max(1, r1(H - B - sy(p.value)))} rx="2" fill={colors.get(p.series)} />
                    {labels.length <= 10 && series.length === 1 && (
                      <text x={r1(x + bw / 2 - 1)} y={sy(p.value) - 5} textAnchor="middle" fontSize="10" fill="rgb(var(--c-ink))">{fmt(p.value)}</text>
                    )}
                  </g>
                );
              });
            })}
      </svg>
      <Legend colors={colors} />
      {clipped && <p className="mt-1 font-mono text-[10px] text-ink-muted">Showing the first {MAX_MARKS} marks. Filter or use Top N to narrow it.</p>}
    </div>
  );
}
