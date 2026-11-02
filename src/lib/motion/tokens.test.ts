import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  durations,
  easing,
  distance,
  staggerDelay,
  revealVariants,
} from "./tokens";

describe("motion tokens", () => {
  it("every duration is between 0.15 and 0.9 seconds", () => {
    assert.equal(typeof durations.fast, "number");
    assert.equal(typeof durations.base, "number");
    assert.equal(typeof durations.slow, "number");

    for (const [key, value] of Object.entries(durations)) {
      assert.ok(
        value >= 0.15 && value <= 0.9,
        `Expected ${key} duration (${value}) to be between 0.15 and 0.9s`
      );
    }
  });

  it("easing matches the cubic-bezier tuple [0.22, 1, 0.36, 1]", () => {
    assert.deepEqual(easing, [0.22, 1, 0.36, 1]);
  });

  it("distance is 16px", () => {
    assert.equal(distance, 16);
  });

  it("staggerDelay computes delays correctly for 0, 3, 100, -2, NaN and custom step", () => {
    assert.equal(staggerDelay(0), 0);
    assert.equal(Number(staggerDelay(3).toFixed(2)), 0.18);
    assert.equal(staggerDelay(100), 0.6);
    assert.equal(staggerDelay(-2), 0);
    assert.equal(staggerDelay(Number.NaN), 0);

    // Custom step and max
    assert.equal(Number(staggerDelay(2, 0.05).toFixed(2)), 0.1);
    assert.equal(staggerDelay(10, 0.05, 0.4), 0.4);
    assert.equal(staggerDelay(Number.POSITIVE_INFINITY), 0);
  });

  it("revealVariants with reduced true gives no movement", () => {
    const variants = revealVariants(true, 0.2);
    assert.deepEqual(variants.hidden, { opacity: 1, y: 0 });
    assert.deepEqual(variants.visible, { opacity: 1, y: 0 });
  });

  it("revealVariants with reduced false gives opacity 0 to 1 and y 16 to 0", () => {
    const variants = revealVariants(false, 0.15);
    assert.equal(variants.hidden.opacity, 0);
    assert.equal(variants.hidden.y, 16);

    assert.equal(variants.visible.opacity, 1);
    assert.equal(variants.visible.y, 0);
    assert.ok(variants.visible.transition);
    assert.equal(variants.visible.transition?.duration, durations.base);
    assert.deepEqual(variants.visible.transition?.ease, easing);
    assert.equal(variants.visible.transition?.delay, 0.15);
  });
});

