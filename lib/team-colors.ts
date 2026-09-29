/**
 * Team colours, made safe to show on the charcoal canvas.
 *
 * Colours only — logos and wordmarks are trademarks and are used nowhere in
 * this product (same reason the course covers are drawn, see CLAUDE.md).
 *
 * The raw colours can't be used as-is: several primaries are near-black
 * (Raiders #000000, Ravens #241773, Steelers #101820) and disappear against
 * the #131F24 canvas. `teamAccent` picks whichever of a team's two colours
 * reads on a dark background, and lightens it if neither does — so a swatch is
 * always visible without inventing a colour that isn't theirs.
 */

import { TEAM_COLORS, type TeamColor } from "./team-colors.generated";

const BY_ABBR = new Map<string, TeamColor>(
  TEAM_COLORS.map((t) => [t.abbr, t]),
);

/** Canvas the swatches sit on — keep in step with --c-night. */
const CANVAS = { r: 0x13, g: 0x1f, b: 0x24 };

function rgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(hex: string) {
  const a = luminance(rgb(hex));
  const b = luminance(CANVAS);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/** Mix toward white until the swatch is visible against the canvas. */
function lighten(hex: string, amount: number) {
  const { r, g, b } = rgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
}

export function teamName(abbr: string): string {
  return BY_ABBR.get(abbr)?.name ?? abbr;
}

/**
 * A colour for `abbr` that is actually visible here. Falls back to the site's
 * muted ink for teams we don't know, rather than guessing.
 */
export function teamAccent(abbr: string): string {
  const team = BY_ABBR.get(abbr);
  if (!team) return "#8591B4";

  // Prefer the team's primary whenever it is legible here. Picking whichever
  // colour has the most contrast would show Kansas City in gold rather than
  // red, which is not how anyone thinks of them.
  if (contrast(team.primary) >= 2.2) return team.primary;
  if (team.secondary && contrast(team.secondary) >= 2.2) return team.secondary;

  // Both colours are too dark to see. Lighten the team's own primary rather
  // than substituting someone else's colour.
  for (const amount of [0.25, 0.4, 0.55, 0.7]) {
    const lit = lighten(team.primary, amount);
    if (contrast(lit) >= 2.2) return lit;
  }
  return lighten(team.primary, 0.7);
}
