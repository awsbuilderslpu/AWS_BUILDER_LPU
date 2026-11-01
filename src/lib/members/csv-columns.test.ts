import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildMemberCsvColumns } from "./csv-columns";
import type { AppRole, MemberDetails } from "./types";

describe("members csv-columns helper", () => {
  const roleLabels: Record<AppRole, string> = {
    admin: "Administrator",
    core: "Core Team",
    member: "Member",
    student: "Student",
    participant: "Participant",
  };

  const columns = buildMemberCsvColumns(roleLabels);

  it("maps one full row with expected headers and formatted values", () => {
    const fullRow: MemberDetails = {
      userId: "u-1",
      registrationId: "r-1",
      role: "core",
      isActive: true,
      registrationStatus: "approved",
      fullName: "Jane Doe",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      registrationNumber: "REG-999",
      department: "cse",
      programme: "B.Tech",
      studyYear: "4th Year",
      memberSince: "2026-02-10T12:00:00Z",
      phoneCountryCode: "+91",
      phoneNumber: "9876543210",
      university: "LPU",
      semester: "8",
      graduationYear: 2026,
      interests: ["Cloud"],
      skills: ["AWS"],
      headline: "Student",
      bio: "Bio",
      location: "Punjab",
      linkedinUrl: "https://linkedin.com",
      githubUrl: "https://github.com",
      websiteUrl: null,
      instagramUrl: null,
      youtubeUrl: null,
      adminNote: "Internal secret note",
    };

    const headers = columns.map((col) => col.header);
    assert.deepEqual(headers, [
      "Name",
      "Email",
      "Phone",
      "Registration number",
      "Programme",
      "Branch",
      "Year",
      "Semester",
      "Expected graduation",
      "Role",
      "Status",
      "Member since",
    ]);

    const values = columns.map((col) => col.value(fullRow));
    assert.equal(values[0], "Jane Doe");
    assert.equal(values[1], "jane@example.com");
    assert.equal(values[2], "+91 9876543210");
    assert.equal(values[3], "REG-999");
    assert.equal(values[4], "B.Tech");
    assert.equal(values[5], "cse");
    assert.equal(values[6], "4th Year");
    assert.equal(values[7], "8");
    assert.equal(values[8], "2026");
    assert.equal(values[9], "Core Team");
    assert.equal(values[10], "Active");
    assert.ok(typeof values[11] === "string" && values[11].length > 0);

    // Ensure adminNote is not exported anywhere
    for (const val of values) {
      assert.ok(!String(val).includes("Internal secret note"));
    }
  });

  it("handles a row full of nulls without any 'null' or 'undefined' text anywhere", () => {
    const nullRow: MemberDetails = {
      userId: "",
      registrationId: null,
      role: "participant",
      isActive: false,
      registrationStatus: null,
      fullName: "",
      firstName: null,
      lastName: null,
      email: null,
      registrationNumber: null,
      department: null,
      programme: null,
      studyYear: null,
      memberSince: "",
      phoneCountryCode: null,
      phoneNumber: null,
      university: null,
      semester: null,
      graduationYear: null,
      interests: [],
      skills: [],
      headline: null,
      bio: null,
      location: null,
      linkedinUrl: null,
      githubUrl: null,
      websiteUrl: null,
      instagramUrl: null,
      youtubeUrl: null,
      adminNote: null,
    };

    const values = columns.map((col) => col.value(nullRow));
    for (const val of values) {
      assert.ok(!String(val).includes("null"), `Found 'null' in: ${val}`);
      assert.ok(!String(val).includes("undefined"), `Found 'undefined' in: ${val}`);
    }

    // Role and Status should map gracefully
    assert.equal(columns.find((c) => c.header === "Role")?.value(nullRow), "Participant");
    assert.equal(columns.find((c) => c.header === "Status")?.value(nullRow), "Inactive");
    assert.equal(columns.find((c) => c.header === "Phone")?.value(nullRow), "");
  });
});

