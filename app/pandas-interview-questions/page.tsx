import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import SiteFooter from "@/components/site-footer";
import CourseArt from "@/components/course-art";
import InterviewGuide from "@/components/interview-guide";
import { PANDAS_GUIDE } from "@/lib/pattern-guides";
import { QUESTIONS } from "@/lib/questions";
import { SITE_URL } from "@/lib/site";

/**
 * Pandas interview questions: the SQL guide page for the Python round
 * (2026-10-06). Content in lib/pattern-guides.ts (PANDAS_GUIDE); the
 * practice list is every Python question in the bank.
 */

const guide = PANDAS_GUIDE;
const url = `${SITE_URL}${guide.path}`;
const practice = QUESTIONS.filter((q) => q.lang === "python");
const image = `/api/og/card?${new URLSearchParams({ kind: "guide", t: guide.name, n: String(practice.length), s: guide.asks })}`;

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.metaDescription,
  alternates: { canonical: url },
  openGraph: { title: guide.metaTitle, description: guide.metaDescription, url, images: [{ url: image, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: guide.metaTitle, description: guide.metaDescription, images: [image] },
};

export default function PandasGuidePage() {
  return (
    <>
      <AppNav />
      <InterviewGuide
        guide={guide}
        url={url}
        crumbs={[{ href: "/questions", label: "Questions", absolute: `${SITE_URL}/questions` }]}
        name={guide.name}
        label={guide.label}
        hero={<CourseArt id="python" className="absolute inset-0 h-full w-full" />}
        practice={practice}
        bankHref="/questions?lang=python"
        example={QUESTIONS.find((q) => q.id === guide.example)}
        code="python"
        mistakesNote="Get one of these wrong on a practice question and the miss says what kind of thing you printed (a Series where the answer is a dict, or a different number of lines), without giving the answer away."
        exampleNote="Grading compares what your code prints with what the answer prints, so a different route to the same output passes too. Python takes a few seconds to load the first time; after that it's instant."
        cta={{
          title: "Want the basics first?",
          body: "The Python course goes from your first variable to groupby and merges in short lessons, each ending on code you run.",
          href: "/learn/track/python",
          label: "Start the Python course",
        }}
      />
      <SiteFooter />
    </>
  );
}
