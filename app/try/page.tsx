import type { Metadata } from "next";
import TryPage from "./try-client";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Try DataDraft — free beta",
  description:
    "Free beta. Create an account and learn SQL through real NFL data in your browser.",
  openGraph: {
    title: "Try DataDraft — free beta",
    description:
      "Free beta. Create an account and learn SQL through real NFL data in your browser.",
    url: `${SITE_URL}/try`,
  },
};

export default function TryRoute() {
  return <TryPage />;
}
