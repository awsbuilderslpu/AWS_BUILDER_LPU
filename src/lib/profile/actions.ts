"use server";

import "server-only";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount, getAdminAccount } from "@/lib/auth/server";
import {
  profileFormSchema,
  adminProfileFormSchema,
  type ProfileFormValues,
  type AdminProfileFormValues,
} from "./validate";

export type ProfileErrorCode =
  | "forbidden"
  | "invalid_input"
  | "not_a_member"
  | "update_failed"
  | "failed";

export interface ProfileActionResult {
  ok: boolean;
  error?: ProfileErrorCode;
  title?: string | null;
}

function mapErrorCode(error: unknown): ProfileErrorCode {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const msg = error.message;
    if (msg === "forbidden" || msg.includes("forbidden") || msg === "42501") {
      return "forbidden";
    }
    if (msg === "invalid_input" || msg.includes("invalid_input")) {
      return "invalid_input";
    }
    if (msg === "not_a_member" || msg.includes("not_a_member")) {
      return "not_a_member";
    }
    if (msg === "update_failed" || msg.includes("update_failed")) {
      return "update_failed";
    }
  }
  return "failed";
}

const mediaSchema = z.object({
  kind: z.enum(["avatar", "cover"]),
  path: z.string().nullable(),
});

const memberTitleSchema = z.object({
  userId: z.string().uuid(),
  title: z
    .string()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : null;
    })
    .refine((val) => val === null || (val.length >= 2 && val.length <= 80), {
      message: "invalid_input",
    }),
});

export async function updateOwnProfileAction(
  form: unknown
): Promise<ProfileActionResult> {
  const parseResult = profileFormSchema.safeParse(form);
  if (!parseResult.success) {
    return { ok: false, error: "invalid_input" };
  }

  const account = await getCurrentAccount();
  if (!account) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const supabase = await createClient();
    const values: ProfileFormValues = parseResult.data;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: values.username || null,
        first_name: values.firstName,
        last_name: values.lastName,
        phone_country_code: values.phoneCountryCode,
        phone_number: values.phoneNumber,
        university: values.university,
        programme: values.programme,
        department: values.department,
        study_year: values.studyYear,
        semester: values.semester,
        graduation_year: values.graduationYear,
        headline: values.headline,
        bio: values.bio,
        location: values.location,
        aws_builder_url: values.awsBuilderUrl,
        linkedin_url: values.linkedinUrl,
        github_url: values.githubUrl,
        website_url: values.websiteUrl,
        instagram_url: values.instagramUrl,
        youtube_url: values.youtubeUrl,
        skills: values.skills,
        interests: values.interests,
        is_public_profile: values.isPublicProfile,
      })
      .eq("id", account.id)
      .select("id");

    if (error) {
      return { ok: false, error: mapErrorCode(error) };
    }

    if (!data || data.length === 0) {
      return { ok: false, error: "failed" };
    }

    revalidatePath("/profile");
    revalidatePath(`/profile/${account.id}`);
    revalidatePath("/members");

    return { ok: true };
  } catch (err) {
    return { ok: false, error: mapErrorCode(err) };
  }
}

export async function setOwnMediaAction(input: {
  kind: "avatar" | "cover";
  path: string | null;
}): Promise<ProfileActionResult> {
  const parsed = mediaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const account = await getCurrentAccount();
  if (!account) {
    return { ok: false, error: "forbidden" };
  }

  const { kind, path } = parsed.data;

  if (path !== null) {
    const pathRegex = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(webp|jpg)$/;
    if (!path.startsWith(`${account.id}/`) || !pathRegex.test(path)) {
      return { ok: false, error: "invalid_input" };
    }
  }

  try {
    const supabase = await createClient();
    const columnToUpdate = kind === "avatar" ? "avatar_path" : "cover_path";

    const { data: currentProfile, error: readError } = await supabase
      .from("profiles")
      .select(columnToUpdate)
      .eq("id", account.id)
      .maybeSingle();

    if (readError) {
      return { ok: false, error: mapErrorCode(readError) };
    }

    const previousPath = (currentProfile as Record<string, unknown> | null)?.[
      columnToUpdate
    ] as string | null | undefined;

    const { data: updateData, error: updateError } = await supabase
      .from("profiles")
      .update({ [columnToUpdate]: path })
      .eq("id", account.id)
      .select("id");

    if (updateError) {
      return { ok: false, error: mapErrorCode(updateError) };
    }

    if (!updateData || updateData.length === 0) {
      return { ok: false, error: "failed" };
    }

    if (
      previousPath &&
      previousPath !== path &&
      previousPath.startsWith(`${account.id}/`)
    ) {
      try {
        const bucket = kind === "avatar" ? "avatars" : "covers";
        await supabase.storage.from(bucket).remove([previousPath]);
      } catch {
        // Best effort file cleanup
      }
    }

    revalidatePath("/profile");
    revalidatePath(`/profile/${account.id}`);
    revalidatePath("/members");

    return { ok: true };
  } catch (err) {
    return { ok: false, error: mapErrorCode(err) };
  }
}

export async function setMemberPublicTitleAction(input: {
  userId: string;
  title: string | null;
}): Promise<ProfileActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = memberTitleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "set_member_public_title" as never,
      {
        p_user_id: parsed.data.userId,
        p_title: parsed.data.title,
      } as never
    );

    if (error) {
      return { ok: false, error: mapErrorCode(error) };
    }

    revalidatePath("/members");
    revalidatePath("/admin/members");

    return { ok: true, title: data ?? null };
  } catch (err) {
    return { ok: false, error: mapErrorCode(err) };
  }
}

export async function getAdminPublicTitle(
  userId: string
): Promise<{ publicTitle: string | null; isPublicProfile: boolean } | null> {
  const admin = await getAdminAccount();
  if (!admin) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("public_title, is_public_profile")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      publicTitle: typeof data.public_title === "string" ? data.public_title : null,
      isPublicProfile: Boolean(data.is_public_profile),
    };
  } catch {
    return null;
  }
}

const publicProfileSchema = z.object({
  enabled: z.boolean(),
});

export async function setOwnPublicProfileAction(input: {
  enabled: boolean;
}): Promise<ProfileActionResult> {
  const parsed = publicProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const account = await getCurrentAccount();
  if (!account) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ is_public_profile: parsed.data.enabled })
      .eq("id", account.id)
      .select("id");

    if (error) {
      return { ok: false, error: mapErrorCode(error) };
    }

    if (!data || data.length === 0) {
      return { ok: false, error: "failed" };
    }

    revalidatePath("/profile");
    revalidatePath(`/profile/${account.id}`);
    revalidatePath("/members");

    return { ok: true };
  } catch (err) {
    return { ok: false, error: mapErrorCode(err) };
  }
}

export async function getAdminUserProfile(
  userId: string
): Promise<Record<string, unknown> | null> {
  const admin = await getAdminAccount();
  if (!admin) {
    return null;
  }

  const parsed = z.string().uuid().safeParse(userId);
  if (!parsed.success) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", parsed.data)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function adminUpdateUserProfileAction(
  form: unknown
): Promise<ProfileActionResult> {
  const admin = await getAdminAccount();
  if (!admin) {
    return { ok: false, error: "forbidden" };
  }

  const parseResult = adminProfileFormSchema.safeParse(form);
  if (!parseResult.success) {
    return { ok: false, error: "invalid_input" };
  }

  try {
    const supabase = await createClient();
    const values: AdminProfileFormValues = parseResult.data;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: values.username || null,
        first_name: values.firstName,
        last_name: values.lastName,
        phone_country_code: values.phoneCountryCode || null,
        phone_number: values.phoneNumber || null,
        registration_number: values.registrationNumber || null,
        date_of_birth: values.dateOfBirth || null,
        gender: values.gender || null,
        university: values.university || null,
        programme: values.programme || null,
        department: values.department || null,
        study_year: values.studyYear || null,
        semester: values.semester || null,
        graduation_year: values.graduationYear || null,
        headline: values.headline || null,
        bio: values.bio || null,
        location: values.location || null,
        interests: values.interests || [],
        skills: values.skills || [],
        aws_builder_url: values.awsBuilderUrl || null,
        linkedin_url: values.linkedinUrl || null,
        github_url: values.githubUrl || null,
        website_url: values.websiteUrl || null,
        instagram_url: values.instagramUrl || null,
        youtube_url: values.youtubeUrl || null,
        ...(values.isPublicProfile !== undefined
          ? { is_public_profile: values.isPublicProfile }
          : {}),
        ...(values.publicTitle !== undefined
          ? { public_title: values.publicTitle }
          : {}),
      })
      .eq("id", values.userId)
      .select("id");

    if (error) {
      return { ok: false, error: mapErrorCode(error) };
    }

    if (!data || data.length === 0) {
      return { ok: false, error: "failed" };
    }

    revalidatePath("/admin/registrations");
    revalidatePath("/admin/members");
    revalidatePath("/members");
    revalidatePath("/profile");

    return { ok: true };
  } catch (err) {
    return { ok: false, error: mapErrorCode(err) };
  }
}

