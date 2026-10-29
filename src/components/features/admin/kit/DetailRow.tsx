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
        "grid grid-cols-[minmax(0,150px)_1fr] items-start gap-3 py-2",
        className
      )}
    >
      <div className="flex items-center gap-2 text-[14px] text-muted-foreground min-w-0">
        {Icon && (
          <Icon className="size-4 shrink-0 text-muted-foreground/80" aria-hidden="true" />
        )}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-[14px] text-white break-words min-w-0">
        {children}
      </div>
    </div>
  );
}

