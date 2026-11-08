"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requireStaff } from "@/lib/auth/server";
import type { ContactMessage, MessageStatus } from "./types";
import { defaultMessages } from "./defaults";

export async function fetchContactMessagesAction(): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured()) {
    return defaultMessages;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.warn("contact_messages table missing, using defaults");
        return defaultMessages;
      }
      console.warn("fetchContactMessagesAction error:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return defaultMessages;
    }

    return data as ContactMessage[];
  } catch (err) {
    console.warn("fetchContactMessagesAction caught:", err);
    return defaultMessages;
  }
}

export async function updateContactMessageStatusAction(
  id: string,
  status: MessageStatus
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireStaff("/admin/messages");

    if (!isSupabaseConfigured()) {
      return { ok: true };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("contact_messages")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/messages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update status";
    return { ok: false, error: message };
  }
}

export async function deleteContactMessageAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireStaff("/admin/messages");

    if (!isSupabaseConfigured()) {
      return { ok: true };
    }

    const supabase = await createClient();

    // 1. Fetch message to check if resume needs deletion
    const { data: msg } = await supabase
      .from("contact_messages")
      .select("resume_path")
      .eq("id", id)
      .single();

    if (msg?.resume_path) {
      await supabase.storage.from("resumes").remove([msg.resume_path]);
    }

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/messages");
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete message";
    return { ok: false, error: message };
  }
}

export async function getResumeDownloadUrlAction(
  path: string
): Promise<{ url: string | null; error?: string }> {
  try {
    await requireStaff("/admin/messages");

    if (!isSupabaseConfigured()) {
      return { url: null };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      return { url: null, error: error?.message || "Failed to generate download URL" };
    }

    return { url: data.signedUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error generating URL";
    return { url: null, error: message };
  }
}

export async function submitContactMessageAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim() || null;
    const registrationNumber = String(formData.get("registrationNumber") || "").trim() || null;
    const university = String(formData.get("university") || "").trim() || null;
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const resumeFile = formData.get("resume") as File | null;

    if (!name || name.length < 2) {
      return { ok: false, error: "Please provide a valid name" };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Please provide a valid email" };
    }
    if (!subject) {
      return { ok: false, error: "Please select a topic" };
    }
    if (!message || message.length < 10) {
      return { ok: false, error: "Message must be at least 10 characters long" };
    }

    let resumePath: string | null = null;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      // Handle file upload if present
      if (resumeFile && resumeFile.size > 0 && typeof resumeFile.name === "string") {
        try {
          const ext = resumeFile.name.split(".").pop() || "pdf";
          const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const path = `uploads/${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from("resumes")
            .upload(path, resumeFile, {
              contentType: resumeFile.type || "application/octet-stream",
              upsert: false,
            });

          if (!uploadError) {
            resumePath = path;
          }
        } catch (uploadErr) {
          console.warn("Resume upload failed, proceeding with message insert:", uploadErr);
        }
      }

      // Insert record
      const { error: insertError } = await supabase.from("contact_messages").insert({
        name,
        email,
        phone,
        registration_number: registrationNumber,
        university,
        subject,
        message,
        resume_path: resumePath,
        status: "new",
      });

      if (insertError) {
        console.warn("Contact message insert error:", insertError.message);
        return { ok: false, error: insertError.message };
      }

      revalidatePath("/admin/messages");
    }

    return { ok: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to submit message";
    return { ok: false, error: errorMsg };
  }
}

