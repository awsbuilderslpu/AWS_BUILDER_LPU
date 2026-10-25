import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionEyebrowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  lines?: "both" | "after" | "none";
  size?: "md" | "sm";
}

export function SectionEyebrow({
  children,
  className,
  lines = "both",
  size = "md",
  ...props
}: SectionEyebrowProps) {
  const showBefore = lines === "both";
  const showAfter = lines === "both" || lines === "after";

  return (
    <div
      className={cn(
        "inline-flex items-center font-mono font-semibold uppercase tracking-[0.22em] text-primary select-none",
        size === "sm"
          ? "text-[10px] sm:text-[11px] gap-2"
          : "text-xs gap-2.5",
        className
      )}
      {...props}
    >
      {showBefore && (
        <span
          aria-hidden="true"
          className={cn("bg-primary shrink-0", size === "sm" ? "h-px w-3.5" : "h-px w-5")}
        />
      )}
      <span>{children}</span>
      {showAfter && (
        <span
          aria-hidden="true"
          className={cn("bg-primary shrink-0", size === "sm" ? "h-px w-3.5" : "h-px w-5")}
        />
      )}
    </div>
  );
}
