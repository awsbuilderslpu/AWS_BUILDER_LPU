import "server-only";

// Server-only code. Do not import in client components.
import { createClient } from "@/lib/supabase/server";

export interface AdminCounts {
  pending: number;
  approved: number;
  total: number;
}

export interface DashboardRecentRegistration {
  id: string;
  fullName: string;
  email: string;
  registrationNumber: string | null;
  department: string | null;
  programme: string | null;
  studyYear: string | null;
  status: string;
  requestedRole: string;
  appliedAt: string;
}

export interface DashboardEventItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  locationMode: string;
  venue: string | null;
  startsAt: string;
  endsAt: string;
  isPublished: boolean;
  bannerPath?: string | null;
}

export interface DashboardMessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  counts: {
    pending: number;
    approved: number;
    total: number;
    upcomingEvents: number;
    totalEvents: number;
    newMessages: number;
    totalMessages: number;
    totalProjects: number;
  };
  recentRegistrations: DashboardRecentRegistration[];
  upcomingEvents: DashboardEventItem[];
  recentMessages: DashboardMessageItem[];
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

/**
 * Fetches aggregated metrics and recent items for the main Admin Dashboard overview.
 * Resilient against RLS restrictions or empty tables using Promise.allSettled.
 */
export async function getDashboardData(isAdmin: boolean): Promise<DashboardData> {
  const defaultData: DashboardData = {
    counts: {
      pending: 0,
      approved: 0,
      total: 0,
      upcomingEvents: 0,
      totalEvents: 0,
      newMessages: 0,
      totalMessages: 0,
      totalProjects: 0,
    },
    recentRegistrations: [],
    upcomingEvents: [],
    recentMessages: [],
  };

  try {
    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    const tasks: PromiseLike<unknown>[] = [];

    // 1. Registrations (Admin only)
    if (isAdmin) {
      tasks.push(
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
        supabase
          .from("registrations")
          .select("id, full_name, email, registration_number, department, programme, study_year, status, requested_role, applied_at")
          .order("applied_at", { ascending: false })
          .limit(5)
      );
    } else {
      tasks.push(
        Promise.resolve({ count: 0 }),
        Promise.resolve({ count: 0 }),
        Promise.resolve({ count: 0 }),
        Promise.resolve({ data: [] })
      );
    }

    // 2. Events (Admin & Core)
    tasks.push(
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .is("archived_at", null)
        .gte("starts_at", nowIso),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .is("archived_at", null),
      supabase
        .from("events")
        .select("id, slug, title, category, location_mode, venue, starts_at, ends_at, is_published, banner_path")
        .is("archived_at", null)
        .order("starts_at", { ascending: true })
        .gte("starts_at", nowIso)
        .limit(4)
    );

    // 3. Contact Messages (Admin & Core)
    tasks.push(
      supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("id, name, email, subject, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(4)
    );

    // 4. Projects (Admin & Core)
    tasks.push(
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
    );

    const results = await Promise.allSettled(tasks);

    // Extract results helper
    const getRes = (index: number) => {
      const res = results[index];
      if (res && res.status === "fulfilled") {
        return (res.value as Record<string, unknown>) ?? {};
      }
      return {};
    };

    const pendingRes = getRes(0);
    const approvedRes = getRes(1);
    const totalRegRes = getRes(2);
    const recentRegRes = getRes(3);

    const upcomingEventsRes = getRes(4);
    const totalEventsRes = getRes(5);
    const eventsListRes = getRes(6);

    const newMsgRes = getRes(7);
    const totalMsgRes = getRes(8);
    const recentMsgRes = getRes(9);

    const totalProjectsRes = getRes(10);

    // If no upcoming events found, attempt to fetch most recent events
    let upcomingEvents = (eventsListRes.data as DashboardEventItem[]) || [];
    if (!upcomingEvents || upcomingEvents.length === 0) {
      try {
        const { data: fallbackEvents } = await supabase
          .from("events")
          .select("id, slug, title, category, location_mode, venue, starts_at, ends_at, is_published, banner_path")
          .is("archived_at", null)
          .order("starts_at", { ascending: false })
          .limit(4);
        if (fallbackEvents && fallbackEvents.length > 0) {
          upcomingEvents = fallbackEvents as unknown as DashboardEventItem[];
        }
      } catch {
        // ignore fallback errors
      }
    }

    const recentRegistrations: DashboardRecentRegistration[] =
      ((recentRegRes.data as Record<string, unknown>[]) || []).map((row) => ({
        id: String(row.id ?? ""),
        fullName: String(row.full_name ?? ""),
        email: String(row.email ?? ""),
        registrationNumber: row.registration_number ? String(row.registration_number) : null,
        department: row.department ? String(row.department) : null,
        programme: row.programme ? String(row.programme) : null,
        studyYear: row.study_year ? String(row.study_year) : null,
        status: String(row.status ?? "pending"),
        requestedRole: String(row.requested_role ?? "student"),
        appliedAt: String(row.applied_at ?? ""),
      }));

    const recentMessages: DashboardMessageItem[] =
      ((recentMsgRes.data as Record<string, unknown>[]) || []).map((msg) => ({
        id: String(msg.id ?? ""),
        name: String(msg.name ?? ""),
        email: String(msg.email ?? ""),
        subject: String(msg.subject ?? ""),
        message: String(msg.message ?? ""),
        status: String(msg.status ?? "new"),
        createdAt: String(msg.created_at ?? ""),
      }));

    return {
      counts: {
        pending: Number(pendingRes.count ?? 0),
        approved: Number(approvedRes.count ?? 0),
        total: Number(totalRegRes.count ?? 0),
        upcomingEvents: Number(upcomingEventsRes.count ?? 0),
        totalEvents: Number(totalEventsRes.count ?? 0),
        newMessages: Number(newMsgRes.count ?? 0),
        totalMessages: Number(totalMsgRes.count ?? 0),
        totalProjects: Number(totalProjectsRes.count ?? 0),
      },
      recentRegistrations,
      upcomingEvents,
      recentMessages,
    };
  } catch (err) {
    console.warn("getDashboardData encountered an error:", err);
    return defaultData;
  }
}

