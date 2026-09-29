import type { Metadata } from "next";
import StudioHubClient from "./client";

export const metadata: Metadata = {
  title: "Studio — DataDraft",
  description:
    "Udemy-style watch-along track: video instruction plus Google Colab notebooks. Same skills as the snap drills — hands-on pacing.",
};

export default function StudioHubPage() {
  return <StudioHubClient />;
}
