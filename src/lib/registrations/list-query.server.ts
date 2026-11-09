import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListParams } from "../admin/list-params";
import { buildSearchOr } from "../admin/search";
import { istDayRange, istTodayStart } from "./date-range";
import {
  toListRow,
  toDetails,
  type RegistrationListRow,
  type RegistrationDetails,
} from "./types";

const LIST_COLUMNS =
  "id, user_id, status, requested_role, applied_at, full_name, first_name, last_name, email, registration_number, programme, department, study_year";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyRegistrationFilters(query: any, params: ListParams): any {
  let q = query;

  if (params.tab && params.tab !== "all") {
    q = q.eq("status", params.tab);
  }

  if (params.filters.programme) {
    q = q.eq("programme", params.filters.programme);
  }

  if (params.filters.year) {
    q = q.eq("study_year", params.filters.year);
  }

  const { fromIso, toExclusiveIso } = istDayRange(
    params.dates.from,
    params.dates.to
  );
  if (fromIso) {
    q = q.gte("applied_at", fromIso);
  }
  if (toExclusiveIso) {
    q = q.lt("applied_at", toExclusiveIso);
  }

  if (params.q) {
    const searchOr = buildSearchOr(
      ["full_name", "email", "registration_number"],
      params.q
    );
    if (searchOr) {
      q = q.or(searchOr);
    }
  }

  return q;
}

export async function listRegistrations(
  supabase: SupabaseClient,
  params: ListParams
): Promise<{ rows: RegistrationListRow[]; total: number }> {
  try {
    let query = supabase
      .from("admin_registrations")
      .select(LIST_COLUMNS, { count: "exact" });

    query = applyRegistrationFilters(query, params);

    const fromIndex = (params.page - 1) * params.pageSize;
    const toIndex = params.page * params.pageSize - 1;

    query = query
      .order(params.sort.column, { ascending: params.sort.dir === "asc" })
      .order("id", { ascending: true })
      .range(fromIndex, toIndex);

    const { data, count, error } = await query;

    if (error || !data) {
      throw new Error("registrations_query_failed");
    }

    const userIds = data.map((d) => d.user_id).filter(Boolean);
    if (userIds.length > 0) {
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, avatar_path")
          .in("id", userIds);

        if (profiles && profiles.length > 0) {
          const pathMap = new Map<string, string>();
          const pathsToSign: string[] = [];
          for (const p of profiles) {
            if (p.avatar_path) {
              pathMap.set(p.id, p.avatar_path);
              if (!p.avatar_path.startsWith("http://") && !p.avatar_path.startsWith("https://")) {
                pathsToSign.push(p.avatar_path);
              }
            }
          }

          const signedMap = new Map<string, string>();
          if (pathsToSign.length > 0) {
            const { data: signed } = await supabase.storage
              .from("avatars")
              .createSignedUrls(pathsToSign, 3600);
            if (signed) {
              for (const s of signed) {
                if (s.path && s.signedUrl) {
                  signedMap.set(s.path, s.signedUrl);
                }
              }
            }
          }

          for (const item of data) {
            const rawItem = item as Record<string, unknown>;
            const path = pathMap.get(item.user_id);
            if (path) {
              rawItem.avatar_path = path;
              rawItem.avatar_url = signedMap.get(path) || (path.startsWith("http") ? path : null);
            }
          }
        }
      } catch {
        // Fall back gracefully
      }
    }

    const rows = data.map((item) => toListRow(item));
    return {
      rows,
      total: count ?? 0,
    };
  } catch {
    throw new Error("registrations_query_failed");
  }
}

export async function getRegistrationCounts(
  supabase: SupabaseClient,
  nowMs: number
): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
} | null> {
  try {
    const todayStartIso = istTodayStart(nowMs);

    const [totalRes, pendingRes, approvedRes, rejectedRes, todayRes] =
      await Promise.all([
        supabase
          .from("admin_registrations")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("admin_registrations")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("admin_registrations")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved"),
        supabase
          .from("admin_registrations")
          .select("*", { count: "exact", head: true })
          .eq("status", "rejected"),
        supabase
          .from("admin_registrations")
          .select("*", { count: "exact", head: true })
          .gte("applied_at", todayStartIso),
      ]);

    if (
      totalRes.error ||
      pendingRes.error ||
      approvedRes.error ||
      rejectedRes.error ||
      todayRes.error
    ) {
      return null;
    }

    return {
      total: totalRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      approved: approvedRes.count ?? 0,
      rejected: rejectedRes.count ?? 0,
      today: todayRes.count ?? 0,
    };
  } catch {
    return null;
  }
}

export async function fetchAllForExport(
  supabase: SupabaseClient,
  params: ListParams,
  cap = 5000
): Promise<{ rows: RegistrationDetails[]; truncated: boolean }> {
  try {
    let offset = 0;
    const batchSize = 1000;
    const rows: RegistrationDetails[] = [];
    let truncated = false;

    while (rows.length < cap) {
      const fetchCount = Math.min(batchSize, cap - rows.length);
      let query = supabase.from("admin_registrations").select("*");
      query = applyRegistrationFilters(query, params);
      query = query
        .order(params.sort.column, { ascending: params.sort.dir === "asc" })
        .order("id", { ascending: true })
        .range(offset, offset + fetchCount - 1);

      const { data, error } = await query;
      if (error || !data) {
        throw new Error("registrations_query_failed");
      }

      for (const item of data) {
        rows.push(toDetails(item, null));
      }

      if (data.length < fetchCount) {
        break;
      }

      offset += data.length;
    }

    if (rows.length >= cap) {
      let checkQuery = supabase
        .from("admin_registrations")
        .select("id", { count: "exact", head: true });
      checkQuery = applyRegistrationFilters(checkQuery, params);
      const { count, error } = await checkQuery;
      if (!error && typeof count === "number" && count > cap) {
        truncated = true;
      }
    }

    return {
      rows: rows.slice(0, cap),
      truncated,
    };
  } catch {
    throw new Error("registrations_query_failed");
  }
}

