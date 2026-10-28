"use server";

import { redirect } from "next/navigation";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/auth/safe-next";

export interface ConfirmState {
  error: string | null;
}

/**
 * Server Action to verify email token hash.
 * Triggered on user interaction to prevent security scanners from burning one-time tokens.
 */
export async function confirmEmailToken(
  prevState: ConfirmState,
  formData: FormData
): Promise<ConfirmState> {
  const tokenHash = formData.get("token_hash") as string | null;
  const type = formData.get("type") as EmailOtpType | null;
  const next = formData.get("next") as string | null;

  if (!tokenHash || !type) {
    return { error: "Missing or invalid confirmation token." };
  }

  if (!isSupabaseConfigured()) {
    return { error: "Authentication service is temporarily unavailable." };
  }

  const destination = safeNext(next, "/account");

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth/confirm] OTP verification error:", error.code);
      }
      return {
        error:
          "This verification link has expired or has already been used. Please try signing in or request a new confirmation email.",
      };
    }
  } catch {
    return { error: "Could not verify confirmation token. Please try again." };
  }

  redirect(destination);
}

