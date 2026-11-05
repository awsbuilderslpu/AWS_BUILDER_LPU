import type { Metadata } from "next";
import { connection } from "next/server";
import { requireStaff } from "@/lib/auth/server";
import { fetchProjectsAction } from "@/lib/projects/actions";
import { ProjectsView } from "@/components/features/admin/projects/ProjectsView";

export const metadata: Metadata = {
  title: "Project Management",
};

export default async function AdminProjectsPage() {
  await connection();
  await requireStaff("/admin/projects");
  const projects = await fetchProjectsAction();

  return <ProjectsView initialProjects={projects} />;
}

