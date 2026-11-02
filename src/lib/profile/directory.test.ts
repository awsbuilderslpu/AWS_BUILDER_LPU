import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { displayTitle, toPublicCard } from "./directory";
import type { DirectoryMember } from "./types";

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  core: "Core Member",
  member: "Contributor",
  student: "Student",
  participant: "Participant",
};

describe("profile directory logic", () => {
  it("displayTitle with and without a public title", () => {
    const withPublicTitle: Pick<DirectoryMember, "publicTitle" | "accessRole"> = {
      publicTitle: "Chapter President",
      accessRole: "admin",
    };
    assert.equal(displayTitle(withPublicTitle, roleLabels), "Chapter President");

    const withoutPublicTitle: Pick<DirectoryMember, "publicTitle" | "accessRole"> = {
      publicTitle: null,
      accessRole: "core",
    };
    assert.equal(displayTitle(withoutPublicTitle, roleLabels), "Core Member");

    const withNoRoleOrTitle: Pick<DirectoryMember, "publicTitle" | "accessRole"> = {
      publicTitle: null,
      accessRole: null,
    };
    assert.equal(displayTitle(withNoRoleOrTitle, roleLabels), "Member");
  });

  it("toPublicCard group for admin, core, member, student, participant", () => {
    const makeMember = (role: DirectoryMember["accessRole"], name = "User"): DirectoryMember => ({
      userId: `id-${role}`,
      fullName: name,
      publicTitle: null,
      accessRole: role,
      headline: "Headline",
      location: "Punjab",
      skills: ["AWS"],
      links: { github: "https://github.com" },
    });

    const adminCard = toPublicCard(makeMember("admin"), roleLabels);
    assert.equal(adminCard.group, "core");
    assert.equal(adminCard.name, "User");
    assert.equal(adminCard.title, "Administrator");

    const coreCard = toPublicCard(makeMember("core"), roleLabels);
    assert.equal(coreCard.group, "core");

    const memberCard = toPublicCard(makeMember("member"), roleLabels);
    assert.equal(memberCard.group, "community");

    const studentCard = toPublicCard(makeMember("student"), roleLabels);
    assert.equal(studentCard.group, "community");

    const participantCard = toPublicCard(makeMember("participant"), roleLabels);
    assert.equal(participantCard.group, "community");

    const emptyNameCard = toPublicCard(makeMember("member", "  "), roleLabels);
    assert.equal(emptyNameCard.name, "(no name)");
  });
});

