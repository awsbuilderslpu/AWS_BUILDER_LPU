import type { EventCategory } from "@/data/events";

export interface CategoryStyle {
  label: string;
  badge: string;
  dot: string;
  calendarDay: string;
}

export interface LegendGroup {
  label: string;
  categories: EventCategory[];
  dotClass: string;
  calendarDayClass: string;
}

export const categoryStyles: Record<EventCategory, CategoryStyle> = {
  workshop: {
    label: "Workshop",
    badge: "bg-primary text-primary-foreground",
    dot: "bg-primary",
    calendarDay: "size-7! rounded-full bg-primary text-primary-foreground font-bold",
  },
  hackathon: {
    label: "Hackathon",
    badge: "bg-accent text-white",
    dot: "bg-accent",
    calendarDay: "size-7! rounded-full bg-accent text-white font-bold",
  },
  talk: {
    label: "Tech Talk",
    badge: "bg-success text-success-foreground",
    dot: "bg-success",
    calendarDay: "size-7! rounded-full bg-success text-success-foreground font-bold",
  },
  competition: {
    label: "Competition",
    badge: "bg-primary text-primary-foreground",
    dot: "bg-primary",
    calendarDay: "size-7! rounded-full bg-primary text-primary-foreground font-bold",
  },
  community: {
    label: "Community",
    badge: "bg-primary text-primary-foreground",
    dot: "bg-primary",
    calendarDay: "size-7! rounded-full bg-primary text-primary-foreground font-bold",
  },
};

export const legendGroups: LegendGroup[] = [
  {
    label: "Workshop",
    categories: ["workshop"],
    dotClass: "bg-primary",
    calendarDayClass: "size-7! rounded-full bg-primary text-primary-foreground font-bold",
  },
  {
    label: "Hackathon",
    categories: ["hackathon"],
    dotClass: "bg-accent",
    calendarDayClass: "size-7! rounded-full bg-accent text-white font-bold",
  },
  {
    label: "Tech Talk",
    categories: ["talk"],
    dotClass: "bg-success",
    calendarDayClass: "size-7! rounded-full bg-success text-success-foreground font-bold",
  },
  {
    label: "Other",
    categories: ["competition", "community"],
    dotClass: "bg-primary",
    calendarDayClass: "size-7! rounded-full bg-primary text-primary-foreground font-bold",
  },
];
