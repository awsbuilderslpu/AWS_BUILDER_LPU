import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildObjectPath, isSafeObjectPath } from "./paths";

describe("paths storage helper", () => {
  const validUser = "e58ed763-928c-4155-bee9-fdbaaadc15f3";
  const validId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

  it("builds an owner folder path with valid userId and injected id", () => {
    const path = buildObjectPath({
      bucket: "avatars",
      userId: validUser,
      ext: "webp",
      id: validId,
    });
    assert.equal(path, `${validUser}/${validId}.webp`);
  });

  it("throws when userId is missing or invalid for owner folder bucket", () => {
    assert.throws(
      () =>
        buildObjectPath({
          bucket: "avatars",
          ext: "webp",
          id: validId,
        }),
      /userId is required/
    );

    assert.throws(
      () =>
        buildObjectPath({
          bucket: "covers",
          userId: "../x",
          ext: "webp",
          id: validId,
        }),
      /userId is required/
    );
  });

  it("builds public bucket path with year and month from now", () => {
    const nowUtc = Date.UTC(2026, 9, 5); // Month 9 is October
    const path = buildObjectPath({
      bucket: "blog-images",
      ext: "webp",
      id: validId,
      now: nowUtc,
    });
    assert.equal(path, `2026/10/${validId}.webp`);
  });

  it("throws on invalid bucket, unsupported extension, or bad id", () => {
    assert.throws(
      () =>
        buildObjectPath({
          bucket: "secrets",
          ext: "webp",
          id: validId,
        }),
      /Invalid bucket/
    );

    assert.throws(
      () =>
        buildObjectPath({
          bucket: "blog-images",
          ext: "svg",
          id: validId,
        }),
      /Invalid extension/
    );

    assert.throws(
      () =>
        buildObjectPath({
          bucket: "blog-images",
          ext: "webp",
          id: "not-a-uuid",
        }),
      /Invalid id/
    );
  });

  it("validates isSafeObjectPath correctly", () => {
    assert.equal(isSafeObjectPath("2026/10/abc-123.webp"), true);
    assert.equal(isSafeObjectPath(`${validUser}/${validId}.jpg`), true);

    assert.equal(isSafeObjectPath("../a.webp"), false);
    assert.equal(isSafeObjectPath("/a.webp"), false);
    assert.equal(isSafeObjectPath("a//b.webp"), false);
    assert.equal(isSafeObjectPath("a/b.webp?x=1"), false);
    assert.equal(isSafeObjectPath("a b.webp"), false);

    const longPath = "a".repeat(202);
    assert.equal(isSafeObjectPath(longPath), false);
  });
});

