/* eslint-disable react-hooks/purity */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { isMailConfigured } from "@/lib/email/mailer.server";
import { parseListParams, toSearchParams } from "@/lib/admin/list-params";
import { registrationsListConfig } from "@/lib/registrations/list-config";
import {
  getRegistrationCounts,
  listRegistrations,
} from "@/lib/registrations/list-query.server";
import type { RegistrationListRow } from "@/lib/registrations/types";
import { clampPage } from "@/lib/registrations/view-logic";
import {
  RegistrationsView,
  type RegistrationsCounts,
} from "@/components/features/admin/registrations/RegistrationsView";

export const metadata: Metadata = {
  title: "Registrations",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegistrationsPage({ searchParams }: PageProps) {
  await requireRole(["admin"], "/admin/registrations");

  const rawParams = await searchParams;
  const params = parseListParams(rawParams, registrationsListConfig);

  const supabase = await createClient();

  let rows: RegistrationListRow[] = [];
  let total = 0;
  let counts: RegistrationsCounts | null = null;
  let loadError = false;

  try {
    const [listResult, countsResult] = await Promise.all([
      listRegistrations(supabase, params),
      getRegistrationCounts(supabase, Date.now()),
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
      registrationsListConfig
    ).toString();
    redirect(`/admin/registrations${qs ? `?${qs}` : ""}`);
  }

  const mailConfigured = isMailConfigured();

  return (
    <RegistrationsView
      rows={rows}
      total={total}
      counts={counts}
      params={params}
      mailConfigured={mailConfigured}
      loadError={loadError}
    />
  );
}

