import { test } from "node:test";
import assert from "node:assert/strict";
import { toAttendeeRow } from "./types";

test("toAttendeeRow safely maps valid raw snake_case object", () => {
  const raw = {
    registration_id: "reg-1",
    event_id: "evt-1",
    user_id: "usr-1",
    status: "attended",
    full_name: "Alex Smith",
    email: "alex@example.com",
    registration_number: "REG123",
    programme: "B.Tech CSE",
    study_year: 3,
    created_at: "2026-03-01T10:00:00Z",
    cancelled_at: null,
  };

  const row = toAttendeeRow(raw);
  assert.equal(row.registrationId, "reg-1");
  assert.equal(row.eventId, "evt-1");
  assert.equal(row.userId, "usr-1");
  assert.equal(row.status, "attended");
  assert.equal(row.fullName, "Alex Smith");
  assert.equal(row.email, "alex@example.com");
  assert.equal(row.registrationNumber, "REG123");
  assert.equal(row.programme, "B.Tech CSE");
  assert.equal(row.studyYear, 3);
  assert.equal(row.createdAt, "2026-03-01T10:00:00Z");
  assert.equal(row.cancelledAt, null);
});

test("toAttendeeRow handles camelCase properties and string study_year", () => {
  const raw = {
    registrationId: "reg-2",
    eventId: "evt-2",
    userId: "usr-2",
    status: "cancelled",
    fullName: "Jordan Lee",
    email: "jordan@example.com",
    registrationNumber: "REG456",
    programme: "BCA",
    studyYear: "2",
    createdAt: "2026-03-02T10:00:00Z",
    cancelledAt: "2026-03-03T10:00:00Z",
  };

  const row = toAttendeeRow(raw);
  assert.equal(row.registrationId, "reg-2");
  assert.equal(row.status, "cancelled");
  assert.equal(row.studyYear, 2);
  assert.equal(row.cancelledAt, "2026-03-03T10:00:00Z");
});

test("toAttendeeRow never throws on null, undefined or empty input", () => {
  const rowNull = toAttendeeRow(null);
  assert.equal(rowNull.registrationId, "");
  assert.equal(rowNull.status, "registered");
  assert.equal(rowNull.studyYear, null);
  assert.equal(rowNull.registrationNumber, null);

  const rowUndef = toAttendeeRow(undefined);
  assert.equal(rowUndef.registrationId, "");

  const rowEmpty = toAttendeeRow({});
  assert.equal(rowEmpty.fullName, "");
  assert.equal(rowEmpty.email, "");
});

