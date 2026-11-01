import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListParams } from "../admin/list-params";
import { buildSearchOr } from "../admin/search";
import { istDayRange } from "../registrations/date-range";
import {
  toEventAdminRow,
  toEventDetails,
  type EventAdminRow,
  type EventDetails,
} from "./types";

const EVENT_LIST_COLUMNS =
  "id, slug, title, category, location_mode, venue, starts_at, ends_at, registration_enabled, registration_deadline, banner_path, is_published, archived_at, updated_at";

const EVENT_DETAILS_COLUMNS =
  "id, slug, title, category, description, location_mode, venue, meeting_url, starts_at, ends_at, registration_enabled, registration_deadline, banner_path, is_published, archived_at, updated_at";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyEventFilters(query: any, params: ListParams, nowIso: string): any {
  let q = query;

  // Tabs:
  // all = archived_at is null;
  // upcoming = archived_at is null and starts_at > nowIso;
  // ongoing = archived_at is null and starts_at <= nowIso and ends_at > nowIso;
  // completed = archived_at is null and ends_at <= nowIso;
  // archived = archived_at is not null.
  if (params.tab === "upcoming") {
    q = q.is("archived_at", null).gt("starts_at", nowIso);
  } else if (params.tab === "ongoing") {
    q = q
      .is("archived_at", null)
      .lte("starts_at", nowIso)
      .gt("ends_at", nowIso);
  } else if (params.tab === "completed") {
    q = q.is("archived_at", null).lte("ends_at", nowIso);
  } else if (params.tab === "archived") {
    q = q.not("archived_at", "is", null);
  } else {
    // "all" or default fallback
    q = q.is("archived_at", null);
  }

  // Filters:
  if (params.filters.category) {
    q = q.eq("category", params.filters.category);
  }

  if (params.filters.publish === "published") {
    q = q.eq("is_published", true);
  } else if (params.filters.publish === "draft") {
    q = q.eq("is_published", false);
  }

  // Dates: starts_at within istDayRange
  const { fromIso, toExclusiveIso } = istDayRange(
    params.dates.from,
    params.dates.to
  );
  if (fromIso) {
    q = q.gte("starts_at", fromIso);
  }
  if (toExclusiveIso) {
    q = q.lt("starts_at", toExclusiveIso);
  }

  // Search: title only when buildSearchOr returns a string
  if (params.q) {
    const searchOr = buildSearchOr(["title"], params.q);
    if (searchOr) {
      q = q.or(searchOr);
    }
  }

  return q;
}

export async function listEvents(
  supabase: SupabaseClient,
  params: ListParams,
  nowIso: string
): Promise<{ rows: EventAdminRow[]; total: number }> {
  try {
    let query = supabase
      .from("events")
      .select(EVENT_LIST_COLUMNS, { count: "exact" });

    query = applyEventFilters(query, params, nowIso);

    const fromIndex = (params.page - 1) * params.pageSize;
    const toIndex = params.page * params.pageSize - 1;

    query = query
      .order(params.sort.column, { ascending: params.sort.dir === "asc" })
      .order("id", { ascending: true })
      .range(fromIndex, toIndex);

    const { data, count, error } = await query;

    if (error || !data) {
      throw new Error("events_query_failed");
    }

    const rows = data.map((item) => toEventAdminRow(item));
    return {
      rows,
      total: count ?? 0,
    };
  } catch {
    throw new Error("events_query_failed");
  }
}

export async function getEventCounts(
  supabase: SupabaseClient,
  nowIso: string
): Promise<{
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
} | null> {
  try {
    const [totalRes, upcomingRes, ongoingRes, completedRes] = await Promise.all(
      [
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .is("archived_at", null),
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .is("archived_at", null)
          .gt("starts_at", nowIso),
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .is("archived_at", null)
          .lte("starts_at", nowIso)
          .gt("ends_at", nowIso),
        supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .is("archived_at", null)
          .lte("ends_at", nowIso),
      ]
    );

    if (
      totalRes.error ||
      upcomingRes.error ||
      ongoingRes.error ||
      completedRes.error
    ) {
      return null;
    }

    return {
      total: totalRes.count ?? 0,
      upcoming: upcomingRes.count ?? 0,
      ongoing: ongoingRes.count ?? 0,
      completed: completedRes.count ?? 0,
    };
  } catch {
    return null;
  }
}

export async function fetchEventsForExport(
  supabase: SupabaseClient,
  params: ListParams,
  nowIso: string,
  cap = 5000
): Promise<{ rows: EventDetails[]; truncated: boolean }> {
  try {
    let offset = 0;
    const batchSize = 1000;
    const rows: EventDetails[] = [];

    while (rows.length < cap) {
      const fetchCount = Math.min(batchSize, cap - rows.length);
      let query = supabase.from("events").select(EVENT_DETAILS_COLUMNS);
      query = applyEventFilters(query, params, nowIso);
      query = query
        .order(params.sort.column, { ascending: params.sort.dir === "asc" })
        .order("id", { ascending: true })
        .range(offset, offset + fetchCount - 1);

      const { data, error } = await query;
      if (error || !data) {
        throw new Error("events_query_failed");
      }

      for (const item of data) {
        rows.push(toEventDetails(item));
      }

      if (data.length < fetchCount) {
        break;
      }
      offset += data.length;
    }

    let truncated = false;
    if (rows.length >= cap) {
      let countQuery = supabase
        .from("events")
        .select("id", { count: "exact", head: true });
      countQuery = applyEventFilters(countQuery, params, nowIso);
      const { count } = await countQuery;
      if (typeof count === "number" && count > cap) {
        truncated = true;
      }
    }

    return { rows, truncated };
  } catch {
    throw new Error("events_query_failed");
  }
}

