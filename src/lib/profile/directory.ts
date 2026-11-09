import type { DirectoryMember } from "./types";

export interface PublicMemberCard {
  key: string;
  userId: string;
  username?: string | null;
  name: string;
  title: string;
  group: "core" | "community";
  headline: string | null;
  skills: string[];
  links: DirectoryMember["links"];
  image?: string;
}

export type PublicCard = PublicMemberCard;

export function displayTitle(
  member: Pick<DirectoryMember, "publicTitle" | "accessRole">,
  roleLabels: Record<string, string>
): string {
  if (member.publicTitle && member.publicTitle.trim()) {
    return member.publicTitle.trim();
  }
  if (member.accessRole && roleLabels[member.accessRole]) {
    return roleLabels[member.accessRole];
  }
  return "Member";
}

export function toPublicCard(
  member: DirectoryMember,
  roleLabels: Record<string, string>
): PublicMemberCard {
  const name = member.fullName.trim() || "(no name)";
  const title = displayTitle(member, roleLabels);
  const isCore =
    member.accessRole === "administrator" ||
    member.accessRole === "admin" ||
    member.accessRole === "core";
  const group: "core" | "community" = isCore ? "core" : "community";

  return {
    key: member.userId,
    userId: member.userId,
    username: member.username,
    name,
    title,
    group,
    headline: member.headline,
    skills: member.skills,
    links: member.links,
    image:
      member.avatarUrl ||
      (member.avatarPath?.startsWith("http") ? member.avatarPath : undefined),
  };
}
