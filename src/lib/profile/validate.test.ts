import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { profileFormSchema, adminProfileFormSchema } from "./validate";

describe("profile validate", () => {
  const currentYear = new Date().getFullYear();
  const validForm = {
    firstName: "Aarav",
    lastName: "Sharma",
    phoneCountryCode: "+91",
    phoneNumber: "9876543210",
    university: "lpu",
    programme: "B.Tech",
    department: "cse",
    studyYear: "3rd Year",
    semester: "6th Semester",
    graduationYear: String(currentYear + 1),
    headline: "Building cloud applications",
    bio: "Curious student learning cloud computing",
    location: "Jalandhar, Punjab",
    awsBuilderUrl: "https://builder.aws.com/community/aarav",
    linkedinUrl: "https://linkedin.com/in/aarav",
    githubUrl: "https://github.com/aarav",
    websiteUrl: "https://aarav.dev",
    instagramUrl: "https://instagram.com/aarav",
    youtubeUrl: "https://youtube.com/@aarav",
    skills: ["React", "TypeScript", "Node.js"],
    interests: ["Web Development", "Cloud Computing"],
    isPublicProfile: true,
  };

  it("valid form passes", () => {
    const parsed = profileFormSchema.parse(validForm);
    assert.equal(parsed.firstName, "Aarav");
    assert.equal(parsed.isPublicProfile, true);
    assert.equal(parsed.phoneNumber, "9876543210");
  });

  it("empty first name fails", () => {
    const invalid = { ...validForm, firstName: "   " };
    assert.throws(() => profileFormSchema.parse(invalid));
  });

  it("a link of javascript:alert(1) fails and https://example.com/me passes", () => {
    const badLink = { ...validForm, websiteUrl: "javascript:alert(1)" };
    assert.throws(() => profileFormSchema.parse(badLink));

    const goodLink = { ...validForm, websiteUrl: "https://example.com/me" };
    const parsed = profileFormSchema.parse(goodLink);
    assert.equal(parsed.websiteUrl, "https://example.com/me");
  });

  it("a link without a scheme gets https", () => {
    const noScheme = { ...validForm, websiteUrl: "example.com/me" };
    const parsed = profileFormSchema.parse(noScheme);
    assert.equal(parsed.websiteUrl, "https://example.com/me");
  });

  it("a 21st skill fails", () => {
    const twentyOneSkills = Array.from({ length: 21 }, (_, i) => `Skill${i + 1}`);
    const tooMany = { ...validForm, skills: twentyOneSkills };
    assert.throws(() => profileFormSchema.parse(tooMany));
  });

  it("duplicate skills in different cases collapse", () => {
    const withDuplicates = {
      ...validForm,
      skills: ["React", "react", "REACT", "TypeScript"],
    };
    const parsed = profileFormSchema.parse(withDuplicates);
    assert.deepEqual(parsed.skills, ["React", "TypeScript"]);
  });

  it("an interest outside interestOptions fails", () => {
    const badInterest = { ...validForm, interests: ["Not An Interest"] };
    assert.throws(() => profileFormSchema.parse(badInterest));
  });

  it("a headline of 121 characters fails", () => {
    const longHeadline = { ...validForm, headline: "a".repeat(121) };
    assert.throws(() => profileFormSchema.parse(longHeadline));

    const okHeadline = { ...validForm, headline: "a".repeat(120) };
    const parsed = profileFormSchema.parse(okHeadline);
    assert.equal(parsed.headline, "a".repeat(120));
  });

  it("a bio of 1001 characters fails", () => {
    const longBio = { ...validForm, bio: "b".repeat(1001) };
    assert.throws(() => profileFormSchema.parse(longBio));

    const okBio = { ...validForm, bio: "b".repeat(1000) };
    const parsed = profileFormSchema.parse(okBio);
    assert.equal(parsed.bio, "b".repeat(1000));
  });

  describe("adminProfileFormSchema", () => {
    const validAdminPayload = {
      userId: "12345678-1234-4234-8234-123456789abc",
      firstName: "Paramjit",
      lastName: "Singh",
      phoneCountryCode: "+91",
      phoneNumber: "9501085313",
      registrationNumber: "12001234",
      dateOfBirth: "2003-04-12",
      gender: "Male" as const,
      university: "lpu",
      programme: "B.Tech",
      department: "cse",
      studyYear: "3rd Year",
      semester: "5th Semester",
      graduationYear: "2026",
      headline: "Cloud & DevOps Enthusiast",
      bio: "Learning AWS and Next.js",
      location: "Punjab, India",
      skills: ["AWS", "Docker", "Next.js"],
      interests: ["Web Development", "Cloud Computing"],
      linkedinUrl: "https://linkedin.com/in/paramjit",
      githubUrl: "https://github.com/paramjit",
      isPublicProfile: true,
      publicTitle: "Student Ambassador",
    };

    it("valid admin payload parses successfully", () => {
      const parsed = adminProfileFormSchema.parse(validAdminPayload);
      assert.equal(parsed.userId, "12345678-1234-4234-8234-123456789abc");
      assert.equal(parsed.firstName, "Paramjit");
      assert.equal(parsed.lastName, "Singh");
      assert.equal(parsed.gender, "Male");
      assert.equal(parsed.graduationYear, 2026);
      assert.equal(parsed.publicTitle, "Student Ambassador");
    });

    it("requires a valid userId uuid", () => {
      const invalid = { ...validAdminPayload, userId: "not-a-uuid" };
      assert.throws(() => adminProfileFormSchema.parse(invalid));
    });

    it("requires non-empty firstName and lastName", () => {
      const invalidFirst = { ...validAdminPayload, firstName: "   " };
      assert.throws(() => adminProfileFormSchema.parse(invalidFirst));

      const invalidLast = { ...validAdminPayload, lastName: "" };
      assert.throws(() => adminProfileFormSchema.parse(invalidLast));
    });

    it("handles optional fields when null or empty", () => {
      const minimalPayload = {
        userId: "12345678-1234-4234-8234-123456789abc",
        firstName: "Paramjit",
        lastName: "Singh",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        graduationYear: "",
        registrationNumber: null,
      };
      const parsed = adminProfileFormSchema.parse(minimalPayload);
      assert.equal(parsed.phoneNumber, null);
      assert.equal(parsed.dateOfBirth, null);
      assert.equal(parsed.gender, null);
      assert.equal(parsed.graduationYear, null);
    });

    it("validates phoneNumber only if provided", () => {
      const badPhone = {
        ...validAdminPayload,
        phoneCountryCode: "+91",
        phoneNumber: "123", // too short for Indian phone
      };
      assert.throws(() => adminProfileFormSchema.parse(badPhone));
    });
  });
});

