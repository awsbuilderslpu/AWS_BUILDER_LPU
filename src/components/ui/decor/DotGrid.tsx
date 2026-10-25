import * as React from "react";
import { cn } from "@/lib/utils";

export interface DotGridProps {
  cols?: number;
  rows?: number;
  gap?: number;
  tone?: "orange" | "muted";
  className?: string;
}

export function DotGrid({
  cols = 6,
  rows = 6,
  gap = 18,
  tone = "muted",
  className,
}: DotGridProps) {
  const total = cols * rows;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "hidden xl:grid pointer-events-none select-none",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, min-content)`,
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-[3px] rounded-full",
            tone === "orange" ? "bg-primary/70" : "bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
