import type { EventDetails, EventLocationMode } from "./types";
import type { EventFormValues } from "./validate";
import { emptyDoc } from "../richtext/sanitize";

export type EventAction = "publish" | "unpublish" | "archive" | "restore";

/**
 * Returns allowed lifecycle actions for an event row in fixed order:
 * Archived -> ["restore"]
 * Draft -> ["publish", "archive"]
 * Published -> ["unpublish", "archive"]
 */
export function eventActions(row: {
  isPublished: boolean;
  archivedAt: string | null;
}): EventAction[] {
  if (row.archivedAt !== null) {
    return ["restore"];
  }
  if (row.isPublished) {
    return ["unpublish", "archive"];
  }
  return ["publish", "archive"];
}

/**
 * Returns the intersection of actions allowed for all provided rows,
 * preserved in the order of the first row. Returns [] for empty input.
 */
export function commonEventActions(
  rows: Array<{ isPublished: boolean; archivedAt: string | null }>
): EventAction[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  const firstAllowed = eventActions(rows[0]);
  return firstAllowed.filter((action) =>
    rows.every((row) => eventActions(row).includes(action))
  );
}

/**
 * Whether the venue input should be visible (on_campus and hybrid).
 */
export function showVenue(
  mode: EventLocationMode | string | null | undefined
): boolean {
  return mode === "on_campus" || mode === "hybrid";
}

/**
 * Whether the meeting URL input should be visible (online and hybrid).
 */
export function showMeetingUrl(
  mode: EventLocationMode | string | null | undefined
): boolean {
  return mode === "online" || mode === "hybrid";
}

/**
 * Whether the registration deadline field should be visible.
 */
export function showDeadline(
  registrationEnabled: boolean | null | undefined
): boolean {
  return Boolean(registrationEnabled);
}

/**
 * Prepares react-hook-form values from loaded EventDetails.
 * Missing optional values become null; description passes through unchanged.
 */
export function formFromDetails(details: EventDetails): EventFormValues {
  return {
    title: details.title ?? "",
    category: details.category ?? "workshop",
    locationMode: details.locationMode ?? "on_campus",
    venue: details.venue ?? null,
    meetingUrl: details.meetingUrl ?? null,
    startsAt: details.startsAt ?? null,
    endsAt: details.endsAt ?? null,
    registrationEnabled: Boolean(details.registrationEnabled),
    registrationDeadline: details.registrationDeadline ?? null,
    bannerPath: details.bannerPath ?? null,
    isPublished: Boolean(details.isPublished),
    capacity: details.capacity ?? null,
    description: details.description ?? emptyDoc,
  };
}

/**
 * Produces blank event form values with empty text fields,
 * locationMode "on_campus", null date fields, and switches off.
 */
export function emptyEventForm(): EventFormValues {
  return {
    title: "",
    category: "workshop",
    locationMode: "on_campus",
    venue: "",
    meetingUrl: "",
    startsAt: null,
    endsAt: null,
    registrationEnabled: false,
    registrationDeadline: null,
    bannerPath: null,
    isPublished: false,
    capacity: null,
    description: emptyDoc,
  };
}

