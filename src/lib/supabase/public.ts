import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client only for anonymous reads of published content.
 * Never reads a visitor's session, uses no cookies, and disables session persistence.
 * Uses only the publishable key.
 * Returns null when either NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.
 */
export function createPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    return null;
  }

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

