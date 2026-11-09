import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNext } from "@/lib/auth/safe-next";
import { isProfileComplete } from "@/lib/auth/account";
import { syncGoogleAvatar } from "@/lib/auth/sync-avatar.server";

/**
 * Handles OAuth callback and email verification redirects from Supabase.
 * Exchanges the temporary authorization code for a persisted session.
 * Checks profile completeness: incomplete profiles are directed to complete registration.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const error = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.searchParams.get("error_code");

  const origin = requestUrl.origin;
  const target = safeNext(next, "/account");

  // Handle provider/OAuth errors
  if (error || errorCode) {
    const errorParam = encodeURIComponent(error || errorCode || "oauth_failed");
    return NextResponse.redirect(`${origin}/?auth=signin&error=${errorParam}`);
  }

  // If no code parameter supplied, redirect with error
  if (!code) {
    return NextResponse.redirect(`${origin}/?auth=signin&error=google`);
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/?auth=signin&error=google`);
  }

  try {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (exchangeError) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[auth/callback] Code exchange error:", exchangeError.code);
      }
      return NextResponse.redirect(
        `${origin}/?auth=signin&error=exchange_failed`
      );
    }

    // Check profile completeness on the same client instance
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Sync Google OAuth avatar into Supabase storage avatars bucket if not already set
      await syncGoogleAvatar(supabase, user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!isProfileComplete(profile)) {
        return NextResponse.redirect(
          `${origin}/?auth=complete&next=${encodeURIComponent(target)}`
        );
      }
    }

    // Fully completed profile routes to destination
    return NextResponse.redirect(new URL(target, origin));
  } catch {
    return NextResponse.redirect(
      `${origin}/?auth=signin&error=exchange_failed`
    );
  }
}
