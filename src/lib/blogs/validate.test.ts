import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { blogFormSchema } from "./validate";

const VALID_BASE = {
  title: "My Blog Post",
  excerpt: "Short excerpt",
  category: "AWS",
  tags: ["aws", "cloud"],
  featuredImagePath: null,
  authorName: "Jane Doe",
  metaTitle: null,
  metaDescription: null,
  status: "draft" as const,
  publishAt: null,
  body: { type: "doc", content: [{ type: "paragraph" }] },
};

describe("blogFormSchema validation", () => {
  it("passes with a valid form", () => {
    const result = blogFormSchema.safeParse(VALID_BASE);
    assert.ok(result.success, JSON.stringify((result as { error?: unknown }).error));
  });

  it("fails when title is 2 characters", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, title: "AB" });
    assert.ok(!result.success);
  });

  it("fails when title is 121 characters", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, title: "A".repeat(121) });
    assert.ok(!result.success);
  });

  it("passes when title is exactly 3 characters", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, title: "ABC" });
    assert.ok(result.success);
  });

  it("fails when excerpt is 201 characters", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, excerpt: "A".repeat(201) });
    assert.ok(!result.success);
  });

  it("passes when excerpt is exactly 200 characters", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, excerpt: "A".repeat(200) });
    assert.ok(result.success);
  });

  it("fails with an unknown category", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, category: "Hacking" });
    assert.ok(!result.success);
  });

  it("fails with 11 tags", () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    const result = blogFormSchema.safeParse({ ...VALID_BASE, tags });
    assert.ok(!result.success);
  });

  it("passes with exactly 10 tags", () => {
    const tags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
    const result = blogFormSchema.safeParse({ ...VALID_BASE, tags });
    assert.ok(result.success);
  });

  it("fails when a tag is 31 characters", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, tags: ["A".repeat(31)] });
    assert.ok(!result.success);
  });

  it("deduplicates tags case-insensitively", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, tags: ["AWS", "aws", "Aws"] });
    assert.ok(result.success);
    if (result.success) {
      assert.equal(result.data.tags.length, 1);
      assert.equal(result.data.tags[0], "AWS");
    }
  });

  it("fails when publishAt is a date-only string", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, publishAt: "2026-10-15" });
    assert.ok(!result.success);
  });

  it("passes when publishAt is an ISO datetime with offset", () => {
    const result = blogFormSchema.safeParse({
      ...VALID_BASE,
      publishAt: "2026-10-15T10:00:00+05:30",
    });
    assert.ok(result.success);
  });

  it("passes when a published post has no publishAt (trigger handles it)", () => {
    const result = blogFormSchema.safeParse({
      ...VALID_BASE,
      status: "published",
      publishAt: null,
    });
    assert.ok(result.success);
  });

  it("fails when meta description is 161 characters", () => {
    const result = blogFormSchema.safeParse({
      ...VALID_BASE,
      metaDescription: "A".repeat(161),
    });
    assert.ok(!result.success);
  });

  it("passes when meta description is exactly 160 characters", () => {
    const result = blogFormSchema.safeParse({
      ...VALID_BASE,
      metaDescription: "A".repeat(160),
    });
    assert.ok(result.success);
  });

  it("fails when author name is 1 character", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, authorName: "A" });
    assert.ok(!result.success);
  });

  it("passes when author name is exactly 2 characters", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, authorName: "AB" });
    assert.ok(result.success);
  });

  it("converts empty excerpt to null", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, excerpt: "   " });
    assert.ok(result.success);
    if (result.success) {
      assert.equal(result.data.excerpt, null);
    }
  });

  it("converts empty metaTitle to null", () => {
    const result = blogFormSchema.safeParse({ ...VALID_BASE, metaTitle: "" });
    assert.ok(result.success);
    if (result.success) {
      assert.equal(result.data.metaTitle, null);
    }
  });
});

