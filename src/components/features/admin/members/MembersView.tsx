"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Crown,
  UserCheck,
  GraduationCap,
  User,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/kit/AdminPageHeader";
import { BulkBar } from "@/components/features/admin/kit/BulkBar";
import { ConfirmDialog } from "@/components/features/admin/kit/ConfirmDialog";
import { DataTable } from "@/components/features/admin/kit/DataTable";
import { EmptyState } from "@/components/features/admin/kit/EmptyState";
import { ExportButton } from "@/components/features/admin/kit/ExportButton";
import {
  FilterBar,
  type FilterBarFilter,
} from "@/components/features/admin/kit/FilterBar";
import { Pagination } from "@/components/features/admin/kit/Pagination";
import { StatCard } from "@/components/features/admin/kit/StatCard";
import { StatCardRow } from "@/components/features/admin/kit/StatCardRow";
import { FilterChips } from "@/components/ui/FilterChips";
import { Button } from "@/components/ui/button";
import { adminCopy } from "@/data/admin";
import { departments, yearOptions } from "@/data/registration";
import { roleMeta } from "@/data/roles";
import { notify } from "@/lib/admin/notify";
import { useListState } from "@/lib/admin/use-list-state";
import {
  exportMembersAction,
  removeMemberAction,
  setMembersActiveAction,
} from "@/lib/members/actions";
import { buildMemberCsvColumns } from "@/lib/members/csv-columns";
import { membersListConfig } from "@/lib/members/list-config";
import type { AppRole, MemberListRow } from "@/lib/members/types";
import {
  countByReason,
  splitActiveChange,
} from "@/lib/members/view-logic";
import {
  labelToTab,
  summarizeResults,
  tabToLabel,
} from "@/lib/registrations/view-logic";
import { getMembersColumns } from "./membersColumns";
import { ChangeRoleDialog } from "./ChangeRoleDialog";
import { MemberDrawer } from "./MemberDrawer";
import { AdminEditProfileDialog } from "@/components/features/admin/profile/AdminEditProfileDialog";

export interface MemberCounts {
  total: number;
  admin: number;
  core: number;
  member: number;
  student: number;
  participant: number;
}

export interface MembersViewProps {
  rows: MemberListRow[];
  total: number;
  counts: MemberCounts | null;
  params?: ReturnType<typeof useListState>["params"];
  currentUserId: string;
  currentUserRole?: AppRole | null;
  loadError?: boolean;
}

type DialogState =
  | { kind: "role"; rows: MemberListRow[] }
  | { kind: "active"; rows: MemberListRow[]; active: boolean }
  | { kind: "remove"; row: MemberListRow }
  | { kind: "drawer"; userId: string }
  | null;

const TAB_KEYS = [
  "all",
  "admin",
  "core",
  "member",
  "student",
  "participant",
] as const;

export function MembersView({
  rows,
  total,
  counts,
  currentUserId,
  currentUserRole,
  loadError = false,
}: MembersViewProps) {
  const router = useRouter();
  const copy = adminCopy.members;

  const {
    params,
    queryText,
    setQueryText,
    setTab,
    setFilter,
    setSort,
    setPage,
    setPageSize,
    reset,
    isDefault,
  } = useListState(membersListConfig);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [dialogState, setDialogState] = React.useState<DialogState>(null);
  const [editProfileUser, setEditProfileUser] = React.useState<MemberListRow | null>(null);

  // Clear page selection on any URL / filter change
  const [prevParamsKey, setPrevParamsKey] = React.useState("");
  const paramsKey = `${params.q}|${params.tab}|${params.page}|${params.pageSize}|${params.sort.column}|${params.sort.dir}|${params.filters.department}|${params.filters.year}|${params.filters.status}`;

  if (paramsKey !== prevParamsKey) {
    setPrevParamsKey(paramsKey);
    if (selectedIds.size > 0) {
      setSelectedIds(new Set());
    }
  }

  const handleActionSuccess = React.useCallback(() => {
    setSelectedIds(new Set());
    React.startTransition(() => {
      router.refresh();
    });
  }, [router]);

  // Tab mapping
  const tabLabelsMap = React.useMemo<Record<string, string>>(
    () => ({
      all: copy.tabs.all,
      admin: copy.tabs.admin,
      core: copy.tabs.core,
      member: copy.tabs.member,
      student: copy.tabs.student,
      participant: copy.tabs.participant,
    }),
    [copy.tabs]
  );

  const tabOptions = React.useMemo(
    () => TAB_KEYS.map((k) => tabLabelsMap[k]),
    [tabLabelsMap]
  );

  const activeTabLabel = tabToLabel(
    params.tab || "all",
    [...TAB_KEYS],
    tabLabelsMap
  );

  const handleTabChange = (label: string) => {
    const newTab = labelToTab(label, [...TAB_KEYS], tabLabelsMap);
    setTab(newTab);
  };

  // CSV Export columns
  const exportColumns = React.useMemo(() => {
    const roleLabels: Record<AppRole, string> = {
      administrator: roleMeta.administrator.label,
      admin: roleMeta.admin.label,
      core: roleMeta.core.label,
      member: roleMeta.member.label,
      student: roleMeta.student.label,
      participant: roleMeta.participant.label,
    };
    return buildMemberCsvColumns(roleLabels);
  }, []);

  const handleExportRows = async () => {
    const raw: Record<string, string | undefined> = {};
    if (params.q) raw.q = params.q;
    if (params.tab) raw.tab = params.tab;
    if (params.sort) raw.sort = `${params.sort.column}:${params.sort.dir}`;
    if (params.filters.department) raw.department = params.filters.department;
    if (params.filters.year) raw.year = params.filters.year;
    if (params.filters.status) raw.status = params.filters.status;

    const res = await exportMembersAction(raw);
    if (!res.ok || !res.rows) {
      throw new Error(res.error || "export_failed");
    }
    if (res.truncated) {
      notify.info(copy.export.truncated(5000));
    }
    return res.rows;
  };

  // FilterBar configuration
  const filterDefinitions: FilterBarFilter[] = React.useMemo(
    () => [
      {
        key: "department",
        label: copy.filters.department,
        allLabel: copy.filters.allDepartments,
        options: departments.map((d) => ({
          value: d.value,
          label: d.short,
        })),
      },
      {
        key: "year",
        label: copy.filters.year,
        allLabel: copy.filters.allYears,
        options: yearOptions.map((y) => ({
          value: y,
          label: y,
        })),
      },
      {
        key: "status",
        label: copy.filters.status,
        allLabel: copy.filters.allStatuses,
        options: [
          { value: "active", label: copy.filters.active },
          { value: "inactive", label: copy.filters.inactive },
        ],
      },
    ],
    [copy.filters]
  );

  // Table columns
  const columns = React.useMemo(() => {
    return getMembersColumns({
      currentUserId,
      page: params.page,
      pageSize: params.pageSize,
      onViewDetails: (row) =>
        setDialogState({ kind: "drawer", userId: row.userId }),
      onChangeRole: (row) =>
        setDialogState({ kind: "role", rows: [row] }),
      onToggleActive: (row, active) =>
        setDialogState({ kind: "active", rows: [row], active }),
      onRemove: (row) =>
        setDialogState({ kind: "remove", row }),
      onEditProfile: (row) => setEditProfileUser(row),
    });
  }, [currentUserId, params.page, params.pageSize]);

  // Selected rows for bulk operations
  const selectedRows = React.useMemo(() => {
    return rows.filter((r) => selectedIds.has(r.userId));
  }, [rows, selectedIds]);

  if (loadError) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title={copy.page.title}
          subtitle={copy.page.subtitle}
        />
        <EmptyState
          icon={AlertCircle}
          title={copy.error.title}
          text={copy.error.text}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => router.refresh()}
              className="h-10 px-5 font-medium cursor-pointer"
            >
              {copy.error.retry}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Export */}
      <AdminPageHeader
        title={copy.page.title}
        subtitle={copy.page.subtitle}
        actions={
          <ExportButton
            filename="members"
            columns={exportColumns}
            getRows={handleExportRows}
            disabled={total === 0}
          />
        }
      />

      {/* Role Tabs */}
      <div>
        <FilterChips
          options={tabOptions}
          value={activeTabLabel}
          onChange={handleTabChange}
          variant="solid"
          ariaLabel={copy.tabsLabel}
        />
      </div>

      {/* Six Stat Cards */}
      <StatCardRow>
        <StatCard
          label={copy.stats.total}
          value={counts ? counts.total : null}
          icon={Users}
          tone="orange"
          href="/admin/members"
        />
        <StatCard
          label={copy.stats.admin}
          value={counts ? counts.admin : null}
          icon={ShieldCheck}
          tone="red"
          href="/admin/members?tab=admin"
        />
        <StatCard
          label={copy.stats.core}
          value={counts ? counts.core : null}
          icon={Crown}
          tone="blue"
          href="/admin/members?tab=core"
        />
        <StatCard
          label={copy.stats.member}
          value={counts ? counts.member : null}
          icon={UserCheck}
          tone="violet"
          href="/admin/members?tab=member"
        />
        <StatCard
          label={copy.stats.student}
          value={counts ? counts.student : null}
          icon={GraduationCap}
          tone="green"
          href="/admin/members?tab=student"
        />
        <StatCard
          label={copy.stats.participant}
          value={counts ? counts.participant : null}
          icon={User}
          tone="muted"
          href="/admin/members?tab=participant"
        />
      </StatCardRow>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder={copy.filters.search}
        queryText={queryText}
        onQueryTextChange={setQueryText}
        filters={filterDefinitions}
        filterValues={params.filters}
        onFilterChange={(key, val) => setFilter(key, val || null)}
        onReset={reset}
        resetDisabled={isDefault}
      />

      {/* Bulk Action Bar */}
      <BulkBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            setDialogState({ kind: "role", rows: selectedRows })
          }
          className="h-9 px-3.5 text-[13px] font-medium cursor-pointer"
        >
          {copy.bulk.changeRole}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            setDialogState({
              kind: "active",
              rows: selectedRows,
              active: true,
            })
          }
          className="h-9 px-3.5 text-[13px] font-medium cursor-pointer"
        >
          {copy.bulk.activate}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            setDialogState({
              kind: "active",
              rows: selectedRows,
              active: false,
            })
          }
          className="h-9 px-3.5 text-[13px] font-medium cursor-pointer"
        >
          {copy.bulk.deactivate}
        </Button>
      </BulkBar>

      {/* Members Data Table */}
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.userId}
        getRowLabel={(r) => r.fullName || r.email || "(no name)"}
        caption={copy.table.caption}
        sort={params.sort}
        onSortChange={setSort}
        selectable
        isRowSelectable={(r) => r.userId !== currentUserId}
        getSelectDisabledReason={(r) =>
          r.userId === currentUserId ? copy.table.selectDisabled : undefined
        }
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) =>
          setDialogState({ kind: "drawer", userId: row.userId })
        }
        empty={
          isDefault ? (
            <EmptyState
              icon={Inbox}
              title={copy.empty.noneTitle}
              text={copy.empty.noneText}
            />
          ) : (
            <EmptyState
              icon={Inbox}
              title={copy.empty.filteredTitle}
              text={copy.empty.filteredText}
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  className="h-10 px-5 font-medium cursor-pointer"
                >
                  {copy.empty.reset}
                </Button>
              }
            />
          )
        }
      />

      {/* Pagination */}
      {total > 0 && (
        <Pagination
          page={params.page}
          pageSize={params.pageSize}
          total={total}
          noun={copy.table.noun}
          pageSizes={[10, 25, 50]}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        open={dialogState?.kind === "role"}
        onOpenChange={(open) => !open && setDialogState(null)}
        rows={dialogState?.kind === "role" ? dialogState.rows : []}
        actorId={currentUserId}
        actorRole={currentUserRole}
        onDone={handleActionSuccess}
      />

      {/* Set Active / Inactive Confirm Dialog */}
      <ConfirmDialog
        open={dialogState?.kind === "active"}
        onOpenChange={(open) => !open && setDialogState(null)}
        title={
          dialogState?.kind === "active"
            ? dialogState.active
              ? copy.activeDialog.activateTitle(dialogState.rows.length)
              : copy.activeDialog.deactivateTitle(dialogState.rows.length)
            : ""
        }
        description={
          dialogState?.kind === "active"
            ? dialogState.active
              ? copy.activeDialog.activateText
              : copy.activeDialog.deactivateText
            : ""
        }
        confirmLabel={
          dialogState?.kind === "active"
            ? dialogState.active
              ? copy.activeDialog.confirmActivate
              : copy.activeDialog.confirmDeactivate
            : ""
        }
        onConfirm={async () => {
          if (dialogState?.kind !== "active") return;
          const { rows: targetRows, active } = dialogState;
          const targets = targetRows.map((r) => ({
            userId: r.userId,
            role: r.role,
            isActive: r.isActive,
            registrationStatus: r.registrationStatus,
          }));

          const { applicable, skipped } = splitActiveChange(
            targets,
            active,
            currentUserId
          );
          const applicableIds = applicable.map((t) => t.userId);
          const skippedCounts = countByReason(skipped);

          if (applicableIds.length === 0) {
            Object.entries(skippedCounts).forEach(([reason, count]) => {
              const reasonText =
                copy.results.reasons[
                  reason as keyof typeof copy.results.reasons
                ] || reason;
              notify.info(copy.roleDialog.skipped(count, reasonText));
            });
            return;
          }

          const res = await setMembersActiveAction({
            ids: applicableIds,
            active,
          });

          if (!res.ok && (!res.results || res.results.length === 0)) {
            const errKey = res.error || "failed";
            notify.error(
              copy.errors[errKey as keyof typeof copy.errors] ||
                copy.errors.failed
            );
            return;
          }

          const summary = summarizeResults(res.results || []);
          if (summary.okCount > 0) {
            notify.success(copy.results.activeChanged(summary.okCount, active));
          }
          if (summary.failedCount > 0) {
            notify.error(copy.results.failedSome(summary.failedCount));
          }

          Object.entries(skippedCounts).forEach(([reason, count]) => {
            const reasonText =
              copy.results.reasons[
                reason as keyof typeof copy.results.reasons
              ] || reason;
            notify.info(copy.roleDialog.skipped(count, reasonText));
          });

          handleActionSuccess();
        }}
      />

      {/* Remove Member Confirm Dialog */}
      <ConfirmDialog
        open={dialogState?.kind === "remove"}
        onOpenChange={(open) => !open && setDialogState(null)}
        title={copy.removeDialog.title}
        description={copy.removeDialog.text}
        confirmLabel={copy.removeDialog.confirm}
        tone="danger"
        onConfirm={async () => {
          if (dialogState?.kind !== "remove") return;
          const res = await removeMemberAction({ id: dialogState.row.userId });
          if (!res.ok) {
            const errKey = res.error || "failed";
            notify.error(
              copy.errors[errKey as keyof typeof copy.errors] ||
                copy.errors.failed
            );
            return;
          }
          notify.success(copy.results.removed);
          handleActionSuccess();
        }}
      />

      {/* Member Details Drawer */}
      <MemberDrawer
        userId={dialogState?.kind === "drawer" ? dialogState.userId : null}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onClose={() => setDialogState(null)}
        onChanged={handleActionSuccess}
      />

      {/* Edit Profile Dialog */}
      <AdminEditProfileDialog
        open={Boolean(editProfileUser)}
        onOpenChange={(open) => {
          if (!open) setEditProfileUser(null);
        }}
        userId={editProfileUser?.userId ?? null}
        initialData={
          editProfileUser
            ? {
                firstName: editProfileUser.firstName || "",
                lastName: editProfileUser.lastName || "",
                registrationNumber: editProfileUser.registrationNumber || "",
                programme: editProfileUser.programme || "",
                department: editProfileUser.department || "",
                studyYear: editProfileUser.studyYear || "",
              }
            : null
        }
        onSaved={handleActionSuccess}
      />
    </div>
  );
}
