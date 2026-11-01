import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "../admin/csv";
import { registrationCsvColumns } from "./csv-columns";
import type { RegistrationDetails } from "./types";

describe("registrations csv-columns helper", () => {
  const fullRow: RegistrationDetails = {
    id: "reg-1",
    userId: "u-1",
    status: "approved",
    requestedRole: "member",
    appliedAt: "2026-11-14T10:00:00.000Z",
    fullName: "Alex Rivera",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex@example.com",
    registrationNumber: "12345678",
    programme: "B.Tech",
    department: "Computer Science",
    studyYear: "3rd Year",
    phoneCountryCode: "+91",
    phoneNumber: "9876543210",
    dateOfBirth: "2004-01-01",
    university: "LPU",
    semester: "5th Semester",
    graduationYear: 2026,
    interests: ["AWS", "Kubernetes"],
    termsAcceptedAt: "2026-11-14T09:59:00.000Z",
    adminNote: "Great applicant",
    reviewedAt: "2026-11-15T08:00:00.000Z",
    reviewedByName: "Admin Person",
  };

  const emptyRow: RegistrationDetails = {
    id: "",
    userId: "",
    status: "pending",
    requestedRole: "student",
    appliedAt: "",
    fullName: "",
    firstName: null,
    lastName: null,
    email: "",
    registrationNumber: null,
    programme: null,
    department: null,
    studyYear: null,
    phoneCountryCode: null,
    phoneNumber: null,
    dateOfBirth: null,
    university: null,
    semester: null,
    graduationYear: null,
    interests: [],
    termsAcceptedAt: null,
    adminNote: null,
    reviewedAt: null,
    reviewedByName: null,
  };

  test("generates expected headers and correctly mapped row for fullRow", () => {
    const csv = toCsv([fullRow], registrationCsvColumns);
    const lines = csv.split("\r\n");
    assert.equal(
      lines[0],
      "Name,Email,Phone,Registration number,Programme,Branch,Year,Semester,Expected graduation,Requested role,Status,Applied on,Reviewed on,Note"
    );
    assert.ok(lines[1].includes("Alex Rivera"));
    assert.ok(lines[1].includes("alex@example.com"));
    assert.ok(lines[1].includes("+91 9876543210"));
    assert.ok(lines[1].includes("12345678"));
    assert.ok(lines[1].includes("B.Tech"));
    assert.ok(lines[1].includes("Computer Science"));
    assert.ok(lines[1].includes("3rd Year"));
    assert.ok(lines[1].includes("5th Semester"));
    assert.ok(lines[1].includes("2026"));
    assert.ok(lines[1].includes("member"));
    assert.ok(lines[1].includes("approved"));
    assert.ok(lines[1].includes("14 Nov 2026")); // Applied on in IST (without time)
    assert.ok(lines[1].includes("15 Nov 2026")); // Reviewed on in IST (without time)
    assert.ok(lines[1].includes("Great applicant"));
  });

  test("row full of nulls contains no 'null' or 'undefined' text anywhere", () => {
    const csv = toCsv([emptyRow], registrationCsvColumns);
    assert.ok(!csv.includes("null"));
    assert.ok(!csv.includes("undefined"));

    // Verify all individual column values for emptyRow
    for (const col of registrationCsvColumns) {
      const val = col.value(emptyRow);
      assert.notEqual(val, "null");
      assert.notEqual(val, "undefined");
      assert.notEqual(val, null);
      assert.notEqual(val, undefined);
    }
  });
});

