/**
 * Paints a "Chart it" chart onto a canvas, 1600×900 — the 16:9 shape X shows
 * uncropped. The on-screen preview is this canvas, so the PNG a learner
 * downloads is exactly what they saw.
 *
 * Why a canvas and not SVG: an SVG turned into an image can't reach the
 * page's web fonts, so the export would fall back to system type. A canvas
 * draws with the fonts the page already loaded.
 *
 * The look is the site's sticker art at chart scale: marks carry the `night`
 * outline, labels a night halo so they read over gridlines, the averages are
 * dashed, and labels are placed so they never collide — the extremes first,
 * because those are the names a chart is posted for. Colours come from the
 * theme tokens at draw time (readTheme), team colours from teamAccent.
 */

import {
  describeColumns,
  marksFor,
  prettyName,
  type ChartSpec,
  type Grid,
  type Mark,
} from "@/lib/chart";
import { teamAccent } from "@/lib/team-colors";
import { SITE_URL } from "@/lib/site";

export const W = 1600;
export const H = 900;
const PAD = 64;
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
const MAX_BARS = 20;
const MAX_LINES = 12;
const MAX_LABELS = 45;

export type ChartTheme = {
  bg: string;
  ink: string;
  inkSoft: string;
  inkMuted: string;
  grid: string;
  night: string;
  turf: string;
  gold: string;
  glow: string;
  gloss: string;
  series: string[];
  display: string;
  sans: string;
  mono: string;
};

/** The theme tokens and the page's own fonts, resolved for canvas use. */
export function readTheme(): ChartTheme {
  const cs = getComputedStyle(document.documentElement);
  const tok = (name: string, a = 1) => {
    const rgb = cs.getPropertyValue(`--c-${name}`).trim().split(/\s+/).join(",");
    return `rgba(${rgb},${a})`;
  };
  const font = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;
  return {
    bg: tok("night"),
    ink: tok("ink"),
    inkSoft: tok("ink-soft"),
    inkMuted: tok("ink-muted"),
    grid: tok("ink", 0.08),
    night: tok("night"),
    turf: tok("turf"),
    gold: tok("gold"),
    glow: tok("turf", 0.14),
    gloss: tok("ink", 0.2),
    // The accents first, then the syntax colours, which already clear AA on
    // this canvas.
    series: [
      tok("turf"),
      tok("ice"),
      tok("gold"),
      tok("syn-func"),
      tok("syn-table"),
      tok("ink-soft"),
    ],
    display: font("--font-space-grotesk", "sans-serif"),
    sans: font("--font-inter", "sans-serif"),
    mono: font("--font-ibm-plex-mono", "monospace"),
  };
}

type Plot = { x0: number; y0: number; x1: number; y1: number };
type Box = { x: number; y: number; w: number; h: number };
type Scale = { lo: number; hi: number; step: number; ticks: number[] };

const setFont = (ctx: CanvasRenderingContext2D, weight: number, size: number, family: string) => {
  ctx.font = `${weight} ${size}px ${family}`;
};

function niceScale(min: number, max: number, count = 6): Scale {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { lo: 0, hi: 1, step: 0.2, ticks: [0, 1] };
  if (min === max) {
    const d = Math.abs(min) || 1;
    min -= d * 0.5;
    max += d * 0.5;
  }
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const err = raw / mag;
  const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v / step) * step);
  return { lo, hi, step, ticks };
}

function fmt(v: number, step?: number): string {
  const decimals =
    step !== undefined
      ? Math.max(0, Math.min(2, -Math.floor(Math.log10(step) + 1e-9)))
      : Number.isInteger(v) || Math.abs(v) >= 100
        ? 0
        : 1;
  return v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Shrink a line of type until it fits, then ellipsise. Leaves the font set. */
function fit(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  weight: number,
  size: number,
  min: number,
  family: string,
): string {
  let s = size;
  setFont(ctx, weight, s, family);
  while (ctx.measureText(text).width > maxW && s > min) {
    s -= 2;
    setFont(ctx, weight, s, family);
  }
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

function haloText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fill: string, halo: string, w = 6) {
  ctx.lineJoin = "round";
  ctx.lineWidth = w;
  ctx.strokeStyle = halo;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

/** With a few pixels of air, so two labels never read as one name. */
const overlaps = (a: Box, b: Box, air = 6) =>
  a.x < b.x + b.w + air && b.x < a.x + a.w + air && a.y < b.y + b.h + air && b.y < a.y + a.h + air;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.abs(w) / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

const markColor = (m: Mark, fallback: string) => (m.team ? teamAccent(m.team) : fallback);

// ── Frame: background, title, footer ────────────────────────────────────

function drawFrame(ctx: CanvasRenderingContext2D, spec: ChartSpec, T: ChartTheme, logo: HTMLImageElement | null) {
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.1, 0, 0, W * 0.1, 0, W * 0.75);
  glow.addColorStop(0, T.glow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const title = fit(ctx, spec.title || "Untitled chart", W - PAD * 2, 700, 54, 34, T.display);
  ctx.fillStyle = T.ink;
  ctx.fillText(title, PAD, 104);
  if (spec.subtitle) {
    const sub = fit(ctx, spec.subtitle, W - PAD * 2, 500, 26, 18, T.sans);
    ctx.fillStyle = T.inkSoft;
    ctx.fillText(sub, PAD, 150);
  }

  // Footer: the mark, the wordmark, where to find it, and whose data it is.
  ctx.strokeStyle = T.grid;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, H - 92);
  ctx.lineTo(W - PAD, H - 92);
  ctx.stroke();
  const fy = H - 46;
  let fx = PAD;
  if (logo && logo.complete && logo.naturalWidth) {
    ctx.drawImage(logo, fx, fy - 26, 52, 52);
    fx += 66;
  }
  ctx.textBaseline = "middle";
  setFont(ctx, 700, 30, T.display);
  ctx.fillStyle = T.ink;
  ctx.fillText("Data", fx, fy);
  fx += ctx.measureText("Data").width;
  ctx.fillStyle = T.turf;
  ctx.fillText("Draft", fx, fy);
  fx += ctx.measureText("Draft").width + 18;
  setFont(ctx, 500, 20, T.mono);
  ctx.fillStyle = T.inkMuted;
  ctx.fillText(SITE_HOST, fx, fy + 2);
  setFont(ctx, 500, 20, T.sans);
  ctx.textAlign = "right";
  ctx.fillText(spec.credit, W - PAD, fy + 2);
  ctx.textAlign = "left";
}

// ── Axes ────────────────────────────────────────────────────────────────

function yTicksWidth(ctx: CanvasRenderingContext2D, s: Scale, T: ChartTheme) {
  setFont(ctx, 500, 20, T.mono);
  return Math.max(...s.ticks.map((t) => ctx.measureText(fmt(t, s.step)).width));
}

function drawAxes(
  ctx: CanvasRenderingContext2D,
  p: Plot,
  sx: Scale,
  sy: Scale | null,
  T: ChartTheme,
  xTitle: string,
  yTitle: string | null,
  xFormat: (v: number) => string = (v) => fmt(v, sx.step),
) {
  const px = (v: number) => p.x0 + ((v - sx.lo) / (sx.hi - sx.lo)) * (p.x1 - p.x0);
  ctx.lineWidth = 2;
  ctx.strokeStyle = T.grid;
  setFont(ctx, 500, 20, T.mono);
  ctx.fillStyle = T.inkMuted;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const t of sx.ticks) {
    const x = px(t);
    ctx.beginPath();
    ctx.moveTo(x, p.y0);
    ctx.lineTo(x, p.y1);
    ctx.stroke();
    ctx.fillText(xFormat(t), x, p.y1 + 14);
  }
  if (sy) {
    const py = (v: number) => p.y1 - ((v - sy.lo) / (sy.hi - sy.lo)) * (p.y1 - p.y0);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (const t of sy.ticks) {
      const y = py(t);
      ctx.beginPath();
      ctx.moveTo(p.x0, y);
      ctx.lineTo(p.x1, y);
      ctx.stroke();
      ctx.fillText(fmt(t, sy.step), p.x0 - 14, y);
    }
  }
  setFont(ctx, 600, 24, T.sans);
  ctx.fillStyle = T.inkSoft;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(xTitle, (p.x0 + p.x1) / 2, p.y1 + 76);
  if (yTitle) {
    ctx.save();
    ctx.translate(PAD + 12, (p.y0 + p.y1) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yTitle, 0, 0);
    ctx.restore();
  }
}

// ── Scatter ─────────────────────────────────────────────────────────────

function drawScatter(ctx: CanvasRenderingContext2D, grid: Grid, spec: ChartSpec, marks: Mark[], T: ChartTheme) {
  const xs = marks.map((m) => m.x);
  const ys = marks.map((m) => m.y);
  const span = (a: number[]) => Math.max(...a) - Math.min(...a) || Math.abs(a[0]) || 1;
  const sx = niceScale(Math.min(...xs) - span(xs) * 0.05, Math.max(...xs) + span(xs) * 0.05);
  const sy = niceScale(Math.min(...ys) - span(ys) * 0.06, Math.max(...ys) + span(ys) * 0.06);
  const p: Plot = { x0: PAD + 44 + yTicksWidth(ctx, sy, T) + 18, y0: 196, x1: W - PAD - 8, y1: H - 196 };
  drawAxes(ctx, p, sx, sy, T, prettyName(grid.columns[spec.x]), prettyName(grid.columns[spec.y]));

  const px = (v: number) => p.x0 + ((v - sx.lo) / (sx.hi - sx.lo)) * (p.x1 - p.x0);
  const py = (v: number) => p.y1 - ((v - sy.lo) / (sy.hi - sy.lo)) * (p.y1 - p.y0);
  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const ax = mean(xs);
  const ay = mean(ys);

  // The averages, dashed, each with its value — the line every quadrant
  // chart is really about.
  ctx.save();
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = T.inkMuted;
  ctx.beginPath();
  ctx.moveTo(px(ax), p.y0);
  ctx.lineTo(px(ax), p.y1);
  ctx.moveTo(p.x0, py(ay));
  ctx.lineTo(p.x1, py(ay));
  ctx.stroke();
  ctx.restore();
  setFont(ctx, 600, 19, T.mono);
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  haloText(ctx, `avg ${fmt(ax)}`, px(ax) + 8, p.y0 + 24, T.inkSoft, T.bg, 5);
  ctx.textAlign = "right";
  haloText(ctx, `avg ${fmt(ay)}`, p.x1 - 6, py(ay) - 6, T.inkSoft, T.bg, 5);

  // Corner captions, remembered so no dot label lands on one.
  const corners: Box[] = [];
  if (spec.quadrants) {
    setFont(ctx, 700, 22, T.mono);
    const [tl, tr, bl, br] = spec.quadrants;
    const q = (text: string, x: number, y: number, align: CanvasTextAlign, base: CanvasTextBaseline) => {
      if (!text) return;
      ctx.textAlign = align;
      ctx.textBaseline = base;
      const label = text.toUpperCase();
      const w = ctx.measureText(label).width;
      corners.push({ x: align === "right" ? x - w : x, y: base === "bottom" ? y - 24 : y, w, h: 24 });
      haloText(ctx, label, x, y, T.gold, T.bg, 6);
    };
    q(tl, p.x0 + 16, p.y0 + 12, "left", "top");
    q(tr, p.x1 - 16, p.y0 + 40, "right", "top");
    q(bl, p.x0 + 16, p.y1 - 12, "left", "bottom");
    q(br, p.x1 - 16, p.y1 - 12, "right", "bottom");
  }

  // With corner captions and no team colours, colour each dot by its corner,
  // so the story reads before the labels do: the lucky gold, the legit turf,
  // the unlucky blue, the rest grey.
  const corner = (m: Mark) => {
    if (m.team || !spec.quadrants) return markColor(m, T.turf);
    const top = m.y >= ay;
    const right = m.x >= ax;
    return top ? (right ? T.turf : T.gold) : right ? T.series[1] : T.inkMuted;
  };
  const r = marks.length > 80 ? 8 : marks.length > 40 ? 10 : 12;
  const taken: Box[] = [...corners, ...marks.map((m) => ({ x: px(m.x) - r, y: py(m.y) - r, w: r * 2, h: r * 2 }))];
  for (const m of marks) {
    ctx.beginPath();
    ctx.arc(px(m.x), py(m.y), r, 0, Math.PI * 2);
    ctx.fillStyle = corner(m);
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = T.night;
    ctx.stroke();
  }

  // Labels: the extremes first, then anyone with room. A label that would
  // collide is left off rather than printed on top of another.
  const sd = (a: number[], m: number) => Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length) || 1;
  const sdx = sd(xs, ax);
  const sdy = sd(ys, ay);
  const order = [...marks].sort(
    (a, b) =>
      Math.abs(b.x - ax) / sdx + Math.abs(b.y - ay) / sdy - (Math.abs(a.x - ax) / sdx + Math.abs(a.y - ay) / sdy),
  );
  const size = marks.length > 40 ? 17 : marks.length > 20 ? 19 : 21;
  setFont(ctx, 600, size, T.sans);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const LH = size + 3;
  const bounds: Box = { x: p.x0 + 2, y: p.y0 + 2, w: p.x1 - p.x0 - 4, h: p.y1 - p.y0 - 4 };
  const inside = (b: Box) => b.x >= bounds.x && b.y >= bounds.y && b.x + b.w <= bounds.x + bounds.w && b.y + b.h <= bounds.y + bounds.h;
  let placed = 0;
  for (const m of order) {
    if (placed >= MAX_LABELS || !m.label) break;
    const w = ctx.measureText(m.label).width;
    const cx = px(m.x);
    const cy = py(m.y);
    const g = r + 7;
    const f = r + 30;
    // Snug spots first; then a ring farther out, joined to the dot by a
    // leader line, so a crowded middle still gets its names.
    const options: [number, number, boolean][] = [
      [g, -LH / 2, false],
      [-g - w, -LH / 2, false],
      [-w / 2, -g - LH, false],
      [-w / 2, g, false],
      [g - 4, -g - LH + 6, false],
      [g - 4, g - 6, false],
      [-g - w + 4, -g - LH + 6, false],
      [-g - w + 4, g - 6, false],
      [f, -f - LH / 2, true],
      [f, f - LH / 2, true],
      [-f - w, -f - LH / 2, true],
      [-f - w, f - LH / 2, true],
      [-w / 2, -f - LH - 8, true],
      [-w / 2, f + 8, true],
    ];
    for (const [dx, dy, leader] of options) {
      const box = { x: cx + dx, y: cy + dy, w, h: LH };
      if (inside(box) && !taken.some((t) => overlaps(t, box))) {
        taken.push(box);
        if (leader) {
          // From the dot's edge to the nearest point of the label.
          const tx = Math.max(box.x, Math.min(cx, box.x + box.w));
          const ty = Math.max(box.y, Math.min(cy, box.y + box.h));
          const a = Math.atan2(ty - cy, tx - cx);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * (r + 2), cy + Math.sin(a) * (r + 2));
          ctx.lineTo(tx, ty);
          ctx.lineWidth = 2;
          ctx.strokeStyle = T.inkMuted;
          ctx.stroke();
        }
        haloText(ctx, m.label, box.x, box.y + 1, T.ink, T.bg, 6);
        placed++;
        break;
      }
    }
  }
}

// ── Bars ────────────────────────────────────────────────────────────────

function drawBars(ctx: CanvasRenderingContext2D, grid: Grid, spec: ChartSpec, marks: Mark[], T: ChartTheme) {
  const cols = describeColumns(grid);
  const byTime = spec.label !== null && cols[spec.label]?.timeLike;
  const sorted = byTime
    ? [...marks].sort((a, b) => Number(a.label) - Number(b.label))
    : [...marks].sort((a, b) => b.y - a.y);
  const shown = sorted.slice(0, MAX_BARS);
  const labels = shown.map((m) => (byTime ? `${prettyName(grid.columns[spec.label!])} ${m.label}` : m.label));

  setFont(ctx, 600, 22, T.sans);
  const labelW = Math.min(380, Math.max(...labels.map((l) => ctx.measureText(l).width)));
  const vals = shown.map((m) => m.y);
  const sx = niceScale(Math.min(0, ...vals), Math.max(0, ...vals));
  setFont(ctx, 700, 22, T.mono);
  const valueW = Math.max(...vals.map((v) => ctx.measureText(fmt(v)).width));
  const p: Plot = { x0: PAD + labelW + 22, y0: 196, x1: W - PAD - valueW - 22, y1: H - 196 };
  drawAxes(ctx, p, sx, null, T, prettyName(grid.columns[spec.y]), null);

  const px = (v: number) => p.x0 + ((v - sx.lo) / (sx.hi - sx.lo)) * (p.x1 - p.x0);
  const band = (p.y1 - p.y0) / shown.length;
  const barH = Math.min(52, band * 0.7);
  const zero = px(0);
  shown.forEach((m, i) => {
    const cy = p.y0 + band * i + band / 2;
    const x = Math.min(zero, px(m.y));
    const w = Math.max(3, Math.abs(px(m.y) - zero));
    const color = m.team ? teamAccent(m.team) : i === 0 && !byTime ? T.gold : T.turf;
    roundRect(ctx, x, cy - barH / 2, w, barH, 9);
    ctx.fillStyle = color;
    ctx.fill();
    // The sticker gloss, as on the front-door buttons.
    ctx.save();
    ctx.clip();
    ctx.fillStyle = T.gloss;
    ctx.fillRect(x, cy - barH / 2, w, barH * 0.36);
    ctx.restore();
    roundRect(ctx, x, cy - barH / 2, w, barH, 9);
    ctx.lineWidth = 3;
    ctx.strokeStyle = T.night;
    ctx.stroke();

    setFont(ctx, 600, 22, T.sans);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = T.ink;
    ctx.fillText(fit(ctx, labels[i], labelW, 600, 22, 16, T.sans), p.x0 - 16, cy);
    setFont(ctx, 700, 22, T.mono);
    ctx.textAlign = "left";
    ctx.fillStyle = T.ink;
    ctx.fillText(fmt(m.y), (m.y >= 0 ? x + w : x) + (m.y >= 0 ? 12 : -12 - ctx.measureText(fmt(m.y)).width), cy + 1);
  });
  if (sorted.length > shown.length) {
    setFont(ctx, 500, 18, T.mono);
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = T.inkMuted;
    ctx.fillText(`Top ${shown.length} of ${sorted.length}`, W - PAD, 186);
  }
}

// ── Lines ───────────────────────────────────────────────────────────────

function drawLines(ctx: CanvasRenderingContext2D, grid: Grid, spec: ChartSpec, marks: Mark[], T: ChartTheme) {
  const groups = new Map<string, Mark[]>();
  for (const m of marks) {
    const k = m.series ?? prettyName(grid.columns[spec.y]);
    groups.set(k, [...(groups.get(k) ?? []), m]);
  }
  let series = Array.from(groups.entries()).map(([name, ms]) => ({
    name,
    ms: ms.sort((a, b) => a.x - b.x),
  }));
  const last = (s: { ms: Mark[] }) => s.ms[s.ms.length - 1].y;
  series.sort((a, b) => last(b) - last(a));
  const total = series.length;
  series = series.slice(0, MAX_LINES);

  const all = series.flatMap((s) => s.ms);
  const xs = all.map((m) => m.x);
  const ys = all.map((m) => m.y);
  const sy = niceScale(Math.min(...ys), Math.max(...ys));
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const integers = xs.every((v) => Number.isInteger(v));
  const sx: Scale =
    integers && xmax - xmin <= 20
      ? { lo: xmin, hi: xmax === xmin ? xmin + 1 : xmax, step: 1, ticks: Array.from({ length: Math.max(xmax - xmin, 1) + 1 }, (_, i) => xmin + i) }
      : niceScale(xmin, xmax);

  setFont(ctx, 600, 21, T.sans);
  const nameW = Math.min(300, Math.max(...series.map((s) => ctx.measureText(s.name).width)));
  const p: Plot = { x0: PAD + 44 + yTicksWidth(ctx, sy, T) + 18, y0: 196, x1: W - PAD - nameW - 30, y1: H - 196 };
  drawAxes(ctx, p, sx, sy, T, prettyName(grid.columns[spec.x]), prettyName(grid.columns[spec.y]), (v) => fmt(v, sx.step < 1 ? sx.step : 1));

  const px = (v: number) => p.x0 + ((v - sx.lo) / (sx.hi - sx.lo || 1)) * (p.x1 - p.x0);
  const py = (v: number) => p.y1 - ((v - sy.lo) / (sy.hi - sy.lo)) * (p.y1 - p.y0);
  const teamOf = (ms: Mark[]) => (ms.every((m) => m.team && m.team === ms[0].team) ? ms[0].team : null);
  const colors = series.map((s, i) => {
    const t = teamOf(s.ms);
    return t ? teamAccent(t) : T.series[i % T.series.length];
  });

  series.forEach((s, i) => {
    ctx.save();
    if (i >= T.series.length) ctx.setLineDash([16, 10]);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    s.ms.forEach((m, j) => (j ? ctx.lineTo(px(m.x), py(m.y)) : ctx.moveTo(px(m.x), py(m.y))));
    ctx.lineWidth = 9;
    ctx.strokeStyle = T.night;
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.strokeStyle = colors[i];
    ctx.stroke();
    ctx.restore();
    for (const m of s.ms) {
      ctx.beginPath();
      ctx.arc(px(m.x), py(m.y), 6.5, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = T.night;
      ctx.stroke();
    }
  });

  // Names at the line ends, nudged apart so none sits on another.
  const ends = series.map((s, i) => ({ name: s.name, y: py(last(s)), x: px(s.ms[s.ms.length - 1].x), color: colors[i] }));
  const byY = [...ends].sort((a, b) => a.y - b.y);
  const GAP = 26;
  for (let i = 1; i < byY.length; i++) byY[i].y = Math.max(byY[i].y, byY[i - 1].y + GAP);
  const overflow = byY.length ? byY[byY.length - 1].y - p.y1 : 0;
  if (overflow > 0) byY.forEach((e) => (e.y -= overflow));
  setFont(ctx, 600, 21, T.sans);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (const e of byY) {
    haloText(ctx, fit(ctx, e.name, nameW, 600, 21, 15, T.sans), p.x1 + 18, e.y, e.color, T.bg, 6);
  }
  if (total > series.length) {
    setFont(ctx, 500, 18, T.mono);
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = T.inkMuted;
    ctx.fillText(`Top ${series.length} of ${total} by latest value`, W - PAD, 186);
  }
}

export function drawChart(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  spec: ChartSpec,
  theme: ChartTheme,
  logo: HTMLImageElement | null,
): void {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  drawFrame(ctx, spec, theme, logo);
  const marks = marksFor(grid, spec);
  if (marks.length) {
    if (spec.kind === "scatter") drawScatter(ctx, grid, spec, marks, theme);
    else if (spec.kind === "line") drawLines(ctx, grid, spec, marks, theme);
    else drawBars(ctx, grid, spec, marks, theme);
  } else {
    setFont(ctx, 600, 28, theme.sans);
    ctx.fillStyle = theme.inkMuted;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Nothing to plot — pick a column with numbers.", W / 2, H / 2);
  }
  ctx.restore();
}
