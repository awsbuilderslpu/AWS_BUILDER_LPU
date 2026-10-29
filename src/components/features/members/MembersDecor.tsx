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
      {/* Artwork: Neon Cloud Network Team */}
      <div className="absolute left-[52%] xl:left-[55%] top-2 h-[340px] xl:h-[370px] w-[34%] xl:w-[36%] max-w-[560px]">
        {/* Ambient atmospheric glow behind members scene */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-tr from-primary/25 via-accent/20 to-transparent blur-3xl"
        />
        <ArtworkSlot
          name="Members: AWS cloud + builders"
          src="/images/artwork/Neon Cloud Network Team.png"
          alt="Neon Cloud Network Team"
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
          name="Members: globe"
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
