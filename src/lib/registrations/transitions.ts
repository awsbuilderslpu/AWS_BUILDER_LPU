import type { AppRole, RegistrationStatus } from "../auth/account";
import {
  type ReviewAction,
  type ApprovableRole,
  approvableRoles,
} from "./types";

export function allowedActions(status: RegistrationStatus): ReviewAction[] {
  switch (status) {
    case "pending":
      return ["approve", "reject", "archive"];
    case "approved":
      return ["archive"];
    case "rejected":
      return ["reopen", "archive"];
    case "archived":
      return ["restore"];
    default:
      return [];
  }
}

export function nextStatus(
  status: RegistrationStatus,
  action: ReviewAction,
  currentRole?: AppRole | null
): RegistrationStatus | null {
  const allowed = allowedActions(status);
  if (!allowed.includes(action)) {
    return null;
  }

  if (action === "approve") {
    return "approved";
  }
  if (action === "reject") {
    return "rejected";
  }
  if (action === "archive") {
    return "archived";
  }
  if (action === "reopen") {
    return "pending";
  }
  if (action === "restore") {
    if (currentRole == null || currentRole === "participant") {
      return "pending";
    }
    return "approved";
  }

  return null;
}

export function defaultApprovalRole(requested: AppRole): ApprovableRole {
  if (approvableRoles.includes(requested as ApprovableRole)) {
    return requested as ApprovableRole;
  }
  return "student";
}

export function sendsEmail(action: ReviewAction): boolean {
  return action === "approve" || action === "reject";
}

