import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toBlogAdminRow, toBlogDetails } from "./types";

describe("blog types", () => {
  it("maps a full snake_case row to BlogAdminRow", () => {
    const raw = {
      id: "abc-123",
      slug: "test-slug",
      title: "Test Title",
      excerpt: "Some excerpt",
      category: "AWS",
      tags: ["aws", "cloud"],
      read_minutes: 5,
      featured_image_path: "2026/11/some-uuid.webp",
      author_name: "Jane Doe",
      status: "published",
      publish_at: "2026-10-01T10:00:00Z",
      is_featured: true,
      updated_at: "2026-10-15T12:00:00Z",
      source_url: "https://builder.aws.com/content/123",
      source_platform: "aws_builder",
      external_image_url: "https://example.com/banner.png",
    };
    const row = toBlogAdminRow(raw);
    assert.equal(row.id, "abc-123");
    assert.equal(row.slug, "test-slug");
    assert.equal(row.title, "Test Title");
    assert.equal(row.excerpt, "Some excerpt");
    assert.equal(row.category, "AWS");
    assert.deepEqual(row.tags, ["aws", "cloud"]);
    assert.equal(row.readMinutes, 5);
    assert.equal(row.featuredImagePath, "2026/11/some-uuid.webp");
    assert.equal(row.authorName, "Jane Doe");
    assert.equal(row.status, "published");
    assert.equal(row.publishAt, "2026-10-01T10:00:00Z");
    assert.equal(row.isFeatured, true);
    assert.equal(row.updatedAt, "2026-10-15T12:00:00Z");
    assert.equal(row.sourceUrl, "https://builder.aws.com/content/123");
    assert.equal(row.sourcePlatform, "aws_builder");
    assert.equal(row.externalImageUrl, "https://example.com/banner.png");
  });

  it("returns safe defaults for a fully null row", () => {
    const row = toBlogAdminRow({
      id: null,
      slug: null,
      title: null,
      excerpt: null,
      category: null,
      tags: null,
      read_minutes: null,
      featured_image_path: null,
      author_name: null,
      status: null,
      publish_at: null,
      is_featured: null,
      updated_at: null,
    });
    assert.equal(row.id, "");
    assert.equal(row.slug, "");
    assert.equal(row.title, "");
    assert.equal(row.excerpt, null);
    assert.equal(row.category, "");
    assert.deepEqual(row.tags, []);
    assert.equal(row.readMinutes, 1);
    assert.equal(row.featuredImagePath, null);
    assert.equal(row.authorName, "");
    assert.equal(row.status, "draft");
    assert.equal(row.publishAt, null);
    assert.equal(row.isFeatured, false);
    assert.equal(row.updatedAt, "");
    assert.equal(row.sourceUrl, null);
    assert.equal(row.sourcePlatform, "internal");
    assert.equal(row.externalImageUrl, null);
  });

  it("converts null tags to []", () => {
    const row = toBlogAdminRow({ tags: null });
    assert.deepEqual(row.tags, []);
  });

  it("maps BlogDetails extra fields", () => {
    const raw = {
      id: "d1",
      body: { type: "doc", content: [] },
      meta_title: "Meta Title",
      meta_description: "Meta description here",
    };
    const details = toBlogDetails(raw);
    assert.deepEqual(details.body, { type: "doc", content: [] });
    assert.equal(details.metaTitle, "Meta Title");
    assert.equal(details.metaDescription, "Meta description here");
  });
});

