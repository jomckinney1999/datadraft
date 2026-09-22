import type { Metadata } from "next";
import ResourcesHub from "@/components/resources-hub";

export const metadata: Metadata = {
  title: "Resources — DataDraft",
  description:
    "Resume sample outlines by career roadmap, job-hunt tactics, and book recommendations for data job searches.",
};

export default function ResourcesPage() {
  return <ResourcesHub />;
}
