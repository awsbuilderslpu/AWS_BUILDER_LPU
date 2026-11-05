import * as React from "react";
import Link from "next/link";
import { io } from "next/cache";

import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { Button } from "@/components/ui/button";
import { StatsRow } from "@/components/ui/StatsRow";
import { eventStats } from "@/data/stats";
import {
  eventsHeading,
  eventsIntro,
  viewAllHref,
} from "@/data/events";
import { publicCopy } from "@/data/public";
import { listPublicEvents } from "@/lib/public/events.server";
import { toEventItem } from "@/lib/public/event-cards";
import { publicObjectUrl } from "@/lib/storage/urls";
import { EventsDecor } from "@/components/features/events/EventsDecor";
import { EventsExplorer } from "@/components/features/events/EventsExplorer";
import { EventsCalendar } from "@/components/features/events/EventsCalendar";

export interface EventsSectionProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export async function EventsSection({ className, ...props }: EventsSectionProps) {
  await io();
  const nowIso = new Date().toISOString();
  const rows = await listPublicEvents(nowIso);
  const events = rows.map((row) =>
    toEventItem(
      row,
      Date.parse(nowIso),
      row.banner_path
        ? publicObjectUrl("event-banners", row.banner_path)
        : null
    )
  );

  return (
    <section
      className={cn(
        "relative flex min-h-[max(calc(100svh-72px),800px)] flex-col overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Direct child 1: Decor layer */}
      <EventsDecor />

      {/* Direct child 2: Content wrapper */}
      <div className="relative z-10 w-full px-6 pt-11 xl:pl-[clamp(150px,13.4vw,224px)] xl:pr-[clamp(40px,6.1vw,102px)]">
        {/* Header row */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-[clamp(24px,2.3vw,39px)]">
          {/* Left block */}
          <div className="flex flex-col items-start">
            <SectionEyebrow lines="both">Our Events</SectionEyebrow>
            <div className="mt-3">
              <PageHeading size="md" as="h1" lines={eventsHeading} />
            </div>
          </div>

          {/* Paragraph */}
          <p className="text-[17px] leading-[1.5] text-muted-foreground xl:mt-16 xl:max-w-[clamp(300px,23.9vw,400px)]">
            {eventsIntro}
          </p>
        </div>

        {/* Main content or empty state, mt-8 */}
        {events.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_clamp(280px,19.3vw,323px)] xl:gap-[21px]">
            <EventsExplorer events={events} />

            <div className="flex flex-col max-w-[420px] xl:max-w-none xl:pt-[45px]">
              <EventsCalendar events={events} className="flex-1" />
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center rounded-lg border border-border bg-card/40 p-12 text-center">
            <p className="text-base text-muted-foreground">
              {publicCopy.events.empty}
            </p>
          </div>
        )}
      </div>

      {/* Direct child 3: Stats wrapper */}
      <div className="relative z-10 mt-auto w-full px-6 pb-10 pt-9 xl:px-[8.6%]">
        <StatsRow
          variant="boxed"
          stats={eventStats}
          className="px-6 py-7 xl:px-[4%]"
          action={
            <Button
              asChild
              variant="primary"
              size="lg"
              withArrow
              className="font-semibold"
            >
              <Link href={viewAllHref}>View All Events</Link>
            </Button>
          }
        />
      </div>
    </section>
  );
}
