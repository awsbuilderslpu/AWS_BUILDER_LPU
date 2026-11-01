import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toMemberListRow, toMemberDetails } from "./types";

describe("members types helper", () => {
  it("maps a full raw view row correctly", () => {
    const raw = {
      user_id: "u-123",
      registration_id: "r-456",
      role: "core",
      is_active: true,
      registration_status: "approved",
      full_name: "Alice Smith",
      first_name: "Alice",
      last_name: "Smith",
      email: "alice@example.com",
      registration_number: "REG-001",
      department: "cse",
      programme: "B.Tech",
      study_year: "3rd Year",
      member_since: "2026-01-15T10:00:00Z",
      phone_country_code: "+91",
      phone_number: "9876543210",
      university: "LPU",
      semester: "5",
      graduation_year: 2027,
      interests: ["Cloud", "AI"],
      skills: ["AWS", "TypeScript"],
      headline: "Cloud Builder",
      bio: "Passionate engineer",
      location: "Punjab, India",
      linkedin_url: "https://linkedin.com/in/alice",
      github_url: "https://github.com/alice",
      website_url: "https://alice.dev",
      instagram_url: "https://instagram.com/alice",
      youtube_url: "https://youtube.com/@alice",
      admin_note: "Verified student",
    };

    const row = toMemberListRow(raw);
    assert.equal(row.userId, "u-123");
    assert.equal(row.registrationId, "r-456");
    assert.equal(row.role, "core");
    assert.equal(row.isActive, true);
    assert.equal(row.registrationStatus, "approved");
    assert.equal(row.fullName, "Alice Smith");
    assert.equal(row.firstName, "Alice");
    assert.equal(row.lastName, "Smith");
    assert.equal(row.email, "alice@example.com");
    assert.equal(row.registrationNumber, "REG-001");
    assert.equal(row.department, "cse");
    assert.equal(row.programme, "B.Tech");
    assert.equal(row.studyYear, "3rd Year");
    assert.equal(row.memberSince, "2026-01-15T10:00:00Z");

    const details = toMemberDetails(raw);
    assert.equal(details.phoneCountryCode, "+91");
    assert.equal(details.phoneNumber, "9876543210");
    assert.equal(details.university, "LPU");
    assert.equal(details.semester, "5");
    assert.equal(details.graduationYear, 2027);
    assert.deepEqual(details.interests, ["Cloud", "AI"]);
    assert.deepEqual(details.skills, ["AWS", "TypeScript"]);
    assert.equal(details.headline, "Cloud Builder");
    assert.equal(details.bio, "Passionate engineer");
    assert.equal(details.location, "Punjab, India");
    assert.equal(details.linkedinUrl, "https://linkedin.com/in/alice");
    assert.equal(details.githubUrl, "https://github.com/alice");
    assert.equal(details.websiteUrl, "https://alice.dev");
    assert.equal(details.instagramUrl, "https://instagram.com/alice");
    assert.equal(details.youtubeUrl, "https://youtube.com/@alice");
    assert.equal(details.adminNote, "Verified student");
  });

  it("handles a row full of nulls without throwing", () => {
    const raw = {
      user_id: null,
      registration_id: null,
      role: null,
      is_active: null,
      registration_status: null,
      full_name: null,
      first_name: null,
      last_name: null,
      email: null,
      registration_number: null,
      department: null,
      programme: null,
      study_year: null,
      member_since: null,
      phone_country_code: null,
      phone_number: null,
      university: null,
      semester: null,
      graduation_year: null,
      interests: null,
      skills: null,
      headline: null,
      bio: null,
      location: null,
      linkedin_url: null,
      github_url: null,
      website_url: null,
      instagram_url: null,
      youtube_url: null,
      admin_note: null,
    };

    const row = toMemberListRow(raw);
    assert.equal(row.userId, "");
    assert.equal(row.registrationId, null);
    assert.equal(row.role, "participant");
    assert.equal(row.isActive, false);
    assert.equal(row.registrationStatus, null);
    assert.equal(row.fullName, "");
    assert.equal(row.firstName, null);
    assert.equal(row.lastName, null);
    assert.equal(row.email, null);
    assert.equal(row.registrationNumber, null);
    assert.equal(row.department, null);
    assert.equal(row.programme, null);
    assert.equal(row.studyYear, null);
    assert.equal(row.memberSince, "");

    const details = toMemberDetails(raw);
    assert.equal(details.phoneCountryCode, null);
    assert.equal(details.phoneNumber, null);
    assert.equal(details.graduationYear, null);
    assert.deepEqual(details.interests, []);
    assert.deepEqual(details.skills, []);
    assert.equal(details.adminNote, null);
  });

  it("converts null or missing interests and skills into empty arrays", () => {
    const detailsNull = toMemberDetails({ interests: null, skills: null });
    assert.deepEqual(detailsNull.interests, []);
    assert.deepEqual(detailsNull.skills, []);

    const detailsEmpty = toMemberDetails({});
    assert.deepEqual(detailsEmpty.interests, []);
    assert.deepEqual(detailsEmpty.skills, []);
  });
});

