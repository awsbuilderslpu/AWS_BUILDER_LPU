import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { eventFormSchema } from "./validate";
import { adminCopy } from "../../data/admin";

describe("events validate helper", () => {
  const validBase = {
    title: "AWS Hands-On Workshop",
    category: "workshop" as const,
    locationMode: "on_campus" as const,
    venue: "Innovation Hall 302",
    meetingUrl: null,
    startsAt: "2026-11-20T10:00:00Z",
    endsAt: "2026-11-20T12:00:00Z",
    registrationEnabled: true,
    registrationDeadline: "2026-11-19T23:59:00Z",
    bannerPath: "2026/11/00000000-0000-0000-0000-000000000001.webp",
    isPublished: true,
    description: { type: "doc", content: [] },
  };

  it("a valid form passes", () => {
    const res = eventFormSchema.safeParse(validBase);
    assert.equal(res.success, true);
  });

  it("a title of two characters fails", () => {
    const res = eventFormSchema.safeParse({ ...validBase, title: "AB" });
    assert.equal(res.success, false);
    if (!res.success) {
      assert.equal(res.error.issues[0].message, adminCopy.events.errors.title);
    }
  });

  it("endsAt equal to startsAt fails", () => {
    const res = eventFormSchema.safeParse({
      ...validBase,
      endsAt: validBase.startsAt,
    });
    assert.equal(res.success, false);
    if (!res.success) {
      const issue = res.error.issues.find((i) => i.path.includes("endsAt"));
      assert.ok(issue);
      assert.equal(issue.message, adminCopy.events.errors.endsAt);
    }
  });

  it("on_campus without a venue fails", () => {
    const res = eventFormSchema.safeParse({
      ...validBase,
      locationMode: "on_campus",
      venue: "",
    });
    assert.equal(res.success, false);
    if (!res.success) {
      const issue = res.error.issues.find((i) => i.path.includes("venue"));
      assert.ok(issue);
      assert.equal(issue.message, adminCopy.events.errors.venue);
    }
  });

  it("online with http:// or javascript: fails", () => {
    const resHttp = eventFormSchema.safeParse({
      ...validBase,
      locationMode: "online",
      venue: null,
      meetingUrl: "http://example.com/meet",
    });
    assert.equal(resHttp.success, false);
    if (!resHttp.success) {
      const issue = resHttp.error.issues.find((i) =>
        i.path.includes("meetingUrl")
      );
      assert.ok(issue);
      assert.equal(issue.message, adminCopy.events.errors.meetingUrl);
    }

    const resJs = eventFormSchema.safeParse({
      ...validBase,
      locationMode: "online",
      venue: null,
      meetingUrl: "javascript:alert(1)",
    });
    assert.equal(resJs.success, false);
    if (!resJs.success) {
      const issue = resJs.error.issues.find((i) =>
        i.path.includes("meetingUrl")
      );
      assert.ok(issue);
      assert.equal(issue.message, adminCopy.events.errors.meetingUrl);
    }
  });

  it("hybrid needs both venue and meetingUrl", () => {
    const withoutUrl = eventFormSchema.safeParse({
      ...validBase,
      locationMode: "hybrid",
      venue: "Hall 1",
      meetingUrl: null,
    });
    assert.equal(withoutUrl.success, false);
    if (!withoutUrl.success) {
      assert.ok(
        withoutUrl.error.issues.some((i) => i.path.includes("meetingUrl"))
      );
    }

    const withoutVenue = eventFormSchema.safeParse({
      ...validBase,
      locationMode: "hybrid",
      venue: null,
      meetingUrl: "https://meet.google.com/abc-def",
    });
    assert.equal(withoutVenue.success, false);
    if (!withoutVenue.success) {
      assert.ok(
        withoutVenue.error.issues.some((i) => i.path.includes("venue"))
      );
    }

    const withBoth = eventFormSchema.safeParse({
      ...validBase,
      locationMode: "hybrid",
      venue: "Hall 1",
      meetingUrl: "https://meet.google.com/abc-def",
    });
    assert.equal(withBoth.success, true);
  });

  it("a deadline after the start fails", () => {
    const res = eventFormSchema.safeParse({
      ...validBase,
      registrationDeadline: "2026-11-20T10:01:00Z",
    });
    assert.equal(res.success, false);
    if (!res.success) {
      const issue = res.error.issues.find((i) =>
        i.path.includes("registrationDeadline")
      );
      assert.ok(issue);
      assert.equal(issue.message, adminCopy.events.errors.deadline);
    }
  });

  it("a bad banner path fails", () => {
    const res = eventFormSchema.safeParse({
      ...validBase,
      bannerPath: "invalid/banner.png",
    });
    assert.equal(res.success, false);
    if (!res.success) {
      const issue = res.error.issues.find((i) =>
        i.path.includes("bannerPath")
      );
      assert.ok(issue);
      assert.equal(issue.message, adminCopy.events.errors.banner);
    }
  });
});

