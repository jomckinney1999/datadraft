/**
 * Team colours, made safe to show on the charcoal canvas — and, for
 * scoreboards only, the crest.
 *
 * Team marks are trademarks (the reason the course covers are drawn, see
 * CLAUDE.md), and this file was colours-only until 2026-09-30, when score
 * tiles gained logos: a scoreboard without crests reads as a spreadsheet.
 * `teamLogo` hands back the ESPN URL nflverse lists; `components/team-logo.tsx`
 * hotlinks it as a plain <img>, never proxied through our domain, and falls
 * back to the swatch. Dense SQL result grids stay on `TeamChip` and colour.
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

/** The crest URL nflverse lists for `abbr`, or null. Scoreboards and charts, never dense grids. */
export function teamLogo(abbr: string): string | null {
  return BY_ABBR.get(abbr)?.logo ?? null;
}

/**
 * The same crest, sized for drawing on a chart: ESPN's own resizer at `px`
 * square (~9 KB instead of the 500px master), and ESPN's dark-background
 * variant, which differs for eight teams whose usual mark sinks into a dark
 * field (DAL, DEN, GB, LAR, LV, MIN, NYG, NYJ) and is the same image for the
 * rest. Still ESPN's CDN, never our domain. ESPN sends
 * `Access-Control-Allow-Origin: *`, which is what lets a canvas that draws
 * it still export a PNG. A URL of any other shape gets null, so a changed
 * source falls back to a dot rather than an image that would block export.
 */
export function teamCrest(abbr: string, px = 128): string | null {
  const m = teamLogo(abbr)?.match(/^https:\/\/a\.espncdn\.com\/i\/teamlogos\/nfl\/500(?:-dark)?\/([a-z]+\.png)$/);
  return m ? `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500-dark/${m[1]}&w=${px}&h=${px}` : null;
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
