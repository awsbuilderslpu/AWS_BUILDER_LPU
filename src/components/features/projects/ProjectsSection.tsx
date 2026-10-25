import * as React from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { StatsRow } from "@/components/ui/StatsRow";
import { projectStats } from "@/data/stats";
import { projectsHeading, projectsIntro } from "@/data/projects";
import { ProjectsDecor } from "@/components/features/projects/ProjectsDecor";
import { ProjectsExplorer } from "@/components/features/projects/ProjectsExplorer";

export function ProjectsSection() {
  return (
    <section className="relative overflow-hidden pb-16">
      <ProjectsDecor />

      {/* Header */}
      <div className="relative z-10 w-full px-6 pt-7 xl:pl-[12.3%]">
        <SectionEyebrow lines="both">Student Innovations</SectionEyebrow>
        <PageHeading
          as="h1"
          size="md"
          lines={projectsHeading}
          className="mt-3"
        />
        <p className="mt-2 text-base leading-6 text-muted-foreground max-w-[clamp(300px,36vw,560px)]">
          {projectsIntro}
        </p>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mt-5 w-full px-6 xl:pl-[10.2%] xl:pr-[7.7%]">
        <StatsRow
          variant="boxed"
          size="sm"
          stats={projectStats}
          className="px-8 py-5 xl:w-[clamp(620px,54vw,880px)]"
        />
        <ProjectsExplorer />
      </div>
    </section>
  );
}
