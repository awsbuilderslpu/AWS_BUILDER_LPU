import { buckets, isBucketKey } from "./buckets";
import { isSafeObjectPath } from "./paths";

/**
 * Builds the full public URL for an asset in a public Supabase Storage bucket.
 * Returns null if the bucket is not public, the path fails safety checks, or no base URL is available.
 * Literal property access process.env.NEXT_PUBLIC_SUPABASE_URL is used so Next.js can inline it.
 */
export function publicObjectUrl(
  bucket: string,
  path: string,
  baseUrl?: string
): string | null {
  const rawBase = baseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawBase || typeof rawBase !== "string") {
    return null;
  }

  const base = rawBase.trim().replace(/\/+$/, "");
  if (!base) {
    return null;
  }

  if (!isBucketKey(bucket) || !buckets[bucket].isPublic) {
    return null;
  }

  if (!isSafeObjectPath(path)) {
    return null;
  }

  const encodedPath = path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");

  return `${base}/storage/v1/object/public/${bucket}/${encodedPath}`;
}
