import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  let validSiteUrl: string | null = null;

  if (rawSiteUrl) {
    try {
      const parsed = new URL(rawSiteUrl);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        validSiteUrl = rawSiteUrl.replace(/\/+$/, "");
      }
    } catch {
      validSiteUrl = null;
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/auth", "/profile"],
    },
    ...(validSiteUrl ? { sitemap: `${validSiteUrl}/sitemap.xml` } : {}),
  };
}

