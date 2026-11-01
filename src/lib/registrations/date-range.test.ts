import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { addDays, istDayRange, istTodayStart } from "./date-range";

describe("registrations date-range helper", () => {
  test("addDays handles year, leap-day boundaries, and negative n", () => {
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
    assert.equal(addDays("2027-01-01", -1), "2026-12-31");
    assert.equal(addDays("2028-02-28", 1), "2028-02-29");
    assert.equal(addDays("2028-02-29", 1), "2028-03-01");
    assert.equal(addDays("2028-03-01", -1), "2028-02-29");
    assert.equal(addDays("2028-02-29", -1), "2028-02-28");
  });

  test("istDayRange returns correct UTC boundaries for same-day range in IST", () => {
    const range = istDayRange("2026-11-14", "2026-11-14");
    assert.equal(range.fromIso, "2026-11-13T18:30:00.000Z");
    assert.equal(range.toExclusiveIso, "2026-11-14T18:30:00.000Z");
  });

  test("istDayRange returns both null when reversed range (from after to)", () => {
    const reversed = istDayRange("2026-11-15", "2026-11-14");
    assert.deepEqual(reversed, { fromIso: null, toExclusiveIso: null });
  });

  test("istDayRange handles one-sided ranges", () => {
    const onlyFrom = istDayRange("2026-11-14", null);
    assert.equal(onlyFrom.fromIso, "2026-11-13T18:30:00.000Z");
    assert.equal(onlyFrom.toExclusiveIso, null);

    const onlyTo = istDayRange(null, "2026-11-14");
    assert.equal(onlyTo.fromIso, null);
    assert.equal(onlyTo.toExclusiveIso, "2026-11-14T18:30:00.000Z");
  });

  test("istDayRange returns null for invalid input dates", () => {
    const badFrom = istDayRange("invalid-date", "2026-11-14");
    assert.equal(badFrom.fromIso, null);
    assert.equal(badFrom.toExclusiveIso, "2026-11-14T18:30:00.000Z");

    const badTo = istDayRange("2026-11-14", "2026-02-31");
    assert.equal(badTo.fromIso, "2026-11-13T18:30:00.000Z");
    assert.equal(badTo.toExclusiveIso, null);
  });

  test("istTodayStart returns 00:00 IST in UTC for given timestamps", () => {
    // 2026-11-14T20:00:00Z -> IST is 2026-11-15 01:30 -> today start is 2026-11-15 00:00 IST -> 2026-11-14T18:30:00.000Z
    const t1 = Date.parse("2026-11-14T20:00:00Z");
    assert.equal(istTodayStart(t1), "2026-11-14T18:30:00.000Z");

    // 2026-11-14T10:00:00Z -> IST is 2026-11-14 15:30 -> today start is 2026-11-14 00:00 IST -> 2026-11-13T18:30:00.000Z
    const t2 = Date.parse("2026-11-14T10:00:00Z");
    assert.equal(istTodayStart(t2), "2026-11-13T18:30:00.000Z");
  });
});

