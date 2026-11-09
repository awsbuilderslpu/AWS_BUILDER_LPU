import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-14 text-center px-4",
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card/60 mb-4 shadow-sm">
        <Icon
          className="size-10 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {text && (
        <p className="mt-1 text-[14px] text-muted-foreground max-w-sm">
          {text}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

