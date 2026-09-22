import type { Metadata } from "next";
import TryPage from "./try-client";

export const metadata: Metadata = {
  title: "Try DataDraft — no account needed",
  description:
    "Guest invite: learn SQL through real NFL data in your browser. No sign-up.",
  openGraph: {
    title: "Try DataDraft — no account needed",
    description:
      "Guest invite: learn SQL through real NFL data in your browser. No sign-up.",
    url: "https://sql-sports.vercel.app/try",
  },
};

export default function TryRoute() {
  return <TryPage />;
}
