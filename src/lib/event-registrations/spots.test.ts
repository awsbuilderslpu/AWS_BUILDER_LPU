import { test } from "node:test";
import assert from "node:assert/strict";
import { spotsState } from "./spots";

test("spotsState returns unlimited for null", () => {
  assert.equal(spotsState(null), "unlimited");
});

test("spotsState returns full for 0 or negative", () => {
  assert.equal(spotsState(0), "full");
  assert.equal(spotsState(-1), "full");
});

test("spotsState returns few for 1 to 5", () => {
  assert.equal(spotsState(1), "few");
  assert.equal(spotsState(3), "few");
  assert.equal(spotsState(5), "few");
});

test("spotsState returns some for 6 or more", () => {
  assert.equal(spotsState(6), "some");
  assert.equal(spotsState(100), "some");
});

