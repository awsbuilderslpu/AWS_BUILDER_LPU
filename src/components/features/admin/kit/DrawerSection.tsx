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
        "rounded-xl border border-border bg-muted/30 p-4 space-y-3 transition-colors hover:border-primary/40",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 text-primary shrink-0 border border-primary/20">
            <Icon
              className="size-3.5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <h4 className="text-[15px] font-semibold text-foreground tracking-tight truncate">
            {title}
          </h4>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="pt-0.5">{children}</div>
    </div>
  );
}

