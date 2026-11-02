"use client";

import * as React from "react";
import Image from "next/image";
import { Pencil, Image as ImageIcon } from "lucide-react";
import { adminCopy } from "@/data/admin";
import { formatIst } from "@/lib/datetime";
import { publicObjectUrl } from "@/lib/storage/urls";
import { eventLifecycle, registrationOpen } from "@/lib/events/lifecycle";
import { eventActions, type EventAction } from "@/lib/events/view-logic";
import type { EventAdminRow } from "@/lib/events/types";
import { StatusBadge } from "@/components/features/admin/kit/StatusBadge";
import { RowActionsMenu, type RowActionItem } from "@/components/features/admin/kit/RowActionsMenu";
import type { DataColumn } from "@/components/features/admin/kit/DataTable";

export interface EventColumnsOptions {
  nowIso: string;
  onEdit: (id: string) => void;
  onAction: (row: EventAdminRow, action: EventAction) => void;
  eventCounts?: Record<string, { registered: number; attended: number }>;
}

export function getEventColumns({
  nowIso,
  onEdit,
  onAction,
  eventCounts,
}: EventColumnsOptions): DataColumn<EventAdminRow>[] {
  const copy = adminCopy.events;
  const nowMs = Date.parse(nowIso);

  return [
    {
      key: "event",
      header: copy.table.event,
      isRowHeader: true,
      sortKey: "title",
      cell: (row) => {
        const bannerUrl = row.bannerPath
          ? publicObjectUrl("event-banners", row.bannerPath)
          : null;

        return (
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-14 shrink-0 overflow-hidden rounded bg-card/60 border border-border flex items-center justify-center">
              {bannerUrl ? (
                <Image
                  src={bannerUrl}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <ImageIcon
                  className="size-3.5 text-muted-foreground/60"
                  aria-label={copy.table.noBanner}
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
                {copy.categoryLabels[row.category]}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "date",
      header: copy.table.date,
      sortKey: "starts_at",
      cell: (row) => (
        <div className="flex flex-col text-[12.5px] whitespace-nowrap">
          <span className="text-foreground">{formatIst(row.startsAt)}</span>
          <span className="text-[11.5px] text-muted-foreground">
            Ends {formatIst(row.endsAt)}
          </span>
        </div>
      ),
    },
    {
      key: "location",
      header: copy.table.location,
      cell: (row) => (
        <div className="flex flex-col text-[12.5px] max-w-[200px]">
          <span className="font-medium text-foreground">
            {copy.locationLabels[row.locationMode]}
          </span>
          {row.locationMode === "online" ? (
            <span className="text-[11.5px] text-muted-foreground">Online</span>
          ) : (
            <span className="text-[11.5px] text-muted-foreground truncate">
              {row.venue || "—"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: copy.table.status,
      cell: (row) => {
        const lifecycle = eventLifecycle(row, nowMs);
        const tone =
          lifecycle === "upcoming"
            ? "info"
            : lifecycle === "ongoing"
            ? "success"
            : "muted";

        return (
          <StatusBadge tone={tone}>
            {copy.lifecycleLabels[lifecycle]}
          </StatusBadge>
        );
      },
    },
    {
      key: "publishing",
      header: copy.table.publishing,
      cell: (row) => (
        <StatusBadge tone={row.isPublished ? "success" : "muted"}>
          {row.isPublished ? copy.publishLabels.published : copy.publishLabels.draft}
        </StatusBadge>
      ),
    },
    {
      key: "registration",
      header: copy.table.registration,
      cell: (row) => {
        const isOpen = registrationOpen(row, nowMs);
        return (
          <StatusBadge tone={isOpen ? "success" : "muted"}>
            {isOpen ? copy.table.registrationOpen : copy.table.registrationClosed}
          </StatusBadge>
        );
      },
    },
    {
      key: "registered",
      header: copy.table.registered,
      cell: (row) => {
        const counts = eventCounts?.[row.id];
        if (!counts) {
          return <span className="text-muted-foreground">—</span>;
        }

        const registeredLabel =
          row.capacity !== null
            ? `${counts.registered} / ${row.capacity}`
            : `${counts.registered}`;

        return (
          <div className="flex flex-col text-[12.5px] whitespace-nowrap">
            <span className="font-medium text-foreground">{registeredLabel}</span>
            <span className="text-[11.5px] text-muted-foreground">
              {counts.attended} attended
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: copy.table.actions,
      align: "right",
      cell: (row) => {
        const actions = eventActions(row);
        const menuItems: RowActionItem[] = actions.map((act) => ({
          label: copy.actions[act],
          tone: act === "archive" ? "danger" : undefined,
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

