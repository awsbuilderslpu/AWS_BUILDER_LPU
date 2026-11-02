import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import {
  getOwnProfile,
  getOwnMediaUrls,
  getOwnRequestedRole,
} from "@/lib/profile/queries.server";
import { ProfileView } from "@/components/features/profile/ProfileView";
import { profileCopy } from "@/data/profile";

export const metadata: Metadata = {
  title: profileCopy.myProfile,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const account = await requireUser("/profile");

  const [profile, requestedRole] = await Promise.all([
    getOwnProfile(),
    getOwnRequestedRole(),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-red-400">
            {profileCopy.errors.loadFailed}
          </p>
          <div className="mt-5">
            <Link
              href="/profile"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-background hover:bg-primary-hover transition-colors"
            >
              {profileCopy.errors.retry}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const media = await getOwnMediaUrls(profile.avatarPath, profile.coverPath);

  return (
    <ProfileView
      account={account}
      profile={profile}
      media={media}
      requestedRole={requestedRole}
    />
  );
}
