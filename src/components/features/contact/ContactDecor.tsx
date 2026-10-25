import * as React from "react";
import { StackedLabel } from "@/components/ui/decor/StackedLabel";
import { InlineLabel } from "@/components/ui/decor/InlineLabel";
import { DotGrid } from "@/components/ui/decor/DotGrid";
import { PlusMark } from "@/components/ui/decor/PlusMark";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { sharedLabels } from "@/data/decor";

export function ContactDecor() {
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
      <InlineLabel
        items={["AWS", "Cloud", "Community", "LPU"]}
        className="absolute right-6 top-3"
      />
      <StackedLabel
        lines={sharedLabels.communityTech}
        line={false}
        className="absolute right-14 top-[74px]"
      />
      <DotGrid
        tone="orange"
        cols={5}
        rows={4}
        gap={14}
        className="absolute left-[4.6%] top-[150px]"
      />
      <PlusMark className="absolute left-[43%] top-[56px]" />
      <PlusMark className="absolute left-[5.7%] top-[300px]" />
      <DotGrid
        tone="orange"
        cols={4}
        rows={4}
        gap={19}
        className="absolute right-[3%] bottom-[120px]"
      />
      <StackedLabel
        lines={sharedLabels.ideasDeploy}
        line={false}
        className="absolute right-7 bottom-8"
      />
      <ArtworkSlot
        name="Contact: cloud + mail"
        className="absolute left-[56%] top-2 h-[230px] w-[26%] aspect-auto"
      />
      <ArtworkSlot
        name="Contact: globe"
        className="absolute left-0 bottom-10 h-[200px] w-[7%] aspect-auto"
      />
    </div>
  );
}
