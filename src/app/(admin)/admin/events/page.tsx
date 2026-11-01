import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { parseListParams, toSearchParams } from "@/lib/admin/list-params";
import { eventsListConfig } from "@/lib/events/list-config";
import {
  listEvents,
  getEventCounts,
} from "@/lib/events/list-query.server";
import type { EventAdminRow } from "@/lib/events/types";
import { clampPage } from "@/lib/registrations/view-logic";
import {
  EventsView,
  type EventCounts,
} from "@/components/features/admin/events/EventsView";

export const metadata: Metadata = {
  title: "Events",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
  await requireStaff("/admin/events");

  const rawParams = await searchParams;
  const params = parseListParams(rawParams, eventsListConfig);

  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let rows: EventAdminRow[] = [];
  let total = 0;
  let counts: EventCounts | null = null;
  let loadError = false;

  try {
    const [listResult, countsResult] = await Promise.all([
      listEvents(supabase, params, nowIso),
      getEventCounts(supabase, nowIso),
    ]);
    rows = listResult.rows;
    total = listResult.total;
    counts = countsResult;
  } catch {
    loadError = true;
  }

  // Handle out-of-range page redirect
  if (!loadError && params.page > 1 && rows.length === 0 && total > 0) {
    const clamped = clampPage(params.page, params.pageSize, total);
    const qs = toSearchParams(
      { ...params, page: clamped },
      eventsListConfig
    ).toString();
    redirect(`/admin/events${qs ? `?${qs}` : ""}`);
  }

  return (
    <EventsView
      rows={rows}
      total={total}
      counts={counts}
      params={params}
      nowIso={nowIso}
      loadError={loadError}
    />
  );
}

