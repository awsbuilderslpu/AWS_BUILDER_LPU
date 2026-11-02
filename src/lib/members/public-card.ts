import type { Member, MemberSocials } from "../../data/members";
import type { PublicCard } from "../profile/directory";

export function toMemberCard(card: PublicCard): Member {
  const socials: MemberSocials = {};
  if (card.links.linkedin) socials.linkedin = card.links.linkedin;
  if (card.links.github) socials.github = card.links.github;
  if (card.links.website) socials.website = card.links.website;
  if (card.links.instagram) socials.instagram = card.links.instagram;
  if (card.links.youtube) socials.youtube = card.links.youtube;

  return {
    slug: card.userId || card.key,
    name: card.name,
    role: card.title,
    focus: card.headline?.trim() || undefined,
    group: card.group,
    skills: card.skills,
    socials,
  };
}

export function skillsOf(members: Member[]): string[] {
  const seen = new Map<string, string>();
  for (const member of members) {
    for (const raw of member.skills) {
      const skill = raw.trim();
      if (!skill) continue;
      const lower = skill.toLowerCase();
      if (!seen.has(lower)) {
        seen.set(lower, skill);
      }
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

