import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { parseListParams, toSearchParams } from "@/lib/admin/list-params";
import { membersListConfig } from "@/lib/members/list-config";
import {
  listMembers,
  getMemberCounts,
} from "@/lib/members/list-query.server";
import type { MemberListRow } from "@/lib/members/types";
import { clampPage } from "@/lib/registrations/view-logic";
import {
  MembersView,
  type MemberCounts,
} from "@/components/features/admin/members/MembersView";

export const metadata: Metadata = {
  title: "Members",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminMembersPage({ searchParams }: PageProps) {
  await connection();
  const account = await requireRole(["administrator", "admin"], "/admin/members");

  const rawParams = await searchParams;
  const params = parseListParams(rawParams, membersListConfig);

  const supabase = await createClient();

  let rows: MemberListRow[] = [];
  let total = 0;
  let counts: MemberCounts | null = null;
  let loadError = false;

  try {
    const [listResult, countsResult] = await Promise.all([
      listMembers(supabase, params),
      getMemberCounts(supabase),
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
      membersListConfig
    ).toString();
    redirect(`/admin/members${qs ? `?${qs}` : ""}`);
  }

  return (
    <MembersView
      rows={rows}
      total={total}
      counts={counts}
      params={params}
      currentUserId={account.id}
      currentUserRole={account.role}
      loadError={loadError}
    />
  );
}
