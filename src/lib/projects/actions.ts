"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getStaffAccount } from "@/lib/auth/server";
import { projects as defaultProjects } from "@/data/projects";
import {
  mapDbRowToProject,
  mapProjectToDbPayload,
  type ProjectItem,
  type ProjectFormData,
  type ProjectStatus,
} from "./types";

export async function fetchProjectsAction(): Promise<ProjectItem[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return defaultProjects as ProjectItem[];
    }
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return defaultProjects as ProjectItem[];
    }

    return (data as Record<string, unknown>[]).map(mapDbRowToProject);
  } catch (err) {
    console.warn("fetchProjectsAction: falling back to static projects", err);
    return defaultProjects as ProjectItem[];
  }
}

export async function createProjectAction(
  data: ProjectFormData
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "Unauthorized: Staff permission required" };
  }

  try {
    const supabase = await createClient();
    const payload = mapProjectToDbPayload(data, staff.id);

    const { data: inserted, error } = await supabase
      .from("projects")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("createProjectAction error:", error);
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { ok: true, id: inserted?.id };
  } catch (err: unknown) {
    console.error("createProjectAction caught:", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Database error. Please run migration 016.",
    };
  }
}

export async function updateProjectAction(
  idOrSlug: string,
  data: Partial<ProjectFormData>
): Promise<{ ok: boolean; error?: string }> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "Unauthorized: Staff permission required" };
  }

  try {
    const supabase = await createClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: staff.id,
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.slug !== undefined)
      updatePayload.slug = data.slug.trim().toLowerCase();
    if (data.tagline !== undefined) updatePayload.tagline = data.tagline.trim();
    if (data.description !== undefined)
      updatePayload.description = data.description.trim();
    if (data.category !== undefined) updatePayload.category = data.category.trim();
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.featured !== undefined) updatePayload.featured = Boolean(data.featured);
    if (data.image !== undefined) updatePayload.image = data.image.trim();
    if (data.techStack !== undefined) updatePayload.tech_stack = data.techStack;
    if (data.awsServices !== undefined)
      updatePayload.aws_services = data.awsServices;
    if (data.author !== undefined) updatePayload.author = data.author;
    if (data.team !== undefined) updatePayload.team = data.team;
    if (data.startDate !== undefined) updatePayload.start_date = data.startDate;
    if (data.endDate !== undefined)
      updatePayload.end_date = data.endDate ? data.endDate.trim() : null;
    if (data.date !== undefined) updatePayload.date = data.date.trim();
    if (data.githubUrl !== undefined)
      updatePayload.github_url = data.githubUrl ? data.githubUrl.trim() : null;
    if (data.demoUrl !== undefined)
      updatePayload.demo_url = data.demoUrl ? data.demoUrl.trim() : null;
    if (data.stats !== undefined) updatePayload.stats = data.stats;

    // Check if idOrSlug looks like a UUID
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug
      );

    const query = supabase.from("projects").update(updatePayload);
    const { error } = isUuid
      ? await query.eq("id", idOrSlug)
      : await query.eq("slug", idOrSlug);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update project",
    };
  }
}

export async function toggleFeaturedProjectAction(
  idOrSlug: string,
  featured: boolean
): Promise<{ ok: boolean; error?: string }> {
  return updateProjectAction(idOrSlug, { featured });
}

export async function updateProjectStatusAction(
  idOrSlug: string,
  status: ProjectStatus
): Promise<{ ok: boolean; error?: string }> {
  return updateProjectAction(idOrSlug, { status });
}

export async function deleteProjectAction(
  idOrSlug: string
): Promise<{ ok: boolean; error?: string }> {
  const staff = await getStaffAccount();
  if (!staff) {
    return { ok: false, error: "Unauthorized: Staff permission required" };
  }

  try {
    const supabase = await createClient();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug
      );

    const query = supabase.from("projects").delete();
    const { error } = isUuid
      ? await query.eq("id", idOrSlug)
      : await query.eq("slug", idOrSlug);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete project",
    };
  }
}

