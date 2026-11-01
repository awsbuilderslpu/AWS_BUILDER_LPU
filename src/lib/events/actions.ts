"use server";

import "server-only";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaffAccount } from "@/lib/auth/server";
import { parseListParams } from "@/lib/admin/list-params";
import {
  sanitizeDoc,
  countChars,
  richLimits,
} from "../richtext/sanitize";
import { eventFormSchema } from "./validate";
import { makeSlug } from "./slug";
import { eventsListConfig } from "./list-config";
import { fetchEventsForExport } from "./list-query.server";
import {
  toEventDetails,
  type EventAdminRow,
  type EventDetails,
} from "./types";

export interface CreateEventResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface UpdateEventResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface SetEventsStateResult {
  ok: boolean;
  count?: number;
  error?: string;
}

export interface ExportEventsActionResult {
  ok: boolean;
  rows?: EventAdminRow[];
  truncated?: boolean;
  error?: string;
}

function mapDatabaseError(code?: string): string {
  if (code === "42501") return "forbidden";
  if (code === "23514") return "invalid_input";
  return "failed";
}

const idSchema = z.string().uuid();

const setEventsStateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(25),
  action: z.enum(["publish", "unpublish", "archive", "restore"]),
});

export async function createEventAction(
  input: unknown
): Promise<CreateEventResult> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const values = parsed.data;
  const cleanDoc = sanitizeDoc(values.description, "basic");
  const charLength = countChars(cleanDoc);

  if (charLength > richLimits.basic.maxChars) {
    return { ok: false, error: "description_too_long" };
  }

  const supabase = await createClient();

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    const suffix = crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 6)
      .toLowerCase();
    const slug = makeSlug(values.title, suffix);

    const { data, error } = await supabase
      .from("events")
      .insert({
        slug,
        title: values.title,
        category: values.category,
        description: cleanDoc,
        location_mode: values.locationMode,
        venue: values.venue,
        meeting_url: values.meetingUrl,
        starts_at: values.startsAt,
        ends_at: values.endsAt,
        registration_enabled: values.registrationEnabled,
        registration_deadline: values.registrationDeadline,
        banner_path: values.bannerPath,
        is_published: values.isPublished,
        capacity: values.capacity,
      })
      .select("id")
      .maybeSingle();

    if (!error && data) {
      revalidatePath("/admin/events");
      revalidatePath("/events", "layout");
      return { ok: true, id: data.id };
    }

    if (error && error.code === "23505" && attempts < 3) {
      continue;
    }

    return { ok: false, error: mapDatabaseError(error?.code) };
  }

  return { ok: false, error: "failed" };
}

export async function updateEventAction(
  idOrInput: unknown,
  maybeValues?: unknown
): Promise<UpdateEventResult> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  let eventId: string;
  let formPayload: unknown;

  if (typeof idOrInput === "string" && maybeValues !== undefined) {
    const parsedId = idSchema.safeParse(idOrInput);
    if (!parsedId.success) {
      return { ok: false, error: "invalid_input" };
    }
    eventId = parsedId.data;
    formPayload = maybeValues;
  } else if (idOrInput && typeof idOrInput === "object" && "id" in idOrInput) {
    const rawId = (idOrInput as { id: unknown }).id;
    const parsedId = idSchema.safeParse(rawId);
    if (!parsedId.success) {
      return { ok: false, error: "invalid_input" };
    }
    eventId = parsedId.data;
    formPayload = idOrInput;
  } else {
    return { ok: false, error: "invalid_input" };
  }

  const parsed = eventFormSchema.safeParse(formPayload);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const values = parsed.data;
  const cleanDoc = sanitizeDoc(values.description, "basic");
  const charLength = countChars(cleanDoc);

  if (charLength > richLimits.basic.maxChars) {
    return { ok: false, error: "description_too_long" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update({
      title: values.title,
      category: values.category,
      description: cleanDoc,
      location_mode: values.locationMode,
      venue: values.venue,
      meeting_url: values.meetingUrl,
      starts_at: values.startsAt,
      ends_at: values.endsAt,
      registration_enabled: values.registrationEnabled,
      registration_deadline: values.registrationDeadline,
      banner_path: values.bannerPath,
      is_published: values.isPublished,
      capacity: values.capacity,
    })
    .eq("id", eventId)
    .select("id");

  if (error) {
    return { ok: false, error: mapDatabaseError(error.code) };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "not_found" };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events", "layout");
  return { ok: true, id: eventId };
}

export async function setEventsStateAction(
  input: unknown
): Promise<SetEventsStateResult> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = setEventsStateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const { ids, action } = parsed.data;
  let patch: Record<string, unknown> = {};

  if (action === "publish") {
    patch = { is_published: true };
  } else if (action === "unpublish") {
    patch = { is_published: false };
  } else if (action === "archive") {
    patch = { archived_at: new Date().toISOString() };
  } else if (action === "restore") {
    patch = { archived_at: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update(patch)
    .in("id", ids)
    .select("id");

  if (error) {
    return { ok: false, error: mapDatabaseError(error.code) };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events", "layout");
  return { ok: true, count: data?.length ?? 0 };
}

export async function getEventDetailsAction(
  id: unknown
): Promise<EventDetails | null> {
  const staff = await getStaffAccount();
  if (!staff) {
    return null;
  }

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, slug, title, category, description, location_mode, venue, starts_at, ends_at, registration_enabled, registration_deadline, banner_path, is_published, archived_at, capacity, created_at, updated_at"
    )
    .eq("id", parsed.data)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  let meetingUrl: string | null = null;
  try {
    const { data: urlData, error: rpcError } = await supabase.rpc(
      "staff_event_meeting_url",
      { p_event_id: parsed.data }
    );
    if (!rpcError && typeof urlData === "string") {
      meetingUrl = urlData;
    }
  } catch {
    meetingUrl = null;
  }

  const details = toEventDetails(data);
  details.meetingUrl = meetingUrl;
  return details;
}

export async function exportEventsAction(
  raw: Record<string, string | string[] | undefined>
): Promise<ExportEventsActionResult> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const params = parseListParams(raw, eventsListConfig);
    const supabase = await createClient();
    const { rows, truncated } = await fetchEventsForExport(
      supabase,
      params,
      new Date().toISOString()
    );

    return { ok: true, rows, truncated };
  } catch {
    return { ok: false, error: "failed" };
  }
}

