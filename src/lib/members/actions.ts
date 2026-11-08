"use server";

import "server-only";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccount } from "@/lib/auth/server";
import { parseListParams } from "@/lib/admin/list-params";
import { membersListConfig } from "./list-config";
import { fetchAllMembersForExport } from "./list-query.server";
import {
  toMemberDetails,
  type AppRole,
  type MemberDetails,
  type RegistrationStatus,
} from "./types";
import {
  canChangeRole,
  canSetActive,
  canRemove,
  type MemberTarget,
} from "./rules";

const changeRoleSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(25),
  role: z.enum(["admin", "core", "member", "student", "participant"]),
  confirmAdmin: z.boolean().optional(),
});

export interface ChangeRoleResultItem {
  id: string;
  ok: boolean;
  error?: string;
}

export interface ChangeRoleActionResult {
  ok: boolean;
  error?: string;
  results?: ChangeRoleResultItem[];
}

const setActiveSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(25),
  active: z.boolean(),
});

export interface SetActiveResultItem {
  id: string;
  ok: boolean;
  error?: string;
}

export interface SetActiveActionResult {
  ok: boolean;
  error?: string;
  results?: SetActiveResultItem[];
}

const removeMemberSchema = z.object({
  id: z.string().uuid(),
});

export interface RemoveMemberActionResult {
  ok: boolean;
  error?: string;
}

const getMemberDetailsSchema = z.string().uuid();

export interface ExportMembersActionResult {
  ok: boolean;
  rows?: MemberDetails[];
  truncated?: boolean;
  error?: string;
}

function mapMemberDatabaseError(
  err: { message?: string; code?: string } | null
): string {
  if (!err) return "failed";
  const msg = (err.message || "").toLowerCase();
  const code = (err.code || "").toUpperCase();

  if (msg.includes("last active admin") || msg.includes("last_admin")) {
    return "last_admin";
  }
  if (msg.includes("forbidden") || code === "42501") {
    return "forbidden";
  }
  if (msg.includes("cannot_change_self")) {
    return "cannot_change_self";
  }
  if (msg.includes("not_found") || code === "P0002") {
    return "not_found";
  }
  if (msg.includes("not_a_member")) {
    return "not_a_member";
  }
  if (msg.includes("no_change")) {
    return "no_change";
  }
  if (msg.includes("admin_requires_approved_active")) {
    return "admin_requires_approved_active";
  }
  if (msg.includes("demote_admin_first")) {
    return "demote_admin_first";
  }
  if (msg.includes("update_failed")) {
    return "update_failed";
  }
  if (msg.includes("invalid_input")) {
    return "invalid_input";
  }
  return "failed";
}

export async function changeMemberRolesAction(
  input: unknown
): Promise<ChangeRoleActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = changeRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const { ids, role, confirmAdmin } = parsed.data;

  if (role === "admin") {
    if (ids.length !== 1) {
      return { ok: false, error: "admin_individually" };
    }
    if (confirmAdmin !== true) {
      return { ok: false, error: "confirm_required" };
    }
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_members")
    .select("user_id, role, is_active, registration_status")
    .in("user_id", ids);

  if (error) {
    return { ok: false, error: "failed" };
  }

  const memberMap = new Map((data ?? []).map((m) => [m.user_id, m]));
  const results: ChangeRoleResultItem[] = [];
  let anySuccess = false;

  for (const id of ids) {
    const targetRow = memberMap.get(id);
    if (!targetRow) {
      results.push({ id, ok: false, error: "not_a_member" });
      continue;
    }

    const target: MemberTarget = {
      userId: targetRow.user_id,
      role: targetRow.role as AppRole,
      isActive: targetRow.is_active,
      registrationStatus:
        targetRow.registration_status as RegistrationStatus | null,
    };

    const check = canChangeRole({
      actorId: admin.id,
      target,
      newRole: role,
      bulk: ids.length > 1,
    });

    if (!check.ok) {
      results.push({ id, ok: false, error: check.reason });
      continue;
    }

    const { error: rpcError } = await supabase.rpc("set_member_role", {
      p_user_id: id,
      p_role: role,
    });

    if (rpcError) {
      results.push({
        id,
        ok: false,
        error: mapMemberDatabaseError(rpcError),
      });
    } else {
      results.push({ id, ok: true });
      anySuccess = true;
    }
  }

  if (anySuccess) {
    revalidatePath("/admin/members");
    revalidatePath("/admin");
  }

  return { ok: true, results };
}

export async function setMembersActiveAction(
  input: unknown
): Promise<SetActiveActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = setActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const { ids, active } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_members")
    .select("user_id, role, is_active, registration_status")
    .in("user_id", ids);

  if (error) {
    return { ok: false, error: "failed" };
  }

  const memberMap = new Map((data ?? []).map((m) => [m.user_id, m]));
  const results: SetActiveResultItem[] = [];
  let anySuccess = false;

  for (const id of ids) {
    const targetRow = memberMap.get(id);
    if (!targetRow) {
      results.push({ id, ok: false, error: "not_a_member" });
      continue;
    }

    const target: MemberTarget = {
      userId: targetRow.user_id,
      role: targetRow.role as AppRole,
      isActive: targetRow.is_active,
      registrationStatus:
        targetRow.registration_status as RegistrationStatus | null,
    };

    const check = canSetActive({
      actorId: admin.id,
      target,
      active,
      bulk: ids.length > 1,
    });

    if (!check.ok) {
      results.push({ id, ok: false, error: check.reason });
      continue;
    }

    const { error: rpcError } = await supabase.rpc("set_member_active", {
      p_user_id: id,
      p_active: active,
    });

    if (rpcError) {
      results.push({
        id,
        ok: false,
        error: mapMemberDatabaseError(rpcError),
      });
    } else {
      results.push({ id, ok: true });
      anySuccess = true;
    }
  }

  if (anySuccess) {
    revalidatePath("/admin/members");
    revalidatePath("/admin");
  }

  return { ok: true, results };
}

export async function removeMemberAction(
  input: unknown
): Promise<RemoveMemberActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = removeMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const { id } = parsed.data;
  const supabase = await createClient();

  const { data: targetRow, error: fetchError } = await supabase
    .from("admin_members")
    .select("user_id, role, is_active, registration_status")
    .eq("user_id", id)
    .maybeSingle();

  if (fetchError || !targetRow) {
    return { ok: false, error: "not_a_member" };
  }

  const target: MemberTarget = {
    userId: targetRow.user_id,
    role: targetRow.role as AppRole,
    isActive: targetRow.is_active,
    registrationStatus:
      targetRow.registration_status as RegistrationStatus | null,
  };

  const check = canRemove({ actorId: admin.id, target });
  if (!check.ok) {
    return { ok: false, error: check.reason };
  }

  const { error: rpcError } = await supabase.rpc("remove_member", {
    p_user_id: id,
  });

  if (rpcError) {
    return { ok: false, error: mapMemberDatabaseError(rpcError) };
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin");

  return { ok: true };
}

export async function getMemberDetailsAction(
  id: unknown
): Promise<MemberDetails | null> {
  const admin = await getAdminAccount();
  if (!admin) {
    return null;
  }

  const parsed = getMemberDetailsSchema.safeParse(id);
  if (!parsed.success) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_members")
    .select("*")
    .eq("user_id", parsed.data)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  // Ensure gender and dateOfBirth are loaded from profiles if missing from admin_members view
  if ((data.gender == null || data.date_of_birth == null) && data.user_id) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("gender, date_of_birth")
      .eq("id", data.user_id)
      .maybeSingle();

    if (userProfile) {
      if (data.gender == null && userProfile.gender) {
        data.gender = userProfile.gender;
      }
      if (data.date_of_birth == null && userProfile.date_of_birth) {
        data.date_of_birth = userProfile.date_of_birth;
      }
    }
  }

  return toMemberDetails(data);
}

export async function exportMembersAction(
  raw: Record<string, string | string[] | undefined>
): Promise<ExportMembersActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const params = parseListParams(raw, membersListConfig);
    const supabase = await createClient();
    const { rows, truncated } = await fetchAllMembersForExport(
      supabase,
      params
    );

    return { ok: true, rows, truncated };
  } catch {
    return { ok: false, error: "failed" };
  }
}

