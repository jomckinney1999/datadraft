import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CAREER_ROLES, getRole } from "@/lib/career-paths";
import CareerPathClient from "./client";

export function generateStaticParams() {
  return CAREER_ROLES.map((r) => ({ roleId: r.id }));
}

export function generateMetadata({
  params,
}: {
  params: { roleId: string };
}): Metadata {
  const role = getRole(params.roleId);
  return {
    title: role
      ? `${role.title} path — SQL Sports`
      : "Career path — SQL Sports",
    description: role?.blurb,
  };
}

export default function CareerPathPage({
  params,
}: {
  params: { roleId: string };
}) {
  if (!getRole(params.roleId)) notFound();
  return <CareerPathClient roleId={params.roleId} />;
}
