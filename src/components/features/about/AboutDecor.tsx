import * as React from "react";
import { cn } from "@/lib/utils";
import { DotGrid } from "@/components/ui/decor/DotGrid";
import { PlusMark } from "@/components/ui/decor/PlusMark";
import { StackedLabel } from "@/components/ui/decor/StackedLabel";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { sharedLabels } from "@/data/decor";

export interface AboutDecorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function AboutDecor({ className, ...props }: AboutDecorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 hidden select-none overflow-hidden xl:block z-[1]",
        className
      )}
      {...props}
    >
      {/* 1. DotGrid orange 4x3 gap 22 -> left-[3.3%] top-[9%] */}
      <DotGrid
        cols={4}
        rows={3}
        gap={22}
        tone="orange"
        className="absolute left-[3.3%] top-[9%]"
      />

      {/* 2. PlusMark -> left-[5.9%] top-[37.5%] */}
      <PlusMark className="absolute left-[5.9%] top-[37.5%]" />

      {/* 3. DotGrid orange 3x3 gap 24 -> left-[4.9%] top-[62%] */}
      <DotGrid
        cols={3}
        rows={3}
        gap={24}
        tone="orange"
        className="absolute left-[4.9%] top-[62%]"
      />

      {/* 4. StackedLabel with line, strongerCloud -> left-[3.3%] top-[86%] */}
      <StackedLabel
        lines={sharedLabels.strongerCloud}
        line
        className="absolute left-[3.3%] top-[86%]"
      />

      {/* 5. StackedLabel with line, studentsIdeas -> left-[53.5%] top-[8%] */}
      <StackedLabel
        lines={sharedLabels.studentsIdeas}
        line
        className="absolute left-[53.5%] top-[8%]"
      />

      {/* 6. StackedLabel with line, learnBuild -> right-6 top-[8%] */}
      <StackedLabel
        lines={sharedLabels.learnBuild}
        line
        className="absolute right-6 top-[8%]"
      />

      {/* 7. StackedLabel with line, infrastructure -> right-6 top-[30.3%] */}
      <StackedLabel
        lines={sharedLabels.infrastructure}
        line
        className="absolute right-6 top-[30.3%]"
      />

      {/* 8. PlusMark -> right-[5%] top-[82%] */}
      <PlusMark className="absolute right-[5%] top-[82%]" />

      {/* 9. DotGrid orange 3x3 gap 25 -> left-[62.8%] top-[90%] */}
      <DotGrid
        cols={3}
        rows={3}
        gap={25}
        tone="orange"
        className="absolute left-[62.8%] top-[90%]"
      />

      {/* 10. ArtworkSlot: Neon Orbital Network Overlay on the left side */}
      <div className="absolute left-0 top-[140px] h-[640px] xl:h-[720px] 2xl:h-[780px] w-[200px] xl:w-[240px] 2xl:w-[260px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 top-1/4 -z-10 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-500/15 via-primary/10 to-transparent blur-3xl"
        />
        <ArtworkSlot
          name="About: orbital network overlay"
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
