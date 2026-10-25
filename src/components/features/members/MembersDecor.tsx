import * as React from "react";
import { StackedLabel } from "@/components/ui/decor/StackedLabel";
import { PlusMark } from "@/components/ui/decor/PlusMark";
import { DotGrid } from "@/components/ui/decor/DotGrid";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { sharedLabels } from "@/data/decor";

export function MembersDecor() {
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
        className="absolute right-5 top-[46px]"
      />
      <StackedLabel
        lines={sharedLabels.studentsCollab}
        line={false}
        className="absolute left-[47.1%] top-[46px]"
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
      <ArtworkSlot
        name="Members: AWS cloud + builders"
        className="absolute left-[57.1%] top-2 h-[365px] w-[31%] aspect-auto"
      />
      <ArtworkSlot
        name="Members: globe"
        className="absolute left-0 top-[515px] h-[220px] w-[7%] aspect-auto"
      />
    </div>
  );
}
