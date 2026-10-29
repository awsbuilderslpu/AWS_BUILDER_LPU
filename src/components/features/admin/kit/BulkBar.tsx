import * as React from "react";
import { adminCopy } from "@/data/admin";
import { cn } from "@/lib/utils";

export interface BulkBarProps {
  count: number;
  onClear: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function BulkBar({ count, onClear, children, className }: BulkBarProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={adminCopy.kit.bulkActions}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 transition-all",
        className
      )}
    >
      <span className="text-[14px] font-semibold text-white">
        {adminCopy.kit.selected(count)}
      </span>

      {children && (
        <div className="flex flex-wrap items-center gap-2.5">{children}</div>
      )}

      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-[13.5px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded cursor-pointer"
      >
        {adminCopy.kit.clearSelection}
      </button>

      <div className="sr-only" aria-live="polite">
        {adminCopy.kit.selected(count)}
      </div>
    </div>
  );
}

