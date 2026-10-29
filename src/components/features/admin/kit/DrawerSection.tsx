import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerSectionProps {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DrawerSection({
  icon: Icon,
  title,
  action,
  children,
  className,
}: DrawerSectionProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/40 p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className="size-[22px] shrink-0 text-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h4 className="text-[16px] font-semibold text-white tracking-tight truncate">
            {title}
          </h4>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="pt-1">{children}</div>
    </div>
  );
}

