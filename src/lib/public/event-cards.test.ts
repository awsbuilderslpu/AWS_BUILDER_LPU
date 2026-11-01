import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toEventItem } from "./event-cards";

describe("event-cards adapter", () => {
  const baseNow = Date.parse("2026-11-01T12:00:00Z");

  it("handles an upcoming event", () => {
    const item = toEventItem(
      {
        slug: "upcoming-meetup",
        title: "Upcoming Meetup",
        description: "Welcome",
        category: "workshop",
        starts_at: "2026-11-05T09:00:00Z",
        ends_at: "2026-11-05T12:00:00Z",
        registration_enabled: false,
        venue: "Hall A",
      },
      baseNow,
      null
    );

    assert.equal(item.status, "upcoming");
    assert.equal(item.href, "/events/upcoming-meetup");
    assert.equal(item.location, "Hall A");
    assert.equal(item.image, undefined);
  });

  it("handles an ongoing event with status upcoming", () => {
    const item = toEventItem(
      {
        slug: "ongoing-hackathon",
        title: "Ongoing Hackathon",
        description: "Building now",
        category: "hackathon",
        starts_at: "2026-11-01T08:00:00Z",
        ends_at: "2026-11-01T16:00:00Z",
        registration_enabled: false,
      },
      baseNow,
      null
    );

    assert.equal(item.status, "upcoming");
    assert.equal(item.location, "Online");
  });

  it("handles a completed event with status past", () => {
    const item = toEventItem(
      {
        slug: "past-talk",
        title: "Past Talk",
        description: "Finished",
        category: "talk",
        starts_at: "2026-10-25T09:00:00Z",
        ends_at: "2026-10-25T11:00:00Z",
        registration_enabled: true,
      },
      baseNow,
      null
    );

    assert.equal(item.status, "past");
  });

  it("handles an open registration window", () => {
    const item = toEventItem(
      {
        slug: "open-reg-event",
        title: "Open Reg Event",
        category: "competition",
        starts_at: "2026-11-10T09:00:00Z",
        ends_at: "2026-11-10T12:00:00Z",
        registration_enabled: true,
        registration_deadline: "2026-11-08T18:00:00Z",
      },
      baseNow,
      null
    );

    assert.equal(item.status, "registration-open");
  });

  it("handles a closed registration window", () => {
    const item = toEventItem(
      {
        slug: "closed-reg-event",
        title: "Closed Reg Event",
        category: "competition",
        starts_at: "2026-11-10T09:00:00Z",
        ends_at: "2026-11-10T12:00:00Z",
        registration_enabled: true,
        registration_deadline: "2026-10-31T18:00:00Z",
      },
      baseNow,
      null
    );

    assert.equal(item.status, "upcoming");
  });

  it("handles an online event with and without a venue", () => {
    const withVenue = toEventItem(
      {
        slug: "online-with-venue",
        title: "Online With Venue",
        category: "talk",
        starts_at: "2026-11-05T09:00:00Z",
        ends_at: "2026-11-05T12:00:00Z",
        venue: "Virtual Room 4",
      },
      baseNow,
      "https://example.com/banner.png"
    );
    assert.equal(withVenue.location, "Virtual Room 4");
    assert.equal(withVenue.image, "https://example.com/banner.png");

    const withoutVenue = toEventItem(
      {
        slug: "online-without-venue",
        title: "Online Without Venue",
        category: "talk",
        starts_at: "2026-11-05T09:00:00Z",
        ends_at: "2026-11-05T12:00:00Z",
        venue: "   ",
      },
      baseNow,
      null
    );
    assert.equal(withoutVenue.location, "Online");
  });

  it("handles a multi-day event with endDate set", () => {
    const item = toEventItem(
      {
        slug: "multi-day",
        title: "Multi Day Conference",
        category: "community",
        starts_at: "2026-11-20T09:00:00Z",
        ends_at: "2026-11-22T18:00:00Z",
      },
      baseNow,
      null
    );

    assert.equal(item.startDate, "2026-11-20");
    assert.equal(item.endDate, "2026-11-22");
  });

  it("handles a same-day event with no endDate", () => {
    const item = toEventItem(
      {
        slug: "same-day",
        title: "Same Day Workshop",
        category: "workshop",
        starts_at: "2026-11-15T04:30:00Z",
        ends_at: "2026-11-15T08:30:00Z",
      },
      baseNow,
      null
    );

    assert.equal(item.startDate, "2026-11-15");
    assert.equal(item.endDate, undefined);
  });
});

