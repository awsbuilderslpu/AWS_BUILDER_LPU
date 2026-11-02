import * as React from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { membersHeading, membersIntro } from "@/data/members";
import { MembersDecor } from "@/components/features/members/MembersDecor";

export default function MembersLoading() {
  return (
    <section className="relative w-full overflow-hidden pb-16">
      <MembersDecor />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 xl:px-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          <div className="flex flex-col items-start max-w-2xl">
            <SectionEyebrow lines="both">Team & Members</SectionEyebrow>
            <div className="mt-2.5">
              <PageHeading size="sm" as="h1" lines={membersHeading} />
            </div>
            <p className="mt-4 text-base leading-[1.47] text-muted-foreground">
              {membersIntro}
            </p>
          </div>
        </div>

        {/* Member cards grid skeleton */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card/40 p-6 flex flex-col items-center text-center space-y-4"
            >
              <div className="size-24 rounded-full bg-muted/20" />
              <div className="space-y-2 w-full">
                <div className="h-5 w-3/4 mx-auto rounded bg-muted/20" />
                <div className="h-4 w-1/2 mx-auto rounded bg-primary/20" />
                <div className="h-3 w-2/3 mx-auto rounded bg-muted/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

