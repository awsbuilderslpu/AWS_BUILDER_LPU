import * as React from "react";
import { cn } from "@/lib/utils";

export interface InlineLabelProps {
  items: string[];
  className?: string;
}

export function InlineLabel({ items, className }: InlineLabelProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "hidden xl:inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-accent pointer-events-none select-none",
        className
      )}
    >
      {items.map((item, idx) => (
        <React.Fragment key={item}>
          <span>{item}</span>
          {idx < items.length - 1 && (
            <span className="text-primary font-bold leading-none">/</span>
          )}
        </React.Fragment>
      ))}
      <span className="h-px w-5 bg-border ml-1 block" />
    </div>
  );
}
