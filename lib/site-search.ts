/**
 * What the site search can find. Built from the same lists the pages use, so
 * a new question or course shows up the moment it ships — no separate index
 * to keep in sync.
 *
 * Kept small and DOM-free so the search dialog can import it from a client
 * component without dragging in engines or datasets.
 */

import { COURSES } from "@/lib/courses";
import { INTERVIEW_CASES } from "@/lib/interview-cases";
import { liveProjects } from "@/lib/projects";
import { LANG_LABEL, QUESTIONS } from "@/lib/questions";
import { NAV } from "@/lib/nav";

export type SearchHit = {
  href: string;
  title: string;
  blurb: string;
  kind: "page" | "question" | "course" | "project" | "case";
  /** Lowercased haystack for matching. */
  needle: string;
};

function hit(
  kind: SearchHit["kind"],
  href: string,
  title: string,
  blurb: string,
  extra = "",
): SearchHit {
  return {
    kind,
    href,
    title,
    blurb,
    needle: `${title} ${blurb} ${extra}`.toLowerCase(),
  };
}

/** Flat list, pages first, then the catalogues. Built once per module load. */
export const SEARCH_INDEX: SearchHit[] = (() => {
  const pages: SearchHit[] = [
    hit("page", "/", "Home", "The front door"),
    hit("page", "/dashboard", "Dashboard", "Your locker — what's next"),
    hit("page", "/account", "Account", "Sign in, save progress"),
    hit("page", "/welcome", "Start here", "A map of the site"),
    hit("page", "/data", "The data", "Where every row comes from"),
    hit("page", "/field", "Practice Field", "Free-play SQL on this season"),
    hit("page", "/excel", "Spreadsheet", "Real formulas on a real workbook"),
    hit("page", "/questions/duel", "Stat Duel", "Five head-to-heads on real numbers"),
    hit("page", "/draft", "Draft Room", "Draft a real season, scouting with SQL"),
    hit("page", "/learn/rapid", "Rapid Fire", "Twelve seconds a question"),
    hit("page", "/questions/mock", "Mock SQL screens", "Timed phone or technical screen"),
    hit("page", "/questions/prep", "Hiring prep", "Online assessment, SQL screen, take-home", "interview analyst oa funnel"),
    hit("page", "/questions/screen", "Analyst Screen", "Timed online assessment: SQL plus multiple choice", "oa assessment stats a/b"),
    hit("page", "/projects/challenge", "Data Challenge", "A take-home on messy data with a rubric", "take-home market pulse dq"),
  ];

  for (const section of NAV) {
    for (const group of section.groups) {
      for (const item of group.items) {
        if (pages.some((p) => p.href === item.href)) continue;
        pages.push(hit("page", item.href, item.label, item.blurb));
      }
    }
  }

  const questions = QUESTIONS.map((q) =>
    hit(
      "question",
      `/questions/${q.id}`,
      q.title,
      `${LANG_LABEL[q.lang]} · ${q.difficulty}`,
      `${q.tags.join(" ")} ${q.prompt.slice(0, 120)}`,
    ),
  );

  const courses = COURSES.map((c) =>
    hit(
      "course",
      c.moduleId ? `/learn/track/${c.moduleId}` : "/learn",
      c.title,
      c.blurb,
      c.level,
    ),
  );

  const projects = liveProjects().map((p) =>
    hit("project", `/projects/${p.id}`, p.title, p.blurb, p.skills.join(" ")),
  );

  const cases = INTERVIEW_CASES.map((c) =>
    hit("case", `/projects/case/${c.id}`, c.title, c.blurb, `${c.org} ${c.skills.join(" ")}`),
  );

  return [...pages, ...courses, ...projects, ...cases, ...questions];
})();

const KIND_RANK: Record<SearchHit["kind"], number> = {
  page: 0,
  course: 1,
  project: 2,
  case: 3,
  question: 4,
};

/**
 * Ranked matches for a query. Empty query → nothing (the dialog shows
 * suggestions separately). Caps the list so a one-letter search can't dump
 * the whole bank into the panel.
 */
export function searchSite(query: string, limit = 12): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);

  const scored: { hit: SearchHit; score: number }[] = [];
  for (const h of SEARCH_INDEX) {
    if (!words.every((w) => h.needle.includes(w))) continue;
    let score = KIND_RANK[h.kind] * 10;
    const title = h.title.toLowerCase();
    if (title.startsWith(q)) score -= 30;
    else if (title.includes(q)) score -= 15;
    else if (words.every((w) => title.includes(w))) score -= 8;
    scored.push({ hit: h, score });
  }

  scored.sort((a, b) => a.score - b.score || a.hit.title.localeCompare(b.hit.title));
  return scored.slice(0, limit).map((s) => s.hit);
}

/** A few doors to show before anyone types. */
export const SEARCH_SUGGESTIONS: SearchHit[] = [
  hit("page", "/questions", "Question bank", "Today's question and the whole bank"),
  hit("page", "/learn", "Courses", "SQL, Python, Excel, R and more"),
  hit("page", "/questions/duel", "Stat Duel", "Five head-to-heads, no code"),
  hit("page", "/draft", "Draft Room", "Scout with SQL, draft a season"),
  hit("page", "/projects/my-league-scorecard", "Your League Scorecard", "Chart your own fantasy league"),
];
