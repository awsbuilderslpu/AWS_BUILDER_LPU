import * as React from "react";
import { Eye, UserCog, UserCheck, UserX, UserMinus, Pencil } from "lucide-react";
import type { DataColumn } from "@/components/features/admin/kit/DataTable";
import { UserCell } from "@/components/features/admin/kit/UserCell";
import { RoleBadge } from "@/components/features/admin/kit/RoleBadge";
import {
  StatusBadge,
  statusTones,
} from "@/components/features/admin/kit/StatusBadge";
import {
  RowActionsMenu,
  type RowActionItem,
} from "@/components/features/admin/kit/RowActionsMenu";
import { adminCopy } from "@/data/admin";
import { departments } from "@/data/registration";
import { departmentLabel, rowNumber } from "@/lib/members/view-logic";
import type { MemberListRow } from "@/lib/members/types";
import { cn } from "@/lib/utils";

export interface MembersColumnsOptions {
  currentUserId: string;
  page: number;
  pageSize: number;
  onViewDetails: (row: MemberListRow) => void;
  onChangeRole: (row: MemberListRow) => void;
  onToggleActive: (row: MemberListRow, active: boolean) => void;
  onRemove: (row: MemberListRow) => void;
  onEditProfile?: (row: MemberListRow) => void;
}

export function getMembersColumns({
  currentUserId,
  page,
  pageSize,
  onViewDetails,
  onChangeRole,
  onToggleActive,
  onRemove,
  onEditProfile,
}: MembersColumnsOptions): DataColumn<MemberListRow>[] {
  const copy = adminCopy.members;

  return [
    {
      key: "row_number",
      header: copy.table.number,
      align: "center",
      className: "w-12 text-muted-foreground",
      cell: (_row, index) => (
        <span className="font-mono text-[13.5px] text-muted-foreground">
          {rowNumber(index, page, pageSize)}
        </span>
      ),
    },
    {
      key: "full_name",
      header: copy.table.name,
      sortKey: "full_name",
      isRowHeader: true,
      cell: (row) => {
        const isSelf = row.userId === currentUserId;
        const name = row.fullName || row.email || "(no name)";
        return (
          <UserCell
            name={name}
            badge={
              isSelf ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-primary/15 text-primary border border-primary/30 shrink-0">
                  {copy.table.you}
                </span>
              ) : undefined
            }
          />
        );
      },
    },
    {
      key: "registration_number",
      header: copy.table.regNo,
      sortKey: "registration_number",
      cell: (row) => (
        <span className="font-mono text-[13.5px] text-foreground">
          {row.registrationNumber || "-"}
        </span>
      ),
    },
    {
      key: "email",
      header: copy.table.email,
      cell: (row) => (
        <span className="text-[14px] text-foreground">
          {row.email || "-"}
        </span>
      ),
    },
    {
      key: "department",
      header: copy.table.department,
      cell: (row) => (
        <span className="text-[14px] text-foreground">
          {departmentLabel(row.department, departments)}
        </span>
      ),
    },
    {
      key: "study_year",
      header: copy.table.year,
      cell: (row) => (
        <span className="text-[14px] text-foreground">
          {row.studyYear || "-"}
        </span>
      ),
    },
    {
      key: "role",
      header: copy.table.role,
      sortKey: "role",
      cell: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: "status",
      header: copy.table.status,
      cell: (row) => (
        <StatusBadge
          tone={statusTones[row.isActive ? "active" : "inactive"] ?? "muted"}
        >
          {row.isActive ? copy.filters.active : copy.filters.inactive}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: copy.table.actions,
      align: "right",
      cell: (row) => {
        const name = row.fullName || row.email || "(no name)";
        const isSelf = row.userId === currentUserId;
        const isAdmin = row.role === "admin" || row.role === "administrator";

        const menuItems: RowActionItem[] = isSelf
          ? [
              {
                label: copy.actions.viewDetails,
                icon: Eye,
                onSelect: () => onViewDetails(row),
              },
              ...(onEditProfile
                ? [
                    {
                      label: "Edit Profile",
                      icon: Pencil,
                      onSelect: () => onEditProfile(row),
                    },
                  ]
                : []),
            ]
          : [
              {
                label: copy.actions.viewDetails,
                icon: Eye,
                onSelect: () => onViewDetails(row),
              },
              ...(onEditProfile
                ? [
                    {
                      label: "Edit Profile",
                      icon: Pencil,
                      onSelect: () => onEditProfile(row),
                    },
                  ]
                : []),
              {
                label: copy.actions.changeRole,
                icon: UserCog,
                onSelect: () => onChangeRole(row),
              },
              {
                label: row.isActive
                  ? copy.actions.deactivate
                  : copy.actions.activate,
                icon: row.isActive ? UserX : UserCheck,
                onSelect: () => onToggleActive(row, !row.isActive),
              },
              {
                label: copy.actions.remove,
                icon: UserMinus,
                tone: "danger",
                disabled: isAdmin,
                title: isAdmin ? copy.removeDialog.demoteFirst : undefined,
                onSelect: () => onRemove(row),
              },
            ];

        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={copy.rowLabels.view(name)}
              onClick={() => onViewDetails(row)}
              className={cn(
                "flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground bg-card/40 transition-colors cursor-pointer",
                "hover:border-primary/50 hover:bg-card/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <Eye className="size-4" aria-hidden="true" />
            </button>

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

