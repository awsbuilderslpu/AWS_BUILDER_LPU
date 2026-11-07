import "server-only";

import { cache } from "react";
import { createPublicClient } from "../supabase/public";

export interface PublicBlogListRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  read_minutes: number;
  featured_image_path: string | null;
  author_name: string;
  status: string;
  publish_at: string | null;
  is_featured: boolean;
  source_url?: string | null;
  source_platform?: string | null;
  external_image_url?: string | null;
}

export interface PublicBlogDetailRow extends PublicBlogListRow {
  body: unknown;
  meta_title: string | null;
  meta_description: string | null;
}

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{2,79}$/;

const PUBLIC_BLOG_LIST_COLUMNS =
  "id, slug, title, excerpt, category, tags, read_minutes, featured_image_path, author_name, status, publish_at, is_featured, source_url, source_platform, external_image_url";

const PUBLIC_BLOG_DETAIL_COLUMNS =
  "id, slug, title, excerpt, category, tags, read_minutes, featured_image_path, author_name, status, publish_at, is_featured, body, meta_title, meta_description, source_url, source_platform, external_image_url";

/**
 * Lists published blogs whose publish_at is at or before nowIso,
 * ordered by publish_at descending, up to 200 rows.
 * Excludes body. Never selects author_id, created_by, or updated_by.
 */
export async function listPublicBlogs(
  nowIso?: string
): Promise<PublicBlogListRow[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return [];
    }

    const effectiveNow = nowIso ?? new Date().toISOString();

    const { data, error } = await supabase
      .from("blogs")
      .select(PUBLIC_BLOG_LIST_COLUMNS)
      .eq("status", "published")
      .lte("publish_at", effectiveNow)
      .order("publish_at", { ascending: false })
      .limit(200);

    if (error || !data) {
      return [];
    }

    return data as PublicBlogListRow[];
  } catch {
    return [];
  }
}

/**
 * Retrieves a single published blog by slug if its publish_at is at or before nowIso.
 * Validates the slug before querying the database.
 * Returns null when not found, not published, scheduled for the future, or on error.
 */
export const getPublicBlog = cache(
  async (
    slug: string,
    nowIso?: string
  ): Promise<PublicBlogDetailRow | null> => {
    if (typeof slug !== "string" || !SLUG_REGEX.test(slug)) {
      return null;
    }

    try {
      const supabase = createPublicClient();
      if (!supabase) {
        return null;
      }

      const effectiveNow = nowIso ?? new Date().toISOString();

      const { data, error } = await supabase
        .from("blogs")
        .select(PUBLIC_BLOG_DETAIL_COLUMNS)
        .eq("slug", slug)
        .eq("status", "published")
        .lte("publish_at", effectiveNow)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as PublicBlogDetailRow;
    } catch {
      return null;
    }
  }
);

