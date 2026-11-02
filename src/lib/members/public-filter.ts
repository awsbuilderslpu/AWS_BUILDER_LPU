import type { Member, MemberGroup } from "@/data/members";

export function filterMembers(
  list: Member[],
  group: MemberGroup | null,
  query: string,
  skills: string[]
): Member[] {
  const trimmedQuery = query.trim().toLowerCase();

  return list.filter((member) => {
    // Group filter
    if (group !== null && member.group !== group) {
      return false;
    }

    // Skills filter: member must have EVERY selected skill (exact match)
    if (skills.length > 0) {
      const hasAllSkills = skills.every((skill) =>
        member.skills.includes(skill)
      );
      if (!hasAllSkills) {
        return false;
      }
    }

    // Query filter: substring match against name, role, badge, focus, or any skill
    if (trimmedQuery !== "") {
      const matchesName = member.name.toLowerCase().includes(trimmedQuery);
      const matchesRole = member.role.toLowerCase().includes(trimmedQuery);
      const matchesBadge = member.badge
        ? member.badge.toLowerCase().includes(trimmedQuery)
        : false;
      const matchesFocus = member.focus
        ? member.focus.toLowerCase().includes(trimmedQuery)
        : false;
      const matchesSkill = member.skills.some((s) =>
        s.toLowerCase().includes(trimmedQuery)
      );

      if (
        !matchesName &&
        !matchesRole &&
        !matchesBadge &&
        !matchesFocus &&
        !matchesSkill
      ) {
        return false;
      }
    }

    return true;
  });
}
