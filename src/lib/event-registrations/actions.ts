"use server";

import "server-only";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "../supabase/server";
import { getCurrentAccount, getAdminAccount } from "../auth/server";
import { listEventAttendees } from "./queries.server";
import type {
  AttendeeRow,
  AttendanceStatus,
  CancelOutcome,
  RegisterOutcome,
} from "./types";

const idSchema = z.string().uuid();

const setAttendanceSchema = z.object({
  registrationId: z.string().uuid(),
  status: z.enum(["attended", "registered"]),
});

export interface RegisterActionResult {
  ok: boolean;
  outcome?: RegisterOutcome;
  error?: string;
}

export interface CancelActionResult {
  ok: boolean;
  outcome?: CancelOutcome;
  error?: string;
}

export interface SetAttendanceActionResult {
  ok: boolean;
  error?: string;
}

export interface ListAttendeesActionResult {
  ok: boolean;
  rows?: AttendeeRow[];
  error?: string;
}

export interface ExportAttendeesActionResult {
  ok: boolean;
  rows?: AttendeeRow[];
  truncated?: boolean;
  error?: string;
}

function mapDatabaseError(code?: string): string {
  if (code === "42501") return "not_member";
  if (code === "P0002") return "not_found";
  return "failed";
}

export async function registerForEventAction(
  eventId: unknown
): Promise<RegisterActionResult> {
  const parsedId = idSchema.safeParse(eventId);
  if (!parsedId.success) {
    return { ok: false, error: "invalid_input" };
  }

  const account = await getCurrentAccount();
  if (!account) {
    return { ok: false, error: "sign_in" };
  }

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc("register_for_event", {
      p_event_id: parsedId.data,
    });

    if (error) {
      return { ok: false, error: mapDatabaseError(error.code) };
    }

    const outcome = data as RegisterOutcome;
    revalidatePath("/events", "layout");
    revalidatePath("/account");
    return { ok: true, outcome };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function cancelEventRegistrationAction(
  eventId: unknown
): Promise<CancelActionResult> {
  const parsedId = idSchema.safeParse(eventId);
  if (!parsedId.success) {
    return { ok: false, error: "invalid_input" };
  }

  const account = await getCurrentAccount();
  if (!account) {
    return { ok: false, error: "sign_in" };
  }

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.rpc("cancel_event_registration", {
      p_event_id: parsedId.data,
    });

    if (error) {
      return { ok: false, error: mapDatabaseError(error.code) };
    }

    const outcome = data as CancelOutcome;
    revalidatePath("/events", "layout");
    revalidatePath("/account");
    return { ok: true, outcome };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function setAttendanceAction(
  input: unknown
): Promise<SetAttendanceActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = setAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const { registrationId, status } = parsed.data;

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("event_registrations")
      .update({ status: status as AttendanceStatus })
      .eq("id", registrationId)
      .in("status", ["registered", "attended"])
      .select("id");

    if (error) {
      return { ok: false, error: "failed" };
    }

    if (!data || data.length === 0) {
      return { ok: false, error: "not_found" };
    }

    revalidatePath("/admin/events");
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function listAttendeesAction(
  eventId: unknown
): Promise<ListAttendeesActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parsedId = idSchema.safeParse(eventId);
  if (!parsedId.success) {
    return { ok: false, error: "invalid_input" };
  }

  try {
    const rows = await listEventAttendees(parsedId.data, 500);
    return { ok: true, rows };
  } catch {
    return { ok: false, error: "failed" };
  }
}

export async function exportAttendeesAction(
  eventId: unknown
): Promise<ExportAttendeesActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parsedId = idSchema.safeParse(eventId);
  if (!parsedId.success) {
    return { ok: false, error: "invalid_input" };
  }

  try {
    const limit = 2001;
    const allRows = await listEventAttendees(parsedId.data, limit);
    const truncated = allRows.length > 2000;
    const rows = truncated ? allRows.slice(0, 2000) : allRows;

    return { ok: true, rows, truncated };
  } catch {
    return { ok: false, error: "failed" };
  }
}
