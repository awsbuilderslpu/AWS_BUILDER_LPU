import type { AppRole, RegistrationStatus } from "./types";

export const roleRank: Record<AppRole, number> = {
  administrator: 5,
  admin: 4,
  core: 3,
  member: 2,
  student: 1,
  participant: 0,
};

export const bulkRoles: AppRole[] = [
  "student",
  "participant",
  "member",
  "core",
];

export interface MemberTarget {
  userId: string;
  role: AppRole;
  isActive: boolean;
  registrationStatus: RegistrationStatus | null;
}

export type RoleChangeKind = "promote" | "demote" | "same";

export function roleChangeKind(from: AppRole, to: AppRole): RoleChangeKind {
  const fromRank = roleRank[from] ?? 0;
  const toRank = roleRank[to] ?? 0;
  if (toRank > fromRank) return "promote";
  if (toRank < fromRank) return "demote";
  return "same";
}

export type ActionDenialReason =
  | "self"
  | "no_change"
  | "admin_individually"
  | "admin_needs_approved_active"
  | "only_administrator_can_promote_admin"
  | "cannot_modify_admin"
  | "demote_admin_first";

export type RuleResult =
  | { ok: true }
  | { ok: false; reason: ActionDenialReason };

export function canChangeRole({
  actorId,
  actorRole,
  target,
  newRole,
  bulk,
}: {
  actorId: string;
  actorRole?: AppRole | null;
  target: MemberTarget;
  newRole: AppRole;
  bulk?: boolean;
}): RuleResult {
  if (target.userId === actorId) {
    return { ok: false, reason: "self" };
  }
  if (actorRole && actorRole !== "administrator") {
    if (newRole === "admin" || newRole === "administrator") {
      return { ok: false, reason: "only_administrator_can_promote_admin" };
    }
    if (target.role === "admin" || target.role === "administrator") {
      return { ok: false, reason: "cannot_modify_admin" };
    }
  }
  if (newRole === target.role) {
    return { ok: false, reason: "no_change" };
  }
  if (
    bulk &&
    (newRole === "admin" ||
      target.role === "admin" ||
      newRole === "administrator" ||
      target.role === "administrator")
  ) {
    return { ok: false, reason: "admin_individually" };
  }
  if (
    (newRole === "admin" || newRole === "administrator") &&
    !(target.registrationStatus === "approved" && target.isActive)
  ) {
    return { ok: false, reason: "admin_needs_approved_active" };
  }
  return { ok: true };
}

export function canSetActive({
  actorId,
  actorRole,
  target,
  active,
  bulk,
}: {
  actorId: string;
  actorRole?: AppRole | null;
  target: MemberTarget;
  active: boolean;
  bulk?: boolean;
}): RuleResult {
  if (target.userId === actorId) {
    return { ok: false, reason: "self" };
  }
  if (actorRole && actorRole !== "administrator") {
    if (target.role === "admin" || target.role === "administrator") {
      return { ok: false, reason: "cannot_modify_admin" };
    }
  }
  if (active === target.isActive) {
    return { ok: false, reason: "no_change" };
  }
  if (bulk && (target.role === "admin" || target.role === "administrator")) {
    return { ok: false, reason: "admin_individually" };
  }
  return { ok: true };
}

export function canRemove({
  actorId,
  actorRole,
  target,
}: {
  actorId: string;
  actorRole?: AppRole | null;
  target: MemberTarget;
}): RuleResult {
  if (target.userId === actorId) {
    return { ok: false, reason: "self" };
  }
  if (actorRole && actorRole !== "administrator") {
    if (target.role === "admin" || target.role === "administrator") {
      return { ok: false, reason: "cannot_modify_admin" };
    }
  }
  if (target.role === "admin" || target.role === "administrator") {
    return { ok: false, reason: "demote_admin_first" };
  }
  return { ok: true };
}

export interface SplitBulkResult {
  eligible: MemberTarget[];
  skipped: { target: MemberTarget; reason: "self" | "admin_individually" }[];
}

export function splitBulk(
  targets: MemberTarget[],
  actorId: string
): SplitBulkResult {
  const eligible: MemberTarget[] = [];
  const skipped: {
    target: MemberTarget;
    reason: "self" | "admin_individually";
  }[] = [];

  for (const target of targets) {
    if (target.userId === actorId) {
      skipped.push({ target, reason: "self" });
    } else if (target.role === "admin" || target.role === "administrator") {
      skipped.push({ target, reason: "admin_individually" });
    } else {
      eligible.push(target);
    }
  }

  return { eligible, skipped };
}

