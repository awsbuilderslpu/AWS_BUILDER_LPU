import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { parseListParams, toSearchParams } from "@/lib/admin/list-params";
import { blogsListConfig } from "@/lib/blogs/list-config";
import {
  listBlogs,
  getBlogCounts,
} from "@/lib/blogs/list-query.server";
import type { BlogAdminRow } from "@/lib/blogs/types";
import { clampPage } from "@/lib/registrations/view-logic";
import {
  BlogsView,
  type BlogCounts,
} from "@/components/features/admin/blogs/BlogsView";

export const metadata: Metadata = {
  title: "Blogs",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminBlogsPage({ searchParams }: PageProps) {
  await requireStaff("/admin/blogs");

  const rawParams = await searchParams;
  const params = parseListParams(rawParams, blogsListConfig);

  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let rows: BlogAdminRow[] = [];
  let total = 0;
  let counts: BlogCounts | null = null;
  let loadError = false;

  try {
    const [listResult, countsResult] = await Promise.all([
      listBlogs(supabase, params, nowIso),
      getBlogCounts(supabase, nowIso),
    ]);
    rows = listResult.rows;
    total = listResult.total;
    counts = countsResult;
  } catch {
    loadError = true;
  }

  // Handle out-of-range page redirect
  if (!loadError && params.page > 1 && rows.length === 0 && total > 0) {
    const clamped = clampPage(params.page, params.pageSize, total);
    const qs = toSearchParams(
      { ...params, page: clamped },
      blogsListConfig
    ).toString();
    redirect(`/admin/blogs${qs ? `?${qs}` : ""}`);
  }

  return (
    <BlogsView
      rows={rows}
      total={total}
      counts={counts}
      params={params}
      nowIso={nowIso}
      loadError={loadError}
    />
  );
}

