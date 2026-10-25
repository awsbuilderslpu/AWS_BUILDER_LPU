"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FilterChipsProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  variant?: "outline" | "solid";
  ariaLabel?: string;
  className?: string;
}

export function FilterChips({
  options,
  value,
  onChange,
  variant = "solid",
  ariaLabel = "Filter options",
  className,
}: FilterChipsProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-center gap-2.5 sm:gap-3", className)}
    >
      {options.map((option) => {
        const isActive = option.toLowerCase() === value.toLowerCase();

        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option)}
            className={cn(
              "h-10 px-5 text-sm rounded-lg border transition-all duration-200 cursor-pointer select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
              isActive
                ? variant === "outline"
                  ? "border-primary text-primary bg-primary/10 font-medium shadow-[0_0_12px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
                  : "bg-primary text-background font-semibold border-primary hover:bg-primary-hover"
                : "border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
