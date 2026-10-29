import * as React from "react";
import { roleMeta, type Role } from "@/data/roles";
import type { AppRole } from "@/lib/auth/account";
import { cn } from "@/lib/utils";

export interface RoleBadgeProps {
  role: AppRole | Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const meta = roleMeta[role as Role];

  if (!meta) {
    return (
      <span
        className={cn(
          "inline-flex h-7 items-center rounded-md border border-border bg-muted/10 px-3 text-[13px] font-medium text-muted-foreground leading-none select-none",
          className
        )}
      >
        {role}
      </span>
    );
  }

  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium leading-none select-none",
        meta.tone.border,
        meta.tone.text,
        meta.tone.bg,
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}

