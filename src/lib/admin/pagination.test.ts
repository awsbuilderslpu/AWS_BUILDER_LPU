import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  totalPages,
  getRange,
  getPageItems,
} from "./pagination.js";

describe("pagination helper", () => {
  it("calculates total pages", () => {
    assert.equal(totalPages(0, 10), 0);
    assert.equal(totalPages(1, 10), 1);
    assert.equal(totalPages(10, 10), 1);
    assert.equal(totalPages(11, 10), 2);
    assert.equal(totalPages(243, 10), 25);
  });

  it("calculates range for total 0 and general pages", () => {
    assert.deepEqual(getRange(1, 10, 0), { from: 0, to: 0 });
    assert.deepEqual(getRange(25, 10, 243), { from: 241, to: 243 });
    assert.deepEqual(getRange(1, 10, 25), { from: 1, to: 10 });
    assert.deepEqual(getRange(3, 10, 25), { from: 21, to: 25 });
  });

  it("generates page items correctly according to the rules", () => {
    // 1 of 1 -> [1]
    assert.deepEqual(getPageItems(1, 1), [1]);

    // 3 of 3 -> [1, 2, 3]
    assert.deepEqual(getPageItems(1, 3), [1, 2, 3]);

    // page 1 of 25 -> [1, 2, 3, 4, 5, "ellipsis", 25]
    assert.deepEqual(getPageItems(1, 25), [1, 2, 3, 4, 5, "ellipsis", 25]);

    // page 4 of 25 -> [1, 2, 3, 4, 5, "ellipsis", 25]
    assert.deepEqual(getPageItems(4, 25), [1, 2, 3, 4, 5, "ellipsis", 25]);

    // page 5 of 25 -> [1, "ellipsis", 4, 5, 6, "ellipsis", 25]
    assert.deepEqual(getPageItems(5, 25), [1, "ellipsis", 4, 5, 6, "ellipsis", 25]);

    // page 13 of 25 -> [1, "ellipsis", 12, 13, 14, "ellipsis", 25]
    assert.deepEqual(getPageItems(13, 25), [1, "ellipsis", 12, 13, 14, "ellipsis", 25]);

    // page 25 of 25 -> [1, "ellipsis", 21, 22, 23, 24, 25]
    assert.deepEqual(getPageItems(25, 25), [1, "ellipsis", 21, 22, 23, 24, 25]);
  });
});

