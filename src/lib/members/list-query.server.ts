import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListParams } from "../admin/list-params";
import { buildSearchOr } from "../admin/search";
import {
  toMemberListRow,
  toMemberDetails,
  type MemberListRow,
  type MemberDetails,
  type AppRole,
} from "./types";

const MEMBER_LIST_COLUMNS =
  "user_id, registration_id, role, is_active, registration_status, full_name, first_name, last_name, email, registration_number, department, programme, study_year, member_since";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMemberFilters(query: any, params: ListParams): any {
  let q = query;

  if (params.tab && params.tab !== "all") {
    if (params.tab === "admin") {
      q = q.in("role", ["administrator", "admin"]);
    } else {
      q = q.eq("role", params.tab);
    }
  }

  if (params.filters.department) {
    q = q.eq("department", params.filters.department);
  }

  if (params.filters.year) {
    q = q.eq("study_year", params.filters.year);
  }

  if (params.filters.status === "active") {
    q = q.eq("is_active", true);
  } else if (params.filters.status === "inactive") {
    q = q.eq("is_active", false);
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

export async function listMembers(
  supabase: SupabaseClient,
  params: ListParams
): Promise<{ rows: MemberListRow[]; total: number }> {
  try {
    let query = supabase
      .from("admin_members")
      .select(MEMBER_LIST_COLUMNS, { count: "exact" });

    query = applyMemberFilters(query, params);

    const fromIndex = (params.page - 1) * params.pageSize;
    const toIndex = params.page * params.pageSize - 1;

    query = query
      .order(params.sort.column, { ascending: params.sort.dir === "asc" })
      .order("user_id", { ascending: true })
      .range(fromIndex, toIndex);

    const { data, count, error } = await query;

    if (error || !data) {
      throw new Error("members_query_failed");
    }

    const rows = data.map((item) => toMemberListRow(item));
    return {
      rows,
      total: count ?? 0,
    };
  } catch {
    throw new Error("members_query_failed");
  }
}

export async function getMemberCounts(
  supabase: SupabaseClient
): Promise<{
  total: number;
  admin: number;
  core: number;
  member: number;
  student: number;
  participant: number;
} | null> {
  try {
    const roles: AppRole[] = [
      "admin",
      "core",
      "member",
      "student",
      "participant",
    ];
    const [totalRes, ...roleResults] = await Promise.all([
      supabase
        .from("admin_members")
        .select("*", { count: "exact", head: true }),
      ...roles.map((r) => {
        const query = supabase
          .from("admin_members")
          .select("*", { count: "exact", head: true });
        return r === "admin"
          ? query.in("role", ["administrator", "admin"])
          : query.eq("role", r);
      }),
    ]);

    if (totalRes.error || roleResults.some((r) => r.error)) {
      return null;
    }

    return {
      total: totalRes.count ?? 0,
      admin: roleResults[0]?.count ?? 0,
      core: roleResults[1]?.count ?? 0,
      member: roleResults[2]?.count ?? 0,
      student: roleResults[3]?.count ?? 0,
      participant: roleResults[4]?.count ?? 0,
    };
  } catch {
    return null;
  }
}

export async function fetchAllMembersForExport(
  supabase: SupabaseClient,
  params: ListParams,
  cap = 5000
): Promise<{ rows: MemberDetails[]; truncated: boolean }> {
  try {
    let offset = 0;
    const batchSize = 1000;
    const rows: MemberDetails[] = [];
    let truncated = false;

    while (rows.length < cap) {
      const fetchCount = Math.min(batchSize, cap - rows.length);
      let query = supabase.from("admin_members").select("*");
      query = applyMemberFilters(query, params);
      query = query
        .order(params.sort.column, { ascending: params.sort.dir === "asc" })
        .order("user_id", { ascending: true })
        .range(offset, offset + fetchCount - 1);

      const { data, error } = await query;
      if (error || !data) {
        throw new Error("members_query_failed");
      }

      for (const item of data) {
        rows.push(toMemberDetails(item));
      }

      if (data.length < fetchCount) {
        break;
      }

      offset += data.length;
    }

    if (rows.length >= cap) {
      let checkQuery = supabase
        .from("admin_members")
        .select("user_id", { count: "exact", head: true });
      checkQuery = applyMemberFilters(checkQuery, params);
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
    throw new Error("members_query_failed");
  }
}

