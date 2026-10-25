import type { BlogPost } from "@/data/blogs";
import { formatEventDate } from "@/lib/events";

export { formatEventDate };

export function splitPosts(posts: BlogPost[]): {
  featured: BlogPost | undefined;
  latest: BlogPost[];
  recent: BlogPost[];
} {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const featuredIndex = sorted.findIndex((p) => p.featured);
  let featured: BlogPost | undefined;
  let remaining: BlogPost[];

  if (featuredIndex !== -1) {
    featured = sorted[featuredIndex];
    remaining = sorted.filter((_, idx) => idx !== featuredIndex);
  } else {
    featured = sorted[0];
    remaining = sorted.slice(1);
  }

  const latest = remaining.slice(0, 3);
  const recent = remaining.slice(3, 7);

  return { featured, latest, recent };
}

export function filterPosts(
  posts: BlogPost[],
  topic: string,
  query: string
): BlogPost[] {
  const q = query.trim().toLowerCase();

  return posts.filter((post) => {
    // Topic match
    const matchesTopic =
      topic === "All" || (post.topics as string[]).includes(topic);
    if (!matchesTopic) return false;

    // Query match
    if (!q) return true;

    const inTitle = post.title.toLowerCase().includes(q);
    const inExcerpt = post.excerpt ? post.excerpt.toLowerCase().includes(q) : false;
    const inCategory = post.category.toLowerCase().includes(q);
    const inAuthor = post.authorName.toLowerCase().includes(q);

    return inTitle || inExcerpt || inCategory || inAuthor;
  });
}
