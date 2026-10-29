import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeSearchTerm, buildSearchOr } from "./search.js";

describe("search helper", () => {
  it("strips dangerous PostgREST characters: , ( ) \" \\ * % < >", () => {
    const dangerous = 'hello,(test)"world"\\*%<foo>';
    const cleaned = sanitizeSearchTerm(dangerous);
    assert.equal(cleaned, "hellotestworldfoo");
    assert.equal(buildSearchOr(["name"], dangerous), "name.ilike.*hellotestworldfoo*");
  });

  it("keeps valid email characters: a.b+c@example.com", () => {
    const email = "a.b+c@example.com";
    assert.equal(sanitizeSearchTerm(email), "a.b+c@example.com");
    assert.equal(
      buildSearchOr(["email", "name"], email),
      "email.ilike.*a.b+c@example.com*,name.ilike.*a.b+c@example.com*"
    );
  });

  it("returns null for empty or whitespace-only search term", () => {
    assert.equal(sanitizeSearchTerm(""), "");
    assert.equal(sanitizeSearchTerm("   \t  \n  "), "");
    assert.equal(sanitizeSearchTerm(null), "");
    assert.equal(sanitizeSearchTerm(123), "");
    assert.equal(buildSearchOr(["name"], ""), null);
    assert.equal(buildSearchOr(["name"], "    "), null);
    assert.equal(buildSearchOr([], "valid"), null);
  });

  it("enforces the 100-character cap", () => {
    const longInput = "a".repeat(150);
    const sanitized = sanitizeSearchTerm(longInput);
    assert.equal(sanitized.length, 100);
    assert.equal(sanitized, "a".repeat(100));
  });
});

