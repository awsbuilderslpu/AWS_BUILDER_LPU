import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { profileFormSchema } from "./validate";

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
});

