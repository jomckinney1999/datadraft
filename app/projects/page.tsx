import type { Metadata } from "next";
import ProjectCatalog from "@/components/project-catalog";

export const metadata: Metadata = {
  title: "Projects — DataDraft",
  description:
    "Guided builds that end in a repo you can show someone, plus short analyst cases with a brief, a schema and a live SQL terminal.",
};

export default function ProjectsPage() {
  return <ProjectCatalog />;
}
