import type { Metadata } from "next";
import { ProjectsSection } from "@/components/features/projects/ProjectsSection";
import { fetchProjectsAction } from "@/lib/projects/actions";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: `Projects | ${siteConfig.name} ${siteConfig.org}`,
  description:
    "Explore production-grade cloud architectures, generative AI tools, and serverless applications built by student developers at AWS Student Builders Group LPU.",
};

export default async function ProjectsPage() {
  const projects = await fetchProjectsAction();
  return <ProjectsSection initialProjects={projects} />;
}
