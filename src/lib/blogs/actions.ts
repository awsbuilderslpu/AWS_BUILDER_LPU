"use server";

import "server-only";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaffAccount } from "@/lib/auth/server";
import { parseListParams } from "@/lib/admin/list-params";
import {
  sanitizeDoc,
  countChars,
  richLimits,
  emptyDoc,
} from "../richtext/sanitize";
import { makeSlug } from "../events/slug";
import { blogFormSchema } from "./validate";
import { blogsListConfig } from "./list-config";
import { estimateReadMinutes } from "./reading-time";
import { fetchBlogsForExport } from "./list-query.server";
import {
  toBlogDetails,
  type BlogDetails,
} from "./types";

export interface CreateBlogResult {
  ok: boolean;
  id?: string;
  slug?: string;
  error?: string;
}

export interface UpdateBlogResult {
  ok: boolean;
  error?: string;
}

export interface SetBlogsStateResult {
  ok: boolean;
  changed?: number;
  error?: string;
}

export interface SetFeaturedBlogResult {
  ok: boolean;
  error?: string;
}

export interface ExportBlogsActionResult {
  ok: boolean;
  rows?: BlogDetails[];
  truncated?: boolean;
  error?: string;
}

function revalidateBlogs() {
  revalidatePath("/admin/blogs");
  revalidatePath("/admin");
  revalidatePath("/blogs", "layout");
}

function mapDatabaseError(error: { code?: string; message?: string } | null | undefined): string {
  if (!error) return "failed";
  if (error.code === "42501") return "forbidden";
  if (error.code === "23514") return "invalid_input";
  if (error.message) {
    if (error.message.includes("not_published")) return "not_published";
    if (error.message.includes("invalid_input")) return "invalid_input";
    if (error.message.includes("not_found")) return "not_found";
    if (error.message.includes("update_failed")) return "update_failed";
  }
  return "failed";
}

const idSchema = z.string().uuid();

const setBlogsStateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(25),
  action: z.enum(["publish", "unpublish", "archive", "restore", "delete"]),
});

const setFeaturedSchema = z.object({
  id: z.string().uuid(),
  featured: z.boolean(),
});

export async function createBlogAction(input: unknown): Promise<CreateBlogResult> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = blogFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const values = parsed.data;
  const cleanDoc = values.body ? sanitizeDoc(values.body, "article") : emptyDoc;
  const charLength = countChars(cleanDoc);

  if (charLength > richLimits.article.maxChars) {
    return { ok: false, error: "description_too_long" };
  }

  const readMinutes = estimateReadMinutes(cleanDoc);
  const supabase = await createClient();

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    const suffix = crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 6)
      .toLowerCase();
    const slug = makeSlug(values.title, suffix);

    const { data, error } = await supabase
      .from("blogs")
      .insert({
        slug,
        title: values.title,
        excerpt: values.excerpt,
        category: values.category,
        tags: values.tags,
        body: cleanDoc,
        read_minutes: readMinutes,
        featured_image_path: values.featuredImagePath,
        author_id: staff.id,
        author_name: values.authorName,
        meta_title: values.metaTitle,
        meta_description: values.metaDescription,
        status: values.status,
        publish_at: values.publishAt,
      })
      .select("id, slug")
      .maybeSingle();

    if (!error && data) {
      revalidateBlogs();
      return { ok: true, id: data.id, slug: data.slug };
    }

    if (error && error.code === "23505" && attempts < 3) {
      continue;
    }

    return { ok: false, error: mapDatabaseError(error) };
  }

  return { ok: false, error: "failed" };
}

export async function updateBlogAction(
  idOrInput: unknown,
  maybeValues?: unknown
): Promise<UpdateBlogResult> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  let blogId: string;
  let formPayload: unknown;

  if (typeof idOrInput === "string" && maybeValues !== undefined) {
    const parsedId = idSchema.safeParse(idOrInput);
    if (!parsedId.success) {
      return { ok: false, error: "invalid_input" };
    }
    blogId = parsedId.data;
    formPayload = maybeValues;
  } else if (idOrInput && typeof idOrInput === "object" && "id" in idOrInput) {
    const rawId = (idOrInput as { id: unknown }).id;
    const parsedId = idSchema.safeParse(rawId);
    if (!parsedId.success) {
      return { ok: false, error: "invalid_input" };
    }
    blogId = parsedId.data;
    formPayload = idOrInput;
  } else {
    return { ok: false, error: "invalid_input" };
  }

  const parsed = blogFormSchema.safeParse(formPayload);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const values = parsed.data;
  const cleanDoc = values.body ? sanitizeDoc(values.body, "article") : emptyDoc;
  const charLength = countChars(cleanDoc);

  if (charLength > richLimits.article.maxChars) {
    return { ok: false, error: "description_too_long" };
  }

  const readMinutes = estimateReadMinutes(cleanDoc);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blogs")
    .update({
      title: values.title,
      excerpt: values.excerpt,
      category: values.category,
      tags: values.tags,
      body: cleanDoc,
      read_minutes: readMinutes,
      featured_image_path: values.featuredImagePath,
      author_name: values.authorName,
      meta_title: values.metaTitle,
      meta_description: values.metaDescription,
      status: values.status,
      publish_at: values.publishAt,
    })
    .eq("id", blogId)
    .select("id");

  if (error) {
    return { ok: false, error: mapDatabaseError(error) };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "not_found" };
  }

  revalidateBlogs();
  return { ok: true };
}

export async function setBlogsStateAction(input: unknown): Promise<SetBlogsStateResult> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = setBlogsStateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const { ids, action } = parsed.data;
  const supabase = await createClient();

  if (action === "delete") {
    const { data, error } = await supabase
      .from("blogs")
      .delete()
      .in("id", ids)
      .select("id");

    if (error) {
      return { ok: false, error: mapDatabaseError(error) };
    }

    revalidateBlogs();
    return { ok: true, changed: data?.length ?? ids.length };
  }

  let patch: Record<string, unknown> = {};

  if (action === "publish") {
    patch = { status: "published", publish_at: new Date().toISOString() };
  } else if (action === "unpublish") {
    patch = { status: "draft" };
  } else if (action === "archive") {
    patch = { status: "archived" };
  } else if (action === "restore") {
    patch = { status: "draft" };
  }

  const { data, error } = await supabase
    .from("blogs")
    .update(patch)
    .in("id", ids)
    .select("id");

  if (error) {
    return { ok: false, error: mapDatabaseError(error) };
  }

  revalidateBlogs();
  return { ok: true, changed: data?.length ?? 0 };
}

export async function deleteBlogsAction(
  idsOrInput: unknown
): Promise<SetBlogsStateResult> {
  const ids = Array.isArray(idsOrInput)
    ? idsOrInput
    : typeof idsOrInput === "string"
    ? [idsOrInput]
    : (idsOrInput as { ids?: unknown })?.ids;
  return setBlogsStateAction({ ids, action: "delete" });
}

export async function setFeaturedBlogAction(input: unknown): Promise<SetFeaturedBlogResult> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = setFeaturedSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const { id, featured } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.rpc("set_featured_blog", {
    p_id: id,
    p_featured: featured,
  });

  if (error) {
    return { ok: false, error: mapDatabaseError(error) };
  }

  revalidateBlogs();
  return { ok: true };
}

export async function getBlogDetailsAction(id: unknown): Promise<BlogDetails | null> {
  const staff = await getStaffAccount();
  if (!staff) {
    return null;
  }

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blogs")
    .select(
      "id, slug, title, excerpt, category, tags, body, read_minutes, featured_image_path, author_name, meta_title, meta_description, status, publish_at, is_featured, created_at, updated_at"
    )
    .eq("id", parsed.data)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toBlogDetails(data);
}

export async function exportBlogsAction(
  raw: Record<string, string | string[] | undefined>
): Promise<ExportBlogsActionResult> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const params = parseListParams(raw, blogsListConfig);
    const supabase = await createClient();
    const { rows, truncated } = await fetchBlogsForExport(
      supabase,
      params,
      new Date().toISOString()
    );

    return { ok: true, rows, truncated };
  } catch {
    return { ok: false, error: "failed" };
  }
}

