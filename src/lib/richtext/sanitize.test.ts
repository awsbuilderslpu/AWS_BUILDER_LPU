import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { countChars, emptyDoc, sanitizeDoc } from "./sanitize";

describe("richtext sanitize helper", () => {
  it("returns emptyDoc for invalid or nullish inputs", () => {
    assert.deepEqual(sanitizeDoc(null), emptyDoc);
    assert.deepEqual(sanitizeDoc(undefined), emptyDoc);
    assert.deepEqual(sanitizeDoc("string"), emptyDoc);
    assert.deepEqual(sanitizeDoc({}), emptyDoc);
    assert.deepEqual(sanitizeDoc({ type: "unknown" }), emptyDoc);
  });

  it("sanitizes basic document with paragraphs and text", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hello " },
            {
              type: "text",
              text: "world",
              marks: [{ type: "bold" }, { type: "malicious_mark" }],
            },
          ],
        },
      ],
    };

    const clean = sanitizeDoc(input);
    assert.equal(clean.type, "doc");
    assert.equal(clean.content?.length, 1);
    const paragraph = clean.content?.[0];
    assert.equal(paragraph?.type, "paragraph");
    assert.equal(paragraph?.content?.length, 2);
    assert.deepEqual(paragraph?.content?.[1].marks, [{ type: "bold" }]);
  });

  it("strips disallowed nodes", () => {
    const input = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Allowed" }] },
        { type: "raw_html", content: [{ type: "text", text: "<script>evil()</script>" }] },
      ],
    };

    const clean = sanitizeDoc(input);
    assert.equal(clean.content?.length, 1);
    assert.equal(clean.content?.[0].content?.[0].text, "Allowed");
  });

  it("counts characters accurately across nested nodes", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hello" },
            { type: "text", text: " " },
            { type: "text", text: "World!" },
          ],
        },
        {
          type: "heading",
          content: [{ type: "text", text: "1234" }],
        },
      ],
    };

    assert.equal(countChars(doc), 16);
    assert.equal(countChars(null), 0);
    assert.equal(countChars({}), 0);
  });
});

