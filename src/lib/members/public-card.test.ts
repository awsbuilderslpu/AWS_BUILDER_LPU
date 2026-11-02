import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toMemberCard, skillsOf } from "./public-card";
import type { PublicCard } from "../profile/directory";
import type { Member } from "../../data/members";

describe("public-card mapping and skillsOf", () => {
  it("toMemberCard maps a core member with links correctly", () => {
    const card: PublicCard = {
      key: "user-123",
      userId: "user-123",
      name: "Alex Smith",
      title: "Cloud Architect",
      group: "core",
      headline: "Building serverless applications",
      skills: ["AWS", "Node.js"],
      links: {
        github: "https://github.com/alexsmith",
        linkedin: "https://linkedin.com/in/alexsmith",
        website: "https://alexsmith.dev",
        instagram: "https://instagram.com/alexsmith",
        youtube: "https://youtube.com/@alexsmith",
      },
    };

    const member = toMemberCard(card);

    assert.equal(member.slug, "user-123");
    assert.equal(member.name, "Alex Smith");
    assert.equal(member.role, "Cloud Architect");
    assert.equal(member.focus, "Building serverless applications");
    assert.equal(member.group, "core");
    assert.deepEqual(member.skills, ["AWS", "Node.js"]);
    assert.equal(member.socials.github, "https://github.com/alexsmith");
    assert.equal(member.socials.linkedin, "https://linkedin.com/in/alexsmith");
    assert.equal(member.socials.website, "https://alexsmith.dev");
    assert.equal(member.socials.instagram, "https://instagram.com/alexsmith");
    assert.equal(member.socials.youtube, "https://youtube.com/@alexsmith");
  });

  it("toMemberCard maps a community member without links correctly", () => {
    const card: PublicCard = {
      key: "user-456",
      userId: "user-456",
      name: "Sam Lee",
      title: "Student",
      group: "community",
      headline: null,
      skills: ["Python"],
      links: {},
    };

    const member = toMemberCard(card);

    assert.equal(member.slug, "user-456");
    assert.equal(member.name, "Sam Lee");
    assert.equal(member.role, "Student");
    assert.equal(member.focus, undefined);
    assert.equal(member.group, "community");
    assert.deepEqual(member.skills, ["Python"]);
    assert.deepEqual(member.socials, {});
  });

  it("skillsOf deduplicates case-insensitively keeping the first spelling and sorting alphabetically", () => {
    const members: Member[] = [
      {
        slug: "1",
        name: "One",
        role: "Member",
        group: "community",
        skills: ["React", "docker", "TypeScript"],
        socials: {},
      },
      {
        slug: "2",
        name: "Two",
        role: "Member",
        group: "community",
        skills: ["DOCKER", "react", "AWS", "   "],
        socials: {},
      },
    ];

    const result = skillsOf(members);

    assert.deepEqual(result, ["AWS", "docker", "React", "TypeScript"]);
  });
});

