import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filterMembers } from "./public-filter";
import type { Member } from "@/data/members";

const sampleMembers: Member[] = [
  {
    slug: "alex-rivera",
    name: "Alex Rivera",
    role: "Lead Organizer",
    badge: "Core",
    focus: "Cloud Architecture",
    group: "core",
    skills: ["AWS", "Terraform", "Serverless"],
    socials: {},
  },
  {
    slug: "sam-chen",
    name: "Sam Chen",
    role: "Community Member",
    group: "community",
    skills: ["React", "TypeScript", "AWS"],
    socials: {},
  },
];

describe("filterMembers", () => {
  it("filters by group", () => {
    const res = filterMembers(sampleMembers, "core", "", []);
    assert.equal(res.length, 1);
    assert.equal(res[0].name, "Alex Rivera");
  });

  it("filters by query matching name or skill", () => {
    const byName = filterMembers(sampleMembers, null, "Sam", []);
    assert.equal(byName.length, 1);
    assert.equal(byName[0].name, "Sam Chen");

    const bySkill = filterMembers(sampleMembers, null, "Terraform", []);
    assert.equal(bySkill.length, 1);
    assert.equal(bySkill[0].name, "Alex Rivera");
  });

  it("filters by multiple skills requiring all", () => {
    const matchingBoth = filterMembers(sampleMembers, null, "", ["AWS", "TypeScript"]);
    assert.equal(matchingBoth.length, 1);
    assert.equal(matchingBoth[0].name, "Sam Chen");

    const matchingNone = filterMembers(sampleMembers, null, "", ["Terraform", "React"]);
    assert.equal(matchingNone.length, 0);
  });
});
