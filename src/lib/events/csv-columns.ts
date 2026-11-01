import type { CsvColumn } from "../admin/csv";
import { formatIst } from "../datetime";
import type { EventCategory, EventAdminRow, EventLocationMode } from "./types";

export interface EventCsvLabels {
  category: Record<EventCategory, string>;
  location: Record<EventLocationMode, string>;
}

export function buildEventCsvColumns(
  categoryOrLabels: EventCsvLabels | Record<EventCategory, string>,
  maybeLocation?: Record<EventLocationMode, string>
): CsvColumn<EventAdminRow>[] {
  const labels: EventCsvLabels =
    "category" in categoryOrLabels && !maybeLocation
      ? (categoryOrLabels as EventCsvLabels)
      : {
          category: categoryOrLabels as Record<EventCategory, string>,
          location: maybeLocation ?? ({} as Record<EventLocationMode, string>),
        };
  return [
    {
      header: "Title",
      value: (row) => row.title ?? "",
    },
    {
      header: "Category",
      value: (row) => labels.category[row.category] ?? row.category ?? "",
    },
    {
      header: "Starts",
      value: (row) =>
        row.startsAt ? formatIst(row.startsAt, { withTime: true }) : "",
    },
    {
      header: "Ends",
      value: (row) =>
        row.endsAt ? formatIst(row.endsAt, { withTime: true }) : "",
    },
    {
      header: "Location",
      value: (row) =>
        labels.location[row.locationMode] ?? row.locationMode ?? "",
    },
    {
      header: "Venue",
      value: (row) => row.venue ?? "",
    },
    {
      header: "Published",
      value: (row) => (row.isPublished ? "Yes" : "No"),
    },
    {
      header: "Archived",
      value: (row) => (row.archivedAt ? "Yes" : "No"),
    },
    {
      header: "Registration open",
      value: (row) => (row.registrationEnabled ? "Yes" : "No"),
    },
    {
      header: "Registration deadline",
      value: (row) =>
        row.registrationDeadline
          ? formatIst(row.registrationDeadline, { withTime: true })
          : "",
    },
  ];
}

