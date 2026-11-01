/**
 * Builds absolute sitemap URLs given a base site URL and an array of relative paths.
 * Returns an empty array when siteUrl is null, empty, or not http/https.
 * Trailing slashes are stripped from the resulting URLs and duplicate URLs are removed.
 */
export function buildSitemapUrls(
  siteUrl: string | null,
  paths: string[]
): string[] {
  if (!siteUrl || typeof siteUrl !== "string") {
    return [];
  }

  const trimmed = siteUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return [];
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return [];
  }

  const base = trimmed.replace(/\/+$/, "");
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawPath of paths) {
    if (typeof rawPath !== "string") continue;
    const trimmedPath = rawPath.trim();
    const withLeading = trimmedPath.startsWith("/")
      ? trimmedPath
      : `/${trimmedPath}`;
    const full = `${base}${withLeading}`.replace(/\/+$/, "");
    const finalUrl = full || base;
    if (!seen.has(finalUrl)) {
      seen.add(finalUrl);
      result.push(finalUrl);
    }
  }

  return result;
}

