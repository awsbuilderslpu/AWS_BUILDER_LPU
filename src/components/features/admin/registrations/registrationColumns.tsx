import * as React from "react";
import { Check, X, Eye, Archive, RotateCcw, Undo2, type LucideIcon } from "lucide-react";
import type { DataColumn } from "@/components/features/admin/kit/DataTable";
import { UserCell } from "@/components/features/admin/kit/UserCell";
import { RoleBadge } from "@/components/features/admin/kit/RoleBadge";
import { StatusBadge, statusTones } from "@/components/features/admin/kit/StatusBadge";
import { RowActionsMenu, type RowActionItem } from "@/components/features/admin/kit/RowActionsMenu";
import { adminCopy } from "@/data/admin";
import { departments } from "@/data/registration";
import { formatIst } from "@/lib/datetime";
import { programmeLabel } from "@/lib/registrations/labels";
import { allowedActions } from "@/lib/registrations/transitions";
import { rowName } from "@/lib/registrations/view-logic";
import type { RegistrationListRow, ReviewAction } from "@/lib/registrations/types";
import { cn } from "@/lib/utils";

const actionIcons: Record<ReviewAction, LucideIcon> = {
  approve: Check,
  reject: X,
  archive: Archive,
  reopen: RotateCcw,
  restore: Undo2,
};

export interface RegistrationColumnsOptions {
  onApprove: (row: RegistrationListRow) => void;
  onReject: (row: RegistrationListRow) => void;
  onView: (row: RegistrationListRow) => void;
  onAction: (action: ReviewAction, row: RegistrationListRow) => void;
}

export function getRegistrationColumns({
  onApprove,
  onReject,
  onView,
  onAction,
}: RegistrationColumnsOptions): DataColumn<RegistrationListRow>[] {
  const copy = adminCopy.registrations;

  return [
    {
      key: "full_name",
      header: copy.table.columns.name,
      sortKey: "full_name",
      isRowHeader: true,
      cell: (row) => (
        <UserCell
          name={rowName(row)}
          secondary={row.email || undefined}
        />
      ),
    },
    {
      key: "registration_number",
      header: copy.table.columns.registrationNumber,
      sortKey: "registration_number",
      cell: (row) => (
        <span className="font-mono text-[13.5px] text-foreground">
          {row.registrationNumber || "-"}
        </span>
      ),
    },
    {
      key: "programme",
      header: copy.table.columns.programme,
      cell: (row) => (
        <span className="text-[14px] text-foreground">
          {programmeLabel(row.programme, row.department, departments)}
        </span>
      ),
    },
    {
      key: "study_year",
      header: copy.table.columns.year,
      cell: (row) => (
        <span className="text-[14px] text-foreground">
          {row.studyYear || "-"}
        </span>
      ),
    },
    {
      key: "requested_role",
      header: copy.table.columns.requestedRole,
      cell: (row) => <RoleBadge role={row.requestedRole} />,
    },
    {
      key: "status",
      header: copy.table.columns.status,
      sortKey: "status",
      cell: (row) => (
        <StatusBadge tone={statusTones[row.status] ?? "muted"}>
          {copy.statusLabels[row.status] ?? row.status}
        </StatusBadge>
      ),
    },
    {
      key: "applied_at",
      header: copy.table.columns.appliedAt,
      sortKey: "applied_at",
      cell: (row) => (
        <span className="text-[13.5px] text-muted-foreground whitespace-nowrap">
          {formatIst(row.appliedAt, { withTime: false })}
        </span>
      ),
    },
    {
      key: "actions",
      header: copy.table.columns.actions,
      align: "right",
      cell: (row) => {
        const name = rowName(row);
        const isPending = row.status === "pending";
        const actions = allowedActions(row.status);

        const menuItems: RowActionItem[] = [
          {
            label: copy.actions.view,
            icon: Eye,
            onSelect: () => onView(row),
          },
          ...actions.map((act) => ({
            label: copy.actions[act],
            icon: actionIcons[act],
            tone: (act === "reject" || act === "archive" ? "danger" : undefined) as "danger" | undefined,
            onSelect: () => onAction(act, row),
          })),
        ];

        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {isPending ? (
              <>
                <button
                  type="button"
                  aria-label={copy.rowLabels.approve(name)}
                  onClick={() => onApprove(row)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md border border-success/60 text-success bg-success/10 transition-colors cursor-pointer",
                    "hover:bg-success/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
                  )}
                >
                  <Check className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={copy.rowLabels.reject(name)}
                  onClick={() => onReject(row)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md border border-red-400/60 text-red-400 bg-red-400/10 transition-colors cursor-pointer",
                    "hover:bg-red-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  )}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <button
                type="button"
                aria-label={copy.rowLabels.view(name)}
                onClick={() => onView(row)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground bg-card/40 transition-colors cursor-pointer",
                  "hover:border-primary/50 hover:bg-card/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <Eye className="size-4" aria-hidden="true" />
              </button>
            )}

            <RowActionsMenu
              label={copy.rowLabels.menu(name)}
              items={menuItems}
            />
          </div>
        );
      },
    },
  ];
}

