import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { estimateReadMinutes } from "./reading-time";

function makeDoc(texts: string[]) {
  return {
    type: "doc",
    content: texts.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

function makeWords(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
}

describe("estimateReadMinutes", () => {
  it("returns 1 for an empty document", () => {
    assert.equal(estimateReadMinutes({ type: "doc", content: [] }), 1);
  });

  it("returns 1 for an invalid document", () => {
    assert.equal(estimateReadMinutes(null), 1);
    assert.equal(estimateReadMinutes(undefined), 1);
    assert.equal(estimateReadMinutes("not a doc"), 1);
    assert.equal(estimateReadMinutes({}), 1);
  });

  it("returns 1 for 200 words", () => {
    assert.equal(estimateReadMinutes(makeDoc([makeWords(200)])), 1);
  });

  it("returns 2 for 201 words", () => {
    assert.equal(estimateReadMinutes(makeDoc([makeWords(201)])), 2);
  });

  it("returns 5 for 1000 words", () => {
    assert.equal(estimateReadMinutes(makeDoc([makeWords(1000)])), 5);
  });

  it("counts text inside nested lists", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: makeWords(200) }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "one" }],
                },
              ],
            },
          ],
        },
      ],
    };
    assert.equal(estimateReadMinutes(doc), 2);
  });

  it("counts text inside blockquotes", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: makeWords(201) }],
            },
          ],
        },
      ],
    };
    assert.equal(estimateReadMinutes(doc), 2);
  });

  it("counts text inside code blocks", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "codeBlock",
          content: [{ type: "text", text: makeWords(201) }],
        },
      ],
    };
    assert.equal(estimateReadMinutes(doc), 2);
  });
});

