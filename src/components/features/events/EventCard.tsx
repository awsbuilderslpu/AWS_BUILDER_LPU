import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { categoryStyles } from "@/components/features/events/categoryStyles";
import { formatEventDate, getBadgeParts } from "@/lib/events/dates";
import type { EventItem, EventStatus } from "@/data/events";

export interface EventCardProps extends React.HTMLAttributes<HTMLElement> {
  event: EventItem;
  className?: string;
}

const statusText: Record<EventStatus, string> = {
  upcoming: "Upcoming",
  "registration-open": "Registration Open",
  past: "Completed",
};

export function EventCard({ event, className, ...props }: EventCardProps) {
  const catStyle = categoryStyles[event.category];
  const { month, day } = getBadgeParts(event.startDate);

  return (
    <article
      className={cn(
        "relative group flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-card/70 transition-colors hover:border-primary/40",
        className
      )}
      {...props}
    >
      {/* Image area: relative aspect-[2/1] overflow-hidden */}
      <div className="relative aspect-[2/1] w-full overflow-hidden">
        {event.image ? (
          <Image
            src={event.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 via-card to-accent/10 select-none">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {event.category}
            </span>
          </div>
        )}

        {/* Overlay at left-4 top-4: status badge, then date box */}
        <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-4 pointer-events-none">
          <span
            className={cn(
              "inline-flex h-5 items-center rounded px-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
              catStyle.badge
            )}
          >
            {statusText[event.status]}
          </span>

          <div className="flex h-16 w-14 flex-col items-center justify-center rounded-md border border-border bg-background/70 backdrop-blur-sm">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {month}
            </span>
            <span className="mt-0.5 text-2xl font-bold leading-none text-foreground">
              {day}
            </span>
          </div>
        </div>
      </div>

      {/* Body: flex flex-1 flex-col px-4 pb-5 pt-5 */}
      <div className="flex flex-1 flex-col px-4 pb-5 pt-5">
        <h2 className="text-xl font-semibold leading-[1.25] text-foreground transition-colors group-hover:text-primary">
          <Link
            href={event.href}
            className="focus:outline-none after:absolute after:inset-0"
          >
            {event.title}
          </Link>
        </h2>

        <p className="mt-2 text-[14.5px] leading-[1.45] text-muted-foreground">
          {event.description}
        </p>

        {/* Bottom row */}
        <div className="mt-auto flex items-center gap-5 pt-5 text-[13.5px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{formatEventDate(event.startDate, event.endDate)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{event.location}</span>
          </div>

          <ArrowRight
            className="ml-auto size-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}
