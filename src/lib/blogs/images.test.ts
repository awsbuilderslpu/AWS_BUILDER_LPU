import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { collectImagePaths, orphansFromSession } from "./images";

describe("blog images helper", () => {
  it("collectImagePaths extracts two unique images in document order", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "image", attrs: { src: "2026/10/img1.webp" } },
            { type: "image", attrs: { src: "2026/10/img2.webp" } },
          ],
        },
      ],
    };
    assert.deepEqual(collectImagePaths(doc), [
      "2026/10/img1.webp",
      "2026/10/img2.webp",
    ]);
  });

  it("collectImagePaths deduplicates repeated images", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "image", attrs: { src: "2026/10/img1.webp" } },
            { type: "image", attrs: { src: "2026/10/img1.webp" } },
          ],
        },
      ],
    };
    assert.deepEqual(collectImagePaths(doc), ["2026/10/img1.webp"]);
  });

  it("collectImagePaths returns [] for invalid documents or docs without images", () => {
    assert.deepEqual(collectImagePaths(null), []);
    assert.deepEqual(collectImagePaths(undefined), []);
    assert.deepEqual(collectImagePaths("not a doc"), []);
    assert.deepEqual(
      collectImagePaths({
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "hello" }] }],
      }),
      []
    );
  });

  it("orphansFromSession returns unique session paths not in savedPaths with duplicates handled", () => {
    const sessionPaths = [
      "2026/10/img1.webp",
      "2026/10/img2.webp",
      "2026/10/img3.webp",
      "2026/10/img2.webp", // duplicate in session
    ];
    const savedPaths = ["2026/10/img1.webp"];

    const orphans = orphansFromSession(sessionPaths, savedPaths);
    assert.deepEqual(orphans, ["2026/10/img2.webp", "2026/10/img3.webp"]);
  });

  it("orphansFromSession returns [] when all session paths are saved", () => {
    const sessionPaths = ["2026/10/img1.webp"];
    const savedPaths = ["2026/10/img1.webp", "2026/10/other.webp"];
    assert.deepEqual(orphansFromSession(sessionPaths, savedPaths), []);
  });
});

