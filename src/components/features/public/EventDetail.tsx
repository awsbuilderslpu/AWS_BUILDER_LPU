import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Video, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { publicCopy } from "@/data/public";
import { categoryStyles } from "@/components/features/events/categoryStyles";
import { formatEventDate } from "@/lib/events/dates";
import { isoToIst, formatIst } from "@/lib/datetime";
import { RichTextRenderer } from "@/components/features/admin/forms/RichTextRenderer";
import { EventRegistrationPanel } from "@/components/features/public/EventRegistrationPanel";
import type { PublicEventRow } from "@/lib/public/events.server";
import type { EventLifecycle } from "@/lib/events/types";
import type { EventCategory } from "@/data/events";
import type { MyStatus } from "@/lib/event-registrations/types";
import type { ViewerKind } from "@/lib/event-registrations/viewer";

export interface EventDetailProps extends React.HTMLAttributes<HTMLElement> {
  event: PublicEventRow;
  lifecycle: EventLifecycle;
  signedIn: boolean;
  meetingUrl: string | null;
  bannerUrl: string | null;
  viewer: ViewerKind;
  myStatus: MyStatus;
  spotsLeft: number | null;
  registrationOpen: boolean;
  hasEnded: boolean;
  isFull: boolean;
  className?: string;
}

export function EventDetail({
  event,
  lifecycle,
  signedIn,
  meetingUrl,
  bannerUrl,
  viewer,
  myStatus,
  spotsLeft,
  registrationOpen,
  hasEnded,
  isFull,
  className,
  ...props
}: EventDetailProps) {
  const catStyle =
    categoryStyles[event.category as EventCategory] ?? categoryStyles.workshop;
  const lifecycleLabel =
    publicCopy.events.lifecycle[
      lifecycle as keyof typeof publicCopy.events.lifecycle
    ] ?? publicCopy.events.lifecycle.upcoming;

  const startIst = isoToIst(event.starts_at);
  const endIst = isoToIst(event.ends_at);
  const dateFormatted = startIst
    ? formatEventDate(startIst.date, endIst?.date)
    : "";

  const timeFormatted =
    event.starts_at && event.ends_at
      ? `${formatIst(event.starts_at)} – ${formatIst(event.ends_at)}`
      : formatIst(event.starts_at);

  const locationModeKey =
    event.location_mode as keyof typeof publicCopy.events.locationLabels;
  const locationModeLabel =
    publicCopy.events.locationLabels[locationModeKey] ?? event.location_mode;

  const isOnlineOrHybrid =
    event.location_mode === "online" || event.location_mode === "hybrid";

  return (
    <article
      className={cn("mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          <span>{publicCopy.events.back}</span>
        </Link>
      </div>

      {/* Header section */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              "inline-flex h-6 items-center rounded px-2.5 font-mono text-xs font-semibold uppercase tracking-wider",
              catStyle.badge
            )}
          >
            {catStyle.label}
          </span>
          <span className="inline-flex h-6 items-center rounded border border-border bg-card/60 px-2.5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {lifecycleLabel}
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight leading-tight text-white sm:text-5xl">
          {event.title}
        </h1>
      </header>

      {/* Banner */}
      {bannerUrl && (
        <div className="relative mt-8 aspect-[1200/630] w-full overflow-hidden rounded-lg border border-border">
          <Image
            src={bannerUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 760px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Two-column layout */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left Column: About this event */}
        <div className="lg:col-span-2 space-y-6">
          <section aria-labelledby="about-event-title">
            <h2
              id="about-event-title"
              className="text-xl font-semibold text-white tracking-tight"
            >
              {publicCopy.events.about}
            </h2>
            <div className="mt-4">
              <RichTextRenderer doc={event.description} variant="basic" />
            </div>
          </section>
        </div>

        {/* Right Column: Event Details Card */}
        <aside className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-card/60 overflow-hidden divide-y divide-border/70">
            {/* Registration Panel */}
            <EventRegistrationPanel
              eventId={event.id}
              slug={event.slug}
              viewer={viewer}
              myStatus={myStatus}
              spotsLeft={spotsLeft}
              registrationOpen={registrationOpen}
              hasEnded={hasEnded}
              isFull={isFull}
            />

            {/* Schedule */}
            <div className="flex items-start gap-3.5 p-5">
              <Calendar
                className="size-5 shrink-0 text-primary stroke-[1.5] mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
                  {publicCopy.events.schedule}
                </span>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {dateFormatted}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {timeFormatted}
                </p>
              </div>
            </div>

            {/* Location & Venue */}
            <div className="flex items-start gap-3.5 p-5">
              <MapPin
                className="size-5 shrink-0 text-primary stroke-[1.5] mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
                  {publicCopy.events.location}
                </span>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {locationModeLabel}
                </p>
                {event.venue && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.venue}
                  </p>
                )}
              </div>
            </div>

            {/* Online meeting link / sign-in prompt */}
            {isOnlineOrHybrid && (
              <div className="flex items-start gap-3.5 p-5">
                <Video
                  className="size-5 shrink-0 text-primary stroke-[1.5] mt-0.5"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  {meetingUrl ? (
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <span>{publicCopy.events.joinOnline}</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : !signedIn ? (
                    <Link
                      href={
                        "/?auth=signin&next=" +
                        encodeURIComponent("/events/" + event.slug)
                      }
                      scroll={false}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {publicCopy.events.signInForLink}
                    </Link>
                  ) : viewer === "member" ? (
                    <p className="text-sm text-muted-foreground">
                      {publicCopy.events.signUp.meetingHint}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}

