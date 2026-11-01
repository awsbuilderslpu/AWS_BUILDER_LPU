import "server-only";

import { cache } from "react";
import { createPublicClient } from "../supabase/public";
import { getCurrentAccount } from "../auth/server";
import { createClient as createServerClient } from "../supabase/server";

export interface PublicEventRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  location_mode: string;
  venue: string | null;
  starts_at: string;
  ends_at: string;
  registration_enabled: boolean;
  registration_deadline: string | null;
  banner_path: string | null;
  description: unknown;
}

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{2,79}$/;

const PUBLIC_EVENT_COLUMNS =
  "id, slug, title, category, location_mode, venue, starts_at, ends_at, registration_enabled, registration_deadline, banner_path, description";

/**
 * Lists published and non-archived events ordered by starts_at ascending, up to 200 rows.
 * Uses only the public publishable client and anonymous read permissions.
 * Never selects meeting_url, author_id, created_by, or updated_by.
 */
export async function listPublicEvents(
  nowIso?: string
): Promise<PublicEventRow[]> {
  void nowIso;
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("events")
      .select(PUBLIC_EVENT_COLUMNS)
      .eq("is_published", true)
      .is("archived_at", null)
      .order("starts_at", { ascending: true })
      .limit(200);

    if (error || !data) {
      return [];
    }

    return data as PublicEventRow[];
  } catch {
    return [];
  }
}

/**
 * Retrieves a single published, non-archived event by slug.
 * Validates the slug before querying the database.
 * Returns null when not found or slug is invalid.
 */
export const getPublicEvent = cache(
  async (slug: string): Promise<PublicEventRow | null> => {
    if (typeof slug !== "string" || !SLUG_REGEX.test(slug)) {
      return null;
    }

    try {
      const supabase = createPublicClient();
      if (!supabase) {
        return null;
      }

      const { data, error } = await supabase
        .from("events")
        .select(PUBLIC_EVENT_COLUMNS)
        .eq("slug", slug)
        .eq("is_published", true)
        .is("archived_at", null)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as PublicEventRow;
    } catch {
      return null;
    }
  }
);

/**
 * Returns the meeting_url for an event only if the visitor is currently signed in.
 * First calls getCurrentAccount(); returns null if nobody is signed in.
 * Uses the cookie-based server client since meeting_url requires authentication.
 * Never throws; returns null on any error.
 */
export async function getMeetingLinkForSignedInUser(
  slug: string
): Promise<string | null> {
  if (typeof slug !== "string" || !SLUG_REGEX.test(slug)) {
    return null;
  }

  try {
    const account = await getCurrentAccount();
    if (!account) {
      return null;
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("events")
      .select("meeting_url")
      .eq("slug", slug)
      .eq("is_published", true)
      .is("archived_at", null)
      .maybeSingle();

    if (error || !data || typeof data.meeting_url !== "string") {
      return null;
    }

    return data.meeting_url;
  } catch {
    return null;
  }
}
