import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getCurrentAccount, getAdminAccount } from "@/lib/auth/server";
import {
  type OwnProfile,
  type DirectoryMember,
  type PublicProfile,
  toOwnProfile,
  toDirectoryMember,
  toPublicProfile,
} from "./types";

const OWN_PROFILE_COLUMNS = [
  "id",
  "username",
  "first_name",
  "last_name",
  "email",
  "phone_country_code",
  "phone_number",
  "registration_number",
  "date_of_birth",
  "university",
  "programme",
  "department",
  "study_year",
  "semester",
  "graduation_year",
  "headline",
  "bio",
  "location",
  "aws_builder_url",
  "linkedin_url",
  "github_url",
  "website_url",
  "instagram_url",
  "youtube_url",
  "skills",
  "interests",
  "avatar_path",
  "cover_path",
  "is_public_profile",
  "public_title",
  "terms_accepted_at",
].join(", ");

export async function getOwnProfile(): Promise<OwnProfile | null> {
  try {
    const account = await getCurrentAccount();
    if (!account) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(OWN_PROFILE_COLUMNS)
      .eq("id", account.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return toOwnProfile(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getPublicDirectory(): Promise<DirectoryMember[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase.rpc(
      "public_member_directory" as never
    );
    if (error || !Array.isArray(data)) {
      return [];
    }

    const members = (data as unknown as Array<Record<string, unknown>>).map((item) =>
      toDirectoryMember(item)
    );

    // Resolve avatar URLs for members with storage avatar paths
    const pathsToSign = members
      .map((m) => m.avatarPath)
      .filter((p): p is string => Boolean(p && !p.startsWith("http://") && !p.startsWith("https://")));

    if (pathsToSign.length > 0) {
      try {
        const authClient = await createClient();
        const { data: signedData } = await authClient.storage
          .from("avatars")
          .createSignedUrls(pathsToSign, 3600);

        if (signedData) {
          const urlMap = new Map<string, string>();
          for (const item of signedData) {
            if (item.signedUrl && item.path) {
              urlMap.set(item.path, item.signedUrl);
            }
          }
          for (const m of members) {
            if (m.avatarPath && urlMap.has(m.avatarPath)) {
              m.avatarUrl = urlMap.get(m.avatarPath);
            }
          }
        }
      } catch {
        // Fall back gracefully to existing paths or initials
      }
    }

    return members;
  } catch {
    return [];
  }
}

export async function getOwnMediaUrls(
  avatarPath: string | null | undefined,
  coverPath: string | null | undefined
): Promise<{ avatarUrl: string | null; coverUrl: string | null }> {
  let avatarUrl: string | null = null;
  let coverUrl: string | null = null;

  try {
    const supabase = await createClient();

    if (avatarPath) {
      if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
        avatarUrl = avatarPath;
      } else {
        try {
          const { data, error } = await supabase.storage
            .from("avatars")
            .createSignedUrl(avatarPath, 3600);
          if (!error && data?.signedUrl) {
            avatarUrl = data.signedUrl;
          }
        } catch {
          avatarUrl = null;
        }
      }
    }

    if (coverPath) {
      if (coverPath.startsWith("http://") || coverPath.startsWith("https://")) {
        coverUrl = coverPath;
      } else {
        try {
          const { data, error } = await supabase.storage
            .from("covers")
            .createSignedUrl(coverPath, 3600);
          if (!error && data?.signedUrl) {
            coverUrl = data.signedUrl;
          }
        } catch {
          coverUrl = null;
        }
      }
    }
  } catch {
    return { avatarUrl: null, coverUrl: null };
  }

  return { avatarUrl, coverUrl };
}

export async function getOwnRequestedRole(): Promise<string | null> {
  try {
    const account = await getCurrentAccount();
    if (!account) {
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("registrations")
      .select("requested_role")
      .eq("user_id", account.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return typeof data.requested_role === "string" ? data.requested_role : null;
  } catch {
    return null;
  }
}

export async function getAdminPublicTitle(
  userId: string
): Promise<{ publicTitle: string | null; isPublicProfile: boolean } | null> {
  try {
    const admin = await getAdminAccount();
    if (!admin) {
      return null;
    }

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

export async function getPublicMemberProfile(
  identifier: string
): Promise<{
  profile: PublicProfile | null;
  media: { avatarUrl: string | null; coverUrl: string | null };
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "get_public_member_profile" as never,
      { p_identifier: identifier } as never
    );

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      return { profile: null, media: { avatarUrl: null, coverUrl: null } };
    }

    const row = Array.isArray(data) ? data[0] : data;
    const profile = toPublicProfile(row as unknown as Record<string, unknown>);
    if (!profile) {
      return { profile: null, media: { avatarUrl: null, coverUrl: null } };
    }

    const media = await getOwnMediaUrls(profile.avatarPath, profile.coverPath);
    return { profile, media };
  } catch {
    return { profile: null, media: { avatarUrl: null, coverUrl: null } };
  }
}


