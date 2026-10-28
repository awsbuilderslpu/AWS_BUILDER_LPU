import * as React from "react";
import { ProjectsHero } from "@/components/features/projects/ProjectsHero";
import { ProjectsExplorer } from "@/components/features/projects/ProjectsExplorer";
import { ProjectsDecor } from "@/components/features/projects/ProjectsDecor";

export function ProjectsSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pb-20">
      <ProjectsDecor />
      <ProjectsHero />
      <ProjectsExplorer />
    </section>
  );
}
