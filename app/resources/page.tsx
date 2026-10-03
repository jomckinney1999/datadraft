import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import { NavIcon } from "@/components/nav-icons";

export const metadata: Metadata = {
  title: "Resources — DataDraft",
  description:
    "Orientation, data provenance, and your account — the reference map for DataDraft.",
};

/**
 * A light hub for orientation and reference links. Not the retired career
 * kit (resume outlines, outreach cadence, book shelf) — those stayed gone.
 * This page exists so /resources is a real destination again, and the nav
 * section has somewhere to land.
 */

const LINKS: {
  href: string;
  label: string;
  blurb: string;
  badge?: string;
}[] = [
  {
    href: "/welcome",
    label: "Start here",
    blurb: "A full map of the site: questions, courses, interview prep, projects and the games.",
  },
  {
    href: "/data",
    label: "The data",
    blurb: "Where every lesson row comes from, what's real vs drafted, and free CSV downloads.",
  },
  {
    href: "/account",
    label: "Account",
    blurb: "Sign in with a magic link, sync progress across devices, manage your Season Pass.",
  },
  {
    href: "/pricing",
    label: "Season Pass",
    blurb: "What's free, what's on the Pass, and the founding price waitlist.",
    badge: "Pass",
  },
  {
    href: "/field",
    label: "Practice Field",
    blurb: "Ungraded SQL on this season's real stats. No timeouts.",
    badge: "Free",
  },
  {
    href: "/excel",
    label: "Spreadsheet",
    blurb: "Real formulas on a real workbook. Free play.",
    badge: "Free",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6">
        <header>
          <p className="label-broadcast text-ice">resources</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Find your way
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            Orientation, where the numbers come from, and your account. The
            daily work still lives under Questions, Courses and Projects.
          </p>
        </header>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="pop-tile group flex h-full items-start gap-3 rounded-2xl border border-panel-border bg-panel/60 p-3.5"
              >
                <NavIcon href={item.href} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-ink">
                    {item.label}
                    {item.badge && (
                      <span
                        className={`rounded-full border px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-widest ${
                          item.badge === "Pass"
                            ? "border-gold/60 bg-gold/15 text-gold"
                            : "border-turf/60 bg-turf/15 text-turf"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                    {item.blurb}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
