import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getDefaultMonth,
  formatEventDate,
  getBadgeParts,
  expandEventDays,
} from "./dates";
import type { EventItem } from "@/data/events";

describe("events dates helper", () => {
  it("getDefaultMonth handles empty, null, or undefined event lists", () => {
    assert.deepEqual(getDefaultMonth([]), new Date(2026, 0, 1));
    assert.deepEqual(getDefaultMonth(null), new Date(2026, 0, 1));
    assert.deepEqual(getDefaultMonth(undefined), new Date(2026, 0, 1));
  });

  it("getDefaultMonth picks the first non-past event", () => {
    const eventsList: EventItem[] = [
      {
        slug: "past",
        title: "Past",
        description: "",
        category: "talk",
        status: "past",
        startDate: "2026-03-10",
        location: "Online",
        href: "/events/past",
      },
      {
        slug: "active",
        title: "Active",
        description: "",
        category: "workshop",
        status: "upcoming",
        startDate: "2026-05-15",
        location: "Hall",
        href: "/events/active",
      },
    ];

    assert.deepEqual(getDefaultMonth(eventsList), new Date(2026, 4, 1));
  });

  it("formatEventDate formats single day and ranges", () => {
    assert.equal(formatEventDate("2026-11-14"), "Nov 14, 2026");
    assert.equal(formatEventDate("2026-11-14", "2026-11-14"), "Nov 14, 2026");
    assert.equal(formatEventDate("2026-11-14", "2026-11-16"), "Nov 14–16, 2026");
    assert.equal(
      formatEventDate("2026-11-28", "2026-12-02"),
      "Nov 28 – Dec 2, 2026"
    );
  });

  it("getBadgeParts extracts month and day", () => {
    const badge = getBadgeParts("2026-11-14");
    assert.equal(badge.month, "NOV");
    assert.equal(badge.day, "14");
  });

  it("expandEventDays expands multi-day events", () => {
    const event: EventItem = {
      slug: "hackathon",
      title: "Hackathon",
      description: "",
      category: "hackathon",
      status: "upcoming",
      startDate: "2026-11-28",
      endDate: "2026-11-29",
      location: "LPU Campus",
      href: "/events/hackathon",
    };
    const days = expandEventDays(event);
    assert.equal(days.length, 2);
  });
});
