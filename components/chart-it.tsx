"use client";

/**
 * "Chart it" — a button beside any SQL result that opens it as a chart worth
 * posting: pick the kind, the columns, the title, and download or share a
 * 1600×900 PNG with the DataDraft name and the data credit on it.
 *
 * It renders nothing when a result can't be charted (fewer than two rows, or
 * no column of numbers). The deciding and the drawing live in lib/chart.ts
 * and lib/chart-draw.ts; this file is only the dialog.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  chartOptions,
  prettyName,
  respec,
  slug,
  suggestSpec,
  type ChartKind,
  type ChartSpec,
  type Grid,
  type Quadrants,
} from "@/lib/chart";
import { drawChart, H, readTheme, W, type Crests } from "@/lib/chart-draw";
import { teamCrest } from "@/lib/team-colors";

const KIND_LABEL: Record<ChartKind, string> = {
  bar: "Bars",
  scatter: "Scatter",
  line: "Lines",
};

const FIELD =
  "w-full rounded-lg border border-panel-border bg-night/60 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-turf/60";

export default function ChartIt({
  grid,
  title,
  subtitle,
  credit,
  shareUrl,
  shareText,
  preset,
}: {
  grid: Grid;
  title: string;
  subtitle?: string;
  credit: string;
  /** Where someone who sees the posted chart can go to make their own. */
  shareUrl: string;
  /** The words that go with the post. */
  shareText?: string;
  /** Overrides on the suggested chart: a league preset's quadrant captions. */
  preset?: Partial<ChartSpec>;
}) {
  const options = useMemo(() => chartOptions(grid), [grid]);
  const shape = grid.columns.join("|");
  const presetKey = JSON.stringify(preset ?? {});
  const [open, setOpen] = useState(false);
  const [spec, setSpec] = useState<ChartSpec | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [logoReady, setLogoReady] = useState(false);
  const [crestsIn, setCrestsIn] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const crestsRef = useRef<Crests>(new Map());
  const crestFrame = useRef<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // A new shape of result gets a fresh suggestion; re-running the same query
  // keeps whatever the learner already chose.
  useEffect(() => {
    const s = suggestSpec(grid, { title, subtitle, credit });
    setSpec(s ? { ...s, ...(preset ?? {}) } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, title, subtitle, credit, presetKey]);

  useEffect(() => {
    if (!open || logoRef.current) return;
    const img = new Image();
    img.onload = () => setLogoReady(true);
    img.src = "/brand/datadraft-avatar-400.png";
    logoRef.current = img;
  }, [open]);

  // The crests of the teams in this result, fetched from ESPN when the
  // dialog opens. `crossOrigin` is what keeps the canvas exportable (ESPN
  // allows any origin); without it the first crest drawn would make Download
  // and Copy throw. The chart draws straight away with dots and redraws as
  // crests land, one redraw per frame however many arrive in it. A crest that
  // fails stays a dot.
  const teamCol = spec?.team ?? null;
  const logosOn = spec?.logos ?? false;
  const teams = useMemo(() => {
    if (teamCol === null) return "";
    const seen = new Set<string>();
    for (const r of grid.values) {
      const v = r[teamCol];
      if (typeof v === "string" && v) seen.add(v);
    }
    return Array.from(seen).sort().join(",");
  }, [grid, teamCol]);

  useEffect(() => {
    if (!open || !logosOn || !teams) return;
    const crests = crestsRef.current;
    const landed = () => {
      if (crestFrame.current !== null) return;
      crestFrame.current = requestAnimationFrame(() => {
        crestFrame.current = null;
        setCrestsIn((n) => n + 1);
      });
    };
    for (const abbr of teams.split(",")) {
      const src = teamCrest(abbr);
      if (!src || crests.has(abbr)) continue;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";
      img.decoding = "async";
      img.onload = landed;
      img.src = src;
      crests.set(abbr, img);
    }
  }, [open, logosOn, teams]);

  useEffect(
    () => () => {
      if (crestFrame.current !== null) cancelAnimationFrame(crestFrame.current);
    },
    [],
  );

  // Draw once the page's fonts are in, so the PNG carries them.
  useEffect(() => {
    if (!open || !spec) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    let cancelled = false;
    const theme = readTheme();
    const fonts = document.fonts
      ? Promise.all([
          document.fonts.load(`700 54px ${theme.display}`),
          document.fonts.load(`600 22px ${theme.sans}`),
          document.fonts.load(`500 20px ${theme.mono}`),
        ]).catch(() => null)
      : Promise.resolve(null);
    fonts.then(() => {
      if (!cancelled) drawChart(ctx, grid, spec, theme, logoRef.current, crestsRef.current);
    });
    return () => {
      cancelled = true;
    };
  }, [open, spec, grid, logoReady, crestsIn]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    const opener = openerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  if (!options.kinds.length || !spec) return null;

  const cols = options.columns;
  const numeric = cols.filter((c) => c.numeric);
  const set = (patch: Partial<ChartSpec>) => setSpec({ ...spec, ...patch });
  const fileName = `${slug(spec.title)}.png`;
  const link = `${shareUrl}${shareUrl.includes("?") ? "&" : "?"}ref=chart`;

  const toBlob = () =>
    new Promise<Blob>((resolve, reject) =>
      canvasRef.current?.toBlob((b) => (b ? resolve(b) : reject(new Error("no image"))), "image/png"),
    );

  async function download() {
    const blob = await toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setNote("Saved. Attach it to your post.");
  }

  async function copy() {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": toBlob() })]);
      setNote("Copied. Paste it straight into a post or the group chat.");
    } catch {
      setNote("This browser won't copy images. Use Download instead.");
    }
  }

  async function share() {
    try {
      const file = new File([await toBlob()], fileName, { type: "image/png" });
      await navigator.share({ files: [file], title: spec!.title, text: `${shareText ?? spec!.title} ${link}` });
    } catch {
      // Cancelled, or not supported — Download is right there.
    }
  }

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] });

  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${shareText ?? spec.title}\n\n`,
  )}&url=${encodeURIComponent(link)}`;

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => {
          setNote(null);
          setOpen(true);
        }}
        className="press btn-gold !px-3 !py-1.5"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5">
          <path d="M2 14 V8 M6 14 V4 M10 14 V7 M14 14 V2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        Chart it
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-night/85 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chart it"
            className="surface w-full max-w-5xl rounded-2xl border border-panel-border bg-panel p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="label-broadcast text-gold">chart it</p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg border border-panel-border px-2.5 py-1 font-mono text-xs text-ink-muted transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-3">
                <div className="flex gap-1.5" role="radiogroup" aria-label="Chart type">
                  {(["bar", "scatter", "line"] as ChartKind[]).map((k) => {
                    const ok = options.kinds.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={spec.kind === k}
                        disabled={!ok}
                        onClick={() => setSpec(respec(spec, k, grid))}
                        className={`flex-1 rounded-lg border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-35 ${
                          spec.kind === k
                            ? "border-gold bg-gold/15 text-gold"
                            : "border-panel-border text-ink-soft hover:border-gold/50"
                        }`}
                      >
                        {KIND_LABEL[k]}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {spec.kind !== "bar" && (
                    <Picker
                      label={spec.kind === "line" ? "Across" : "X axis"}
                      value={spec.x}
                      onChange={(x) => set({ x })}
                      options={numeric.map((c) => [c.index, prettyName(c.name)])}
                    />
                  )}
                  <Picker
                    label={spec.kind === "bar" ? "Value" : "Y axis"}
                    value={spec.y}
                    onChange={(y) => set({ y, ...(spec.kind === "bar" ? { x: y } : {}) })}
                    options={numeric.map((c) => [c.index, prettyName(c.name)])}
                  />
                  <Picker
                    label={spec.kind === "line" ? "One line per" : spec.kind === "bar" ? "Bars" : "Dot labels"}
                    value={spec.label ?? -1}
                    onChange={(v) => set({ label: v < 0 ? null : v })}
                    options={[
                      [-1, spec.kind === "line" ? "One line" : "None"],
                      ...cols.filter((c) => c.index !== spec.y).map((c) => [c.index, prettyName(c.name)] as [number, string]),
                    ]}
                  />
                </div>

                {spec.team !== null && (
                  <button
                    type="button"
                    aria-pressed={spec.logos}
                    onClick={() => set({ logos: !spec.logos })}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      spec.logos
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-panel-border text-ink-soft hover:border-gold/50"
                    }`}
                  >
                    Team logos
                    <span aria-hidden>{spec.logos ? "On" : "Off"}</span>
                  </button>
                )}

                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-muted">Title</span>
                  <input className={FIELD} value={spec.title} maxLength={90} onChange={(e) => set({ title: e.target.value })} />
                </label>
                <label className="block">
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-muted">Subtitle</span>
                  <input className={FIELD} value={spec.subtitle} maxLength={120} onChange={(e) => set({ subtitle: e.target.value })} />
                </label>

                {spec.kind === "scatter" && (
                  <details className="rounded-lg border border-panel-border px-3 py-2" open={!!spec.quadrants}>
                    <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                      Corner labels
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {(["Top left", "Top right", "Bottom left", "Bottom right"] as const).map((name, i) => (
                        <input
                          key={name}
                          className={FIELD}
                          placeholder={name}
                          maxLength={28}
                          value={spec.quadrants?.[i] ?? ""}
                          onChange={(e) => {
                            const q: Quadrants = [...(spec.quadrants ?? ["", "", "", ""])] as Quadrants;
                            q[i] = e.target.value;
                            set({ quadrants: q.some(Boolean) ? q : null });
                          }}
                        />
                      ))}
                    </div>
                  </details>
                )}
              </div>

              <div>
                <canvas
                  ref={canvasRef}
                  width={W}
                  height={H}
                  role="img"
                  aria-label={`${KIND_LABEL[spec.kind]} chart: ${spec.title}`}
                  className="h-auto w-full rounded-xl border border-panel-border"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={download} className="press btn-turf">
                    Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={copy}
                    className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-turf/50 hover:text-ink"
                  >
                    Copy image
                  </button>
                  {canShareFiles && (
                    <button
                      type="button"
                      onClick={share}
                      className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-turf/50 hover:text-ink"
                    >
                      Share
                    </button>
                  )}
                  <a
                    href={tweet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-panel-border px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft transition-colors hover:border-ice/50 hover:text-ink"
                  >
                    Post on X
                  </a>
                </div>
                <p className="mt-2 min-h-[1.25rem] font-mono text-[10px] text-ink-muted" aria-live="polite">
                  {note ?? "Posting to X? Download or copy the image first, then attach it to the post."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Picker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  options: [number, string][];
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-muted">{label}</span>
      <select className={FIELD} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map(([v, name]) => (
          <option key={v} value={v}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
