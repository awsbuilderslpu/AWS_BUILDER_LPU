import * as React from "react";
import { cn } from "@/lib/utils";

export interface PlusMarkProps {
  className?: string;
}

export function PlusMark({ className }: PlusMarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn(
        "hidden xl:block size-4 text-accent/70 pointer-events-none select-none shrink-0",
        className
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M8 2v12M2 8h12" strokeLinecap="round" />
    </svg>
  );
}
