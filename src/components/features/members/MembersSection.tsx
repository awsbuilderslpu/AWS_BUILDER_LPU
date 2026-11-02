import * as React from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { StatsRow } from "@/components/ui/StatsRow";
import { memberStats } from "@/data/stats";
import { membersHeading, membersIntro } from "@/data/members";
import { MembersDecor } from "@/components/features/members/MembersDecor";
import { MembersExplorer } from "@/components/features/members/MembersExplorer";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { getPublicDirectory } from "@/lib/profile/queries.server";
import { toPublicCard } from "@/lib/profile/directory";
import { toMemberCard } from "@/lib/members/public-card";
import { roleMeta } from "@/data/roles";

export async function MembersSection() {
  const roleLabels = Object.fromEntries(
    Object.entries(roleMeta).map(([k, v]) => [k, v.label])
  );
  const directory = await getPublicDirectory();
  const members = directory.map((d) => toMemberCard(toPublicCard(d, roleLabels)));

  return (
    <section className="relative w-full overflow-hidden pb-16">
      <MembersDecor />

      {/* Main Container */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8">
        {/* Hero Section: Two-Column Desktop Layout */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          {/* Left Column: Eyebrow + Heading + Subtitle + StatsRow */}
          <div className="flex flex-col items-start w-full lg:max-w-[680px] xl:max-w-[740px] shrink-0">
            <SectionEyebrow lines="both">Our Members</SectionEyebrow>
            <PageHeading
              as="h1"
              size="md"
              lines={membersHeading}
              className="mt-3 text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] leading-[1.08]"
            />
            <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-[580px]">
              {membersIntro}
            </p>

            {/* Stats Row embedded in hero left column */}
            <div className="mt-5 sm:mt-6 w-full">
              <StatsRow
                variant="boxed"
                size="sm"
                stats={memberStats}
                className="w-full px-5 py-4 sm:px-6 sm:py-4.5"
              />
            </div>
          </div>

          {/* Right Column: Hero Artwork scaling proportionally */}
          <div className="relative flex w-full flex-1 items-center justify-center lg:justify-end">
            <div className="relative aspect-[3/2] w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[520px] xl:max-w-[580px]">
              {/* Ambient Radial Background Glow */}
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
          </div>
        </div>

        {/* Members Explorer Section */}
        <div className="mt-8 sm:mt-10">
          <MembersExplorer members={members} />
        </div>
      </div>
    </section>
  );
}
