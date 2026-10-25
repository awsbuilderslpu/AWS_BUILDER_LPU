"use client";

import * as React from "react";
import { FilterChips } from "@/components/ui/FilterChips";
import { EventCard } from "@/components/features/events/EventCard";
import { eventFilters, type EventItem } from "@/data/events";

export interface EventsExplorerProps {
  events: EventItem[];
}

export function EventsExplorer({ events }: EventsExplorerProps) {
  const [activeFilter, setActiveFilter] = React.useState<string>("All Events");

  const filterOptions = React.useMemo(
    () => eventFilters.map((f) => f.label),
    []
  );

  const selectedCategory =
    eventFilters.find((f) => f.label === activeFilter)?.category ?? null;

  const filteredEvents = React.useMemo(() => {
    if (!selectedCategory) return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  return (
    <div className="flex w-full flex-col">
      <FilterChips
        options={filterOptions}
        value={activeFilter}
        onChange={setActiveFilter}
        variant="outline"
        ariaLabel="Filter events by category"
      />

      <p className="sr-only" aria-live="polite">
        Showing {filteredEvents.length} events
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <li key={event.slug} className="flex">
              <EventCard event={event} />
            </li>
          ))
        ) : (
          <li className="col-span-full flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-card/30 p-8 text-center text-muted-foreground">
            No events in this category yet. Check back soon.
          </li>
        )}
      </ul>
    </div>
  );
}
