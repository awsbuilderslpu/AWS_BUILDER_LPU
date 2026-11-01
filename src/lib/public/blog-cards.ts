import type { BlogPost, BlogTopic } from "../../data/blogs";
import { isoToIst } from "../datetime";

export const SIX_TOPICS: readonly BlogTopic[] = [
  "AWS",
  "Cloud Computing",
  "Tutorials",
  "Community",
  "Career",
  "Projects",
] as const;

export interface BlogCardRowInput {
  slug: string;
  title: string;
  excerpt?: string | null;
  category: string;
  tags?: string[] | null;
  read_minutes?: number | null;
  featured_image_path?: string | null;
  author_name: string;
  status?: string | null;
  publish_at: string | null;
  is_featured?: boolean | null;
  author_image?: string | null;
}

/**
 * Extracts topics from category and tags that match the six standard blog topics.
 * Returns unique matches preserved in canonical topic order.
 * Tag comparison is case-insensitive.
 */
export function topicsFor(
  category: string,
  tags?: string[] | null
): BlogTopic[] {
  const matched = new Set<BlogTopic>();

  const matchTopic = (val: string): BlogTopic | undefined => {
    const trimmed = val.trim().toLowerCase();
    return SIX_TOPICS.find((t) => t.toLowerCase() === trimmed);
  };

  const catTopic = matchTopic(category);
  if (catTopic) {
    matched.add(catTopic);
  }

  if (Array.isArray(tags)) {
    for (const tag of tags) {
      if (typeof tag === "string") {
        const tagTopic = matchTopic(tag);
        if (tagTopic) {
          matched.add(tagTopic);
        }
      }
    }
  }

  return SIX_TOPICS.filter((t) => matched.has(t));
}

/**
 * Counts how many posts carry each of the six canonical topics.
 */
export function popularTopicCounts(
  posts: BlogPost[]
): Record<BlogTopic, number> {
  const counts: Record<BlogTopic, number> = {
    AWS: 0,
    "Cloud Computing": 0,
    Tutorials: 0,
    Community: 0,
    Career: 0,
    Projects: 0,
  };

  for (const post of posts) {
    if (Array.isArray(post.topics)) {
      for (const topic of post.topics) {
        if (topic in counts) {
          counts[topic]++;
        }
      }
    }
  }

  return counts;
}

/**
 * Pure adapter transforming a blog database row into a BlogPost for public cards.
 * Returns null when publish_at is missing or invalid.
 */
export function toBlogPost(
  row: BlogCardRowInput,
  _nowMs: number,
  imageUrl: string | null
): BlogPost | null {
  if (!row.publish_at || typeof row.publish_at !== "string") {
    return null;
  }

  const ist = isoToIst(row.publish_at);
  if (!ist) {
    return null;
  }

  const date = ist.date;
  const topics = topicsFor(row.category, row.tags);
  const image = imageUrl ? imageUrl : undefined;
  const featured = Boolean(row.is_featured);
  const href = `/blogs/${row.slug}`;
  const readMinutes =
    typeof row.read_minutes === "number" && row.read_minutes > 0
      ? row.read_minutes
      : 1;

  return {
    slug: row.slug,
    title: row.title,
    ...(row.excerpt ? { excerpt: row.excerpt } : {}),
    category: row.category,
    topics,
    authorName: row.author_name,
    ...(row.author_image ? { authorImage: row.author_image } : {}),
    date,
    readMinutes,
    ...(image ? { image } : {}),
    featured,
    href,
  };
}

export const blogRowToCard = toBlogPost;
export const tallyTopicCounts = popularTopicCounts;


