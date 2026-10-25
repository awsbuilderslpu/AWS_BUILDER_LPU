import * as React from "react";
import { cn } from "@/lib/utils";

export interface StackedLabelProps {
  lines: string[];
  line?: boolean;
  className?: string;
}

export function StackedLabel({
  lines,
  line = false,
  className,
}: StackedLabelProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "hidden xl:flex flex-col font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground pointer-events-none select-none space-y-1",
        className
      )}
    >
      {line && <span className="h-px w-6 bg-border mb-2 block" />}
      {lines.map((text, idx) => {
        const isLast = idx === lines.length - 1;
        if (isLast) {
          return (
            <span key={text} className="text-accent flex items-center">
              <span className="text-primary font-bold mr-1.5 leading-none">/</span>
              {text}
            </span>
          );
        }
        return <span key={text}>{text}</span>;
      })}
    </div>
  );
}
