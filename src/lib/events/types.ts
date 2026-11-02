export type EventCategory =
  | "workshop"
  | "hackathon"
  | "talk"
  | "competition"
  | "community";

export type EventLocationMode = "on_campus" | "online" | "hybrid";

export type EventLifecycle = "upcoming" | "ongoing" | "completed" | "archived";

export interface EventAdminRow {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  locationMode: EventLocationMode;
  venue: string | null;
  startsAt: string;
  endsAt: string;
  registrationEnabled: boolean;
  registrationDeadline: string | null;
  capacity: number | null;
  bannerPath: string | null;
  isPublished: boolean;
  archivedAt: string | null;
  updatedAt: string;
}

export interface EventDetails extends EventAdminRow {
  description: unknown;
  meetingUrl: string | null;
}

export function toEventAdminRow(raw: unknown): EventAdminRow {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;

  const category = (
    r.category === "workshop" ||
    r.category === "hackathon" ||
    r.category === "talk" ||
    r.category === "competition" ||
    r.category === "community"
      ? r.category
      : "community"
  ) as EventCategory;

  const locationMode = (
    r.location_mode === "on_campus" ||
    r.location_mode === "online" ||
    r.location_mode === "hybrid"
      ? r.location_mode
      : "on_campus"
  ) as EventLocationMode;

  return {
    id: typeof r.id === "string" ? r.id : "",
    slug: typeof r.slug === "string" ? r.slug : "",
    title: typeof r.title === "string" ? r.title : "",
    category,
    locationMode,
    venue: typeof r.venue === "string" ? r.venue : null,
    startsAt: typeof r.starts_at === "string" ? r.starts_at : "",
    endsAt: typeof r.ends_at === "string" ? r.ends_at : "",
    registrationEnabled: Boolean(r.registration_enabled),
    registrationDeadline:
      typeof r.registration_deadline === "string"
        ? r.registration_deadline
        : null,
    capacity: typeof r.capacity === "number" ? r.capacity : null,
    bannerPath: typeof r.banner_path === "string" ? r.banner_path : null,
    isPublished: Boolean(r.is_published),
    archivedAt: typeof r.archived_at === "string" ? r.archived_at : null,
    updatedAt: typeof r.updated_at === "string" ? r.updated_at : "",
  };
}

export function toEventDetails(raw: unknown): EventDetails {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const adminRow = toEventAdminRow(raw);

  return {
    ...adminRow,
    description: r.description ?? null,
    meetingUrl: typeof r.meeting_url === "string" ? r.meeting_url : null,
    capacity: typeof r.capacity === "number" ? r.capacity : null,
  };
}

