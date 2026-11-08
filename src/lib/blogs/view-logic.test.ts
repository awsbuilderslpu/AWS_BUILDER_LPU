import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  blogActions,
  actionLabel,
  commonBlogActions,
  featuredToggleAllowed,
  formFromDetails,
  emptyBlogForm,
} from "./view-logic";
import { blogFormSchema } from "./validate";
import type { BlogDetails } from "./types";

const mockLabels = {
  publish: "Publish",
  publishNow: "Publish now",
  unpublish: "Move to drafts",
  archive: "Archive",
  restore: "Restore",
  delete: "Delete",
};

describe("blog view-logic helper", () => {
  it("blogActions returns expected actions for each lifecycle", () => {
    assert.deepEqual(blogActions("draft"), ["publish", "archive", "delete"]);
    assert.deepEqual(blogActions("scheduled"), ["publish", "unpublish", "archive", "delete"]);
    assert.deepEqual(blogActions("published"), ["unpublish", "archive", "delete"]);
    assert.deepEqual(blogActions("archived"), ["restore", "delete"]);
  });

  it("actionLabel returns publishNow for scheduled publish, and plain label otherwise", () => {
    assert.equal(actionLabel("publish", "scheduled", mockLabels), "Publish now");
    assert.equal(actionLabel("publish", "draft", mockLabels), "Publish");
    assert.equal(actionLabel("unpublish", "published", mockLabels), "Move to drafts");
    assert.equal(actionLabel("archive", "draft", mockLabels), "Archive");
    assert.equal(actionLabel("restore", "archived", mockLabels), "Restore");
    assert.equal(actionLabel("delete", "draft", mockLabels), "Delete");
  });

  it("commonBlogActions computes common actions for mixed, drafts, and empty list", () => {
    assert.deepEqual(commonBlogActions([]), []);
    assert.deepEqual(commonBlogActions(["draft", "draft"]), ["publish", "archive", "delete"]);
    // draft (publish, archive, delete) and published (unpublish, archive, delete) -> archive, delete
    assert.deepEqual(commonBlogActions(["draft", "published"]), ["archive", "delete"]);
    // scheduled (publish, unpublish, archive, delete) and draft (publish, archive, delete) -> publish, archive, delete
    assert.deepEqual(commonBlogActions(["scheduled", "draft"]), ["publish", "archive", "delete"]);
    // published (unpublish, archive, delete) and archived (restore, delete) -> delete
    assert.deepEqual(commonBlogActions(["published", "archived"]), ["delete"]);
  });

  it("featuredToggleAllowed is true only for published", () => {
    assert.equal(featuredToggleAllowed("published"), true);
    assert.equal(featuredToggleAllowed("scheduled"), false);
    assert.equal(featuredToggleAllowed("draft"), false);
    assert.equal(featuredToggleAllowed("archived"), false);
  });

  it("formFromDetails maps published post with date and draft without image or date", () => {
    const publishedDetails: BlogDetails = {
      id: "b1",
      slug: "post-1",
      title: "Title 1",
      excerpt: "Excerpt 1",
      category: "AWS",
      tags: ["aws"],
      readMinutes: 3,
      featuredImagePath: "2026/10/img.webp",
      authorName: "Author",
      status: "published",
      publishAt: "2026-10-14T10:00:00Z",
      isFeatured: true,
      updatedAt: "2026-10-14T12:00:00Z",
      body: { type: "doc", content: [] },
      metaTitle: "Meta",
      metaDescription: "Desc",
    };
    const form1 = formFromDetails(publishedDetails);
    assert.equal(form1.title, "Title 1");
    assert.equal(form1.status, "published");
    assert.equal(form1.publishAt, "2026-10-14T10:00:00Z");
    assert.equal(form1.featuredImagePath, "2026/10/img.webp");
    assert.deepEqual(form1.tags, ["aws"]);

    const draftDetails: BlogDetails = {
      id: "b2",
      slug: "post-2",
      title: "Title 2",
      excerpt: null,
      category: "Tutorials",
      tags: [],
      readMinutes: 1,
      featuredImagePath: null,
      authorName: "Author",
      status: "draft",
      publishAt: null,
      isFeatured: false,
      updatedAt: "2026-10-14T12:00:00Z",
      body: null,
      metaTitle: null,
      metaDescription: null,
    };
    const form2 = formFromDetails(draftDetails);
    assert.equal(form2.status, "draft");
    assert.equal(form2.publishAt, null);
    assert.equal(form2.featuredImagePath, null);
  });

  it("emptyBlogForm produces a shape that satisfies blogFormSchema", () => {
    const empty = emptyBlogForm();
    assert.equal(empty.title, "");
    assert.equal(empty.excerpt, null);
    assert.equal(empty.status, "draft");
    assert.equal(empty.publishAt, null);
    assert.equal(empty.featuredImagePath, null);

    // With a valid title and authorName filled in, it validates cleanly
    const parsed = blogFormSchema.safeParse({
      ...empty,
      title: "Valid Title",
      authorName: "Valid Author",
    });
    assert.ok(parsed.success, JSON.stringify((parsed as { error?: unknown }).error));
  });
});

