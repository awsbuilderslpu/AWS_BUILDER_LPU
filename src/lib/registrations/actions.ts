"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccount } from "@/lib/auth/server";
import { parseListParams } from "@/lib/admin/list-params";
import { siteConfig } from "@/data/site";
import { emailCopy } from "@/data/emails";
import { sendMail, type SendMailOptions } from "@/lib/email/mailer.server";
import {
  type ReviewAction,
  type RegistrationDetails,
  type ApprovableRole,
  toDetails,
} from "./types";
import { sendsEmail } from "./transitions";
import { registrationsListConfig } from "./list-config";
import { fetchAllForExport } from "./list-query.server";
import { buildReviewEmail } from "./email";
import type { RegistrationStatus } from "../auth/account";

const reviewSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(25),
  action: z.enum(["approve", "reject", "archive", "reopen", "restore"]),
  role: z.enum(["student", "participant", "member", "core"]).optional(),
  note: z.string().max(2000).optional(),
  sendEmail: z.boolean().optional(),
  includeNote: z.boolean().optional(),
});

export interface ReviewResultItem {
  id: string;
  ok: boolean;
  status?: RegistrationStatus;
  error?: string;
  email?: "sent" | "failed" | "skipped" | "not_configured";
}

export interface ReviewActionResult {
  ok: boolean;
  error?: string;
  results?: ReviewResultItem[];
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function sendMailWithTimeout(
  options: SendMailOptions
): Promise<"sent" | "failed" | "not_configured"> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<"failed">((resolve) => {
    timer = setTimeout(() => resolve("failed"), 15000);
  });
  try {
    return await Promise.race([sendMail(options), timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

function mapDatabaseError(err: {
  message?: string;
  code?: string;
} | null): string {
  if (!err) return "failed";
  const msg = (err.message || "").toLowerCase();
  const code = err.code || "";

  if (msg.includes("forbidden") || code === "42501") {
    return "forbidden";
  }
  if (msg.includes("invalid_transition")) {
    return "invalid_transition";
  }
  if (msg.includes("not_found") || code === "P0002") {
    return "not_found";
  }
  if (msg.includes("invalid_role")) {
    return "invalid_role";
  }
  if (msg.includes("note_too_long")) {
    return "note_too_long";
  }
  return "failed";
}

export async function reviewRegistrationsAction(
  input: unknown
): Promise<ReviewActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const { ids, action, role, sendEmail, includeNote } = parsed.data;
  const trimmedNote = parsed.data.note?.trim() || null;
  const pRole = action === "approve" ? (role as ApprovableRole ?? null) : null;

  const supabase = await createClient();
  const results: ReviewResultItem[] = [];

  interface PendingMail {
    id: string;
    mailOptions: SendMailOptions;
  }
  const pendingMails: PendingMail[] = [];

  // Process IDs sequentially through the RPC
  for (const id of ids) {
    const { data, error } = await supabase.rpc("review_registration", {
      p_id: id,
      p_action: action,
      p_note: trimmedNote,
      p_role: pRole,
    });

    if (error) {
      results.push({
        id,
        ok: false,
        error: mapDatabaseError(error),
      });
      continue;
    }

    const newStatus = data as RegistrationStatus;
    const resultItem: ReviewResultItem = {
      id,
      ok: true,
      status: newStatus,
      email: "skipped",
    };

    if (sendsEmail(action as ReviewAction) && sendEmail === true) {
      // Read applicant info strictly from database by registration id
      const { data: regData } = await supabase
        .from("admin_registrations")
        .select("first_name, email")
        .eq("id", id)
        .maybeSingle();

      if (regData && regData.email) {
        const siteLabel = `${siteConfig.name} ${siteConfig.org}`;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || null;
        const emailContent = buildReviewEmail(
          {
            kind: action === "approve" ? "approved" : "rejected",
            firstName: regData.first_name || "",
            siteLabel,
            siteUrl,
            contactEmail: siteConfig.email,
            note: includeNote && trimmedNote ? trimmedNote : undefined,
          },
          emailCopy
        );

        pendingMails.push({
          id,
          mailOptions: {
            to: regData.email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
            replyTo: siteConfig.email,
          },
        });
      } else {
        resultItem.email = "failed";
      }
    }

    results.push(resultItem);
  }

  // Send pending emails in batches of at most 5 with 15s timeout
  if (pendingMails.length > 0) {
    const mailChunks = chunkArray(pendingMails, 5);

    for (const chunk of mailChunks) {
      const settled = await Promise.allSettled(
        chunk.map((item) => sendMailWithTimeout(item.mailOptions))
      );

      for (let i = 0; i < chunk.length; i++) {
        const mailItem = chunk[i];
        const settleResult = settled[i];
        const statusOutcome =
          settleResult.status === "fulfilled" ? settleResult.value : "failed";

        const targetResult = results.find((r) => r.id === mailItem.id);
        if (targetResult) {
          targetResult.email = statusOutcome;
        }
      }
    }
  }

  revalidatePath("/admin/registrations");
  revalidatePath("/admin");

  return { ok: true, results };
}

const saveNoteSchema = z.object({
  id: z.string().uuid(),
  note: z.string().max(2000),
});

export async function saveNoteAction(
  input: unknown
): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = saveNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const trimmed = parsed.data.note.trim();
  const supabase = await createClient();

  if (trimmed) {
    const { error } = await supabase
      .from("registration_notes")
      .upsert(
        { registration_id: parsed.data.id, note: trimmed },
        { onConflict: "registration_id" }
      );

    if (error) {
      if (error.code === "23503") {
        return { ok: false, error: "not_found" };
      }
      return { ok: false, error: "failed" };
    }
  } else {
    const { error } = await supabase
      .from("registration_notes")
      .delete()
      .eq("registration_id", parsed.data.id);

    if (error) {
      return { ok: false, error: "failed" };
    }
  }

  revalidatePath("/admin/registrations");
  return { ok: true };
}

const detailsIdSchema = z.string().uuid();

export async function getRegistrationDetailsAction(
  id: unknown
): Promise<RegistrationDetails | null> {
  const admin = await getAdminAccount();
  if (!admin) {
    return null;
  }

  const parsed = detailsIdSchema.safeParse(id);
  if (!parsed.success) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_registrations")
    .select("*")
    .eq("id", parsed.data)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  // Ensure gender and dateOfBirth are loaded from profiles if missing from admin_registrations view
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

  let reviewerName: string | null = null;
  if (data.reviewed_by) {
    const { data: reviewer } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", data.reviewed_by)
      .maybeSingle();

    if (reviewer) {
      reviewerName =
        [reviewer.first_name, reviewer.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || null;
    }
  }

  return toDetails(data, reviewerName);
}

export async function exportRegistrationsAction(
  raw: Record<string, string | string[] | undefined>
): Promise<{
  ok: boolean;
  rows?: RegistrationDetails[];
  truncated?: boolean;
  error?: string;
}> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const params = parseListParams(raw, registrationsListConfig);
    const supabase = await createClient();
    const { rows, truncated } = await fetchAllForExport(supabase, params);

    return { ok: true, rows, truncated };
  } catch {
    return { ok: false, error: "failed" };
  }
}

