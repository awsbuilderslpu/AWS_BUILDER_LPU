import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAttendeeCsvColumns } from "./csv-columns";
import type { AttendeeRow } from "./types";

test("buildAttendeeCsvColumns formats full attendee row correctly", () => {
  const statusLabels = {
    registered: "Registered",
    attended: "Attended",
    cancelled: "Cancelled",
  };

  const columns = buildAttendeeCsvColumns(statusLabels);
  assert.equal(columns.length, 8);
  assert.equal(columns[0].header, "Name");
  assert.equal(columns[1].header, "Email");
  assert.equal(columns[2].header, "Registration number");
  assert.equal(columns[3].header, "Programme");
  assert.equal(columns[4].header, "Study year");
  assert.equal(columns[5].header, "Status");
  assert.equal(columns[6].header, "Registered on");
  assert.equal(columns[7].header, "Cancelled on");

  const sampleRow: AttendeeRow = {
    registrationId: "r-1",
    eventId: "e-1",
    userId: "u-1",
    status: "attended",
    fullName: "Morgan Taylor",
    email: "morgan@example.com",
    registrationNumber: "REG999",
    programme: "CSE",
    studyYear: 4,
    createdAt: "2026-11-14T04:30:00.000Z",
    cancelledAt: null,
  };

  assert.equal(columns[0].value(sampleRow), "Morgan Taylor");
  assert.equal(columns[1].value(sampleRow), "morgan@example.com");
  assert.equal(columns[2].value(sampleRow), "REG999");
  assert.equal(columns[3].value(sampleRow), "CSE");
  assert.equal(columns[4].value(sampleRow), 4);
  assert.equal(columns[5].value(sampleRow), "Attended");
  assert.ok(String(columns[6].value(sampleRow)).length > 0);
  assert.equal(columns[7].value(sampleRow), "");
});

test("buildAttendeeCsvColumns handles row with nulls safely", () => {
  const statusLabels = {
    registered: "Registered",
    attended: "Attended",
    cancelled: "Cancelled",
  };

  const columns = buildAttendeeCsvColumns(statusLabels);
  const nullRow: AttendeeRow = {
    registrationId: "",
    eventId: "",
    userId: "",
    status: "registered",
    fullName: "",
    email: "",
    registrationNumber: null,
    programme: null,
    studyYear: null,
    createdAt: "",
    cancelledAt: null,
  };

  assert.equal(columns[0].value(nullRow), "");
  assert.equal(columns[1].value(nullRow), "");
  assert.equal(columns[2].value(nullRow), "");
  assert.equal(columns[3].value(nullRow), "");
  assert.equal(columns[4].value(nullRow), "");
  assert.equal(columns[5].value(nullRow), "Registered");
  assert.equal(columns[6].value(nullRow), "");
  assert.equal(columns[7].value(nullRow), "");
});
