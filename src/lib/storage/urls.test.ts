import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { publicObjectUrl } from "./urls";

describe("urls storage helper", () => {
  it("builds correct public URL for public bucket with baseUrl", () => {
    const url = publicObjectUrl(
      "blog-images",
      "2026/10/photo.webp",
      "https://abc.supabase.co"
    );
    assert.equal(
      url,
      "https://abc.supabase.co/storage/v1/object/public/blog-images/2026/10/photo.webp"
    );
  });

  it("ignores trailing slashes on the base URL", () => {
    const url = publicObjectUrl(
      "blog-images",
      "2026/10/photo.webp",
      "https://abc.supabase.co///"
    );
    assert.equal(
      url,
      "https://abc.supabase.co/storage/v1/object/public/blog-images/2026/10/photo.webp"
    );
  });

  it("returns null for private buckets", () => {
    const url = publicObjectUrl(
      "avatars",
      "user-id/avatar.webp",
      "https://abc.supabase.co"
    );
    assert.equal(url, null);
  });

  it("returns null for unsafe paths", () => {
    const url = publicObjectUrl(
      "blog-images",
      "../unsafe/path.webp",
      "https://abc.supabase.co"
    );
    assert.equal(url, null);
  });

  it("returns null when no base is available or empty", () => {
    const originalEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      const url = publicObjectUrl("blog-images", "2026/10/photo.webp", "");
      assert.equal(url, null);
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv;
    }
  });
});

