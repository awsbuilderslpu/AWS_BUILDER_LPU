import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsSection } from "@/components/features/projects/ProjectsSection";
import { fetchProjectsAction } from "@/lib/projects/actions";
import { projects as staticProjects } from "@/data/projects";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: `Projects | ${siteConfig.name} ${siteConfig.org}`,
  description:
    "Explore production-grade cloud architectures, generative AI tools, and serverless applications built by student developers at AWS Student Builders Group LPU.",
};

async function ProjectsContent() {
  const projects = await fetchProjectsAction();
  return <ProjectsSection initialProjects={projects} />;
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsSection initialProjects={staticProjects} />}>
      <ProjectsContent />
    </Suspense>
  );
}
