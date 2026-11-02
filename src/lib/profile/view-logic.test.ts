import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formFromOwnProfile, formatDob } from "./view-logic";
import type { OwnProfile } from "./types";

describe("profile view-logic", () => {
  it("formFromOwnProfile maps a full profile correctly", () => {
    const fullProfile: OwnProfile = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phoneCountryCode: "+91",
      phoneNumber: "9876543210",
      registrationNumber: "12345678",
      dateOfBirth: "2003-05-14",
      university: "lpu",
      programme: "B.Tech",
      department: "cse",
      studyYear: "3rd Year",
      semester: "5th Semester",
      graduationYear: "2026",
      headline: "Cloud & DevOps enthusiast",
      bio: "Passionate about distributed systems and cloud architecture.",
      location: "Punjab, India",
      linkedinUrl: "https://linkedin.com/in/janedoe",
      githubUrl: "https://github.com/janedoe",
      websiteUrl: "https://janedoe.dev",
      instagramUrl: "https://instagram.com/janedoe",
      youtubeUrl: "https://youtube.com/@janedoe",
      skills: ["AWS", "Docker", "Kubernetes"],
      interests: ["Cloud Computing", "DevOps"],
      avatarPath: "avatars/user-1/avatar.png",
      coverPath: "covers/user-1/cover.png",
      isPublicProfile: true,
      publicTitle: "Lead Architect",
      termsAcceptedAt: "2026-01-01T00:00:00Z",
    };

    const values = formFromOwnProfile(fullProfile);

    assert.equal(values.firstName, "Jane");
    assert.equal(values.lastName, "Doe");
    assert.equal(values.phoneCountryCode, "+91");
    assert.equal(values.phoneNumber, "9876543210");
    assert.equal(values.university, "lpu");
    assert.equal(values.programme, "B.Tech");
    assert.equal(values.department, "cse");
    assert.equal(values.studyYear, "3rd Year");
    assert.equal(values.semester, "5th Semester");
    assert.equal(values.graduationYear, "2026");
    assert.equal(values.headline, "Cloud & DevOps enthusiast");
    assert.equal(values.bio, "Passionate about distributed systems and cloud architecture.");
    assert.equal(values.location, "Punjab, India");
    assert.equal(values.linkedinUrl, "https://linkedin.com/in/janedoe");
    assert.equal(values.githubUrl, "https://github.com/janedoe");
    assert.equal(values.websiteUrl, "https://janedoe.dev");
    assert.equal(values.instagramUrl, "https://instagram.com/janedoe");
    assert.equal(values.youtubeUrl, "https://youtube.com/@janedoe");
    assert.deepEqual(values.skills, ["AWS", "Docker", "Kubernetes"]);
    assert.deepEqual(values.interests, ["Cloud Computing", "DevOps"]);
    assert.equal(values.isPublicProfile, true);
  });

  it("formFromOwnProfile handles an empty profile with nulls and falls back to defaults", () => {
    const emptyProfile: OwnProfile = {
      firstName: "",
      lastName: "",
      email: "user@example.com",
      phoneCountryCode: null,
      phoneNumber: null,
      registrationNumber: null,
      dateOfBirth: null,
      university: null,
      programme: null,
      department: null,
      studyYear: null,
      semester: null,
      graduationYear: null,
      headline: null,
      bio: null,
      location: null,
      linkedinUrl: null,
      githubUrl: null,
      websiteUrl: null,
      instagramUrl: null,
      youtubeUrl: null,
      skills: [],
      interests: [],
      avatarPath: null,
      coverPath: null,
      isPublicProfile: false,
      publicTitle: null,
      termsAcceptedAt: null,
    };

    const values = formFromOwnProfile(emptyProfile);

    assert.equal(values.firstName, "");
    assert.equal(values.lastName, "");
    assert.equal(values.phoneCountryCode, "+91");
    assert.equal(values.phoneNumber, "");
    assert.equal(values.headline, null);
    assert.equal(values.bio, null);
    assert.equal(values.location, null);
    assert.equal(values.linkedinUrl, null);
    assert.equal(values.githubUrl, null);
    assert.equal(values.websiteUrl, null);
    assert.equal(values.instagramUrl, null);
    assert.equal(values.youtubeUrl, null);
    assert.deepEqual(values.skills, []);
    assert.deepEqual(values.interests, []);
    assert.equal(values.isPublicProfile, false);
  });

  it("formatDob formats date of birth YYYY-MM-DD correctly", () => {
    assert.equal(formatDob("2003-05-14"), "14 May 2003");
    assert.equal(formatDob("2000-01-01"), "1 Jan 2000");
    assert.equal(formatDob("1999-12-31"), "31 Dec 1999");
    assert.equal(formatDob(null), "-");
    assert.equal(formatDob(undefined), "-");
    assert.equal(formatDob("invalid-date"), "invalid-date");
  });
});
