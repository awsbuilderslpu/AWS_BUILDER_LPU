import * as React from "react";
import Image from "next/image";
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
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card/70 transition-colors duration-200 hover:border-primary/40",
        className
      )}
    >
      {/* Photo area */}
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        {member.image ? (
          <Image
            src={member.image}
            alt=""
            fill
            sizes="(min-width: 1536px) 165px, (min-width: 640px) 33vw, 50vw"
            className="object-cover object-top"
          />
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-primary/25 via-card to-background"
          >
            <Avatar name={member.name} size={72} />
          </div>
        )}

        {/* Role badge */}
        <div className="pointer-events-none select-none absolute left-3.5 top-2.5 inline-flex h-5 items-center gap-1.5 rounded border border-primary/60 bg-background/70 px-2 backdrop-blur-sm">
          <Crown className="size-[13px] text-primary" aria-hidden="true" />
          <span className="text-[11.5px] font-medium text-foreground leading-none">
            {member.badge ?? member.role}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-3.5 pb-3 pt-1.5">
        <h3 className="text-base font-semibold leading-5 text-foreground">
          {member.name}
        </h3>
        <p className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground">
          {member.role}
        </p>
        {member.focus && (
          <p className="text-[12.5px] leading-[17px] text-muted-foreground">
            {member.focus}
          </p>
        )}
        <MemberSocials
          name={member.name}
          socials={member.socials}
          className="mt-auto pt-2.5"
        />
      </div>
    </article>
  );
}
