import type { EventItem } from "@/data/events";

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatEventDate(start: string, end?: string): string {
  const sDate = parseISODate(start);
  const sYear = sDate.getFullYear();
  const sMonth = MONTH_NAMES[sDate.getMonth()];
  const sDay = sDate.getDate();

  if (!end || start === end) {
    return `${sMonth} ${sDay}, ${sYear}`;
  }

  const eDate = parseISODate(end);
  const eYear = eDate.getFullYear();
  const eMonth = MONTH_NAMES[eDate.getMonth()];
  const eDay = eDate.getDate();

  if (sYear === eYear && sMonth === eMonth) {
    return `${sMonth} ${sDay}–${eDay}, ${sYear}`;
  }

  if (sYear === eYear) {
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
  }

  return `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${eYear}`;
}

export function getBadgeParts(start: string): { month: string; day: string } {
  const date = parseISODate(start);
  return {
    month: MONTH_NAMES[date.getMonth()].toUpperCase(),
    day: String(date.getDate()),
  };
}

export function getDefaultMonth(eventsList: EventItem[]): Date {
  const activeEvent =
    eventsList.find((e) => e.status !== "past") || eventsList[0];

  if (!activeEvent) {
    return new Date(2026, 0, 1);
  }

  const d = parseISODate(activeEvent.startDate);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function expandEventDays(event: EventItem): Date[] {
  const start = parseISODate(event.startDate);
  const end = event.endDate ? parseISODate(event.endDate) : start;
  const days: Date[] = [];
  const current = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= last) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}
