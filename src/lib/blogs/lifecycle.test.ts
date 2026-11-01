import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { blogLifecycle, isPubliclyVisible } from "./lifecycle";

const NOW = Date.parse("2026-10-15T12:00:00Z");
const FUTURE = "2026-10-20T12:00:00Z"; // > NOW
const PAST = "2026-10-10T12:00:00Z";   // < NOW
const EXACT = "2026-10-15T12:00:00Z";  // === NOW
const BAD_DATE = "not-a-date";

describe("blogLifecycle", () => {
  it("returns 'archived' when status is archived", () => {
    assert.equal(blogLifecycle({ status: "archived", publishAt: PAST }, NOW), "archived");
    assert.equal(blogLifecycle({ status: "archived", publishAt: FUTURE }, NOW), "archived");
    assert.equal(blogLifecycle({ status: "archived", publishAt: null }, NOW), "archived");
  });

  it("returns 'draft' when status is draft", () => {
    assert.equal(blogLifecycle({ status: "draft", publishAt: null }, NOW), "draft");
    assert.equal(blogLifecycle({ status: "draft", publishAt: FUTURE }, NOW), "draft");
  });

  it("returns 'scheduled' when published with publishAt in the future", () => {
    assert.equal(blogLifecycle({ status: "published", publishAt: FUTURE }, NOW), "scheduled");
  });

  it("returns 'published' when published with publishAt at the exact now moment", () => {
    assert.equal(blogLifecycle({ status: "published", publishAt: EXACT }, NOW), "published");
  });

  it("returns 'published' when published with publishAt in the past", () => {
    assert.equal(blogLifecycle({ status: "published", publishAt: PAST }, NOW), "published");
  });

  it("returns 'draft' when published but publishAt is null", () => {
    assert.equal(blogLifecycle({ status: "published", publishAt: null }, NOW), "draft");
  });

  it("returns 'draft' for an unparseable publishAt on a published post", () => {
    assert.equal(blogLifecycle({ status: "published", publishAt: BAD_DATE }, NOW), "draft");
  });
});

describe("isPubliclyVisible", () => {
  it("returns true when published and publishAt is in the past", () => {
    assert.equal(isPubliclyVisible({ status: "published", publishAt: PAST }, NOW), true);
  });

  it("returns true when published and publishAt is exactly now", () => {
    assert.equal(isPubliclyVisible({ status: "published", publishAt: EXACT }, NOW), true);
  });

  it("returns false when published but publishAt is in the future", () => {
    assert.equal(isPubliclyVisible({ status: "published", publishAt: FUTURE }, NOW), false);
  });

  it("returns false when draft regardless of publishAt", () => {
    assert.equal(isPubliclyVisible({ status: "draft", publishAt: PAST }, NOW), false);
    assert.equal(isPubliclyVisible({ status: "draft", publishAt: null }, NOW), false);
  });

  it("returns false when archived regardless of publishAt", () => {
    assert.equal(isPubliclyVisible({ status: "archived", publishAt: PAST }, NOW), false);
  });

  it("returns false when published but publishAt is null", () => {
    assert.equal(isPubliclyVisible({ status: "published", publishAt: null }, NOW), false);
  });

  it("returns false when published but publishAt is unparseable", () => {
    assert.equal(isPubliclyVisible({ status: "published", publishAt: BAD_DATE }, NOW), false);
  });
});

