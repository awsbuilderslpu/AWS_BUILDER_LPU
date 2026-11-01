import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  eventActions,
  commonEventActions,
  showVenue,
  showMeetingUrl,
  showDeadline,
  formFromDetails,
  emptyEventForm,
} from "./view-logic";
import type { EventDetails } from "./types";

describe("events view-logic helper", () => {
  describe("eventActions", () => {
    it("returns [publish, archive] for draft event", () => {
      const actions = eventActions({ isPublished: false, archivedAt: null });
      assert.deepEqual(actions, ["publish", "archive"]);
    });

    it("returns [unpublish, archive] for published event", () => {
      const actions = eventActions({ isPublished: true, archivedAt: null });
      assert.deepEqual(actions, ["unpublish", "archive"]);
    });

    it("returns [restore] for archived event", () => {
      const actions = eventActions({
        isPublished: true,
        archivedAt: "2026-11-01T12:00:00Z",
      });
      assert.deepEqual(actions, ["restore"]);
    });
  });

  describe("commonEventActions", () => {
    it("returns empty array for empty list", () => {
      assert.deepEqual(commonEventActions([]), []);
    });

    it("returns [unpublish, archive] when all rows are published", () => {
      const rows = [
        { isPublished: true, archivedAt: null },
        { isPublished: true, archivedAt: null },
      ];
      assert.deepEqual(commonEventActions(rows), ["unpublish", "archive"]);
    });

    it("returns [archive] for a mixed set of draft and published events", () => {
      const rows = [
        { isPublished: false, archivedAt: null }, // [publish, archive]
        { isPublished: true, archivedAt: null }, // [unpublish, archive]
      ];
      assert.deepEqual(commonEventActions(rows), ["archive"]);
    });

    it("returns empty array when mixed with an archived row", () => {
      const rows = [
        { isPublished: false, archivedAt: null }, // [publish, archive]
        { isPublished: false, archivedAt: "2026-11-01T10:00:00Z" }, // [restore]
      ];
      assert.deepEqual(commonEventActions(rows), []);
    });
  });

  describe("visibility helpers", () => {
    it("showVenue returns true only for on_campus and hybrid", () => {
      assert.equal(showVenue("on_campus"), true);
      assert.equal(showVenue("hybrid"), true);
      assert.equal(showVenue("online"), false);
      assert.equal(showVenue(null), false);
      assert.equal(showVenue(undefined), false);
    });

    it("showMeetingUrl returns true only for online and hybrid", () => {
      assert.equal(showMeetingUrl("online"), true);
      assert.equal(showMeetingUrl("hybrid"), true);
      assert.equal(showMeetingUrl("on_campus"), false);
      assert.equal(showMeetingUrl(null), false);
      assert.equal(showMeetingUrl(undefined), false);
    });

    it("showDeadline returns the boolean itself", () => {
      assert.equal(showDeadline(true), true);
      assert.equal(showDeadline(false), false);
      assert.equal(showDeadline(null), false);
      assert.equal(showDeadline(undefined), false);
    });
  });

  describe("formFromDetails & emptyEventForm", () => {
    it("formFromDetails maps a hybrid event with a deadline", () => {
      const customDoc = {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
      };
      const details: EventDetails = {
        id: "evt-123",
        slug: "hybrid-hackathon-abc123",
        title: "Hybrid Hackathon",
        category: "hackathon",
        locationMode: "hybrid",
        venue: "Hall A",
        meetingUrl: "https://meet.example.com/hackathon",
        startsAt: "2026-11-20T10:00:00Z",
        endsAt: "2026-11-20T18:00:00Z",
        registrationEnabled: true,
        registrationDeadline: "2026-11-19T23:59:00Z",
        bannerPath: "2026/11/00000000-0000-0000-0000-000000000001.webp",
        isPublished: true,
        archivedAt: null,
        updatedAt: "2026-11-01T10:00:00Z",
        description: customDoc,
      };

      const formValues = formFromDetails(details);
      assert.equal(formValues.title, "Hybrid Hackathon");
      assert.equal(formValues.category, "hackathon");
      assert.equal(formValues.locationMode, "hybrid");
      assert.equal(formValues.venue, "Hall A");
      assert.equal(formValues.meetingUrl, "https://meet.example.com/hackathon");
      assert.equal(formValues.startsAt, "2026-11-20T10:00:00Z");
      assert.equal(formValues.endsAt, "2026-11-20T18:00:00Z");
      assert.equal(formValues.registrationEnabled, true);
      assert.equal(formValues.registrationDeadline, "2026-11-19T23:59:00Z");
      assert.equal(
        formValues.bannerPath,
        "2026/11/00000000-0000-0000-0000-000000000001.webp"
      );
      assert.equal(formValues.isPublished, true);
      assert.deepEqual(formValues.description, customDoc);
    });

    it("formFromDetails maps an online event with no venue and no deadline", () => {
      const details: EventDetails = {
        id: "evt-456",
        slug: "cloud-talk-def456",
        title: "Cloud Talk",
        category: "talk",
        locationMode: "online",
        venue: null,
        meetingUrl: "https://meet.example.com/talk",
        startsAt: "2026-11-25T14:00:00Z",
        endsAt: "2026-11-25T15:30:00Z",
        registrationEnabled: false,
        registrationDeadline: null,
        bannerPath: null,
        isPublished: false,
        archivedAt: null,
        updatedAt: "2026-11-01T10:00:00Z",
        description: { type: "doc", content: [] },
      };

      const formValues = formFromDetails(details);
      assert.equal(formValues.title, "Cloud Talk");
      assert.equal(formValues.category, "talk");
      assert.equal(formValues.locationMode, "online");
      assert.equal(formValues.venue, null);
      assert.equal(formValues.meetingUrl, "https://meet.example.com/talk");
      assert.equal(formValues.registrationDeadline, null);
      assert.equal(formValues.bannerPath, null);
      assert.equal(formValues.isPublished, false);
    });

    it("emptyEventForm initializes default blank values", () => {
      const empty = emptyEventForm();
      assert.equal(empty.title, "");
      assert.equal(empty.venue, "");
      assert.equal(empty.meetingUrl, "");
      assert.equal(empty.locationMode, "on_campus");
      assert.equal(empty.category, "workshop");
      assert.equal(empty.startsAt, null);
      assert.equal(empty.endsAt, null);
      assert.equal(empty.registrationDeadline, null);
      assert.equal(empty.registrationEnabled, false);
      assert.equal(empty.isPublished, false);
      assert.equal(empty.bannerPath, null);
      assert.ok(empty.description);
    });
  });
});

