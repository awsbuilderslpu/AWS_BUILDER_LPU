import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  fitWithin,
  computeCropRect,
  qualitySteps,
} from "./image-math";

describe("image-math storage helper", () => {
  it("scales down large dimensions without upscaling smaller ones", () => {
    assert.deepEqual(fitWithin(4000, 3000, 1600), {
      width: 1600,
      height: 1200,
    });
    assert.deepEqual(fitWithin(800, 600, 1600), {
      width: 800,
      height: 600,
    });
  });

  it("computes centred crop rectangle for wider source", () => {
    assert.deepEqual(computeCropRect(4000, 3000, 1), {
      x: 500,
      y: 0,
      width: 3000,
      height: 3000,
    });
    assert.deepEqual(computeCropRect(3000, 1000, 1), {
      x: 1000,
      y: 0,
      width: 1000,
      height: 1000,
    });
  });

  it("computes centred crop rectangle for taller source", () => {
    assert.deepEqual(computeCropRect(1000, 1000, 2), {
      x: 0,
      y: 250,
      width: 1000,
      height: 500,
    });
  });

  it("provides descending quality steps", () => {
    assert.deepEqual(qualitySteps, [0.85, 0.75, 0.65, 0.55]);
  });
});

