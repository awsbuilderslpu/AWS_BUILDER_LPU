import type { MetadataRoute } from "next";
import { listPublicEvents } from "@/lib/public/events.server";
import { listPublicBlogs } from "@/lib/public/blogs.server";
import { buildSitemapUrls } from "@/lib/public/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || null;

  const [events, blogs] = await Promise.all([
    listPublicEvents(),
    listPublicBlogs(),
  ]);

  const items: Array<{ path: string; lastModified?: Date }> = [
    { path: "/" },
    { path: "/about" },
    { path: "/events" },
    { path: "/blogs" },
    { path: "/members" },
    { path: "/contact" },
  ];

  for (const event of events) {
    const d = event.starts_at ? new Date(event.starts_at) : undefined;
    items.push({
      path: `/events/${event.slug}`,
      ...(d && !Number.isNaN(d.getTime()) ? { lastModified: d } : {}),
    });
  }

  for (const blog of blogs) {
    const d = blog.publish_at ? new Date(blog.publish_at) : undefined;
    items.push({
      path: `/blogs/${blog.slug}`,
      ...(d && !Number.isNaN(d.getTime()) ? { lastModified: d } : {}),
    });
  }

  const rawUrls = buildSitemapUrls(
    siteUrl,
    items.map((i) => i.path)
  );

  if (rawUrls.length === 0) {
    return [];
  }

  const itemMap = new Map<string, { lastModified?: Date }>();
  for (const item of items) {
    const built = buildSitemapUrls(siteUrl, [item.path]);
    if (built[0]) {
      itemMap.set(built[0], item);
    }
  }

  return rawUrls.map((url) => {
    const item = itemMap.get(url);
    return {
      url,
      ...(item?.lastModified ? { lastModified: item.lastModified } : {}),
    };
  });
}
