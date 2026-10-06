import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import SiteFooter from "@/components/site-footer";
import CourseArt from "@/components/course-art";
import InterviewGuide from "@/components/interview-guide";
import { EXCEL_GUIDE } from "@/lib/pattern-guides";
import { QUESTIONS } from "@/lib/questions";
import { SITE_URL } from "@/lib/site";

/**
 * Excel interview questions: the guide page for the spreadsheet round
 * (2026-10-06). Content in lib/pattern-guides.ts (EXCEL_GUIDE); the
 * practice list is every Excel question in the bank.
 */

const guide = EXCEL_GUIDE;
const url = `${SITE_URL}${guide.path}`;
const practice = QUESTIONS.filter((q) => q.lang === "excel");
const image = `/api/og/card?${new URLSearchParams({ kind: "guide", t: guide.name, n: String(practice.length), s: guide.asks })}`;

export const metadata: Metadata = {
  title: guide.metaTitle,
  description: guide.metaDescription,
  alternates: { canonical: url },
  openGraph: { title: guide.metaTitle, description: guide.metaDescription, url, images: [{ url: image, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: guide.metaTitle, description: guide.metaDescription, images: [image] },
};

export default function ExcelGuidePage() {
  return (
    <>
      <AppNav />
      <InterviewGuide
        guide={guide}
        url={url}
        crumbs={[{ href: "/questions", label: "Questions", absolute: `${SITE_URL}/questions` }]}
        name={guide.name}
        label={guide.label}
        hero={<CourseArt id="excel" className="absolute inset-0 h-full w-full" />}
        practice={practice}
        bankHref="/questions?lang=excel"
        example={QUESTIONS.find((q) => q.id === guide.example)}
        code="excel"
        mistakesNote="Get one of these wrong on a practice question and the miss says whether you produced the wrong kind of value (text where the answer is a number, a blank) or the right kind from the wrong range, without giving the answer away."
        exampleNote="Grading compares the value your formula produces with the answer's, so XLOOKUP, INDEX/MATCH or anything else that lands on the same cell passes. It loads instantly: no download."
        cta={{
          title: "Want to try formulas with no question attached?",
          body: "The free Spreadsheet has the same workbook, a formula bar and a blank Practice sheet, plus a short drill book.",
          href: "/excel",
          label: "Open the Spreadsheet",
        }}
      />
      <SiteFooter />
    </>
  );
}
