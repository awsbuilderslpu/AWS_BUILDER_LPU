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
      {/* Artwork: Neon Cyber Contact Network */}
      <div className="absolute left-[48%] xl:left-[51%] top-2 h-[230px] xl:h-[260px] 2xl:h-[280px] w-[32%] xl:w-[35%] max-w-[540px]">
        {/* Ambient atmospheric glow behind contact network */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-tr from-primary/25 via-accent/20 to-transparent blur-3xl"
        />
        <ArtworkSlot
          name="Contact: cloud + mail"
          src="/images/artwork/Neon Cyber Contact Network.png"
          alt="Neon Cyber Contact Network"
          priority
          objectFit="contain"
          className="h-full w-full aspect-auto overflow-visible"
          imageClassName="drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]"
        />
      </div>
      {/* Artwork: Neon Orbital Network Overlay on the left side */}
      <div className="absolute left-0 top-[140px] h-[640px] xl:h-[720px] 2xl:h-[780px] w-[200px] xl:w-[240px] 2xl:w-[260px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 top-1/4 -z-10 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-500/15 via-primary/10 to-transparent blur-3xl"
        />
        <ArtworkSlot
          name="Contact: globe"
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
