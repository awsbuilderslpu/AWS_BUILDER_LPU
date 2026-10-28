export interface SupabaseEnv {
  url: string;
  publishableKey: string;
}

/**
 * Checks whether Supabase environment variables are populated and valid.
 * Does not throw; returns false if variables are missing or default placeholders.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  return Boolean(
    url &&
      publishableKey &&
      url.startsWith("http") &&
      !url.includes("your-project")
  );
}

/**
 * Returns the Supabase URL and Publishable Key from process.env.
 * Uses literal property access so Next.js can inline NEXT_PUBLIC_* variables in browser bundles.
 * Throws only when called, never at import time.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Copy .env.example to .env.local and fill in the Supabase values."
    );
  }

  return { url, publishableKey };
}
