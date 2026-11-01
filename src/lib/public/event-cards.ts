import type { EventItem, EventCategory, EventStatus } from "../../data/events";
import { eventLifecycle, registrationOpen } from "../events/lifecycle";
import { isoToIst } from "../datetime";

export interface EventCardRowInput {
  slug: string;
  title: string;
  description?: unknown;
  category: EventCategory | string;
  location_mode?: string | null;
  venue?: string | null;
  starts_at: string;
  ends_at: string;
  registration_enabled?: boolean | null;
  registration_deadline?: string | null;
  banner_path?: string | null;
  is_published?: boolean | null;
  archived_at?: string | null;
}

function extractDescriptionText(description: unknown): string {
  if (typeof description === "string") {
    return description;
  }
  if (!description || typeof description !== "object") {
    return "";
  }
  const node = description as { text?: string; content?: unknown[] };
  let res = typeof node.text === "string" ? node.text : "";
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      const childText = extractDescriptionText(child);
      if (childText) {
        res = res ? `${res} ${childText}` : childText;
      }
    }
  }
  return res;
}

/**
 * Pure adapter transforming an event database row into an EventItem for public view cards.
 * Dates are converted to IST date strings.
 * endDate is only populated when it differs from startDate.
 * status is "past" when completed, "registration-open" when registration is open, else "upcoming".
 * location defaults to "Online" when venue is null or blank.
 */
export function toEventItem(
  row: EventCardRowInput,
  nowMs: number,
  bannerUrl: string | null
): EventItem {
  const startIst = isoToIst(row.starts_at);
  const endIst = isoToIst(row.ends_at);

  const startDate = startIst ? startIst.date : "";
  const endDateStr = endIst ? endIst.date : undefined;
  const endDate =
    endDateStr && endDateStr !== startDate ? endDateStr : undefined;

  const lifecycle = eventLifecycle(
    {
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      archivedAt: row.archived_at ?? null,
    },
    nowMs
  );

  let status: EventStatus;
  if (lifecycle === "completed") {
    status = "past";
  } else if (
    registrationOpen(
      {
        isPublished: row.is_published ?? true,
        archivedAt: row.archived_at ?? null,
        registrationEnabled: row.registration_enabled,
        registrationDeadline: row.registration_deadline,
        startsAt: row.starts_at,
      },
      nowMs
    )
  ) {
    status = "registration-open";
  } else {
    status = "upcoming";
  }

  const trimmedVenue = row.venue?.trim();
  const location =
    trimmedVenue && trimmedVenue.length > 0 ? trimmedVenue : "Online";

  const image = bannerUrl ? bannerUrl : undefined;
  const href = `/events/${row.slug}`;
  const description = extractDescriptionText(row.description);

  return {
    slug: row.slug,
    title: row.title,
    description,
    category: row.category as EventCategory,
    status,
    startDate,
    ...(endDate ? { endDate } : {}),
    location,
    ...(image ? { image } : {}),
    href,
  };
}

