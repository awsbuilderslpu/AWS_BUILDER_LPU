"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Inbox } from "lucide-react";
import { adminCopy } from "@/data/admin";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

export interface DataColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortKey?: string;
  align?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
  isRowHeader?: boolean;
}

export interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  caption: string;
  sort?: { column: string; dir: "asc" | "desc" };
  onSortChange?: (sort: { column: string; dir: "asc" | "desc" }) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (row: T) => void;
  getRowLabel: (row: T) => string;
  loading?: boolean;
  skeletonRows?: number; // default 10
  empty?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  sort,
  onSortChange,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onRowClick,
  getRowLabel,
  loading = false,
  skeletonRows = 10,
  empty,
  className,
}: DataTableProps<T>) {
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);

  const totalCols = (selectable ? 1 : 0) + columns.length;

  // Compute selection state for current page rows
  const selectedOnPageCount = rows.reduce(
    (count, row) => (selectedIds?.has(getRowId(row)) ? count + 1 : count),
    0
  );
  const isAllSelected = rows.length > 0 && selectedOnPageCount === rows.length;
  const isSomeSelected =
    selectedOnPageCount > 0 && selectedOnPageCount < rows.length;

  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const handleHeaderCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (e.target.checked) {
      rows.forEach((r) => next.add(getRowId(r)));
    } else {
      rows.forEach((r) => next.delete(getRowId(r)));
    }
    onSelectionChange(next);
  };

  const handleRowCheckboxChange = (
    rowId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (e.target.checked) {
      next.add(rowId);
    } else {
      next.delete(rowId);
    }
    onSelectionChange(next);
  };

  const handleSortClick = (sortKey: string) => {
    if (!onSortChange) return;
    const isCurrent = sort?.column === sortKey;
    const nextDir: "asc" | "desc" =
      isCurrent && sort?.dir === "asc" ? "desc" : "asc";
    onSortChange({ column: sortKey, dir: nextDir });
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/40 overflow-x-auto",
        className
      )}
    >
      <table
        className="w-full min-w-[880px] border-collapse text-left"
        aria-busy={loading ? "true" : undefined}
      >
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="h-12 border-b border-border bg-card/60 text-[13.5px] font-semibold text-white">
            {selectable && (
              <th
                scope="col"
                className="w-12 px-4 text-center align-middle"
              >
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleHeaderCheckboxChange}
                  aria-label={adminCopy.kit.selectAll}
                  className="size-5 rounded border border-border bg-card/40 accent-primary cursor-pointer hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
                />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sort?.column === col.sortKey;
              const isAsc = isSorted && sort?.dir === "asc";
              const isDesc = isSorted && sort?.dir === "desc";
              const ariaSort = isAsc
                ? "ascending"
                : isDesc
                ? "descending"
                : "none";

              const alignClass =
                col.align === "center"
                  ? "text-center"
                  : col.align === "right"
                  ? "text-right"
                  : "text-left";

              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={col.sortKey && onSortChange ? ariaSort : undefined}
                  className={cn(
                    "px-4 py-3 align-middle text-[13.5px] font-semibold text-white",
                    alignClass,
                    col.headerClassName
                  )}
                >
                  {col.sortKey && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => handleSortClick(col.sortKey!)}
                      aria-label={adminCopy.kit.sortBy(col.header)}
                      className={cn(
                        "inline-flex items-center gap-1.5 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded cursor-pointer",
                        col.align === "right" && "ml-auto",
                        col.align === "center" && "mx-auto"
                      )}
                    >
                      <span>{col.header}</span>
                      {isAsc ? (
                        <ArrowUp
                          className="size-3.5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      ) : isDesc ? (
                        <ArrowDown
                          className="size-3.5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronsUpDown
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-border/60">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr
                key={`skeleton-${i}`}
                aria-hidden="true"
                className="h-14 animate-pulse motion-reduce:animate-none"
              >
                {selectable && (
                  <td className="w-12 px-4 py-3 text-center align-middle">
                    <div className="size-5 mx-auto rounded bg-muted/20" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle">
                    <div className="h-4 w-3/4 rounded bg-muted/20" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={totalCols} className="p-0">
                {empty || (
                  <EmptyState
                    icon={Inbox}
                    title={adminCopy.kit.emptyTitle}
                    text={adminCopy.kit.emptyText}
                  />
                )}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const id = getRowId(row);
              const isSelected = selectedIds?.has(id) ?? false;

              return (
                <tr
                  key={id}
                  onClick={(e) => {
                    if (!onRowClick) return;
                    const target = e.target as HTMLElement | null;
                    if (
                      target?.closest(
                        "button, a, input, select, textarea, [role='checkbox'], [data-ignore-row-click]"
                      )
                    ) {
                      return;
                    }
                    onRowClick(row);
                  }}
                  className={cn(
                    "min-h-[56px] border-b border-border/60 text-[14px] transition-colors",
                    onRowClick && "cursor-pointer",
                    isSelected
                      ? "bg-primary/10 hover:bg-primary/15"
                      : "hover:bg-primary/5"
                  )}
                >
                  {selectable && (
                    <td
                      className="w-12 px-4 py-3 text-center align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowCheckboxChange(id, e)}
                        aria-label={adminCopy.kit.selectRow(getRowLabel(row))}
                        className="size-5 rounded border border-border bg-card/40 accent-primary cursor-pointer hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
                      />
                    </td>
                  )}

                  {columns.map((col) => {
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left";

                    const isRowHeader = col.isRowHeader;
                    const cellContent = col.cell(row);

                    return isRowHeader ? (
                      <th
                        key={col.key}
                        scope="row"
                        className={cn(
                          "px-4 py-3 align-middle text-[14px] font-normal text-foreground",
                          alignClass,
                          col.className
                        )}
                      >
                        {onRowClick ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowClick(row);
                            }}
                            className="text-left font-normal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background rounded cursor-pointer"
                          >
                            {cellContent}
                          </button>
                        ) : (
                          cellContent
                        )}
                      </th>
                    ) : (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 align-middle text-[14px] text-foreground",
                          alignClass,
                          col.className
                        )}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

