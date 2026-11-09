import * as React from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight, MapPin, Globe, Plus } from "lucide-react";
import { isoToIst } from "@/lib/datetime";
import type { DashboardEventItem } from "@/lib/admin/queries";

interface UpcomingEventsCardProps {
  events: DashboardEventItem[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatEventDate(isoDate: string) {
  const ist = isoToIst(isoDate);
  if (!ist) return { day: "--", month: "---" };
  const parts = ist.date.split("-");
  const monthIdx = Number(parts[1]) - 1;
  return {
    day: parts[2] || "--",
    month: MONTH_NAMES[monthIdx] || "---",
  };
}

export function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
            <CalendarDays className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Events & Sessions
            </h3>
            <p className="text-xs text-muted-foreground">
              Upcoming club workshops, talks & hackathons
            </p>
          </div>
        </div>

        <Link
          href="/admin/events"
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Manage
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Events List or Empty State */}
      {events.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <div className="size-10 rounded-full border border-border bg-card/40 flex items-center justify-center text-muted-foreground mb-3">
            <CalendarDays className="size-5" />
          </div>
          <p className="text-sm font-medium text-foreground">No upcoming events</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mb-4">
            Schedule a workshop or cloud session to engage the student community.
          </p>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-all"
          >
            <Plus className="size-3.5" />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {events.map((event) => {
            const { day, month } = formatEventDate(event.startsAt);
            const isOnline = event.locationMode === "online";

            return (
              <div
                key={event.id || event.slug}
                className="flex items-center justify-between gap-3.5 p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Date badge */}
                  <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-muted/60 dark:bg-[#050B18] shadow-inner text-center">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent leading-none">
                      {month}
                    </span>
                    <span className="text-base font-extrabold text-foreground leading-none mt-0.5">
                      {day}
                    </span>
                  </div>

                  {/* Title & metadata */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-foreground truncate block">
                        {event.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="capitalize font-mono text-[11px] text-accent/90">
                        {event.category}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 truncate text-[11px]">
                        {isOnline ? (
                          <>
                            <Globe className="size-3 text-muted-foreground" />
                            Online
                          </>
                        ) : (
                          <>
                            <MapPin className="size-3 text-muted-foreground" />
                            {event.venue || "Campus Venue"}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/admin/events"
                  className="shrink-0 inline-flex items-center justify-center size-7 rounded-lg border border-border bg-card/60 text-muted-foreground hover:border-accent/40 hover:bg-accent/10 hover:text-accent transition-all text-xs"
                  title="View event in console"
                >
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

