import * as React from "react";
import { StackedLabel } from "@/components/ui/decor/StackedLabel";
import { PlusMark } from "@/components/ui/decor/PlusMark";
import { DotGrid } from "@/components/ui/decor/DotGrid";
import { sharedLabels } from "@/data/decor";

export function ProjectsDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 z-[1] hidden xl:block overflow-hidden"
    >
      <StackedLabel
        lines={sharedLabels.learnBuild}
        line={false}
        className="absolute left-12 top-3"
      />
      <StackedLabel
        lines={sharedLabels.communityTech}
        line={false}
        className="absolute right-6 top-[46px]"
      />
      <StackedLabel
        lines={["Architect", "Build", "Deploy", "Scale"]}
        line={false}
        className="absolute left-[48%] top-[46px]"
      />
      <PlusMark className="absolute left-[42.4%] top-[161px]" />
      <DotGrid
        tone="orange"
        cols={4}
        rows={4}
        gap={19}
        className="absolute left-[4.5%] top-[167px]"
      />
      <PlusMark className="absolute left-[5.7%] top-[282px]" />
      <PlusMark className="absolute left-[95.3%] top-[483px]" />
      <DotGrid
        tone="orange"
        cols={4}
        rows={4}
        gap={19}
        className="absolute left-[94.5%] top-[546px]"
      />
      <StackedLabel
        lines={sharedLabels.ideasDeploy}
        line={false}
        className="absolute right-7 top-[767px]"
      />
    </div>
  );
}
