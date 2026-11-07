"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaffAccount } from "@/lib/auth/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  AnnouncementItem,
  AnnouncementFormData,
} from "./types";
import { defaultAnnouncements } from "./defaults";

export async function fetchAnnouncementsAction(): Promise<AnnouncementItem[]> {
  if (!isSupabaseConfigured()) {
    return defaultAnnouncements;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Table doesn't exist yet (migration 014 not run)
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.warn("announcements table missing, using defaultAnnouncements");
        return defaultAnnouncements;
      }
      console.warn("fetchAnnouncementsAction error:", error.message);
      return [];
    }

    return (data ?? []) as AnnouncementItem[];
  } catch (err) {
    console.warn("fetchAnnouncementsAction caught:", err);
    return [];
  }
}

export async function fetchPublicNotificationsAction(): Promise<AnnouncementItem[]> {
  if (!isSupabaseConfigured()) {
    return defaultAnnouncements.filter((a) => a.is_published);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return defaultAnnouncements.filter((a) => a.is_published);
      }
      console.warn("fetchPublicNotificationsAction error:", error.message);
      return [];
    }

    return (data ?? []) as AnnouncementItem[];
  } catch (err) {
    console.warn("fetchPublicNotificationsAction caught:", err);
    return [];
  }
}

export async function createAnnouncementAction(
  data: AnnouncementFormData
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "Unauthorized: only staff can create announcements." };
  }

  try {
    const supabase = await createClient();
    const { data: inserted, error } = await supabase
      .from("announcements")
      .insert({
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        href: data.href ? data.href.trim() : null,
        target_audience: data.target_audience,
        priority: data.priority,
        is_published: Boolean(data.is_published),
        created_by: staff.id,
        author_name: staff.displayName || (staff.role === "admin" ? "Admin" : "Staff"),
      })
      .select("id")
      .single();

    if (error) {
      console.error("createAnnouncementAction error:", error);
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/", "layout");
    return { ok: true, id: inserted.id };
  } catch (err: unknown) {
    console.error("createAnnouncementAction caught error:", err);
    return { ok: false, error: "Database error while creating announcement." };
  }
}

export async function updateAnnouncementAction(
  id: string,
  data: Partial<AnnouncementFormData>
): Promise<{ ok: boolean; error?: string }> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "Unauthorized: only staff can update announcements." };
  }

  try {
    const supabase = await createClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined) updatePayload.description = data.description.trim();
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.target_audience !== undefined) updatePayload.target_audience = data.target_audience;
    if (data.is_published !== undefined) updatePayload.is_published = Boolean(data.is_published);
    if ("href" in data) {
      updatePayload.href = data.href ? data.href.trim() : null;
    }

    const { data: updated, error } = await supabase
      .from("announcements")
      .update(updatePayload)
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("updateAnnouncementAction error:", error);
      return { ok: false, error: error.message };
    }

    if (!updated || updated.length === 0) {
      return { ok: false, error: "Announcement not found or permission denied." };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err: unknown) {
    console.error("updateAnnouncementAction caught error:", err);
    return { ok: false, error: "Update failed." };
  }
}

export async function togglePublishAnnouncementAction(
  id: string,
  isPublished: boolean
): Promise<{ ok: boolean; error?: string }> {
  return updateAnnouncementAction(id, { is_published: isPublished });
}

export async function deleteAnnouncementAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "Unauthorized: only staff can delete announcements." };
  }

  try {
    const supabase = await createClient();
    const { data: deleted, error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("deleteAnnouncementAction error:", error);
      return { ok: false, error: error.message };
    }

    if (!deleted || deleted.length === 0) {
      return { ok: false, error: "Announcement not found or permission denied." };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err: unknown) {
    console.error("deleteAnnouncementAction caught error:", err);
    return { ok: false, error: "Delete failed." };
  }
}
