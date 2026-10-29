"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adminCopy } from "@/data/admin";
import { totalPages, getRange, getPageItems } from "@/lib/admin/pagination";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizes?: number[];
  noun: string;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizes = [10, 25, 50],
  noun,
  className,
}: PaginationProps) {
  const totalP = totalPages(total, pageSize);
  const { from, to } = getRange(page, pageSize, total);
  const pageItems = getPageItems(page, totalP);

  return (
    <nav
      aria-label={adminCopy.kit.pagination}
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 pt-5",
        className
      )}
    >
      {/* Left: Showing from to of total */}
      <div className="text-[14px] text-muted-foreground select-none">
        {adminCopy.kit.showing(from, to, total, noun)}
      </div>

      {/* Middle: Page Controls (hidden when 1 or fewer pages) */}
      {totalP > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous page button */}
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={adminCopy.kit.previous}
            className={cn(
              "flex size-10 items-center justify-center rounded-md border border-border bg-card/40 transition-colors",
              page <= 1
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer hover:border-primary/50 hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>

          {/* Page numbers / ellipsis */}
          {pageItems.map((item, idx) => {
            if (typeof item === "number") {
              const isCurrent = item === page;
              return (
                <button
                  key={`page-${item}`}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-label={adminCopy.kit.pageN(item)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-md text-[13.5px] transition-colors cursor-pointer",
                    isCurrent
                      ? "bg-primary font-semibold text-background border border-primary shadow-sm"
                      : "border border-border bg-card/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                >
                  {item}
                </button>
              );
            }

            return (
              <span
                key={`ellipsis-${idx}`}
                aria-hidden="true"
                className="flex size-10 items-center justify-center text-muted-foreground select-none"
              >
                ...
              </span>
            );
          })}

          {/* Next page button */}
          <button
            type="button"
            disabled={page >= totalP}
            onClick={() => onPageChange(page + 1)}
            aria-label={adminCopy.kit.next}
            className={cn(
              "flex size-10 items-center justify-center rounded-md border border-border bg-card/40 transition-colors",
              page >= totalP
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer hover:border-primary/50 hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Right: Page size selector */}
      <div className="flex items-center gap-2">
        <select
          aria-label={adminCopy.kit.rowsPerPage}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-10 rounded-md border border-border bg-card/40 px-3 text-[13px] text-foreground [color-scheme:dark] cursor-pointer hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {adminCopy.kit.perPage(size)}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}

