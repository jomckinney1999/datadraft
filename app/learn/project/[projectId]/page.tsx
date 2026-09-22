import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectGuide from "@/components/project-guide";
import { PROJECTS, getProject } from "@/lib/projects";

export function generateStaticParams() {
  return PROJECTS.filter((p) => p.status === "live").map((p) => ({
    projectId: p.id,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { projectId: string };
}): Metadata {
  const project = getProject(params.projectId);
  return {
    title: project
      ? `${project.title} — DataDraft`
      : "Project — DataDraft",
    description: project?.blurb,
  };
}

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const project = getProject(params.projectId);
  if (!project || project.status !== "live") notFound();
  return <ProjectGuide project={project} />;
}
