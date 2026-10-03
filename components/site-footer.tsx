/**
 * The footer, as a map of the site rather than a copyright line.
 *
 * Three columns: what you can do, where the data lives, and what it is
 * built on. Nothing here links to a page that does not exist yet — the
 * legal drafts in docs/ are drafts, and a footer link to a policy that has
 * not been reviewed is a promise the site cannot keep.
 */

import Link from "next/link";
import { REPO_URL } from "@/lib/site";

const COLUMNS = [
  {
    title: "Practice",
    links: [
      { href: "/welcome", label: "Start here" },
      { href: "/questions", label: "Questions" },
      { href: "/questions/prep", label: "Hiring prep" },
      { href: "/learn", label: "Courses" },
      { href: "/projects", label: "Projects" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/account#locker", label: "Your locker" },
      { href: "/pricing", label: "Season Pass" },
    ],
  },
  {
    title: "The data",
    links: [
      { href: "/data", label: "Where it comes from" },
      { href: "/field", label: "Practice Field (free SQL)" },
      { href: "/excel", label: "Spreadsheet (free Excel)" },
      { href: "/questions/duel", label: "Stat Duel" },
      { href: "/draft", label: "Draft Room" },
      { href: "/learn/rapid", label: "Rapid Fire" },
    ],
  },
  {
    title: "Built on",
    links: [
      {
        href: "https://github.com/nflverse/nflverse-data",
        label: "nflverse-data (CC BY 4.0)",
        external: true,
      },
      {
        href: REPO_URL,
        label: "Source on GitHub",
        external: true,
      },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-panel-border bg-night/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-display text-lg font-bold text-ink">
              Data<span className="text-turf">Draft</span>
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
              LeetCode for football data. SQL, Python, R and Excel on three
              real NFL seasons — a new question every day, courses that run
              your code, projects worth your name.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Football as the lens · you don&apos;t have to watch the games
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) =>
                  "external" in l && l.external ? (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-ink-soft transition-colors hover:text-turf"
                      >
                        {l.label} ↗
                      </a>
                    </li>
                  ) : (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-ink-soft transition-colors hover:text-turf"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-panel-border pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-ink-muted">
            © {new Date().getFullYear()} DataDraft · free beta
          </p>
          <p className="font-mono text-[11px] text-ink-muted">
            Real NFL data from nflverse. No logos, no likenesses, no invented
            stats.
          </p>
        </div>
      </div>
    </footer>
  );
}
