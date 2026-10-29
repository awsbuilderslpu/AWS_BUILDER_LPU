import * as React from "react";
import { cn } from "@/lib/utils";
import { DotGrid } from "@/components/ui/decor/DotGrid";
import { StackedLabel } from "@/components/ui/decor/StackedLabel";
import { InlineLabel } from "@/components/ui/decor/InlineLabel";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { sharedLabels } from "@/data/decor";

export interface BlogsDecorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function BlogsDecor({ className, ...props }: BlogsDecorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 hidden select-none overflow-hidden xl:block z-[1]",
        className
      )}
      {...props}
    >
      {/* 1. StackedLabel, no line, sharedLabels.learnBuild -> left-16 top-3 */}
      <StackedLabel
        lines={sharedLabels.learnBuild}
        line={false}
        className="absolute left-16 top-3"
      />

      {/* 2. InlineLabel AWS / Cloud / Community / LPU -> right-6 top-3 */}
      <InlineLabel
        items={["AWS", "Cloud", "Community", "LPU"]}
        className="absolute right-6 top-3"
      />

      {/* 3. DotGrid orange 5x4 gap 14 -> left-[4.6%] top-[150px] */}
      <DotGrid
        cols={5}
        rows={4}
        gap={14}
        tone="orange"
        className="absolute left-[4.6%] top-[150px]"
      />

      {/* 4. StackedLabel, no line, sharedLabels.communityTech -> right-14 top-[74px] */}
      <StackedLabel
        lines={sharedLabels.communityTech}
        line={false}
        className="absolute right-14 top-[74px]"
      />

      {/* 5. ArtworkSlot "Blogs: laptop + servers + cloud" -> left-[55.9%] top-2 h-[220px] w-[24.8%] */}
      <div className="absolute left-[55.9%] top-2 h-[220px] w-[24.8%]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-2xl"
        />
        <ArtworkSlot
          name="Blogs: laptop + servers + cloud"
          src="/images/artwork/Neon AWS Cloud Computing Network.png"
          alt="AWS Cloud Computing Network"
          priority
          className="h-full w-full aspect-auto overflow-visible"
          imageClassName="drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]"
        />
      </div>

      {/* 6. ArtworkSlot "Blogs: cube + globe" -> left-0 top-[180px] */}
      <div className="absolute left-0 top-[180px] h-[660px] xl:h-[720px] 2xl:h-[780px] w-[220px] xl:w-[240px] 2xl:w-[260px]">
        {/* Ambient atmospheric glow behind the orbital globe */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 top-1/4 -z-10 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-500/15 via-primary/10 to-transparent blur-3xl"
        />
        <ArtworkSlot
          name="Blogs: cube + globe"
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
