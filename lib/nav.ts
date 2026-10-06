/**
 * The site's map. Both headers read it — the in-product AppNav and the
 * landing page's SiteNav — so crossing between them doesn't re-arrange
 * the world.
 *
 * Product sections first (Dashboard · Questions · Courses · Projects),
 * then Resources (orientation / data / account) and Pricing (Season Pass).
 * Each section opens a menu of its own pages.
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

/**
 * A compact link: a course you can jump straight into, shown as a small
 * tile with a monogram rather than a full card, so eleven of them fit.
 */
export type NavChip = {
  href: string;
  label: string;
  /** One to three characters on the tile, periodic-table style. */
  mark: string;
  /** The course's full name, for the tooltip. */
  blurb: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
  /** Compact links under the items, with a caption of their own. */
  chips?: { title: string; items: NavChip[] };
};

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
          { href: "/sql-interview-questions", label: "Interview patterns", blurb: "The nine SQL patterns screens test, plus pandas and Excel guides" },
          { href: "/questions/prep", label: "Analyst path", blurb: "Four steps to interview-ready, with your progress ticked", badge: "Pass" },
          { href: "/questions/screen", label: "Analyst Screen", blurb: "A timed online assessment: SQL plus stats, wrangling and A/B", badge: "Pass" },
          { href: "/questions/mock", label: "Mock SQL screens", blurb: "A timed phone or technical screen, then a report", badge: "Pass" },
        ],
      },
      {
        title: "Play",
        items: [
          { href: "/questions/duel", label: "Stat Duel", blurb: "Five head-to-heads on real numbers", badge: "Daily" },
          { href: "/draft", label: "Draft Room", blurb: "Draft a real season, scouting with SQL" },
          { href: "/learn/rapid", label: "Rapid Fire", blurb: "Twelve seconds a question, no typing" },
          { href: "/learn/arcade", label: "Arcade", blurb: "Pattern Call, Foul Call, Film Room Match — prep between drives" },
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
        chips: {
          title: "Pick a language",
          items: [
            { href: "/learn/track/sql-fundamentals", label: "SQL", mark: "Sq", blurb: "SQL Fundamentals" },
            { href: "/learn/track/sql-advanced", label: "Advanced SQL", mark: "Sq+", blurb: "Advanced SQL" },
            { href: "/learn/track/python", label: "Python", mark: "Py", blurb: "Python & pandas" },
            { href: "/learn/track/r", label: "R", mark: "R", blurb: "R & the Tidyverse" },
            { href: "/learn/track/excel", label: "Excel", mark: "Fx", blurb: "Excel for Analysts" },
            { href: "/learn/track/stats", label: "Statistics", mark: "St", blurb: "Statistics That Hold Up" },
            { href: "/learn/track/viz", label: "Visualization", mark: "Vz", blurb: "Chart choice, honest axes, bars, lines and scatters" },
            { href: "/learn/track/tableau", label: "Tableau", mark: "Tb", blurb: "Tableau for Data Visualization" },
            { href: "/learn/track/powerbi", label: "Power BI", mark: "Bi", blurb: "Power BI & DAX" },
            { href: "/learn/track/git", label: "Git", mark: "Gt", blurb: "Git & GitHub" },
            { href: "/learn/track/ai", label: "AI", mark: "Ai", blurb: "LLMs & AI for Analysts" },
          ],
        },
      },
      {
        title: "Sandboxes",
        items: [
          { href: "/field", label: "Practice Field", blurb: "Free-play SQL on this season's real stats", badge: "Free" },
          { href: "/excel", label: "Spreadsheet", blurb: "Real formulas on a real workbook", badge: "Free" },
          { href: "/viz", label: "Viz Builder", blurb: "Tableau-style shelves, marks and filters", badge: "Free" },
          { href: "/dax", label: "DAX Lab", blurb: "Power BI-style measures in a live matrix", badge: "Free" },
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
          { href: "/projects/my-league-scorecard", label: "Your League Scorecard", blurb: "Chart your own fantasy league", badge: "Free" },
          { href: "/projects/nflverse-dbt-warehouse", label: "Build the Warehouse", blurb: "A real dbt project on NFL data" },
          { href: "/projects/fantasy-points-model", label: "Prediction Model", blurb: "Beat a baseline, honestly" },
        ],
      },
      {
        title: "Cases",
        items: [
          { href: "/projects#cases", label: "Data cases", blurb: "Half an hour, a schema you've never seen, a right answer" },
          { href: "/projects/challenge", label: "Data Challenge", blurb: "A take-home on messy data: clean, join, recommend", badge: "Pass" },
        ],
      },
    ],
  },
  {
    href: "/resources",
    label: "Resources",
    groups: [
      {
        title: "Find your way",
        items: [
          { href: "/resources", label: "Resource hub", blurb: "Start here, the data, your account — the map of the site" },
          { href: "/welcome", label: "Start here", blurb: "A full map of Questions, Courses, Projects and Play" },
          { href: "/data", label: "The data", blurb: "Where every row comes from, with free downloads" },
        ],
      },
      {
        title: "Your stuff",
        items: [
          { href: "/account", label: "Account", blurb: "Sign in, sync progress, manage your Season Pass" },
        ],
      },
    ],
  },
  {
    href: "/pricing",
    label: "Pricing",
    groups: [
      {
        title: "Season Pass",
        items: [
          { href: "/pricing", label: "Season Pass", blurb: "Every question, Query Doctor, mocks and every course", badge: "Pass" },
          { href: "/account", label: "Manage billing", blurb: "Sign in to join the waitlist or open the billing portal" },
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
  // A page under a menu item's own path (the pattern guides under
  // /sql-interview-questions) belongs to that item's section, unless the
  // item is a section's front door, which the prefix match below handles.
  const roots = new Set(NAV.map((s) => s.href));
  for (const s of NAV) {
    if (s.groups.some((g) => g.items.some((i) => !roots.has(pathOf(i.href)) && pathname.startsWith(`${pathOf(i.href)}/`)))) return s.href;
  }
  const hit = NAV.filter((s) => pathname === s.href || pathname.startsWith(`${s.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  return hit?.href ?? null;
}
