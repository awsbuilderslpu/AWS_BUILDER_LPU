import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addTag, removeTag } from "./tags";

describe("blog tags helper", () => {
  it("rejects an empty or whitespace-only tag", () => {
    assert.deepEqual(addTag([], ""), { ok: false, error: "empty" });
    assert.deepEqual(addTag([], "   "), { ok: false, error: "empty" });
  });

  it("rejects a tag longer than 30 characters", () => {
    const longTag = "a".repeat(31);
    assert.deepEqual(addTag([], longTag), { ok: false, error: "too_long" });
  });

  it("accepts a tag of exactly 30 characters", () => {
    const valid30 = "a".repeat(30);
    const res = addTag([], valid30);
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.deepEqual(res.tags, [valid30]);
    }
  });

  it("rejects a duplicate tag in a different case", () => {
    assert.deepEqual(addTag(["AWS"], "aws"), { ok: false, error: "duplicate" });
    assert.deepEqual(addTag(["Cloud"], "CLOUD"), { ok: false, error: "duplicate" });
  });

  it("rejects the eleventh tag when list holds 10 tags", () => {
    const current = Array.from({ length: 10 }, (_, i) => `tag${i}`);
    assert.deepEqual(addTag(current, "tag11"), { ok: false, error: "limit" });
  });

  it("adds a valid tag and trims whitespace", () => {
    const res = addTag(["cloud"], "  serverless  ");
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.deepEqual(res.tags, ["cloud", "serverless"]);
    }
  });

  it("removeTag removes tag case-insensitively", () => {
    const initial = ["AWS", "Docker", "Kubernetes"];
    assert.deepEqual(removeTag(initial, "docker"), ["AWS", "Kubernetes"]);
    assert.deepEqual(removeTag(initial, "AWS"), ["Docker", "Kubernetes"]);
    assert.deepEqual(removeTag(initial, "unknown"), ["AWS", "Docker", "Kubernetes"]);
  });
});

