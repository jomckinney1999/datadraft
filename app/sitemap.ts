import type { MetadataRoute } from "next";
import { COURSES } from "@/lib/courses";
import { INTERVIEW_CASES } from "@/lib/interview-cases";
import { liveProjects } from "@/lib/projects";
import { QUESTIONS } from "@/lib/questions";
import { SITE_URL } from "@/lib/site";
import { PAYWALL_LIVE } from "@/lib/season-pass";
import { GUIDES_BASE, PATTERN_GUIDES } from "@/lib/pattern-guides";

/**
 * Every public page, so search engines find the question bank rather than
 * just the front door. Built from the same lists the pages are, so a new
 * question, build or case is in the sitemap the moment it ships.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly") => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  });
  return [
    at("/", 1, "daily"),
    at("/questions", 0.9, "daily"),
    at(GUIDES_BASE, 0.9),
    ...PATTERN_GUIDES.map((g) => at(`${GUIDES_BASE}/${g.slug}`, 0.8)),
    at("/questions/duel", 0.8, "daily"),
    at("/questions/mock", 0.7),
    at("/questions/prep", 0.7),
    at("/questions/screen", 0.7),
    at("/projects/challenge", 0.6),
    at("/draft", 0.8),
    at("/learn", 0.8),
    at("/projects", 0.8),
    at("/welcome", 0.6, "monthly"),
    at("/resources", 0.5, "monthly"),
    at("/dashboard", 0.7, "daily"),
    at("/achievements", 0.6, "monthly"),
    at("/pricing", PAYWALL_LIVE ? 0.8 : 0.6, "monthly"),
    at("/data", 0.5, "monthly"),
    at("/field", 0.5, "monthly"),
    at("/excel", 0.5, "monthly"),
    at("/learn/rapid", 0.4, "monthly"),
    at("/learn/arcade", 0.5, "monthly"),
    ...COURSES.filter((c) => c.moduleId).map((c) => at(`/learn/track/${c.moduleId}`, 0.6, "monthly")),
    ...liveProjects().map((p) => at(`/projects/${p.id}`, 0.6, "monthly")),
    ...INTERVIEW_CASES.map((c) => at(`/projects/case/${c.id}`, 0.5, "monthly")),
    ...QUESTIONS.map((q) => at(`/questions/${q.id}`, 0.6, "monthly")),
  ];
}
