import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DetailRowProps {
  icon?: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailRow({
  icon: Icon,
  label,
  children,
  className,
}: DetailRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,135px)_1fr] items-baseline gap-2.5 py-2 border-b border-border/50 last:border-b-0",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground min-w-0">
        {Icon && (
          <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-[13.5px] text-foreground break-words min-w-0">
        {children}
      </div>
    </div>
  );
}

