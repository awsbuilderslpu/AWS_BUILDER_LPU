"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaffAccount } from "@/lib/auth/server";
import type {
  AnnouncementItem,
  AnnouncementFormData,
} from "./types";
import { defaultAnnouncements } from "./defaults";

export async function fetchAnnouncementsAction(): Promise<AnnouncementItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("fetchAnnouncementsAction: falling back to defaults", error.message);
      return defaultAnnouncements;
    }

    if (!data || data.length === 0) {
      return defaultAnnouncements;
    }

    return data as AnnouncementItem[];
  } catch (err) {
    console.warn("fetchAnnouncementsAction caught:", err);
    return defaultAnnouncements;
  }
}

export async function fetchPublicNotificationsAction(): Promise<AnnouncementItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return defaultAnnouncements.filter((a) => a.is_published);
    }

    return data as AnnouncementItem[];
  } catch {
    return defaultAnnouncements.filter((a) => a.is_published);
  }
}

export async function createAnnouncementAction(
  data: AnnouncementFormData
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
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
        is_published: data.is_published,
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
    return { ok: false, error: "Database error. Please run migration 014." };
  }
}

export async function updateAnnouncementAction(
  id: string,
  data: Partial<AnnouncementFormData>
): Promise<{ ok: boolean; error?: string }> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("announcements")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err: unknown) {
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
    return { ok: false, error: "forbidden" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Delete failed." };
  }
}
