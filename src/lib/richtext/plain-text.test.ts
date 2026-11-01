import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { docToPlainText } from "./plain-text";

describe("docToPlainText helper", () => {
  it("extracts plain text from a simple string and trims", () => {
    assert.equal(docToPlainText("  Hello   world!  "), "Hello world!");
  });

  it("extracts text from nested rich-text nodes", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Welcome to the event." },
            { type: "text", text: " Bring your laptop!" },
          ],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Snacks provided." }],
        },
      ],
    };

    assert.equal(
      docToPlainText(doc),
      "Welcome to the event. Bring your laptop! Snacks provided."
    );
  });

  it("truncates to maxLength without trailing spaces", () => {
    assert.equal(docToPlainText("One two three four five", 11), "One two");
  });

  it("handles null, undefined, and non-object inputs safely", () => {
    assert.equal(docToPlainText(null), "");
    assert.equal(docToPlainText(undefined), "");
    assert.equal(docToPlainText(123), "");
  });
});

