import "server-only";

// Server-only code. Do not import in client components.

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  type AccountSummary,
  type AppRole,
  isProfileComplete,
} from "@/lib/auth/account";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * Returns the currently signed-in user's account summary.
 * Wrapped in React's cache() to deduplicate requests within a single server render cycle.
 *
 * Returns null if Supabase is not configured or if no authenticated user session exists.
 * Always verifies identity via `auth.getUser()` (never trusts cookies or `getSession()` alone).
 */
export const getCurrentAccount = cache(async (): Promise<AccountSummary | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Query profile, role, and registration status in parallel
    const [profileRes, roleRes, regRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role, is_active")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("registrations")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    const roleData = roleRes.data;
    const regData = regRes.data;

    const fullName = [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    const metadataName =
      (typeof user.user_metadata?.full_name === "string" &&
        user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" &&
        user.user_metadata.name) ||
      "";

    const displayName =
      fullName ||
      metadataName ||
      (user.email ? user.email.split("@")[0] : "") ||
      "Member";

    const role = (roleData?.role as AppRole) ?? null;
    const isActive = roleData?.is_active ?? true;
    const registrationStatus = regData?.status ?? null;
    const profileComplete = isProfileComplete(profile);

    return {
      id: user.id,
      email: user.email ?? "",
      displayName,
      role,
      isActive,
      registrationStatus,
      profileComplete,
    };
  } catch {
    return null;
  }
});

/**
 * Returns the currently signed-in user's account summary only if they hold the "admin" role and are active.
 * Never redirects (used by server actions).
 * Wrapped in React's cache() to deduplicate requests within a single server cycle.
 */
export const getAdminAccount = cache(async (): Promise<AccountSummary | null> => {
  const account = await getCurrentAccount();
  if (!account || account.role !== "admin" || !account.isActive) {
    return null;
  }
  return account;
});

/**
 * Ensures the user is authenticated on server-rendered routes.
 * Redirects unauthenticated visitors to the sign-in modal with a sanitized ?next= destination.
 */
export async function requireUser(next?: string): Promise<AccountSummary> {
  const account = await getCurrentAccount();

  if (!account) {
    const sanitized = encodeURIComponent(safeNext(next, "/account"));
    redirect(`/?auth=signin&next=${sanitized}`);
  }

  return account;
}

/**
 * Ensures the authenticated user possesses one of the allowed roles and is active.
 * Redirects unauthorized users to `/account`.
 */
export async function requireRole(
  allowedRoles: AppRole[],
  next?: string
): Promise<AccountSummary> {
  const account = await requireUser(next);

  if (!account.role || !allowedRoles.includes(account.role) || !account.isActive) {
    redirect("/account");
  }

  return account;
}

