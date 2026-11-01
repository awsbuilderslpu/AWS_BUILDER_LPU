import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { toListRow, toDetails, approvableRoles } from "./types";

describe("registrations types helper", () => {
  test("approvableRoles exports the four allowed roles", () => {
    assert.deepEqual(approvableRoles, ["student", "participant", "member", "core"]);
  });

  test("toListRow handles full view row correctly", () => {
    const raw = {
      id: "reg-1",
      user_id: "user-1",
      status: "approved",
      requested_role: "member",
      applied_at: "2026-11-01T10:00:00Z",
      full_name: "Jane Doe",
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      registration_number: "12345678",
      programme: "B.Tech",
      department: "cse",
      study_year: "3rd Year",
    };

    const row = toListRow(raw);
    assert.equal(row.id, "reg-1");
    assert.equal(row.userId, "user-1");
    assert.equal(row.status, "approved");
    assert.equal(row.requestedRole, "member");
    assert.equal(row.appliedAt, "2026-11-01T10:00:00Z");
    assert.equal(row.fullName, "Jane Doe");
    assert.equal(row.firstName, "Jane");
    assert.equal(row.lastName, "Doe");
    assert.equal(row.email, "jane@example.com");
    assert.equal(row.registrationNumber, "12345678");
    assert.equal(row.programme, "B.Tech");
    assert.equal(row.department, "cse");
    assert.equal(row.studyYear, "3rd Year");
  });

  test("toListRow never throws on null, undefined, or empty values", () => {
    const empty = toListRow(null);
    assert.equal(empty.id, "");
    assert.equal(empty.userId, "");
    assert.equal(empty.status, "pending");
    assert.equal(empty.requestedRole, "student");
    assert.equal(empty.appliedAt, "");
    assert.equal(empty.fullName, "");
    assert.equal(empty.firstName, null);
    assert.equal(empty.lastName, null);
    assert.equal(empty.email, "");
    assert.equal(empty.registrationNumber, null);
    assert.equal(empty.programme, null);
    assert.equal(empty.department, null);
    assert.equal(empty.studyYear, null);
  });

  test("toDetails maps all extra details fields and reviewer name", () => {
    const raw = {
      id: "reg-2",
      user_id: "user-2",
      status: "pending",
      requested_role: "core",
      applied_at: "2026-11-01T12:00:00Z",
      full_name: "Bob Smith",
      first_name: "Bob",
      last_name: "Smith",
      email: "bob@example.com",
      phone_country_code: "+91",
      phone_number: "9876543210",
      registration_number: "87654321",
      date_of_birth: "2004-05-15",
      university: "lpu",
      programme: "BCA",
      department: "it",
      study_year: "2nd Year",
      semester: "3rd Semester",
      graduation_year: 2027,
      interests: ["Cloud", "DevOps"],
      terms_accepted_at: "2026-11-01T11:59:00Z",
      admin_note: "Strong profile",
      reviewed_at: "2026-11-01T12:30:00Z",
    };

    const details = toDetails(raw, "Admin User");
    assert.equal(details.phoneCountryCode, "+91");
    assert.equal(details.phoneNumber, "9876543210");
    assert.equal(details.dateOfBirth, "2004-05-15");
    assert.equal(details.university, "lpu");
    assert.equal(details.semester, "3rd Semester");
    assert.equal(details.graduationYear, 2027);
    assert.deepEqual(details.interests, ["Cloud", "DevOps"]);
    assert.equal(details.termsAcceptedAt, "2026-11-01T11:59:00Z");
    assert.equal(details.adminNote, "Strong profile");
    assert.equal(details.reviewedAt, "2026-11-01T12:30:00Z");
    assert.equal(details.reviewedByName, "Admin User");
  });

  test("toDetails safely parses numeric strings and null reviewer", () => {
    const raw = {
      id: "reg-3",
      graduation_year: "2028",
      interests: null,
    };
    const details = toDetails(raw, "  ");
    assert.equal(details.graduationYear, 2028);
    assert.deepEqual(details.interests, []);
    assert.equal(details.reviewedByName, null);
  });
});

