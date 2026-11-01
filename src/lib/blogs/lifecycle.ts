import type { BlogStatus, BlogLifecycle } from "./types";

export interface BlogLifecycleInput {
  status: BlogStatus | string;
  publishAt: string | null | undefined;
}

/**
 * Computes the blog lifecycle from its status and publish date.
 * - archived  -> "archived"
 * - draft     -> "draft"
 * - published + publishAt in the future -> "scheduled"
 * - published + publishAt at or before now -> "published"
 * - published + unparseable publishAt -> "draft" (safety fallback)
 */
export function blogLifecycle(
  post: BlogLifecycleInput,
  nowMs: number
): BlogLifecycle {
  if (post.status === "archived") {
    return "archived";
  }

  if (post.status !== "published") {
    return "draft";
  }

  // status === "published"
  if (!post.publishAt) {
    return "draft";
  }

  const publishMs = Date.parse(post.publishAt);
  if (Number.isNaN(publishMs)) {
    return "draft";
  }

  if (publishMs > nowMs) {
    return "scheduled";
  }

  return "published";
}

/**
 * Returns true only when the post is published and its publish date is at or before now.
 * Mirrors the SQL policy: status = 'published' and publish_at <= now().
 */
export function isPubliclyVisible(
  post: BlogLifecycleInput,
  nowMs: number
): boolean {
  if (post.status !== "published") {
    return false;
  }

  if (!post.publishAt) {
    return false;
  }

  const publishMs = Date.parse(post.publishAt);
  if (Number.isNaN(publishMs)) {
    return false;
  }

  return publishMs <= nowMs;
}

