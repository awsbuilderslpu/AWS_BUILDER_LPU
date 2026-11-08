import { bulkRoles, canChangeRole, canSetActive, type MemberTarget } from "./rules";
import type { AppRole } from "./types";

export function roleChoices(bulk: boolean): AppRole[] {
  if (bulk) {
    return bulkRoles;
  }
  return ["student", "participant", "member", "core", "admin"];
}

export function adminChoice(
  target: MemberTarget,
  actorId: string,
  actorRole?: AppRole | null
):
  | { enabled: true }
  | {
      enabled: false;
      reason: "self" | "current" | "admin_needs_approved_active" | "only_administrator";
    } {
  if (actorRole && actorRole !== "administrator") {
    return { enabled: false, reason: "only_administrator" };
  }
  if (target.userId === actorId) {
    return { enabled: false, reason: "self" };
  }
  if (target.role === "admin" || target.role === "administrator") {
    return { enabled: false, reason: "current" };
  }
  const result = canChangeRole({
    actorId,
    actorRole,
    target,
    newRole: "admin",
    bulk: false,
  });
  if (!result.ok) {
    if (result.reason === "only_administrator_can_promote_admin") {
      return {
        enabled: false,
        reason: "only_administrator",
      };
    }
    return {
      enabled: false,
      reason: "admin_needs_approved_active",
    };
  }
  return { enabled: true };
}

export function splitRoleChange(
  targets: MemberTarget[],
  newRole: AppRole,
  actorId: string,
  actorRole?: AppRole | null
): {
  applicable: MemberTarget[];
  skipped: { target: MemberTarget; reason: string }[];
} {
  const applicable: MemberTarget[] = [];
  const skipped: { target: MemberTarget; reason: string }[] = [];
  const bulk = targets.length > 1;

  for (const target of targets) {
    const res = canChangeRole({ actorId, actorRole, target, newRole, bulk });
    if (res.ok) {
      applicable.push(target);
    } else {
      skipped.push({ target, reason: res.reason });
    }
  }

  return { applicable, skipped };
}

export function splitActiveChange(
  targets: MemberTarget[],
  active: boolean,
  actorId: string,
  actorRole?: AppRole | null
): {
  applicable: MemberTarget[];
  skipped: { target: MemberTarget; reason: string }[];
} {
  const applicable: MemberTarget[] = [];
  const skipped: { target: MemberTarget; reason: string }[] = [];
  const bulk = targets.length > 1;

  for (const target of targets) {
    const res = canSetActive({ actorId, actorRole, target, active, bulk });
    if (res.ok) {
      applicable.push(target);
    } else {
      skipped.push({ target, reason: res.reason });
    }
  }

  return { applicable, skipped };
}

export function rowNumber(
  index: number,
  page: number,
  pageSize: number
): number {
  return (page - 1) * pageSize + index + 1;
}

export function departmentLabel(
  value: string | null | undefined,
  departments: { value: string; short: string }[]
): string {
  if (!value) return "-";
  const match = departments.find(
    (d) => d.value.toLowerCase() === value.toLowerCase()
  );
  if (match) return match.short;
  return value;
}

export function countByReason(
  skipped: { reason: string }[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of skipped) {
    counts[item.reason] = (counts[item.reason] ?? 0) + 1;
  }
  return counts;
}

