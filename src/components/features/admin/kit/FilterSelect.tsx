"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { fieldClass } from "@/components/ui/formStyles";
import { cn } from "@/lib/utils";

export interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  allLabel: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterSelect({
  id,
  label,
  value,
  options,
  allLabel,
  onChange,
  className,
}: FilterSelectProps) {
  return (
    <div className={cn("flex flex-col gap-1 min-w-[140px]", className)}>
      <label
        htmlFor={id}
        className="text-[12px] text-muted-foreground select-none"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            fieldClass,
            "h-11 min-w-[140px] appearance-none pr-9 [color-scheme:dark] cursor-pointer"
          )}
        >
          <option value="">{allLabel}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </div>
  );
}

