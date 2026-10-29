import * as React from "react";
import { cn } from "@/lib/utils";
import { DotGrid } from "@/components/ui/decor/DotGrid";
import { PlusMark } from "@/components/ui/decor/PlusMark";
import { StackedLabel } from "@/components/ui/decor/StackedLabel";
import { InlineLabel } from "@/components/ui/decor/InlineLabel";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { sharedLabels } from "@/data/decor";

export interface EventsDecorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function EventsDecor({ className, ...props }: EventsDecorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 hidden select-none overflow-hidden xl:block z-[1]",
        className
      )}
      {...props}
    >
      {/* 1. StackedLabel, no line, learnBuild -> left-12 top-4 */}
      <StackedLabel
        lines={sharedLabels.learnBuild}
        line={false}
        className="absolute left-12 top-4"
      />

      {/* 2. InlineLabel AWS / Cloud / Community / LPU -> right-6 top-4 */}
      <InlineLabel
        items={["AWS", "Cloud", "Community", "LPU"]}
        className="absolute right-6 top-4"
      />

      {/* 3. PlusMark -> left-[59.9%] top-[5.5%] */}
      <PlusMark className="absolute left-[59.9%] top-[5.5%]" />

      {/* 4. StackedLabel, no line, realSkills -> left-[63.2%] top-[11.3%] */}
      <StackedLabel
        lines={sharedLabels.realSkills}
        line={false}
        className="absolute left-[63.2%] top-[11.3%]"
      />

      {/* 5. DotGrid orange 5x5 gap 13 -> left-[4.9%] top-[21%] */}
      <DotGrid
        cols={5}
        rows={5}
        gap={13}
        tone="orange"
        className="absolute left-[4.9%] top-[21%]"
      />

      {/* 6. StackedLabel, no line, communityTech, inside a faint box -> right-5 top-[14.2%] */}
      <StackedLabel
        lines={sharedLabels.communityTech}
        line={false}
        className="absolute right-5 top-[14.2%] rounded-md border border-border/60 bg-card/30 px-4 py-3.5"
      />

      {/* 7. DotGrid orange 5x6 gap 16 -> right-[1.3%] top-[69.5%] */}
      <DotGrid
        cols={5}
        rows={6}
        gap={16}
        tone="orange"
        className="absolute right-[1.3%] top-[69.5%]"
      />

      {/* 8. StackedLabel, no line, ideasDeploy -> right-6 bottom-12 */}
      <StackedLabel
        lines={sharedLabels.ideasDeploy}
        line={false}
        className="absolute right-6 bottom-12"
      />

      {/* 9. ArtworkSlot "Events: cloud + cubes" -> right-[10.2%] top-[4.4%] h-[31%] w-[18.5%] */}
      <ArtworkSlot
        name="Events: cloud + cubes"
        className="absolute right-[10.2%] top-[4.4%] h-[31%] w-[18.5%] aspect-auto"
      />

      {/* 10. ArtworkSlot: Neon Orbital Network Overlay on the left side */}
      <div className="absolute left-0 top-[140px] h-[640px] xl:h-[720px] 2xl:h-[780px] w-[200px] xl:w-[240px] 2xl:w-[260px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 top-1/4 -z-10 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-500/15 via-primary/10 to-transparent blur-3xl"
        />
        <ArtworkSlot
          name="Events: cubes + globe"
          src="/images/artwork/Neon Orbital Network Overlay.png"
          alt="Neon Orbital Network Overlay"
          priority
          objectFit="contain"
          objectPosition="object-left"
          className="h-full w-full aspect-auto overflow-visible"
          imageClassName="object-left drop-shadow-[0_0_25px_rgba(0,180,255,0.2)]"
        />
      </div>
    </div>
  );
}
