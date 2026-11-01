export type BlogStatus = "draft" | "published" | "archived";

export type BlogLifecycle = "draft" | "scheduled" | "published" | "archived";

export interface BlogAdminRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  readMinutes: number;
  featuredImagePath: string | null;
  authorName: string;
  status: BlogStatus;
  publishAt: string | null;
  isFeatured: boolean;
  updatedAt: string;
}

export interface BlogDetails extends BlogAdminRow {
  /** Already sanitized rich-text document (unknown shape). */
  body: unknown;
  metaTitle: string | null;
  metaDescription: string | null;
}

export function toBlogAdminRow(raw: unknown): BlogAdminRow {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;

  const status: BlogStatus =
    r.status === "draft" || r.status === "published" || r.status === "archived"
      ? r.status
      : "draft";

  return {
    id: typeof r.id === "string" ? r.id : "",
    slug: typeof r.slug === "string" ? r.slug : "",
    title: typeof r.title === "string" ? r.title : "",
    excerpt: typeof r.excerpt === "string" ? r.excerpt : null,
    category: typeof r.category === "string" ? r.category : "",
    tags: Array.isArray(r.tags)
      ? r.tags.filter((t): t is string => typeof t === "string")
      : [],
    readMinutes: typeof r.read_minutes === "number" ? r.read_minutes : 1,
    featuredImagePath:
      typeof r.featured_image_path === "string" ? r.featured_image_path : null,
    authorName: typeof r.author_name === "string" ? r.author_name : "",
    status,
    publishAt: typeof r.publish_at === "string" ? r.publish_at : null,
    isFeatured: Boolean(r.is_featured),
    updatedAt: typeof r.updated_at === "string" ? r.updated_at : "",
  };
}

export function toBlogDetails(raw: unknown): BlogDetails {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const adminRow = toBlogAdminRow(raw);

  return {
    ...adminRow,
    body: r.body ?? null,
    metaTitle: typeof r.meta_title === "string" ? r.meta_title : null,
    metaDescription:
      typeof r.meta_description === "string" ? r.meta_description : null,
  };
}

