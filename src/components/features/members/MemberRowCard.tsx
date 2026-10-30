import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { MemberSocials } from "@/components/features/members/MemberSocials";
import type { Member } from "@/data/members";

export interface MemberRowCardProps {
  member: Member;
  className?: string;
}

export function MemberRowCard({ member, className }: MemberRowCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full min-w-0 gap-3 rounded-lg border border-border bg-card/60 p-3 transition-colors duration-200 hover:border-primary/40",
        className
      )}
    >
      {/* Left */}
      <Avatar
        name={member.name}
        src={member.image}
        size={58}
        className="shrink-0"
      />

      {/* Right */}
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="truncate text-sm sm:text-[15px] font-semibold leading-snug text-foreground">
          {member.name}
        </h3>
        <p className="mt-0.5 truncate text-xs sm:text-[13px] leading-tight text-muted-foreground">
          {member.role}
        </p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {member.skills.map((skill) => (
            <li
              key={skill}
              className="inline-flex h-5 items-center rounded border border-accent/30 bg-background/60 px-2 text-[10.5px] text-foreground leading-none"
            >
              {skill}
            </li>
          ))}
        </ul>
        <MemberSocials
          name={member.name}
          socials={member.socials}
          className="mt-auto gap-3 pt-2"
        />
      </div>
    </article>
  );
}
