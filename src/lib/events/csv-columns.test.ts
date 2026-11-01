import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildEventCsvColumns } from "./csv-columns";
import type { EventDetails } from "./types";

describe("events csv-columns helper", () => {
  const labels = {
    category: {
      workshop: "Workshop",
      hackathon: "Hackathon",
      talk: "Tech Talk",
      competition: "Competition",
      community: "Community",
    },
    location: {
      on_campus: "On Campus",
      online: "Online",
      hybrid: "Hybrid",
    },
  };

  const columns = buildEventCsvColumns(labels);

  it("maps a full row with all headers and formatted values", () => {
    const fullRow: EventDetails = {
      id: "ev-1",
      slug: "cloud-hackathon-abc123",
      title: "Cloud Hackathon",
      category: "hackathon",
      locationMode: "hybrid",
      venue: "Student Centre Hall 2",
      startsAt: "2026-11-20T10:00:00Z",
      endsAt: "2026-11-21T18:00:00Z",
      registrationEnabled: true,
      registrationDeadline: "2026-11-19T23:59:00Z",
      bannerPath: "2026/11/00000000-0000-0000-0000-000000000001.webp",
      isPublished: true,
      archivedAt: null,
      updatedAt: "2026-11-01T12:00:00Z",
      description: { type: "doc", content: [] },
      meetingUrl: "https://meet.google.com/xyz-abc",
    };

    const headers = columns.map((col) => col.header);
    assert.deepEqual(headers, [
      "Title",
      "Category",
      "Starts",
      "Ends",
      "Location",
      "Venue",
      "Published",
      "Archived",
      "Registration open",
      "Registration deadline",
    ]);

    const values = columns.map((col) => col.value(fullRow));
    assert.equal(values[0], "Cloud Hackathon");
    assert.equal(values[1], "Hackathon");
    assert.ok(String(values[2]).includes("2026"));
    assert.ok(String(values[3]).includes("2026"));
    assert.equal(values[4], "Hybrid");
    assert.equal(values[5], "Student Centre Hall 2");
    assert.equal(values[6], "Yes");
    assert.equal(values[7], "No");
    assert.equal(values[8], "Yes");
    assert.ok(String(values[9]).includes("2026"));

    // Ensure description and meeting link are never exported
    for (const val of values) {
      assert.ok(!String(val).includes("meet.google.com"));
      assert.ok(!String(val).includes("doc"));
    }
  });

  it("handles a row full of nulls with no 'null' or 'undefined' text anywhere", () => {
    const nullRow: EventDetails = {
      id: "",
      slug: "",
      title: "",
      category: "community",
      locationMode: "on_campus",
      venue: null,
      startsAt: "",
      endsAt: "",
      registrationEnabled: false,
      registrationDeadline: null,
      bannerPath: null,
      isPublished: false,
      archivedAt: null,
      updatedAt: "",
      description: null,
      meetingUrl: null,
    };

    const values = columns.map((col) => col.value(nullRow));
    for (const val of values) {
      assert.ok(
        !String(val).toLowerCase().includes("null"),
        `Unexpected 'null' text in value: ${val}`
      );
      assert.ok(
        !String(val).toLowerCase().includes("undefined"),
        `Unexpected 'undefined' text in value: ${val}`
      );
    }
    assert.equal(values[0], "");
    assert.equal(values[5], "");
    assert.equal(values[6], "No");
    assert.equal(values[7], "No");
    assert.equal(values[8], "No");
    assert.equal(values[9], "");
  });
});
