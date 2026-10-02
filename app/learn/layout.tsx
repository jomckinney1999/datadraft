import type { Metadata } from "next";

/**
 * /learn and everything under it are client pages, which can't export
 * metadata, so the title lives here. Pages below that set their own (Rapid
 * Fire, the arcade) still win.
 */
export const metadata: Metadata = {
  title: "Courses — DataDraft",
  description:
    "Ten courses that play like a football drive: SQL, Python, Excel, R, statistics, visualization and Git, every lesson on real NFL data.",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
