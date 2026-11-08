import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { MemberSocials } from "@/components/features/members/MemberSocials";
import type { Member } from "@/data/members";

export interface MemberCoreCardProps {
  member: Member;
  className?: string;
}

export function MemberCoreCard({ member, className }: MemberCoreCardProps) {
  const profileHref = `/profile/${member.slug}`;

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card/70 transition-colors duration-200 hover:border-primary/40 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:translate-y-[-2px]",
        className
      )}
    >
      {/* Photo area */}
      <Link href={profileHref} className="relative aspect-[3/2] w-full overflow-hidden block">
        {member.image ? (
          <Image
            src={member.image}
            alt=""
            fill
            sizes="(min-width: 1536px) 165px, (min-width: 640px) 33vw, 50vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-primary/25 via-card to-background"
          >
            <Avatar name={member.name} size={64} />
          </div>
        )}

        {/* Role badge */}
        <div className="pointer-events-none select-none absolute left-2.5 top-2 inline-flex h-5 items-center gap-1.5 rounded border border-primary/60 bg-background/70 px-2 backdrop-blur-sm">
          <Crown className="size-3 text-primary" aria-hidden="true" />
          <span className="text-[11px] font-medium text-foreground leading-none">
            {member.badge ?? member.role}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 pt-2">
        <Link href={profileHref}>
          <h3 className="truncate text-sm sm:text-[15px] font-semibold leading-snug text-foreground hover:text-primary transition-colors">
            {member.name}
          </h3>
        </Link>
        <p className="mt-0.5 truncate text-xs sm:text-[13px] leading-tight text-muted-foreground">
          {member.role}
        </p>
        {member.focus && (
          <p className="truncate text-[11px] sm:text-xs text-muted-foreground">
            {member.focus}
          </p>
        )}
        <MemberSocials
          name={member.name}
          socials={member.socials}
          className="mt-auto pt-2"
        />
      </div>
    </article>
  );
}
