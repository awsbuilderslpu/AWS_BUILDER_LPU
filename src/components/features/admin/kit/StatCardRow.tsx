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
        "grid gap-3 sm:gap-4 mt-5 sm:mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

