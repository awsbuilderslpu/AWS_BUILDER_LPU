import * as React from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { eventsHeading, eventsIntro } from "@/data/events";
import { EventsDecor } from "@/components/features/events/EventsDecor";

export default function EventsLoading() {
  return (
    <section className="relative flex min-h-[max(calc(100svh-72px),800px)] flex-col overflow-hidden pb-12">
      <EventsDecor />

      {/* Hero header */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 xl:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-start max-w-2xl">
            <SectionEyebrow lines="both">Our Events</SectionEyebrow>
            <div className="mt-2.5">
              <PageHeading size="sm" as="h1" lines={eventsHeading} />
            </div>
            <p className="mt-4 text-base leading-[1.47] text-muted-foreground">
              {eventsIntro}
            </p>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="mt-10 space-y-8 animate-pulse">
          {/* Filter / Search Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-10 w-full max-w-sm rounded-lg bg-card/60 border border-border" />
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-full bg-card/60 border border-border" />
              <div className="h-8 w-24 rounded-full bg-card/60 border border-border" />
            </div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/40 overflow-hidden flex flex-col">
                <div className="aspect-[16/9] w-full bg-muted/20" />
                <div className="p-5 space-y-3 flex-1">
                  <div className="h-4 w-20 rounded bg-primary/20" />
                  <div className="h-5 w-4/5 rounded bg-muted/20" />
                  <div className="h-4 w-1/2 rounded bg-muted/20" />
                  <div className="h-9 w-full rounded-lg bg-card/60 border border-border mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

