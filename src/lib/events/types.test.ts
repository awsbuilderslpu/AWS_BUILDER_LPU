import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toEventAdminRow, toEventDetails } from "./types";

describe("events types helper", () => {
  it("toEventAdminRow maps snake_case properties to camelCase correctly", () => {
    const raw = {
      id: "ev-1",
      slug: "cloud-summit-abc123",
      title: "Cloud Summit",
      category: "talk",
      location_mode: "hybrid",
      venue: "Main Auditorium",
      starts_at: "2026-11-20T10:00:00Z",
      ends_at: "2026-11-20T12:00:00Z",
      registration_enabled: true,
      registration_deadline: "2026-11-19T23:59:00Z",
      banner_path: "2026/11/00000000-0000-0000-0000-000000000001.webp",
      is_published: true,
      archived_at: null,
      updated_at: "2026-11-01T12:00:00Z",
    };

    const row = toEventAdminRow(raw);
    assert.equal(row.id, "ev-1");
    assert.equal(row.slug, "cloud-summit-abc123");
    assert.equal(row.title, "Cloud Summit");
    assert.equal(row.category, "talk");
    assert.equal(row.locationMode, "hybrid");
    assert.equal(row.venue, "Main Auditorium");
    assert.equal(row.startsAt, "2026-11-20T10:00:00Z");
    assert.equal(row.endsAt, "2026-11-20T12:00:00Z");
    assert.equal(row.registrationEnabled, true);
    assert.equal(row.registrationDeadline, "2026-11-19T23:59:00Z");
    assert.equal(
      row.bannerPath,
      "2026/11/00000000-0000-0000-0000-000000000001.webp"
    );
    assert.equal(row.isPublished, true);
    assert.equal(row.archivedAt, null);
    assert.equal(row.updatedAt, "2026-11-01T12:00:00Z");
  });

  it("never throws on null or undefined raw objects", () => {
    const emptyRow = toEventAdminRow(null);
    assert.equal(emptyRow.id, "");
    assert.equal(emptyRow.slug, "");
    assert.equal(emptyRow.title, "");
    assert.equal(emptyRow.category, "community");
    assert.equal(emptyRow.locationMode, "on_campus");
    assert.equal(emptyRow.venue, null);
    assert.equal(emptyRow.isPublished, false);
    assert.equal(emptyRow.archivedAt, null);

    const emptyDetails = toEventDetails(undefined);
    assert.equal(emptyDetails.id, "");
    assert.equal(emptyDetails.description, null);
    assert.equal(emptyDetails.meetingUrl, null);
  });

  it("toEventDetails preserves description and meetingUrl", () => {
    const raw = {
      id: "ev-2",
      title: "Dev Workshop",
      description: { type: "doc", content: [] },
      meeting_url: "https://meet.google.com/xyz",
    };

    const details = toEventDetails(raw);
    assert.deepEqual(details.description, { type: "doc", content: [] });
    assert.equal(details.meetingUrl, "https://meet.google.com/xyz");
  });
});

