import { buckets, isBucketKey, type BucketKey } from "./buckets";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface BuildObjectPathOptions {
  bucket: string;
  userId?: string;
  ext: string;
  now?: Date | number;
  id?: string;
}

/**
 * Builds a safe, deterministic storage path for an uploaded object.
 * Rejects invalid buckets, extensions, or IDs, and guarantees that user-provided text
 * cannot be injected into the path.
 */
export function buildObjectPath({
  bucket,
  userId,
  ext,
  now,
  id,
}: BuildObjectPathOptions): string {
  if (!isBucketKey(bucket)) {
    throw new Error(`Invalid bucket: ${bucket}`);
  }

  if (ext !== "webp" && ext !== "jpg") {
    throw new Error(`Invalid extension: ${ext}; must be 'webp' or 'jpg'`);
  }

  const resolvedId = id ?? crypto.randomUUID();
  if (typeof resolvedId !== "string" || !UUID_REGEX.test(resolvedId)) {
    throw new Error(`Invalid id: ${resolvedId}; must match a UUID pattern`);
  }

  const bucketConfig = buckets[bucket];

  if (bucketConfig.ownerFolder) {
    if (!userId || typeof userId !== "string" || !UUID_REGEX.test(userId)) {
      throw new Error(
        `userId is required and must be a UUID for ownerFolder bucket: ${bucket}`
      );
    }
    return `${userId}/${resolvedId}.${ext}`;
  }

  const nowDate =
    now instanceof Date
      ? now
      : typeof now === "number"
      ? new Date(now)
      : new Date();

  if (Number.isNaN(nowDate.getTime())) {
    throw new Error("Invalid 'now' timestamp provided");
  }

  const yyyy = String(nowDate.getUTCFullYear()).padStart(4, "0");
  const mm = String(nowDate.getUTCMonth() + 1).padStart(2, "0");

  return `${yyyy}/${mm}/${resolvedId}.${ext}`;
}

/**
 * Validates that a storage path matches safe alphanumeric and separator patterns,
 * does not contain directory traversal attempts (".."), leading slashes, double slashes,
 * or exceed 200 characters.
 */
export function isSafeObjectPath(path: string): boolean {
  if (typeof path !== "string") return false;
  if (path.length === 0 || path.length > 200) return false;
  if (!/^[A-Za-z0-9/_.-]+$/.test(path)) return false;
  if (path.startsWith("/")) return false;
  if (path.includes("..")) return false;
  if (path.includes("//")) return false;
  return true;
}
