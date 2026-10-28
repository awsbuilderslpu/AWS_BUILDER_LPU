import type { Role } from "@/data/roles";

/**
 * Application role alias corresponding to the database public.app_role enum.
 */
export type AppRole = Role;

/**
 * Registration status corresponding to public.registration_status in Supabase.
 */
export type RegistrationStatus = "pending" | "approved" | "rejected" | "archived";

/**
 * Normalized account summary for the signed-in user.
 * Safe for use across both server and client components.
 */
export interface AccountSummary {
  id: string;
  email: string;
  displayName: string;
  role: AppRole | null;
  isActive: boolean;
  registrationStatus: RegistrationStatus | null;
  profileComplete: boolean;
}

/**
 * Checks if a member profile has completed all required institutional and academic fields.
 * Required fields:
 * - registration_number
 * - phone_number
 * - date_of_birth
 * - university
 * - programme
 * - department
 * - study_year
 * - semester
 * - graduation_year
 * - terms_accepted_at
 */
export function isProfileComplete(
  profile: Record<string, unknown> | null | undefined
): boolean {
  if (!profile || typeof profile !== "object") {
    return false;
  }

  const requiredFields = [
    "registration_number",
    "phone_number",
    "date_of_birth",
    "university",
    "programme",
    "department",
    "study_year",
    "semester",
    "graduation_year",
    "terms_accepted_at",
  ] as const;

  for (const field of requiredFields) {
    const value = profile[field];
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === "string" && value.trim() === "") {
      return false;
    }
  }

  return true;
}

