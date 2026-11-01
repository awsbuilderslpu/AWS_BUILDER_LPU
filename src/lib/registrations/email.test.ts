import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, buildReviewEmail } from "./email";
import { emailCopy } from "../../data/emails";

describe("registrations email helper", () => {
  test("escapeHtml escapes &, <, >, \", and ' and nothing else", () => {
    assert.equal(
      escapeHtml(`Tom & "Jerry" <friends> 'forever' 100% safe`),
      `Tom &amp; &quot;Jerry&quot; &lt;friends&gt; &#39;forever&#39; 100% safe`
    );
  });

  test("firstName and note with script tags and quotes are escaped in html and unchanged in text", () => {
    const dangerousName = `<script>alert(1)</script> "Quotes"`;
    const dangerousNote = `Hello <script>bad()</script> "test" & 'done'`;

    const result = buildReviewEmail(
      {
        kind: "approved",
        firstName: dangerousName,
        siteLabel: "AWS Builders Club",
        siteUrl: "https://example.com",
        contactEmail: "admin@example.com",
        note: dangerousNote,
      },
      emailCopy
    );

    // Text contains unescaped original characters
    assert.ok(result.text.includes(dangerousName));
    assert.ok(result.text.includes(dangerousNote));

    // HTML contains strictly escaped entities
    assert.ok(!result.html.includes("<script>"));
    assert.ok(
      result.html.includes("&lt;script&gt;alert(1)&lt;/script&gt; &quot;Quotes&quot;")
    );
    assert.ok(
      result.html.includes(
        "Hello &lt;script&gt;bad()&lt;/script&gt; &quot;test&quot; &amp; &#39;done&#39;"
      )
    );
  });

  test("a note with CRLF is converted to <br> in HTML", () => {
    const noteWithCrlf = "Line 1\r\nLine 2\nLine 3";
    const result = buildReviewEmail({
      kind: "approved",
      firstName: "Jane",
      siteLabel: "Test Club",
      siteUrl: "https://example.com",
      contactEmail: "contact@example.com",
      note: noteWithCrlf,
    });

    assert.ok(result.html.includes("Line 1<br>Line 2<br>Line 3"));
    assert.ok(result.text.includes("Line 1\r\nLine 2\nLine 3"));
  });

  test("no note passed produces no note section", () => {
    const withoutNote = buildReviewEmail({
      kind: "approved",
      firstName: "Jane",
      siteLabel: "Test Club",
      siteUrl: "https://example.com",
      contactEmail: "contact@example.com",
    });

    assert.ok(!withoutNote.text.includes("A note from the admins:"));
    assert.ok(!withoutNote.html.includes("A note from the admins:"));

    const emptyNote = buildReviewEmail({
      kind: "approved",
      firstName: "Jane",
      siteLabel: "Test Club",
      siteUrl: "https://example.com",
      contactEmail: "contact@example.com",
      note: "   ",
    });

    assert.ok(!emptyNote.text.includes("A note from the admins:"));
    assert.ok(!emptyNote.html.includes("A note from the admins:"));
  });

  test("an invalid siteUrl results in no sign in link", () => {
    const invalidUrls = [
      "javascript:alert(1)",
      "ftp://example.com",
      "not a url",
      "http://example.com/ bad",
      "",
    ];

    for (const badUrl of invalidUrls) {
      const res = buildReviewEmail({
        kind: "approved",
        firstName: "Jane",
        siteLabel: "Test Club",
        siteUrl: badUrl,
        contactEmail: "contact@example.com",
      });

      assert.ok(!res.text.includes("Sign in:"));
      assert.ok(!res.html.includes("<a href="));
    }
  });

  test("a subject built from a siteLabel containing newlines has none", () => {
    const res = buildReviewEmail({
      kind: "approved",
      firstName: "Jane",
      siteLabel: "AWS Builders\r\nGroup\nLPU",
      siteUrl: "https://example.com",
      contactEmail: "contact@example.com",
    });

    assert.ok(!res.subject.includes("\r"));
    assert.ok(!res.subject.includes("\n"));
    assert.ok(res.subject.includes("AWS Builders Group LPU"));
  });

  test("the rejected email contains the contact address and fallback name", () => {
    const res = buildReviewEmail({
      kind: "rejected",
      firstName: "",
      siteLabel: "Test Club",
      siteUrl: "https://example.com",
      contactEmail: "help@example.com",
    });

    assert.ok(res.text.includes("Hi there,"));
    assert.ok(res.text.includes("help@example.com"));
    assert.ok(res.html.includes("Hi there,"));
    assert.ok(res.html.includes("help@example.com"));
  });
});

