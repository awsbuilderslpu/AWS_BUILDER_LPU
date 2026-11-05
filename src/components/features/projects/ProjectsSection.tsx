import * as React from "react";
import { ProjectsHero } from "@/components/features/projects/ProjectsHero";
import { ProjectsExplorer } from "@/components/features/projects/ProjectsExplorer";
import { ProjectsDecor } from "@/components/features/projects/ProjectsDecor";
import type { Project } from "@/data/projects";

interface ProjectsSectionProps {
  initialProjects?: Project[];
}

export function ProjectsSection({ initialProjects }: ProjectsSectionProps = {}) {
  return (
    <section className="relative min-h-screen overflow-hidden pb-20">
      <ProjectsDecor />
      <ProjectsHero />
      <ProjectsExplorer initialProjects={initialProjects} />
    </section>
  );
}
