import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildSitemapUrls } from "./sitemap";

describe("sitemap helper", () => {
  it("returns empty array for null or non-http(s) base URL", () => {
    assert.deepEqual(buildSitemapUrls(null, ["/", "/events"]), []);
    assert.deepEqual(buildSitemapUrls(undefined as unknown as string, ["/"]), []);
    assert.deepEqual(buildSitemapUrls("javascript:alert(1)", ["/"]), []);
    assert.deepEqual(buildSitemapUrls("ftp://example.com", ["/"]), []);
    assert.deepEqual(buildSitemapUrls("not-a-valid-url", ["/"]), []);
  });

  it("handles trailing slash on base URL, path trailing slashes, and deduplication", () => {
    const urls = buildSitemapUrls("https://example.com/", [
      "/",
      "/about/",
      "/about",
      "events/",
      "/events",
      "/blogs/my-post/",
    ]);

    assert.deepEqual(urls, [
      "https://example.com",
      "https://example.com/about",
      "https://example.com/events",
      "https://example.com/blogs/my-post",
    ]);

    for (const u of urls) {
      assert.ok(u.startsWith("https://"));
      if (u !== "https://example.com") {
        assert.ok(!u.endsWith("/"));
      }
    }
  });

  it("produces absolute URLs for valid http base", () => {
    const urls = buildSitemapUrls("http://localhost:3000", ["/about", "/events"]);
    assert.deepEqual(urls, [
      "http://localhost:3000/about",
      "http://localhost:3000/events",
    ]);
  });
});

