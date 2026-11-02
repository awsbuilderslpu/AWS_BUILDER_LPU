import type { AccountSummary } from "../auth/account";

export type ViewerKind = "anonymous" | "signed-in-not-member" | "member";

/**
 * Returns the viewer kind for event registration permissions.
 *
 * A member is an account that is active and has registrationStatus "approved",
 * which matches the rule defined in `private.is_approved_member()` in migration 012.
 * Note: A staff role without an approved registration is not a member for sign-up.
 */
export function viewerKind(account: AccountSummary | null): ViewerKind {
  if (!account) {
    return "anonymous";
  }

  // Active account with approved registration status
  if (account.isActive && account.registrationStatus === "approved") {
    return "member";
  }

  return "signed-in-not-member";
}

