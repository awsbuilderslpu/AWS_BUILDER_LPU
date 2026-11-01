import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { eventLifecycle, registrationOpen } from "./lifecycle";

describe("events lifecycle helper", () => {
  const startIso = "2026-11-15T10:00:00.000Z";
  const endIso = "2026-11-15T12:00:00.000Z";
  const startMs = Date.parse(startIso);
  const endMs = Date.parse(endIso);

  it("lifecycle: before start evaluates to 'upcoming'", () => {
    const res = eventLifecycle(
      { startsAt: startIso, endsAt: endIso, archivedAt: null },
      startMs - 1000
    );
    assert.equal(res, "upcoming");
  });

  it("lifecycle: at the exact start evaluates to 'ongoing'", () => {
    const res = eventLifecycle(
      { startsAt: startIso, endsAt: endIso, archivedAt: null },
      startMs
    );
    assert.equal(res, "ongoing");
  });

  it("lifecycle: during the event evaluates to 'ongoing'", () => {
    const res = eventLifecycle(
      { startsAt: startIso, endsAt: endIso, archivedAt: null },
      startMs + 3600000
    );
    assert.equal(res, "ongoing");
  });

  it("lifecycle: at the exact end evaluates to 'completed'", () => {
    const res = eventLifecycle(
      { startsAt: startIso, endsAt: endIso, archivedAt: null },
      endMs
    );
    assert.equal(res, "completed");
  });

  it("lifecycle: after the event evaluates to 'completed'", () => {
    const res = eventLifecycle(
      { startsAt: startIso, endsAt: endIso, archivedAt: null },
      endMs + 1000
    );
    assert.equal(res, "completed");
  });

  it("lifecycle: archivedAt set evaluates to 'archived' regardless of times", () => {
    const archivedIso = "2026-11-01T00:00:00.000Z";
    assert.equal(
      eventLifecycle(
        { startsAt: startIso, endsAt: endIso, archivedAt: archivedIso },
        startMs - 5000
      ),
      "archived"
    );
    assert.equal(
      eventLifecycle(
        { startsAt: startIso, endsAt: endIso, archivedAt: archivedIso },
        startMs + 1000
      ),
      "archived"
    );
    assert.equal(
      eventLifecycle(
        { startsAt: startIso, endsAt: endIso, archivedAt: archivedIso },
        endMs + 5000
      ),
      "archived"
    );
  });

  it("lifecycle: invalid or inverted times evaluate to 'completed'", () => {
    assert.equal(
      eventLifecycle({ startsAt: null, endsAt: endIso }, startMs),
      "completed"
    );
    assert.equal(
      eventLifecycle({ startsAt: "invalid", endsAt: endIso }, startMs),
      "completed"
    );
    assert.equal(
      eventLifecycle({ startsAt: endIso, endsAt: startIso }, startMs),
      "completed"
    );
    assert.equal(
      eventLifecycle({ startsAt: startIso, endsAt: startIso }, startMs),
      "completed"
    );
  });

  describe("registrationOpen", () => {
    const base = {
      isPublished: true,
      archivedAt: null,
      registrationEnabled: true,
      startsAt: startIso,
      registrationDeadline: null,
    };

    it("evaluates true when all conditions are met and before startsAt", () => {
      assert.equal(registrationOpen(base, startMs - 1000), true);
    });

    it("each condition on its own: isPublished false evaluates to false", () => {
      assert.equal(
        registrationOpen({ ...base, isPublished: false }, startMs - 1000),
        false
      );
    });

    it("each condition on its own: archivedAt set evaluates to false", () => {
      assert.equal(
        registrationOpen(
          { ...base, archivedAt: "2026-11-01T00:00:00.000Z" },
          startMs - 1000
        ),
        false
      );
    });

    it("each condition on its own: registrationEnabled false evaluates to false", () => {
      assert.equal(
        registrationOpen({ ...base, registrationEnabled: false }, startMs - 1000),
        false
      );
    });

    it("deadline earlier than start: open before deadline, closed between deadline and start", () => {
      const deadlineIso = "2026-11-14T20:00:00.000Z";
      const deadlineMs = Date.parse(deadlineIso);

      const withEarlyDeadline = {
        ...base,
        registrationDeadline: deadlineIso,
      };

      assert.equal(
        registrationOpen(withEarlyDeadline, deadlineMs - 1000),
        true
      );
      assert.equal(
        registrationOpen(withEarlyDeadline, deadlineMs),
        false
      );
      assert.equal(
        registrationOpen(withEarlyDeadline, deadlineMs + 5000),
        false
      );
    });

    it("deadline later than start: cutoff uses deadline when provided", () => {
      const lateDeadlineIso = "2026-11-15T11:00:00.000Z";
      const lateDeadlineMs = Date.parse(lateDeadlineIso);

      const withLateDeadline = {
        ...base,
        registrationDeadline: lateDeadlineIso,
      };

      // Since deadline is set, now < (deadline ?? startsAt) evaluates against deadline
      assert.equal(
        registrationOpen(withLateDeadline, startMs + 1000),
        true
      );
      assert.equal(
        registrationOpen(withLateDeadline, lateDeadlineMs + 1000),
        false
      );
    });
  });
});

