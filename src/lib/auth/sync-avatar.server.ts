import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Downloads the user's Google / OAuth avatar from user_metadata.avatar_url or .picture,
 * uploads it into the Supabase 'avatars' storage bucket under '<userId>/<uuid>.jpg',
 * and updates public.profiles.avatar_path.
 *
 * Safe to call repeatedly: skips upload if avatar_path is already set.
 */
export async function syncGoogleAvatar(
  supabase: SupabaseClient,
  user: User
): Promise<string | null> {
  const avatarUrl =
    (typeof user.user_metadata?.avatar_url === "string" &&
      user.user_metadata.avatar_url) ||
    (typeof user.user_metadata?.picture === "string" &&
      user.user_metadata.picture) ||
    null;

  if (!avatarUrl) {
    return null;
  }

  try {
    // 1. Check if user already has an avatar_path in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_path")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.avatar_path) {
      return profile.avatar_path;
    }

    // 2. Fetch avatar image bytes from Google
    const res = await fetch(avatarUrl);
    if (!res.ok) {
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Limit to 2 MB (matching storage bucket maxBytes)
    if (buffer.length === 0 || buffer.length > 2 * 1024 * 1024) {
      return null;
    }

    // 3. Upload to avatars bucket: <userId>/<uuid>.jpg
    const fileId = crypto.randomUUID();
    const filePath = `${user.id}/${fileId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return null;
    }

    // 4. Update public.profiles.avatar_path
    await supabase
      .from("profiles")
      .update({ avatar_path: filePath })
      .eq("id", user.id);

    return filePath;
  } catch {
    return null;
  }
}
