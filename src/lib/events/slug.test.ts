import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { makeSlug } from "./slug";

describe("events slug helper", () => {
  const validSuffix = "abc123";

  it("handles a normal title", () => {
    assert.equal(
      makeSlug("AWS Cloud Workshop", validSuffix),
      "aws-cloud-workshop-abc123"
    );
  });

  it("handles punctuation and collapses runs of symbols", () => {
    assert.equal(
      makeSlug("DevOps & CI/CD: Hands-On Lab!!!", validSuffix),
      "devops-ci-cd-hands-on-lab-abc123"
    );
  });

  it("handles an empty title with fallback to 'event'", () => {
    assert.equal(makeSlug("", validSuffix), "event-abc123");
    assert.equal(makeSlug("   ", validSuffix), "event-abc123");
  });

  it("handles a title with no ASCII letters with fallback to 'event'", () => {
    assert.equal(makeSlug("✨🚀⚡🎉", validSuffix), "event-abc123");
    assert.equal(makeSlug("---...---", validSuffix), "event-abc123");
  });

  it("cuts a base longer than 60 characters and trims trailing dashes", () => {
    const longTitle = "a".repeat(80);
    const slug = makeSlug(longTitle, validSuffix);
    assert.equal(slug, `${"a".repeat(60)}-${validSuffix}`);

    const titleWithDashCut = `${"a".repeat(59)}-${"b".repeat(20)}`;
    const slug2 = makeSlug(titleWithDashCut, validSuffix);
    // 59 'a's, followed by dash at pos 60 trimmed
    assert.equal(slug2, `${"a".repeat(59)}-${validSuffix}`);
  });

  it("throws when suffix is not exactly six lower-case letters or digits", () => {
    assert.throws(() => makeSlug("Test", "ABC123"), /suffix/);
    assert.throws(() => makeSlug("Test", "ab12"), /suffix/);
    assert.throws(() => makeSlug("Test", "ab12345"), /suffix/);
    assert.throws(() => makeSlug("Test", "ab-123"), /suffix/);
    assert.throws(() => makeSlug("Test", ""), /suffix/);
    assert.throws(() => makeSlug("Test", null as unknown as string), /suffix/);
  });
});

