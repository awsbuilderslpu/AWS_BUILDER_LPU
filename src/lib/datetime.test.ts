import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLUB_TIMEZONE,
  IST_OFFSET_MINUTES,
  isValidDateString,
  isValidTimeString,
  istToIso,
  isoToIst,
  formatIst,
  isBefore,
} from "./datetime";

describe("datetime pure helper", () => {
  it("exposes expected constants", () => {
    assert.equal(CLUB_TIMEZONE, "Asia/Kolkata");
    assert.equal(IST_OFFSET_MINUTES, 330);
  });

  it("validates date strings correctly", () => {
    assert.equal(isValidDateString("2028-02-29"), true); // Leap day
    assert.equal(isValidDateString("2026-02-29"), false); // Non-leap year
    assert.equal(isValidDateString("2026-02-31"), false); // Invalid day
    assert.equal(isValidDateString("1969-12-31"), false); // Before 1970
    assert.equal(isValidDateString("2101-01-01"), false); // After 2100
    assert.equal(isValidDateString("2026-13-01"), false); // Invalid month
    assert.equal(isValidDateString("not-a-date"), false);
  });

  it("validates time strings correctly", () => {
    assert.equal(isValidTimeString("00:00"), true);
    assert.equal(isValidTimeString("10:00"), true);
    assert.equal(isValidTimeString("23:59"), true);
    assert.equal(isValidTimeString("24:00"), false);
    assert.equal(isValidTimeString("9:00"), false);
    assert.equal(isValidTimeString("10:60"), false);
    assert.equal(isValidTimeString("random"), false);
  });

  it("converts ist to iso with exact UTC offsets", () => {
    assert.equal(
      istToIso("2026-11-14", "10:00"),
      "2026-11-14T04:30:00.000Z"
    );
    assert.equal(
      istToIso("2026-11-14", "00:00"),
      "2026-11-13T18:30:00.000Z"
    );
    assert.equal(
      istToIso("2026-11-14", "23:59"),
      "2026-11-14T18:29:00.000Z"
    );
    assert.equal(istToIso("2026-02-29", "10:00"), null);
    assert.equal(istToIso("2026-11-14", "25:00"), null);
  });

  it("converts iso to ist with exact offsets", () => {
    assert.deepEqual(isoToIst("2026-11-13T18:30:00.000Z"), {
      date: "2026-11-14",
      time: "00:00",
    });

    const withOffset = isoToIst("2026-11-14T10:00:00+05:30");
    const withUtcZ = isoToIst("2026-11-14T04:30:00Z");
    assert.deepEqual(withOffset, { date: "2026-11-14", time: "10:00" });
    assert.deepEqual(withOffset, withUtcZ);

    assert.equal(isoToIst(""), null);
    assert.equal(isoToIst("garbage"), null);
    assert.equal(isoToIst("2026-11-14"), null);
    assert.equal(isoToIst("2026-11-14T10:00"), null); // No offset or Z
  });

  it("round trips for ten varied inputs", () => {
    const inputs: [string, string][] = [
      ["2026-01-01", "00:00"],
      ["2026-03-15", "06:15"],
      ["2026-05-31", "12:00"],
      ["2026-07-20", "15:45"],
      ["2026-08-15", "09:30"],
      ["2026-10-31", "23:59"],
      ["2026-12-25", "18:20"],
      ["2028-02-29", "11:11"], // Leap year
      ["2027-06-01", "01:05"],
      ["2029-09-09", "22:50"],
    ];

    for (const [date, time] of inputs) {
      const iso = istToIso(date, time);
      assert.ok(iso, `Expected iso for ${date} ${time}`);
      const roundTrip = isoToIst(iso);
      assert.ok(roundTrip, `Expected roundtrip for ${iso}`);
      assert.equal(roundTrip.date, date);
      assert.equal(roundTrip.time, time);
    }
  });

  it("formats ISO strings in IST correctly", () => {
    assert.equal(
      formatIst("2026-11-14T04:30:00.000Z"),
      "14 Nov 2026, 10:00 AM IST"
    );
    assert.equal(
      formatIst("2026-11-13T18:35:00Z"),
      "14 Nov 2026, 12:05 AM IST"
    );
    assert.equal(
      formatIst("2026-11-14T06:30:00Z"),
      "14 Nov 2026, 12:00 PM IST"
    );
    assert.equal(
      formatIst("2026-11-14T18:29:00Z"),
      "14 Nov 2026, 11:59 PM IST"
    );
    assert.equal(
      formatIst("2026-11-14T04:30:00.000Z", { withTime: false }),
      "14 Nov 2026"
    );
    assert.equal(formatIst("not-a-valid-date"), "");
  });

  it("checks chronological ordering with isBefore", () => {
    const early = "2026-11-14T04:30:00.000Z";
    const late = "2026-11-14T06:30:00.000Z";
    assert.equal(isBefore(early, late), true);
    assert.equal(isBefore(late, early), false);
    assert.equal(isBefore(early, early), false);
    assert.equal(isBefore("invalid", late), false);
    assert.equal(isBefore(early, "invalid"), false);
  });
});

