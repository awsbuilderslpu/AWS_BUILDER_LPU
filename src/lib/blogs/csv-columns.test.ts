import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildBlogCsvColumns } from "./csv-columns";
import type { BlogDetails, BlogLifecycle } from "./types";

const mockStatusLabels: Record<BlogLifecycle, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

const NOW_MS = Date.parse("2026-10-15T12:00:00Z");

describe("buildBlogCsvColumns", () => {
  it("formats a full row properly without null or undefined text", () => {
    const columns = buildBlogCsvColumns(mockStatusLabels, NOW_MS);
    const row: BlogDetails = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      slug: "full-blog-post",
      title: "Full Blog Post",
      excerpt: "An excerpt",
      category: "AWS",
      tags: ["cloud", "serverless"],
      readMinutes: 7,
      featuredImagePath: "2026/10/banner.webp",
      authorName: "Jane Doe",
      status: "published",
      publishAt: "2026-10-14T10:00:00Z",
      isFeatured: true,
      updatedAt: "2026-10-14T12:00:00Z",
      body: { type: "doc" },
      metaTitle: "Meta",
      metaDescription: "Meta Desc",
    };

    const rendered = columns.map((col) => {
      const val = String(col.value(row));
      assert.ok(!val.includes("null"), `Column ${col.header} contains 'null'`);
      assert.ok(!val.includes("undefined"), `Column ${col.header} contains 'undefined'`);
      return { header: col.header, value: val };
    });

    assert.deepEqual(rendered, [
      { header: "Title", value: "Full Blog Post" },
      { header: "Category", value: "AWS" },
      { header: "Author", value: "Jane Doe" },
      { header: "Status", value: "Published" },
      { header: "Publish date", value: "14 Oct 2026, 3:30 PM IST" },
      { header: "Read minutes", value: "7" },
      { header: "Featured", value: "Yes" },
      { header: "Tags", value: "cloud; serverless" },
    ]);
  });

  it("handles a row full of nulls with no 'null' or 'undefined' anywhere", () => {
    const columns = buildBlogCsvColumns(mockStatusLabels, NOW_MS);
    const row: BlogDetails = {
      id: "",
      slug: "",
      title: "",
      excerpt: null,
      category: "",
      tags: [],
      readMinutes: 1,
      featuredImagePath: null,
      authorName: "",
      status: "draft",
      publishAt: null,
      isFeatured: false,
      updatedAt: "",
      body: null,
      metaTitle: null,
      metaDescription: null,
    };

    for (const col of columns) {
      const val = String(col.value(row));
      assert.ok(!val.includes("null"), `Column ${col.header} contained 'null'`);
      assert.ok(!val.includes("undefined"), `Column ${col.header} contained 'undefined'`);
    }

    const statusCol = columns.find((c) => c.header === "Status");
    assert.equal(statusCol?.value(row), "Draft");

    const featCol = columns.find((c) => c.header === "Featured");
    assert.equal(featCol?.value(row), "No");
  });
});

