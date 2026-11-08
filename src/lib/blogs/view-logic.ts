import type { BlogDetails, BlogLifecycle } from "./types";
import type { BlogFormValues } from "./validate";
import { blogCategories } from "./categories";
import { emptyDoc } from "../richtext/sanitize";

export type BlogAction = "publish" | "unpublish" | "archive" | "restore" | "delete";

/**
 * Returns allowed lifecycle actions for a blog post based on its computed lifecycle:
 * - draft: ["publish", "archive", "delete"]
 * - scheduled: ["publish", "unpublish", "archive", "delete"]
 * - published: ["unpublish", "archive", "delete"]
 * - archived: ["restore", "delete"]
 */
export function blogActions(lifecycle: BlogLifecycle): BlogAction[] {
  if (lifecycle === "archived") {
    return ["restore", "delete"];
  }
  if (lifecycle === "scheduled") {
    return ["publish", "unpublish", "archive", "delete"];
  }
  if (lifecycle === "published") {
    return ["unpublish", "archive", "delete"];
  }
  return ["publish", "archive", "delete"];
}

/**
 * Label for a blog action.
 * Publish on a scheduled post gives labels.publishNow, every other case uses labels[action].
 */
export function actionLabel(
  action: BlogAction,
  lifecycle: BlogLifecycle,
  labels: Record<string, string>
): string {
  if (action === "publish" && lifecycle === "scheduled") {
    return labels.publishNow ?? "Publish now";
  }
  return labels[action] ?? action;
}

/**
 * Returns the intersection of actions allowed for all lifecycles in the list,
 * in the order of the first lifecycle. Returns [] for an empty list.
 */
export function commonBlogActions(lifecycles: BlogLifecycle[]): BlogAction[] {
  if (!lifecycles || lifecycles.length === 0) {
    return [];
  }
  const firstAllowed = blogActions(lifecycles[0]);
  return firstAllowed.filter((act) =>
    lifecycles.every((l) => blogActions(l).includes(act))
  );
}

/**
 * True only for "published". Scheduled posts can't be featured yet.
 */
export function featuredToggleAllowed(lifecycle: BlogLifecycle): boolean {
  return lifecycle === "published";
}

/**
 * Prepares react-hook-form values from loaded BlogDetails.
 * Tags are copied; missing featured image or publish date becomes null;
 * status is "published" when it is published and "draft" otherwise.
 */
export function formFromDetails(details: BlogDetails): BlogFormValues {
  return {
    title: details.title ?? "",
    excerpt: details.excerpt ?? null,
    category: details.category || blogCategories[0],
    tags: Array.isArray(details.tags) ? [...details.tags] : [],
    body: details.body ?? emptyDoc,
    featuredImagePath: details.featuredImagePath ?? null,
    authorName: details.authorName ?? "",
    metaTitle: details.metaTitle ?? null,
    metaDescription: details.metaDescription ?? null,
    status: details.status === "published" ? "published" : "draft",
    publishAt: details.publishAt ?? null,
  };
}

/**
 * Produces blank blog form values with empty defaults.
 */
export function emptyBlogForm(): BlogFormValues {
  return {
    title: "",
    excerpt: null,
    category: blogCategories[0],
    tags: [],
    body: emptyDoc,
    authorName: "",
    metaTitle: null,
    metaDescription: null,
    status: "draft",
    publishAt: null,
    featuredImagePath: null,
  };
}

