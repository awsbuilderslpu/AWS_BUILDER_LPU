"use client";

import { createClient } from "@/lib/supabase/client";
import { buckets, type BucketKey } from "./buckets";
import { buildObjectPath, isSafeObjectPath } from "./paths";
import { publicObjectUrl } from "./urls";
import { processImage } from "./image-process";
import { UploadError } from "./errors";

export { UploadError, type UploadErrorCode } from "./errors";

export interface UploadImageOptions {
  bucket: BucketKey;
  file: File;
  userId?: string | null;
  aspect?: number;
}

export interface UploadResult {
  path: string;
  previewBlob: Blob;
}

/**
 * Uploads an image file to Supabase storage after client-side sanitization and compression.
 * Enforces ownership folder constraints and returns the storage path and preview blob.
 */
export async function uploadImage({
  bucket,
  file,
  userId,
  aspect,
}: UploadImageOptions): Promise<UploadResult> {
  const bucketConfig = buckets[bucket];

  if (bucketConfig.ownerFolder && (!userId || typeof userId !== "string")) {
    throw new UploadError("signed_out");
  }

  const processed = await processImage(file, {
    maxWidth: bucketConfig.maxWidth,
    maxBytes: bucketConfig.maxBytes,
    aspect: aspect ?? bucketConfig.aspect,
  });

  const ext = processed.mime === "image/webp" ? "webp" : "jpg";
  let path: string;
  try {
    path = buildObjectPath({
      bucket,
      userId: userId ?? undefined,
      ext,
    });
  } catch {
    throw new UploadError("upload");
  }

  const supabase = createClient();
  const cacheControl = bucketConfig.isPublic ? "31536000" : "3600";

  const { error } = await supabase.storage.from(bucket).upload(path, processed.blob, {
    contentType: processed.mime,
    cacheControl,
    upsert: false,
  });

  if (error) {
    throw new UploadError("upload", error.message);
  }

  return { path, previewBlob: processed.blob };
}

/**
 * Best-effort deletion of an uploaded file from storage.
 * Only attempts removal if the path passes safety checks, and never throws.
 */
export async function removeUploaded(
  bucket: BucketKey,
  path: string
): Promise<void> {
  if (!isSafeObjectPath(path)) {
    return;
  }

  try {
    const supabase = createClient();
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // Best effort cleanup: never throw or leak errors
  }
}

/**
 * Retrieves a preview URL for a storage path.
 * Returns a static CDN public URL for public buckets or a 1-hour signed URL for private buckets.
 * Returns null on any failure.
 */
export async function getPreviewUrl(
  bucket: BucketKey,
  path: string
): Promise<string | null> {
  if (!isSafeObjectPath(path)) {
    return null;
  }

  const bucketConfig = buckets[bucket];
  if (bucketConfig.isPublic) {
    return publicObjectUrl(bucket, path);
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      return null;
    }
    return data.signedUrl;
  } catch {
    return null;
  }
}
