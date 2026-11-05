"use client";

import * as React from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/formStyles";
import { adminCopy } from "@/data/admin";
import { FilterSelect } from "./FilterSelect";
import { cn } from "@/lib/utils";

export interface FilterBarFilter {
  key: string;
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
}

export interface FilterBarProps {
  searchPlaceholder?: string;
  queryText: string;
  onQueryTextChange: (val: string) => void;
  filters?: FilterBarFilter[];
  filterValues: Record<string, string | null>;
  onFilterChange: (key: string, value: string) => void;
  dateRange?: { fromKey: string; toKey: string };
  dateValues?: Record<string, string | null>;
  onDateChange?: (key: string, value: string) => void;
  onReset: () => void;
  resetDisabled?: boolean;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = adminCopy.kit.searchDefault,
  queryText,
  onQueryTextChange,
  filters,
  filterValues,
  onFilterChange,
  dateRange,
  dateValues,
  onDateChange,
  onReset,
  resetDisabled = false,
  className,
}: FilterBarProps) {
  const fromDate = dateRange ? dateValues?.[dateRange.fromKey] ?? "" : "";
  const toDate = dateRange ? dateValues?.[dateRange.toKey] ?? "" : "";

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-2.5 sm:gap-3",
        className
      )}
    >
      <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[240px] sm:max-w-[480px]">
        <SearchInput
          value={queryText}
          onChange={onQueryTextChange}
          placeholder={searchPlaceholder}
          ariaLabel={searchPlaceholder}
          className="h-11"
        />
      </div>

      {filters?.map((f) => (
        <FilterSelect
          key={f.key}
          id={`filter-${f.key}`}
          label={f.label}
          value={filterValues[f.key] ?? ""}
          options={f.options}
          allLabel={f.allLabel}
          onChange={(val) => onFilterChange(f.key, val)}
        />
      ))}

      {dateRange && (
        <>
          <div className="flex flex-col gap-1 min-w-[130px]">
            <label
              htmlFor="filter-from-date"
              className="text-[12px] text-muted-foreground select-none"
            >
              {adminCopy.kit.from}
            </label>
            <input
              id="filter-from-date"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) =>
                onDateChange?.(dateRange.fromKey, e.target.value)
              }
              className={cn(
                fieldClass,
                "h-11 [color-scheme:dark] cursor-pointer"
              )}
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[130px]">
            <label
              htmlFor="filter-to-date"
              className="text-[12px] text-muted-foreground select-none"
            >
              {adminCopy.kit.to}
            </label>
            <input
              id="filter-to-date"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) =>
                onDateChange?.(dateRange.toKey, e.target.value)
              }
              className={cn(
                fieldClass,
                "h-11 [color-scheme:dark] cursor-pointer"
              )}
            />
          </div>
        </>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={resetDisabled}
        className="h-11 px-5 cursor-pointer font-medium"
      >
        {adminCopy.kit.reset}
      </Button>
    </div>
  );
}

