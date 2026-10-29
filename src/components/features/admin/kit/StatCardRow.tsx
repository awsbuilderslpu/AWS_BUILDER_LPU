import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatCardRowProps {
  children: React.ReactNode;
  className?: string;
}

export function StatCardRow({ children, className }: StatCardRowProps) {
  return (
    <div
      className={cn(
        "grid gap-4 mt-6 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]",
        className
      )}
    >
      {children}
    </div>
  );
}

