import * as React from "react";
import { cn } from "@/lib/utils";
import { StackedLabel } from "@/components/ui/decor/StackedLabel";
import { DotGrid } from "@/components/ui/decor/DotGrid";
import { PlusMark } from "@/components/ui/decor/PlusMark";
import { InlineLabel } from "@/components/ui/decor/InlineLabel";
import { Artwork } from "@/components/ui/Artwork";
import { decorLabels } from "@/data/home";

export interface HeroDecorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function HeroDecor({ className, ...props }: HeroDecorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 bottom-0 hidden select-none overflow-hidden xl:block z-[1]",
        className
      )}
      {...props}
    >
      {/* 1. StackedLabel with line: Learn / Build / Share / Grow / Together */}
      <StackedLabel
        lines={decorLabels.learnBuild}
        line
        className="absolute left-9 top-3"
      />

      {/* 2. DotGrid orange 4x4 gap 18 */}
      <DotGrid
        cols={4}
        rows={4}
        gap={18}
        tone="orange"
        className="absolute left-[14%] top-[6%]"
      />

      {/* 3, 4, 5. PlusMarks */}
      <PlusMark className="absolute left-[21.5%] top-[4.5%]" />
      <PlusMark className="absolute left-[10.6%] top-[19%]" />
      <PlusMark className="absolute left-[71%] top-[44.5%]" />

      {/* 6. StackedLabel: Students / Technology / Community / Impact */}
      <StackedLabel
        lines={decorLabels.studentsTech}
        className="absolute left-[28%] top-[3.5%]"
      />

      {/* 7. InlineLabel: AWS / Cloud / Community / LPU */}
      <InlineLabel
        items={decorLabels.awsCloud}
        className="absolute right-10 top-6"
      />

      {/* 8. StackedLabel: Cloud / Infrastructure / For a brighter / Tomorrow */}
      <StackedLabel
        lines={decorLabels.cloudInfra}
        className="absolute right-10 top-[9%]"
      />

      {/* 9. DotGrid muted 5x5 gap 15 */}
      <DotGrid
        cols={5}
        rows={5}
        gap={15}
        tone="muted"
        className="absolute right-[3%] top-[24%]"
      />

      {/* 10. StackedLabel with line: Ideas / Deploy / Scale / Repeat */}
      <StackedLabel
        lines={decorLabels.ideasDeploy}
        line
        className="absolute right-6 top-[38%]"
      />

      {/* 11. StackedLabel with line: A / Stronger / Cloud / Community / Together */}
      <StackedLabel
        lines={decorLabels.strongerCloud}
        line
        className="absolute right-[4%] top-[81%]"
      />

      {/* 12. DotGrid orange 5x4 gap 18 */}
      <DotGrid
        cols={5}
        rows={4}
        gap={18}
        tone="orange"
        className="absolute left-[30.5%] top-[90%]"
      />

      {/* 13. Artwork Home: AWS cube */}
      <Artwork
        slot="homeCube"
        sizes="24vw"
        className="absolute left-0 top-[15%] h-[55%] w-[24%] aspect-auto"
      />

      {/* 14. Artwork Home: globe */}
      <Artwork
        slot="homeGlobe"
        sizes="42vw"
        className="absolute bottom-0 left-0 h-[52%] w-[42%] aspect-auto"
      />
    </div>
  );
}
