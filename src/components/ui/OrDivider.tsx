import * as React from "react";
import { cn } from "@/lib/utils";

export interface OrDividerProps {
  text?: string;
  className?: string;
}

export function OrDivider({ text = "or", className }: OrDividerProps) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center",
        className
      )}
      role="separator"
    >
      <div className="flex-1 border-t border-border" />
      <span className="px-3 text-[14px] text-muted-foreground">{text}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}
