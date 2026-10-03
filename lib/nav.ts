/**
 * The site's map: four sections, and what sits under each (decided
 * 2026-10-03). Both headers read it, the in-product AppNav and the landing
 * page's SiteNav, so crossing between them doesn't re-arrange the world.
 *
 * Four sections is still the rule; a fifth tab means taking one out. What
 * changed is that the games and the sandboxes were two clicks deep (the
 * Stat Duel and the Draft Room were deliberately kept out of the nav, and
 * reachable only from the questions page, the dashboard and the home page).
 * They're the things people come back for daily, so each section now opens
 * a menu of its own pages instead of growing the row.
 *
 * Every href here has to be a real page or a real anchor on one.
 */

export type NavItem = {
  href: string;
  label: string;
  /** One line under the label: what you'd do there. */
  blurb: string;
  /** A small tag, for the things that change every day. */
  badge?: string;
};

export type NavGroup = { title: string; items: NavItem[] };

export type NavSection = {
  href: string;
  label: string;
  groups: NavGroup[];
};

export const NAV: NavSection[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    groups: [
      {
        title: "Your locker",
        items: [
          { href: "/dashboard", label: "Home", blurb: "What's next — today's question and the next lesson" },
          { href: "/achievements", label: "Hall of Fame", blurb: "Trophies you've earned, and the next enshrinement" },
        ],
      },
    ],
  },
  {
    href: "/questions",
    label: "Questions",
    groups: [
      {
        title: "Practice",
        items: [
          { href: "/questions", label: "Question bank", blurb: "Today's question, and the whole bank in SQL, Python, R and Excel", badge: "Daily" },
          { href: "/questions#interview", label: "Interview patterns", blurb: "The nine SQL patterns analyst screens test" },
          { href: "/questions/prep", label: "Hiring prep", blurb: "The funnel in order: online assessment, SQL screen, take-home" },
          { href: "/questions/screen", label: "Analyst Screen", blurb: "A timed online assessment: SQL plus stats, wrangling and A/B" },
          { href: "/questions/mock", label: "Mock SQL screens", blurb: "A timed phone or technical screen, then a report" },
        ],
      },
      {
        title: "Play",
        items: [
          { href: "/questions/duel", label: "Stat Duel", blurb: "Five head-to-heads on real numbers", badge: "Daily" },
          { href: "/draft", label: "Draft Room", blurb: "Draft a real season, scouting with SQL" },
          { href: "/learn/rapid", label: "Rapid Fire", blurb: "Twelve seconds a question, no typing" },
          { href: "/learn/arcade", label: "Arcade", blurb: "Pattern Call, Foul Call, Film Room Match — prep between drives", badge: "Prep" },
        ],
      },
    ],
  },
  {
    href: "/learn",
    label: "Courses",
    groups: [
      {
        title: "Learn",
        items: [
          { href: "/learn", label: "All courses", blurb: "SQL, Python, Excel, R and more, one short lesson at a time" },
        ],
      },
      {
        title: "Sandboxes",
        items: [
          { href: "/field", label: "Practice Field", blurb: "Free-play SQL on this season's real stats" },
          { href: "/excel", label: "Spreadsheet", blurb: "Real formulas on a real workbook" },
          { href: "/data", label: "The data", blurb: "Where every row comes from, with free downloads" },
        ],
      },
    ],
  },
  {
    href: "/projects",
    label: "Projects",
    groups: [
      {
        title: "Builds",
        items: [
          { href: "/projects/my-league-scorecard", label: "Your League Scorecard", blurb: "Chart your own fantasy league" },
          { href: "/projects/nflverse-dbt-warehouse", label: "Build the Warehouse", blurb: "A real dbt project on NFL data" },
          { href: "/projects/fantasy-points-model", label: "Prediction Model", blurb: "Beat a baseline, honestly" },
        ],
      },
      {
        title: "Cases",
        items: [
          { href: "/projects#cases", label: "Data cases", blurb: "Half an hour, a schema you've never seen, a right answer" },
          { href: "/projects/challenge", label: "Data Challenge", blurb: "A take-home on messy data: clean, join, recommend" },
        ],
      },
    ],
  },
];

const pathOf = (href: string) => href.split("#")[0];

/**
 * The section a page belongs to. A page listed in a menu belongs to that
 * menu's section even when its URL lives elsewhere (Rapid Fire is under
 * /learn but is a game, so it lights up Questions); otherwise the longest
 * matching section prefix wins.
 */
export function currentSection(pathname: string): string | null {
  for (const s of NAV) {
    if (s.groups.some((g) => g.items.some((i) => pathOf(i.href) === pathname && pathOf(i.href) !== s.href))) return s.href;
  }
  const hit = NAV.filter((s) => pathname === s.href || pathname.startsWith(`${s.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  return hit?.href ?? null;
}
