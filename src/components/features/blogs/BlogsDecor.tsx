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
      <ArtworkSlot
        name="Blogs: laptop + servers + cloud"
        className="absolute left-[55.9%] top-2 h-[220px] w-[24.8%] aspect-auto"
      />

      {/* 6. ArtworkSlot "Blogs: cube + globe" -> left-0 top-[225px] h-[300px] w-[9%] */}
      <ArtworkSlot
        name="Blogs: cube + globe"
        className="absolute left-0 top-[225px] h-[300px] w-[9%] aspect-auto"
      />
    </div>
  );
}
