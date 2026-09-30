import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectGuide from "@/components/project-guide";
import { getProject, liveProjects } from "@/lib/projects";

export function generateStaticParams() {
  return liveProjects().map((p) => ({ projectId: p.id }));
}

export function generateMetadata({
  params,
}: {
  params: { projectId: string };
}): Metadata {
  const p = getProject(params.projectId);
  return {
    title: p ? `${p.title} — DataDraft` : "Project — DataDraft",
    description: p?.blurb,
  };
}

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const project = getProject(params.projectId);
  if (!project) notFound();
  return <ProjectGuide project={project} />;
}
