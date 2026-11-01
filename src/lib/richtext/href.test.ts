import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeHref } from "./href";

describe("richtext href helper", () => {
  it("normalizes valid https URLs", () => {
    assert.equal(
      normalizeHref("https://example.com/events/1"),
      "https://example.com/events/1"
    );
    assert.equal(
      normalizeHref("  https://meet.google.com/abc-def  "),
      "https://meet.google.com/abc-def"
    );
  });

  it("normalizes valid http URLs", () => {
    assert.equal(
      normalizeHref("http://example.com"),
      "http://example.com/"
    );
  });

  it("rejects javascript: and other dangerous protocols", () => {
    assert.equal(normalizeHref("javascript:alert(1)"), null);
    assert.equal(normalizeHref("JAVASCRIPT:void(0)"), null);
    assert.equal(normalizeHref("data:text/html,test"), null);
    assert.equal(normalizeHref("vbscript:test"), null);
  });

  it("returns null for empty or non-string inputs", () => {
    assert.equal(normalizeHref(""), null);
    assert.equal(normalizeHref("   "), null);
    assert.equal(normalizeHref(null), null);
    assert.equal(normalizeHref(undefined), null);
    assert.equal(normalizeHref("not a url"), null);
  });
});

