import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/auth/safe-next";
import { authCopy } from "@/data/auth";
import { registrationCopy } from "@/data/registration";
import type { SignInValues, RegisterInput } from "@/lib/auth/schemas";

export type AuthResult = { ok: true } | { ok: false; error: string };

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
        console.warn("[auth] Sign up error:", error.code);
      }

      if (
        error.code === "over_request_rate_limit" ||
        error.code === "over_email_send_rate_limit" ||
        error.status === 429
      ) {
        return { ok: false, error: authCopy.errors.rateLimited };
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
