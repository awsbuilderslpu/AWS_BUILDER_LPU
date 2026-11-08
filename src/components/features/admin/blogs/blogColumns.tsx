"use client";

import * as React from "react";
import Image from "next/image";
import { Pencil, Image as ImageIcon, Star } from "lucide-react";
import { adminCopy } from "@/data/admin";
import { formatIst } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { publicObjectUrl } from "@/lib/storage/urls";
import { blogLifecycle } from "@/lib/blogs/lifecycle";
import {
  blogActions,
  actionLabel,
  featuredToggleAllowed,
  type BlogAction,
} from "@/lib/blogs/view-logic";
import type { BlogAdminRow } from "@/lib/blogs/types";
import { StatusBadge } from "@/components/features/admin/kit/StatusBadge";
import {
  RowActionsMenu,
  type RowActionItem,
} from "@/components/features/admin/kit/RowActionsMenu";
import type { DataColumn } from "@/components/features/admin/kit/DataTable";
import { CategoryBadge } from "@/components/features/blogs/CategoryBadge";
import { Avatar } from "@/components/ui/Avatar";

export interface BlogColumnsOptions {
  nowIso: string;
  onEdit: (id: string) => void;
  onAction: (row: BlogAdminRow, action: BlogAction) => void;
  onFeaturedToggle: (row: BlogAdminRow) => void;
}

export function getBlogColumns({
  nowIso,
  onEdit,
  onAction,
  onFeaturedToggle,
}: BlogColumnsOptions): DataColumn<BlogAdminRow>[] {
  const copy = adminCopy.blogs;
  const nowMs = Date.parse(nowIso);

  return [
    {
      key: "post",
      header: copy.table.post,
      isRowHeader: true,
      sortKey: "title",
      cell: (row) => {
        const imageUrl = row.featuredImagePath
          ? publicObjectUrl("blog-images", row.featuredImagePath)
          : null;

        return (
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-16 shrink-0 overflow-hidden rounded bg-card/60 border border-border flex items-center justify-center">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <ImageIcon
                  className="size-3.5 text-muted-foreground/60"
                  aria-label={copy.table.noImage}
                />
              )}
            </div>
            <div className="flex flex-col min-w-0 max-w-[280px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row.id);
                }}
                className="text-left font-medium text-white hover:text-primary transition-colors truncate cursor-pointer focus-visible:outline-none focus-visible:underline"
              >
                {row.title}
              </button>
              <span className="text-[11.5px] text-muted-foreground truncate">
                {row.excerpt || "—"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "author",
      header: copy.table.author,
      cell: (row) => (
        <div className="flex items-center gap-2 max-w-[180px]">
          <Avatar name={row.authorName} size={28} />
          <span className="text-[12.5px] text-foreground truncate">
            {row.authorName}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: copy.table.category,
      sortKey: "category",
      cell: (row) => (
        <CategoryBadge tone="blue">{row.category}</CategoryBadge>
      ),
    },
    {
      key: "status",
      header: copy.table.status,
      cell: (row) => {
        const lifecycle = blogLifecycle(row, nowMs);
        const tone =
          lifecycle === "published"
            ? "success"
            : lifecycle === "scheduled"
            ? "violet"
            : "muted";

        return (
          <StatusBadge tone={tone}>
            {copy.statusLabels[lifecycle]}
          </StatusBadge>
        );
      },
    },
    {
      key: "publishedOn",
      header: copy.table.publishedOn,
      sortKey: "publish_at",
      cell: (row) => (
        <div className="flex flex-col text-[12.5px] whitespace-nowrap">
          <span className="text-foreground">
            {row.publishAt
              ? formatIst(row.publishAt, { withTime: false })
              : copy.table.noDate}
          </span>
          <span className="text-[11.5px] text-muted-foreground">
            {copy.table.readTime(row.readMinutes)}
          </span>
        </div>
      ),
    },
    {
      key: "featured",
      header: copy.table.featured,
      align: "center",
      cell: (row) => {
        const lifecycle = blogLifecycle(row, nowMs);
        const canFeature = featuredToggleAllowed(lifecycle);

        return (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={!canFeature}
              aria-pressed={row.isFeatured}
              aria-label={
                !canFeature
                  ? copy.table.featureDisabled
                  : row.isFeatured
                  ? copy.table.unfeature(row.title)
                  : copy.table.feature(row.title)
              }
              title={!canFeature ? copy.table.featureDisabled : undefined}
              onClick={() => onFeaturedToggle(row)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md border border-transparent transition-colors",
                canFeature
                  ? "cursor-pointer hover:border-border hover:bg-card/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  : "opacity-40 cursor-not-allowed"
              )}
            >
              <Star
                className={cn(
                  "size-4 transition-colors",
                  row.isFeatured
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/60 hover:text-primary"
                )}
                aria-hidden="true"
              />
            </button>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: copy.table.actions,
      align: "right",
      cell: (row) => {
        const lifecycle = blogLifecycle(row, nowMs);
        const actions = blogActions(lifecycle);
        const menuItems: RowActionItem[] = actions.map((act) => ({
          label: actionLabel(act, lifecycle, copy.actions),
          tone: act === "archive" || act === "delete" ? "danger" : undefined,
          onSelect: () => onAction(row, act),
        }));

        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={copy.table.edit(row.title)}
              onClick={() => onEdit(row.id)}
              className="flex size-9 items-center justify-center rounded-md border border-border bg-card/40 text-foreground transition-colors hover:border-primary/50 hover:bg-card/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background cursor-pointer"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <RowActionsMenu
              label={copy.table.menu(row.title)}
              items={menuItems}
            />
          </div>
        );
      },
    },
  ];
}

