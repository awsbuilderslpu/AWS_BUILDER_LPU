import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "pending"
  | "success"
  | "danger"
  | "muted"
  | "info"
  | "violet";

export const statusTones: Record<string, StatusTone> = {
  pending: "pending",
  approved: "success",
  active: "success",
  published: "success",
  ongoing: "success",
  rejected: "danger",
  inactive: "danger",
  archived: "muted",
  draft: "muted",
  completed: "muted",
  upcoming: "info",
  scheduled: "violet",
};

const toneClasses: Record<StatusTone, string> = {
  pending: "border-primary/60 text-primary bg-primary/10",
  success: "border-success/60 text-success bg-success/10",
  danger: "border-red-400/60 text-red-400 bg-red-400/10",
  muted: "border-border text-muted-foreground bg-muted/10",
  info: "border-accent/60 text-accent bg-accent/10",
  violet: "border-violet/60 text-violet bg-violet/10",
};

export interface StatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-3 text-[13px] font-medium leading-none select-none",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

