"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { legendGroups } from "@/components/features/events/categoryStyles";
import { expandEventDays, getDefaultMonth, MONTH_NAMES } from "@/lib/events";
import type { EventItem } from "@/data/events";

export interface EventsCalendarProps {
  events: EventItem[];
  className?: string;
}

export function EventsCalendar({ events, className }: EventsCalendarProps) {
  const [month, setMonth] = React.useState<Date>(() => getDefaultMonth(events));

  const { workshop, hackathon, talk, other } = React.useMemo(() => {
    const w: Date[] = [];
    const h: Date[] = [];
    const t: Date[] = [];
    const o: Date[] = [];

    for (const event of events) {
      const days = expandEventDays(event);
      if (event.category === "workshop") {
        w.push(...days);
      } else if (event.category === "hackathon") {
        h.push(...days);
      } else if (event.category === "talk") {
        t.push(...days);
      } else {
        o.push(...days);
      }
    }

    return { workshop: w, hackathon: h, talk: t, other: o };
  }, [events]);

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card/60 p-4",
        className
      )}
    >
      {/* Header (px-1.5): lucide CalendarDays (22px, orange) + <h2> "Events Calendar" */}
      <div className="flex items-center gap-2.5 px-1.5">
        <CalendarDays
          className="size-[22px] text-primary shrink-0"
          aria-hidden="true"
        />
        <h2 className="font-mono text-[12.5px] font-semibold uppercase tracking-[0.1em] text-foreground">
          Events Calendar
        </h2>
      </div>

      {/* DayPicker with month nav and styling via classNames */}
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        showOutsideDays
        formatters={{
          formatCaption: (d) =>
            `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
          formatWeekdayName: (d) =>
            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
        }}
        labels={{
          labelPrevious: () => "Previous month",
          labelNext: () => "Next month",
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? (
              <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
            ),
        }}
        modifiers={{
          workshop,
          hackathon,
          talk,
          other,
        }}
        modifiersClassNames={{
          workshop: legendGroups[0].calendarDayClass,
          hackathon: legendGroups[1].calendarDayClass,
          talk: legendGroups[2].calendarDayClass,
          other: legendGroups[3].calendarDayClass,
        }}
        classNames={{
          root: "w-full",
          months: "relative flex flex-col items-center w-full mt-5",
          month: "w-full flex flex-col items-center",
          nav: "absolute top-0 inset-x-0 mx-auto w-[190px] h-8 flex items-center justify-between pointer-events-none z-10",
          button_previous:
            "pointer-events-auto flex items-center justify-center size-7 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
          button_next:
            "pointer-events-auto flex items-center justify-center size-7 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
          month_caption: "flex items-center justify-center h-8 w-full",
          caption_label:
            "text-sm font-medium uppercase text-foreground select-none",
          month_grid: "w-full border-collapse mt-4",
          weekdays: "grid grid-cols-7 mb-2 text-center w-full",
          weekday: "text-xs text-muted-foreground font-normal",
          weeks: "w-full flex flex-col gap-1",
          week: "grid grid-cols-7 text-center items-center justify-items-center h-9 w-full",
          day: "flex size-9 items-center justify-center text-sm text-foreground font-normal select-none",
          outside: "opacity-20 text-muted-foreground pointer-events-none",
          today: "",
        }}
      />

      {/* Legend at the bottom (mt-auto pt-4) */}
      <div className="mt-auto flex flex-wrap items-center gap-5 pt-4">
        {legendGroups.map((group) => (
          <div key={group.label} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full shrink-0", group.dotClass)}
            />
            <span className="font-mono text-[11.5px] text-muted-foreground">
              {group.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
