import "server-only";

import { createClient as createServerClient } from "../supabase/server";
import { createPublicClient } from "../supabase/public";
import { toAttendeeRow, type AttendeeRow, type MyStatus } from "./types";

const ADMIN_EVENT_ATTENDEES_COLUMNS =
  "registration_id, event_id, user_id, status, full_name, email, registration_number, programme, study_year, created_at, cancelled_at";

export async function getMyRegistrationStatus(
  eventId: string
): Promise<MyStatus> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc("my_event_registration", {
      p_event_id: eventId,
    });

    if (error || typeof data !== "string") {
      return null;
    }

    if (data === "registered" || data === "attended" || data === "cancelled") {
      return data;
    }

    return null;
  } catch {
    return null;
  }
}

export async function getSpotsLeft(eventId: string): Promise<number | null> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.rpc("event_spots_left", {
      p_event_id: eventId,
    });

    if (error || typeof data !== "number") {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function getStaffEventCounts(): Promise<
  Record<string, { registered: number; attended: number }>
> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc("staff_event_counts");

    if (error || !Array.isArray(data)) {
      return {};
    }

    const counts: Record<string, { registered: number; attended: number }> = {};
    for (const item of data) {
      if (item && typeof item === "object" && typeof item.event_id === "string") {
        counts[item.event_id] = {
          registered: typeof item.registered === "number" ? item.registered : 0,
          attended: typeof item.attended === "number" ? item.attended : 0,
        };
      }
    }

    return counts;
  } catch {
    return {};
  }
}

export async function listEventAttendees(
  eventId: string,
  limit?: number
): Promise<AttendeeRow[]> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from("admin_event_attendees")
      .select(ADMIN_EVENT_ATTENDEES_COLUMNS)
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (typeof limit === "number" && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      throw new Error("attendees_query_failed");
    }

    return data.map((item) => toAttendeeRow(item));
  } catch {
    throw new Error("attendees_query_failed");
  }
}
