import "server-only";

// Server-only code. Do not import in client components.
import { createClient } from "@/lib/supabase/server";

export interface AdminCounts {
  pending: number;
  approved: number;
  total: number;
}

/**
 * Retrieves registration counts for the admin dashboard via head-only queries.
 * Operates under the signed-in admin's own session and row level security.
 * Returns null if any query errors or if Supabase is unavailable.
 */
export async function getAdminCounts(): Promise<AdminCounts | null> {
  try {
    const supabase = await createClient();

    const [pendingRes, approvedRes, totalRes] = await Promise.all([
      supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase
        .from("registrations")
        .select("*", { count: "exact", head: true }),
    ]);

    if (pendingRes.error || approvedRes.error || totalRes.error) {
      return null;
    }

    return {
      pending: pendingRes.count ?? 0,
      approved: approvedRes.count ?? 0,
      total: totalRes.count ?? 0,
    };
  } catch {
    return null;
  }
}

