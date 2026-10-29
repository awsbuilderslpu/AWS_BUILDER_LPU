// mirrors supabase/migrations/005_storage.sql; keep the two in sync.

export type BucketKey = "avatars" | "covers" | "event-banners" | "blog-images";

export interface BucketConfig {
  isPublic: boolean;
  maxBytes: number;
  ownerFolder: boolean;
  maxWidth: number;
  aspect?: number;
}

export const buckets: Record<BucketKey, BucketConfig> = {
  avatars: {
    isPublic: false,
    maxBytes: 2 * 1024 * 1024, // 2 MB
    ownerFolder: true,
    maxWidth: 800,
    aspect: 1,
  },
  covers: {
    isPublic: false,
    maxBytes: 5 * 1024 * 1024, // 5 MB
    ownerFolder: true,
    maxWidth: 1800,
    aspect: 7.5,
  },
  "event-banners": {
    isPublic: true,
    maxBytes: 5 * 1024 * 1024, // 5 MB
    ownerFolder: false,
    maxWidth: 1600,
    aspect: 1200 / 630,
  },
  "blog-images": {
    isPublic: true,
    maxBytes: 5 * 1024 * 1024, // 5 MB
    ownerFolder: false,
    maxWidth: 1600,
  },
};

export const allowedInputTypes: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const maxInputBytes = 15 * 1024 * 1024; // 15 MB
export const maxInputPixels = 40_000_000; // 40,000,000 pixels

export function isBucketKey(x: unknown): x is BucketKey {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(buckets, x);
}

