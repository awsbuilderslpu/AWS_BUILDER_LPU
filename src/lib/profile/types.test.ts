import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toOwnProfile, toDirectoryMember } from "./types";

describe("profile types", () => {
  it("toOwnProfile maps a full database row", () => {
    const raw = {
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      phone_country_code: "+91",
      phone_number: "9876543210",
      registration_number: "12345678",
      date_of_birth: "2000-01-01",
      gender: "Male",
      university: "Lovely Professional University",
      programme: "B.Tech",
      department: "CSE",
      study_year: "3rd Year",
      semester: "6th Semester",
      graduation_year: "2026",
      headline: "Full-stack developer",
      bio: "Passionate about open source",
      location: "Punjab, India",
      linkedin_url: "https://linkedin.com/in/johndoe",
      github_url: "https://github.com/johndoe",
      website_url: "https://example.com",
      instagram_url: "https://instagram.com/johndoe",
      youtube_url: "https://youtube.com/@johndoe",
      skills: ["React", "TypeScript"],
      interests: ["Cloud Computing"],
      avatar_path: "11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222.webp",
      cover_path: "11111111-1111-1111-1111-111111111111/33333333-3333-3333-3333-333333333333.jpg",
      is_public_profile: true,
      public_title: "Tech Lead",
      terms_accepted_at: "2026-01-01T00:00:00Z",
    };

    const profile = toOwnProfile(raw);
    assert.equal(profile.firstName, "John");
    assert.equal(profile.lastName, "Doe");
    assert.equal(profile.email, "john@example.com");
    assert.equal(profile.phoneCountryCode, "+91");
    assert.equal(profile.phoneNumber, "9876543210");
    assert.equal(profile.registrationNumber, "12345678");
    assert.equal(profile.dateOfBirth, "2000-01-01");
    assert.equal(profile.gender, "Male");
    assert.equal(profile.university, "Lovely Professional University");
    assert.equal(profile.programme, "B.Tech");
    assert.equal(profile.department, "CSE");
    assert.equal(profile.studyYear, "3rd Year");
    assert.equal(profile.semester, "6th Semester");
    assert.equal(profile.graduationYear, "2026");
    assert.equal(profile.headline, "Full-stack developer");
    assert.equal(profile.bio, "Passionate about open source");
    assert.equal(profile.location, "Punjab, India");
    assert.equal(profile.linkedinUrl, "https://linkedin.com/in/johndoe");
    assert.equal(profile.githubUrl, "https://github.com/johndoe");
    assert.equal(profile.websiteUrl, "https://example.com");
    assert.equal(profile.instagramUrl, "https://instagram.com/johndoe");
    assert.equal(profile.youtubeUrl, "https://youtube.com/@johndoe");
    assert.deepEqual(profile.skills, ["React", "TypeScript"]);
    assert.deepEqual(profile.interests, ["Cloud Computing"]);
    assert.equal(profile.avatarPath, raw.avatar_path);
    assert.equal(profile.coverPath, raw.cover_path);
    assert.equal(profile.isPublicProfile, true);
    assert.equal(profile.publicTitle, "Tech Lead");
    assert.equal(profile.termsAcceptedAt, "2026-01-01T00:00:00Z");
  });

  it("toOwnProfile handles a row full of nulls without throwing and turns null arrays into []", () => {
    const raw = {
      first_name: null,
      last_name: null,
      email: null,
      phone_country_code: null,
      phone_number: null,
      registration_number: null,
      date_of_birth: null,
      university: null,
      programme: null,
      department: null,
      study_year: null,
      semester: null,
      graduation_year: null,
      headline: null,
      bio: null,
      location: null,
      linkedin_url: null,
      github_url: null,
      website_url: null,
      instagram_url: null,
      youtube_url: null,
      skills: null,
      interests: null,
      avatar_path: null,
      cover_path: null,
      is_public_profile: null,
      public_title: null,
      terms_accepted_at: null,
    };

    const profile = toOwnProfile(raw);
    assert.equal(profile.firstName, "");
    assert.equal(profile.lastName, "");
    assert.equal(profile.email, "");
    assert.equal(profile.phoneCountryCode, null);
    assert.equal(profile.phoneNumber, null);
    assert.deepEqual(profile.skills, []);
    assert.deepEqual(profile.interests, []);
    assert.equal(profile.isPublicProfile, false);
    assert.equal(profile.publicTitle, null);
  });

  it("toDirectoryMember maps member and handles unknown role giving null", () => {
    const valid = toDirectoryMember({
      user_id: "u-1",
      full_name: "Jane Smith",
      public_title: "Advisor",
      access_role: "core",
      headline: "DevOps Engineer",
      location: "Remote",
      skills: ["AWS", "Docker"],
      linkedin_url: "https://linkedin.com/in/janesmith",
    });

    assert.equal(valid.userId, "u-1");
    assert.equal(valid.fullName, "Jane Smith");
    assert.equal(valid.publicTitle, "Advisor");
    assert.equal(valid.accessRole, "core");
    assert.deepEqual(valid.skills, ["AWS", "Docker"]);
    assert.equal(valid.links.linkedin, "https://linkedin.com/in/janesmith");
    assert.equal(valid.links.github, undefined);

    const unknownRole = toDirectoryMember({
      user_id: "u-2",
      full_name: "Bob",
      access_role: "super_admin",
    });
    assert.equal(unknownRole.accessRole, null);
  });
});

