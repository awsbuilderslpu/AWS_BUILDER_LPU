import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListParams } from "../admin/list-params";
import { buildSearchOr } from "../admin/search";
import { istDayRange } from "../registrations/date-range";
import {
  toBlogAdminRow,
  toBlogDetails,
  type BlogAdminRow,
  type BlogDetails,
} from "./types";

export const BLOG_LIST_COLUMNS =
  "id, slug, title, excerpt, category, tags, read_minutes, featured_image_path, author_name, status, publish_at, is_featured, updated_at";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyBlogFilters(query: any, params: ListParams, nowIso: string): any {
  let q = query;

  // Tabs:
  // all adds no condition;
  // published means status = 'published' and publish_at <= nowIso;
  // scheduled means status = 'published' and publish_at > nowIso;
  // drafts means status = 'draft';
  // archived means status = 'archived'.
  if (params.tab === "published") {
    q = q.eq("status", "published").lte("publish_at", nowIso);
  } else if (params.tab === "scheduled") {
    q = q.eq("status", "published").gt("publish_at", nowIso);
  } else if (params.tab === "drafts") {
    q = q.eq("status", "draft");
  } else if (params.tab === "archived") {
    q = q.eq("status", "archived");
  }

  // Filters: category equals the value
  if (params.filters.category) {
    q = q.eq("category", params.filters.category);
  }

  // Dates: publish_at within istDayRange(from, to)
  const { fromIso, toExclusiveIso } = istDayRange(
    params.dates.from,
    params.dates.to
  );
  if (fromIso) {
    q = q.gte("publish_at", fromIso);
  }
  if (toExclusiveIso) {
    q = q.lt("publish_at", toExclusiveIso);
  }

  // Search: .or(buildSearchOr(["title", "excerpt", "author_name"], q)) only when it returns a string
  if (params.q) {
    const searchOr = buildSearchOr(["title", "excerpt", "author_name"], params.q);
    if (searchOr) {
      q = q.or(searchOr);
    }
  }

  return q;
}

export async function listBlogs(
  supabase: SupabaseClient,
  params: ListParams,
  nowIso: string
): Promise<{ rows: BlogAdminRow[]; total: number }> {
  try {
    let query = supabase
      .from("blogs")
      .select(BLOG_LIST_COLUMNS, { count: "exact" });

    query = applyBlogFilters(query, params, nowIso);

    const fromIndex = (params.page - 1) * params.pageSize;
    const toIndex = params.page * params.pageSize - 1;

    query = query
      .order(params.sort.column, { ascending: params.sort.dir === "asc" })
      .order("id", { ascending: true })
      .range(fromIndex, toIndex);

    const { data, count, error } = await query;

    if (error || !data) {
      throw new Error("blogs_query_failed");
    }

    const rows = data.map((item) => toBlogAdminRow(item));
    return {
      rows,
      total: count ?? 0,
    };
  } catch {
    throw new Error("blogs_query_failed");
  }
}

export async function getBlogCounts(
  supabase: SupabaseClient,
  nowIso: string
): Promise<{
  total: number;
  published: number;
  scheduled: number;
  drafts: number;
  archived: number;
} | null> {
  try {
    const [totalRes, publishedRes, scheduledRes, draftsRes, archivedRes] =
      await Promise.all([
        supabase
          .from("blogs")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("blogs")
          .select("*", { count: "exact", head: true })
          .eq("status", "published")
          .lte("publish_at", nowIso),
        supabase
          .from("blogs")
          .select("*", { count: "exact", head: true })
          .eq("status", "published")
          .gt("publish_at", nowIso),
        supabase
          .from("blogs")
          .select("*", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase
          .from("blogs")
          .select("*", { count: "exact", head: true })
          .eq("status", "archived"),
      ]);

    if (
      totalRes.error ||
      publishedRes.error ||
      scheduledRes.error ||
      draftsRes.error ||
      archivedRes.error
    ) {
      return null;
    }

    return {
      total: totalRes.count ?? 0,
      published: publishedRes.count ?? 0,
      scheduled: scheduledRes.count ?? 0,
      drafts: draftsRes.count ?? 0,
      archived: archivedRes.count ?? 0,
    };
  } catch {
    return null;
  }
}

export async function fetchBlogsForExport(
  supabase: SupabaseClient,
  params: ListParams,
  nowIso: string,
  cap = 5000
): Promise<{ rows: BlogDetails[]; truncated: boolean }> {
  try {
    let offset = 0;
    const batchSize = 1000;
    const rows: BlogDetails[] = [];

    while (rows.length < cap) {
      const fetchCount = Math.min(batchSize, cap - rows.length);
      let query = supabase.from("blogs").select(BLOG_LIST_COLUMNS);
      query = applyBlogFilters(query, params, nowIso);
      query = query
        .order(params.sort.column, { ascending: params.sort.dir === "asc" })
        .order("id", { ascending: true })
        .range(offset, offset + fetchCount - 1);

      const { data, error } = await query;
      if (error || !data) {
        throw new Error("blogs_query_failed");
      }

      for (const item of data) {
        rows.push(toBlogDetails(item));
      }

      if (data.length < fetchCount) {
        break;
      }
      offset += data.length;
    }

    let truncated = false;
    if (rows.length >= cap) {
      let countQuery = supabase
        .from("blogs")
        .select("id", { count: "exact", head: true });
      countQuery = applyBlogFilters(countQuery, params, nowIso);
      const { count } = await countQuery;
      if (typeof count === "number" && count > cap) {
        truncated = true;
      }
    }

    return { rows, truncated };
  } catch {
    throw new Error("blogs_query_failed");
  }
}

