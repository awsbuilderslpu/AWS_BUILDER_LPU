import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/auth/safe-next";
import { authCopy } from "@/data/auth";
import { registrationCopy, universities } from "@/data/registration";
import type {
  SignInValues,
  RegisterInput,
  CompleteRegistrationValues,
} from "@/lib/auth/schemas";

export type AuthResult = { ok: true } | { ok: false; error: string };

export interface OwnProfileData {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  registrationNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  university: string;
  programme: string;
  department: string;
  year: string;
  semester: string;
  graduationYear: string;
  interests: string[];
  termsAcceptedAt: string | null;
  status: string | null;
  requestedRole: string | null;
}

/**
 * Maps raw registration form inputs into structured user metadata
 * matching the private.handle_new_user() database trigger expectations.
 */
export function toSignUpMetadata(input: RegisterInput): Record<string, unknown> {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    phone_country_code: input.countryCode,
    phone_number: input.phone,
    registration_number: input.registrationNumber,
    university: input.university,
    programme: input.programme,
    department: input.department,
    study_year: input.year,
    semester: input.semester,
    date_of_birth: input.dateOfBirth,
    gender: input.gender,
    graduation_year: Number(input.graduationYear),
    interests: input.interests,
    terms_accepted: input.termsAccepted,
    requested_role: input.requestedRole,
  };
}

/**
 * Initiates Google OAuth sign-in flow via Supabase.
 */
export async function signInWithGoogle(next?: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  try {
    const supabase = createClient();
    const destination = safeNext(next, "/account");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth] Google sign-in failed:", error.code);
      }
      return { ok: false, error: authCopy.errors.googleFailed };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: authCopy.errors.network };
  }
}

/**
 * Signs in using email and password.
 * Generic error messages are used to prevent user enumeration attacks.
 */
export async function signInWithPassword({
  email,
  password,
}: SignInValues): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth] Password sign-in error:", error.code);
      }

      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed") || error.code === "email_not_confirmed") {
        return { ok: false, error: authCopy.errors.emailNotConfirmed };
      }

      if (
        error.code === "over_request_rate_limit" ||
        error.code === "over_email_send_rate_limit" ||
        error.status === 429
      ) {
        return { ok: false, error: authCopy.errors.rateLimited };
      }

      // Enumeration defense: identical generic message for wrong password or non-existent user
      return { ok: false, error: authCopy.errors.failed };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: authCopy.errors.network };
  }
}

/**
 * Registers a new user account with comprehensive metadata.
 * Enumeration defense: if email already exists, succeeds silently without revealing state.
 */
export async function registerAccount(
  input: RegisterInput
): Promise<AuthResult & { unconfirmed?: boolean }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  try {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/account`;

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: toSignUpMetadata(input),
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth] Sign up error:", error.code ?? error.message ?? error);
      }

      const msg = (error.message || "").toLowerCase();

      if (
        error.code === "over_request_rate_limit" ||
        error.code === "over_email_send_rate_limit" ||
        error.status === 429 ||
        msg.includes("rate limit")
      ) {
        return { ok: false, error: authCopy.errors.rateLimited };
      }

      if (
        msg.includes("error sending confirmation mail") ||
        msg.includes("error sending confirmation email")
      ) {
        return {
          ok: false,
          error:
            "Your registration was received, but the confirmation email could not be sent. Please check back later or contact an administrator.",
        };
      }

      return { ok: false, error: registrationCopy.errors.registerFailed };
    }

    // Enumeration defense: If user already exists, Supabase returns user with empty identities
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { ok: true, unconfirmed: true };
    }

    return { ok: true, unconfirmed: !data.session };
  } catch {
    return { ok: false, error: authCopy.errors.network };
  }
}

/**
 * Resends the confirmation link for an unverified email address.
 */
export async function resendVerificationEmail(
  email: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  try {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/account`;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth] Resend email error:", error.code);
      }

      if (error.status === 429 || error.code === "over_email_send_rate_limit") {
        return { ok: false, error: authCopy.errors.rateLimited };
      }

      return { ok: false, error: registrationCopy.errors.resendFailed };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: authCopy.errors.network };
  }
}

/**
 * Sends a password reset link to the given email address.
 * Always returns { ok: true } (unless rate-limited or offline) to prevent enumeration.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  try {
    const supabase = createClient();
    // Reset link destination comes from the Supabase email template configuration
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth] Reset password error:", error.code);
      }

      if (
        error.status === 429 ||
        error.code === "over_email_send_rate_limit" ||
        error.code === "over_request_rate_limit"
      ) {
        return { ok: false, error: authCopy.errors.rateLimited };
      }

      // Enumeration defense: do not reveal non-existence of user
    }

    return { ok: true };
  } catch {
    return { ok: false, error: authCopy.errors.network };
  }
}

/**
 * Updates the user's password for the active recovery session.
 * Terminates all other active sessions on success.
 */
export async function updatePassword(
  newPassword: string
): Promise<AuthResult & { expired?: boolean }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth] Update password error:", error.code);
      }

      if (error.code === "same_password") {
        return { ok: false, error: authCopy.errors.samePassword };
      }

      if (error.code === "weak_password") {
        return { ok: false, error: registrationCopy.errors.password };
      }

      const msg = error.message.toLowerCase();
      if (
        error.code === "session_not_found" ||
        error.code === "auth_session_missing" ||
        msg.includes("session") ||
        msg.includes("expired") ||
        error.status === 401
      ) {
        return {
          ok: false,
          error: authCopy.errors.linkExpired,
          expired: true,
        };
      }

      return { ok: false, error: authCopy.errors.generic };
    }

    // Terminate all other sessions on success
    try {
      await supabase.auth.signOut({ scope: "others" });
    } catch {
      // Ignore failure of background other-session termination
    }

    return { ok: true };
  } catch {
    return { ok: false, error: authCopy.errors.network };
  }
}

/**
 * Reads the caller's own profile and registration record from the client.
 */
export async function loadOwnProfile(): Promise<
  { ok: true; data: OwnProfileData } | { ok: false; error: string }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return { ok: false, error: authCopy.complete.loadFailed };
    }

    const [profileRes, regRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "first_name, last_name, email, phone_country_code, phone_number, registration_number, date_of_birth, gender, university, programme, department, study_year, semester, graduation_year, interests, terms_accepted_at"
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("registrations")
        .select("status, requested_role")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (profileRes.error || regRes.error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[auth] loadOwnProfile query error:",
          profileRes.error?.code || regRes.error?.code
        );
      }
      return { ok: false, error: authCopy.complete.loadFailed };
    }

    const p = profileRes.data;
    const r = regRes.data;

    const data: OwnProfileData = {
      firstName: p?.first_name || "",
      lastName: p?.last_name || "",
      email: p?.email || user.email || "",
      countryCode: p?.phone_country_code || "+91",
      phone: p?.phone_number || "",
      registrationNumber: p?.registration_number || null,
      dateOfBirth: p?.date_of_birth || null,
      gender: p?.gender || null,
      university: p?.university || universities[0].value,
      programme: p?.programme || "",
      department: p?.department || "",
      year: p?.study_year || "",
      semester: p?.semester || "",
      graduationYear: p?.graduation_year ? String(p.graduation_year) : "",
      interests: Array.isArray(p?.interests) ? p.interests : [],
      termsAcceptedAt: p?.terms_accepted_at || null,
      status: r?.status || null,
      requestedRole: r?.requested_role || null,
    };

    return { ok: true, data };
  } catch {
    return { ok: false, error: authCopy.errors.network };
  }
}

/**
 * Saves completed registration details to the caller's own profile and registration record.
 * Protects locked fields from being re-sent if already populated.
 */
export async function completeRegistration(
  values: CompleteRegistrationValues,
  current: OwnProfileData
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: authCopy.errors.unavailable };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return { ok: false, error: authCopy.complete.saveFailed };
    }

    const profileUpdate: Record<string, unknown> = {
      first_name: values.firstName,
      last_name: values.lastName,
      phone_country_code: values.countryCode,
      phone_number: values.phone,
      gender: values.gender,
      university: values.university,
      programme: values.programme,
      department: values.department,
      study_year: values.year,
      semester: values.semester,
      graduation_year: Number(values.graduationYear),
      interests: values.interests,
    };

    // Never re-send registration_number, date_of_birth, or terms_accepted_at if already set
    if (!current.registrationNumber) {
      profileUpdate.registration_number = values.registrationNumber;
    }
    if (!current.dateOfBirth) {
      profileUpdate.date_of_birth = values.dateOfBirth;
    }
    if (!current.termsAcceptedAt) {
      profileUpdate.terms_accepted_at = new Date().toISOString();
    }

    const { data: updatedProfile, error: profileErr } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", user.id)
      .select("id");

    if (profileErr || !updatedProfile || updatedProfile.length === 0) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth] completeRegistration profile error:", profileErr?.code);
      }
      return { ok: false, error: authCopy.complete.saveFailed };
    }

    // Only update requested_role if registration status is pending
    if (current.status === "pending") {
      const { data: updatedReg, error: regErr } = await supabase
        .from("registrations")
        .update({ requested_role: values.requestedRole })
        .eq("user_id", user.id)
        .select("id");

      if (regErr || !updatedReg || updatedReg.length === 0) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[auth] completeRegistration registration error:", regErr?.code);
        }
        return { ok: false, error: authCopy.complete.saveFailed };
      }
    }

    return { ok: true };
  } catch {
    return { ok: false, error: authCopy.errors.network };
  }
}

/**
 * Signs the current user out across browser tabs.
 */
export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth] Sign out error:", error.code);
      }
      return { ok: false, error: authCopy.errors.generic };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: authCopy.errors.network };
  }
}
