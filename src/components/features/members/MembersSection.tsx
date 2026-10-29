import * as React from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { StatsRow } from "@/components/ui/StatsRow";
import { memberStats } from "@/data/stats";
import { membersHeading, membersIntro } from "@/data/members";
import { MembersDecor } from "@/components/features/members/MembersDecor";
import { MembersExplorer } from "@/components/features/members/MembersExplorer";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";

export function MembersSection() {
  return (
    <section className="relative overflow-hidden pb-12">
      <MembersDecor />

      {/* Header */}
      <div className="relative z-10 w-full px-6 pt-7 xl:pl-[12.3%]">
        <SectionEyebrow lines="both">Our Members</SectionEyebrow>
        <PageHeading
          as="h1"
          size="md"
          lines={membersHeading}
          className="mt-3"
        />
        <p className="mt-2 text-base leading-6 text-muted-foreground max-w-[clamp(300px,26.6vw,445px)]">
          {membersIntro}
        </p>
      </div>

      {/* Mobile/Tablet Artwork banner */}
      <div className="relative mx-auto mt-4 mb-2 aspect-[3/2] w-full max-w-[420px] px-6 xl:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 scale-105 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-2xl"
        />
        <ArtworkSlot
          name="Members: AWS cloud + builders"
          src="/images/artwork/Neon Cloud Network Team.png"
          alt="Neon Cloud Network Team"
          priority
          objectFit="contain"
          className="h-full w-full aspect-auto overflow-visible"
          imageClassName="drop-shadow-[0_0_25px_rgba(255,153,0,0.3)]"
        />
      </div>

      {/* Main wrapper */}
      <div className="relative z-10 mt-3 w-full px-6 xl:pl-[10.2%] xl:pr-[7.7%]">
        <StatsRow
          variant="boxed"
          size="sm"
          stats={memberStats}
          className="px-8 py-5 xl:w-[clamp(620px,48.6vw,812px)]"
        />
        <MembersExplorer />
      </div>
    </section>
  );
}
