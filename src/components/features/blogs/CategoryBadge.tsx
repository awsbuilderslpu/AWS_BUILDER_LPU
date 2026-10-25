import * as React from "react";
import { cn } from "@/lib/utils";

export interface CategoryBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  tone: "solid" | "orange" | "blue";
  className?: string;
}

export function CategoryBadge({
  children,
  tone,
  className,
  ...props
}: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm font-sans font-medium select-none whitespace-nowrap",
        tone === "solid" &&
          "h-[22px] px-3 bg-primary text-primary-foreground text-xs font-semibold",
        tone === "orange" &&
          "h-[18px] px-2 text-[11.5px] border border-primary/70 text-primary bg-background/60",
        tone === "blue" &&
          "h-[18px] px-2 text-[11.5px] border border-accent/70 text-accent bg-background/60",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
