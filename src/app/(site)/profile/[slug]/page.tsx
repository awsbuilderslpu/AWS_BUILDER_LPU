import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getCurrentAccount } from "@/lib/auth/server";
import { getPublicMemberProfile } from "@/lib/profile/queries.server";
import { PublicProfileView } from "@/components/features/profile/PublicProfileView";
import { Users, Lock } from "lucide-react";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const { profile } = await getPublicMemberProfile(slug);

  if (!profile) {
    return {
      title: "Member Profile Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.fullName} | AWS Student Builder Group LPU`;
  const description =
    profile.headline ||
    profile.bio ||
    `Official profile of ${profile.fullName}, AWS Student Builder at Lovely Professional University.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  await connection();
  const { slug } = await params;

  const [account, profileData] = await Promise.all([
    getCurrentAccount(),
    getPublicMemberProfile(slug),
  ]);

  const { profile, media } = profileData;

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-border/80 bg-card/60 p-8 sm:p-10 text-center backdrop-blur-sm shadow-xl">
          <div className="mx-auto size-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
            <Lock className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Profile Unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            This profile does not exist or has been set to private by the member.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/members"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-background hover:bg-primary-hover transition-colors"
            >
              <Users className="size-3.5" />
              <span>Explore Member Directory</span>
            </Link>
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(account && account.id === profile.userId);

  return (
    <PublicProfileView
      profile={profile}
      media={media}
      isOwner={isOwner}
    />
  );
}

