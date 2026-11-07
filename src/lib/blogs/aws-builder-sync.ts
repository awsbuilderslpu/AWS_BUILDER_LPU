"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/lib/auth/server";
import type { RichTextDoc } from "@/lib/richtext/sanitize";

export interface AwsBuilderArticleMeta {
  title: string;
  excerpt: string;
  authorName: string;
  tags: string[];
  publishAt: string;
  externalImageUrl: string | null;
  sourceUrl: string;
  body: RichTextDoc;
}

function parseAwsBuilderHtml(
  html: string,
  originalUrl: string
): AwsBuilderArticleMeta {
  const match = html.match(
    /<script id="__bingo-ssr-query-state__" type="application\/json">(.*?)<\/script>/
  );
  if (!match) {
    throw new Error("Could not find article state in AWS Builder response");
  }

  const json = JSON.parse(match[1]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articleQuery = json.article?.queries?.[0]?.state?.data as any;
  if (!articleQuery) {
    throw new Error("Could not find article data in query state");
  }

  const rawTitle = String(articleQuery.title || "AWS Builder Article").trim();
  const title = rawTitle.slice(0, 120);

  const rawDescription = String(
    articleQuery.description || articleQuery.markdownDescription || ""
  ).trim();
  const excerpt = rawDescription.slice(0, 200);

  const authorName = String(
    articleQuery.author?.preferredName || "MD ARFAA TAJ"
  ).slice(0, 80);

  const rawTags: string[] = Array.isArray(articleQuery.tags)
    ? articleQuery.tags.filter((t: unknown): t is string => typeof t === "string")
    : [];
  const tags = rawTags.slice(0, 10);

  const publishAt = articleQuery.lastPublishedAt
    ? new Date(articleQuery.lastPublishedAt).toISOString()
    : new Date().toISOString();

  // Try hero image or fallback to og:image meta tag
  const ogImageMatch = html.match(
    /<meta property="og:image" content="([^"]+)"/
  );
  const externalImageUrl =
    typeof articleQuery.heroImageUrl === "string" && articleQuery.heroImageUrl
      ? articleQuery.heroImageUrl
      : ogImageMatch
      ? ogImageMatch[1].replace(/&amp;/g, "&")
      : null;

  // Build clean rich-text body with overview and callout
  const bodyContent: RichTextDoc["content"] = [];

  if (rawDescription) {
    const paragraphs = rawDescription.split(/\n\n+/).filter(Boolean);
    for (const para of paragraphs) {
      bodyContent.push({
        type: "paragraph",
        content: [{ type: "text", text: para.trim() }],
      });
    }
  } else {
    bodyContent.push({
      type: "paragraph",
      content: [{ type: "text", text: excerpt || title }],
    });
  }

  const body: RichTextDoc = {
    type: "doc",
    content: bodyContent,
  };

  return {
    title,
    excerpt,
    authorName,
    tags,
    publishAt,
    externalImageUrl,
    sourceUrl: originalUrl,
    body,
  };
}

export async function fetchAwsBuilderArticle(
  url: string
): Promise<AwsBuilderArticleMeta> {
  const trimmed = url.trim();
  if (!/^https?:\/\/builder\.aws\.com\/content\//i.test(trimmed)) {
    throw new Error(
      "URL must start with https://builder.aws.com/content/"
    );
  }

  const res = await fetch(trimmed, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch article from AWS Builder: HTTP ${res.status}`);
  }

  const html = await res.text();
  return parseAwsBuilderHtml(html, trimmed);
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
  return `${base || "aws-builder"}-${suffix}`;
}

export interface ImportArticleResult {
  ok: boolean;
  slug?: string;
  title?: string;
  error?: string;
}

export async function importAwsBuilderArticleAction(
  articleUrl: string
): Promise<ImportArticleResult> {
  try {
    const account = await getCurrentAccount();
    if (!account) {
      return { ok: false, error: "Authentication required" };
    }

    const meta = await fetchAwsBuilderArticle(articleUrl);
    const supabase = await createClient();

    // Check if an article with this sourceUrl already exists
    const { data: existing } = await supabase
      .from("blogs")
      .select("id, slug")
      .eq("source_url", meta.sourceUrl)
      .maybeSingle();

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from("blogs")
        .update({
          title: meta.title,
          excerpt: meta.excerpt,
          tags: meta.tags,
          body: meta.body,
          external_image_url: meta.externalImageUrl,
          publish_at: meta.publishAt,
          status: "published",
        })
        .eq("id", existing.id);

      if (updateError) {
        return { ok: false, error: updateError.message };
      }

      revalidatePath("/blogs");
      revalidatePath("/admin/blogs");
      return { ok: true, slug: existing.slug, title: meta.title };
    }

    // Insert new
    const slug = generateSlug(meta.title);

    const { error: insertError } = await supabase.from("blogs").insert({
      slug,
      title: meta.title,
      excerpt: meta.excerpt,
      category: "AWS",
      tags: meta.tags,
      body: meta.body,
      read_minutes: 5,
      author_id: account.id,
      author_name: meta.authorName,
      status: "published",
      publish_at: meta.publishAt,
      source_url: meta.sourceUrl,
      source_platform: "aws_builder",
      external_image_url: meta.externalImageUrl,
    });

    if (insertError) {
      return { ok: false, error: insertError.message };
    }

    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");
    return { ok: true, slug, title: meta.title };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to import article",
    };
  }
}

