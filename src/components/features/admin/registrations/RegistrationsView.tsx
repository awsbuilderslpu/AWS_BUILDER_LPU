"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Clock3,
  CircleCheck,
  CircleX,
  CalendarDays,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/kit/AdminPageHeader";
import { BulkBar } from "@/components/features/admin/kit/BulkBar";
import { ConfirmDialog } from "@/components/features/admin/kit/ConfirmDialog";
import { DataTable } from "@/components/features/admin/kit/DataTable";
import { EmptyState } from "@/components/features/admin/kit/EmptyState";
import { ExportButton } from "@/components/features/admin/kit/ExportButton";
import { FilterBar } from "@/components/features/admin/kit/FilterBar";
import { Pagination } from "@/components/features/admin/kit/Pagination";
import { StatCard } from "@/components/features/admin/kit/StatCard";
import { StatCardRow } from "@/components/features/admin/kit/StatCardRow";
import { FilterChips } from "@/components/ui/FilterChips";
import { Button } from "@/components/ui/button";
import { adminCopy } from "@/data/admin";
import { programmes, yearOptions } from "@/data/registration";
import { notify } from "@/lib/admin/notify";
import { toSearchParams, type ListParams } from "@/lib/admin/list-params";
import { isoToIst } from "@/lib/datetime";
import { exportRegistrationsAction, reviewRegistrationsAction } from "@/lib/registrations/actions";
import { registrationCsvColumns } from "@/lib/registrations/csv-columns";
import { registrationsListConfig } from "@/lib/registrations/list-config";
import type {
  RegistrationListRow,
} from "@/lib/registrations/types";
import {
  commonActions,
  labelToTab,
  rowName,
  summarizeResults,
  tabToLabel,
} from "@/lib/registrations/view-logic";
import { getRegistrationColumns } from "./registrationColumns";
import { RegistrationDrawer } from "./RegistrationDrawer";
import { ReviewDialog } from "./ReviewDialog";
import { AdminEditProfileDialog } from "@/components/features/admin/profile/AdminEditProfileDialog";

export interface RegistrationsCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
}

export interface RegistrationsViewProps {
  rows: RegistrationListRow[];
  total: number;
  counts: RegistrationsCounts | null;
  params: ListParams;
  mailConfigured: boolean;
  loadError?: boolean;
}

type DialogState =
  | {
      kind: "review";
      action: "approve" | "reject";
      rows: RegistrationListRow[];
    }
  | {
      kind: "confirm";
      action: "archive" | "reopen" | "restore";
      rows: RegistrationListRow[];
    }
  | {
      kind: "drawer";
      id: string;
    }
  | null;

const TAB_KEYS = ["all", "pending", "approved", "rejected", "archived"] as const;

export function RegistrationsView({
  rows,
  total,
  counts,
  params,
  mailConfigured,
  loadError = false,
}: RegistrationsViewProps) {
  const router = useRouter();
  const copy = adminCopy.registrations;

  // Selected row IDs for current page
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Search input state
  const [searchQuery, setSearchQuery] = React.useState(params.q);

  // Active dialog state
  const [dialogState, setDialogState] = React.useState<DialogState>(null);
  const [editProfileUser, setEditProfileUser] = React.useState<RegistrationListRow | null>(null);

  // Clear selection on params change
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [
    params.q,
    params.tab,
    params.page,
    params.pageSize,
    params.sort.column,
    params.sort.dir,
    params.filters.programme,
    params.filters.year,
    params.dates.from,
    params.dates.to,
  ]);

  // Sync search input if params.q changes externally
  React.useEffect(() => {
    setSearchQuery(params.q);
  }, [params.q]);

  const updateParams = React.useCallback(
    (updates: Partial<ListParams>) => {
      const merged: ListParams = {
        ...params,
        ...updates,
        filters: { ...params.filters, ...(updates.filters || {}) },
        dates: { ...params.dates, ...(updates.dates || {}) },
      };
      const qs = toSearchParams(merged, registrationsListConfig).toString();
      router.push(`/admin/registrations${qs ? `?${qs}` : ""}`);
    },
    [params, router]
  );

  // Debounced search query update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() !== params.q) {
        updateParams({ q: searchQuery.trim(), page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, params.q, updateParams]);

  // Tab mapping
  const tabLabelsMap = React.useMemo<Record<string, string>>(
    () => ({
      all: copy.tabs.all,
      pending: copy.tabs.pending,
      approved: copy.tabs.approved,
      rejected: copy.tabs.rejected,
      archived: copy.tabs.archived,
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
    updateParams({ tab: newTab === "all" ? null : newTab, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    updateParams({
      q: "",
      filters: { programme: null, year: null },
      dates: { from: null, to: null },
      page: 1,
    });
  };

  // Stat card links
  const todayDateStr = React.useMemo(() => {
    return isoToIst(new Date().toISOString())?.date || "";
  }, []);

  // Columns definition
  const columns = React.useMemo(() => {
    return getRegistrationColumns({
      onApprove: (row) =>
        setDialogState({ kind: "review", action: "approve", rows: [row] }),
      onReject: (row) =>
        setDialogState({ kind: "review", action: "reject", rows: [row] }),
      onView: (row) => setDialogState({ kind: "drawer", id: row.id }),
      onEditProfile: (row) => setEditProfileUser(row),
      onAction: (action, row) => {
        if (action === "approve" || action === "reject") {
          setDialogState({ kind: "review", action, rows: [row] });
        } else {
          setDialogState({ kind: "confirm", action, rows: [row] });
        }
      },
    });
  }, []);

  // Bulk actions computation
  const selectedRows = React.useMemo(() => {
    return rows.filter((r) => selectedIds.has(r.id));
  }, [rows, selectedIds]);

  const bulkAllowedActions = React.useMemo(() => {
    return commonActions(selectedRows.map((r) => r.status));
  }, [selectedRows]);

  // Confirm dialog handlers for archive / reopen / restore
  const handleConfirmAction = async () => {
    if (dialogState?.kind !== "confirm") return;
    const { action, rows: actionRows } = dialogState;
    const ids = actionRows.map((r) => r.id);
    const isBulk = actionRows.length > 1;

    const res = await reviewRegistrationsAction({
      ids,
      action,
      role: undefined,
      note: undefined,
      sendEmail: false,
    });

    if (!res.ok && (!res.results || res.results.length === 0)) {
      const errKey = res.error || "failed";
      notify.error(
        copy.results.errorMessages[
          errKey as keyof typeof copy.results.errorMessages
        ] || copy.results.errorMessages.failed
      );
      return;
    }

    const summary = summarizeResults(res.results || []);

    if (summary.failedCount > 0) {
      const firstErr = summary.errorCodes[0] || "failed";
      const mappedMsg =
        copy.results.errorMessages[
          firstErr as keyof typeof copy.results.errorMessages
        ] || copy.results.errorMessages.failed;

      if (summary.okCount > 0) {
        notify.error(
          `${copy.results.bulkPartial(summary.okCount, summary.failedCount)}: ${mappedMsg}`
        );
      } else {
        notify.error(mappedMsg);
      }
    } else {
      const successMsg = isBulk
        ? copy.results.bulkSuccess(summary.okCount, action)
        : copy.results.singleSuccess(action);
      notify.success(successMsg);
    }

    setSelectedIds(new Set());
    router.refresh();
  };

  // Export data handler
  const handleExportRows = async () => {
    const raw: Record<string, string | undefined> = {};
    if (params.q) raw.q = params.q;
    if (params.tab) raw.tab = params.tab;
    if (params.sort) raw.sort = `${params.sort.column}:${params.sort.dir}`;
    if (params.filters.programme) raw.programme = params.filters.programme;
    if (params.filters.year) raw.year = params.filters.year;
    if (params.dates.from) raw.from = params.dates.from;
    if (params.dates.to) raw.to = params.dates.to;

    const res = await exportRegistrationsAction(raw);
    if (!res.ok || !res.rows) {
      throw new Error("export_failed");
    }
    if (res.truncated) {
      notify.info(copy.export.notice(res.rows.length));
    }
    return res.rows;
  };

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
          text={copy.error.description}
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

  const isResetDisabled =
    !params.q &&
    !params.filters.programme &&
    !params.filters.year &&
    !params.dates.from &&
    !params.dates.to;

  return (
    <div className="space-y-6">
      {/* Page Header with Export */}
      <AdminPageHeader
        title={copy.page.title}
        subtitle={copy.page.subtitle}
        actions={
          <ExportButton
            filename="registrations"
            columns={registrationCsvColumns}
            getRows={handleExportRows}
            disabled={total === 0}
          />
        }
      />

      {/* Tabs */}
      <div>
        <FilterChips
          options={tabOptions}
          value={activeTabLabel}
          onChange={handleTabChange}
          variant="solid"
          ariaLabel={copy.tabsLabel}
        />
      </div>

      {/* Stat Cards Row */}
      <StatCardRow className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label={copy.stats.total}
          value={counts ? counts.total : null}
          icon={Users}
          tone="blue"
          href="/admin/registrations"
        />
        <StatCard
          label={copy.stats.pending}
          value={counts ? counts.pending : null}
          icon={Clock3}
          tone="orange"
          href="/admin/registrations?tab=pending"
        />
        <StatCard
          label={copy.stats.approved}
          value={counts ? counts.approved : null}
          icon={CircleCheck}
          tone="green"
          href="/admin/registrations?tab=approved"
        />
        <StatCard
          label={copy.stats.rejected}
          value={counts ? counts.rejected : null}
          icon={CircleX}
          tone="red"
          href="/admin/registrations?tab=rejected"
        />
        <StatCard
          label={copy.stats.today}
          value={counts ? counts.today : null}
          icon={CalendarDays}
          tone="violet"
          href={
            todayDateStr
              ? `/admin/registrations?from=${todayDateStr}&to=${todayDateStr}`
              : "/admin/registrations"
          }
        />
      </StatCardRow>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder={copy.filters.search}
        queryText={searchQuery}
        onQueryTextChange={setSearchQuery}
        filters={[
          {
            key: "programme",
            label: copy.filters.programme,
            allLabel: copy.filters.all,
            options: programmes.map((p) => ({ value: p, label: p })),
          },
          {
            key: "year",
            label: copy.filters.year,
            allLabel: copy.filters.all,
            options: yearOptions.map((y) => ({ value: y, label: y })),
          },
        ]}
        filterValues={{
          programme: params.filters.programme,
          year: params.filters.year,
        }}
        onFilterChange={(key, val) =>
          updateParams({
            filters: { ...params.filters, [key]: val || null },
            page: 1,
          })
        }
        dateRange={{ fromKey: "from", toKey: "to" }}
        dateValues={{
          from: params.dates.from,
          to: params.dates.to,
        }}
        onDateChange={(key, val) =>
          updateParams({
            dates: { ...params.dates, [key]: val || null },
            page: 1,
          })
        }
        onReset={handleResetFilters}
        resetDisabled={isResetDisabled}
      />

      {/* Bulk Action Bar */}
      <BulkBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
      >
        {bulkAllowedActions.includes("approve") && (
          <Button
            type="button"
            onClick={() =>
              setDialogState({
                kind: "review",
                action: "approve",
                rows: selectedRows,
              })
            }
            className="h-9 px-3.5 bg-success/20 text-success border border-success/40 hover:bg-success/30 font-medium cursor-pointer"
          >
            {copy.actions.approve}
          </Button>
        )}

        {bulkAllowedActions.includes("reject") && (
          <Button
            type="button"
            onClick={() =>
              setDialogState({
                kind: "review",
                action: "reject",
                rows: selectedRows,
              })
            }
            className="h-9 px-3.5 bg-red-400/20 text-red-400 border border-red-400/40 hover:bg-red-400/30 font-medium cursor-pointer"
          >
            {copy.actions.reject}
          </Button>
        )}

        {bulkAllowedActions.includes("archive") && (
          <Button
            type="button"
            onClick={() =>
              setDialogState({
                kind: "confirm",
                action: "archive",
                rows: selectedRows,
              })
            }
            className="h-9 px-3.5 bg-red-400/20 text-red-400 border border-red-400/40 hover:bg-red-400/30 font-medium cursor-pointer"
          >
            {copy.actions.archive}
          </Button>
        )}

        {bulkAllowedActions.includes("reopen") && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setDialogState({
                kind: "confirm",
                action: "reopen",
                rows: selectedRows,
              })
            }
            className="h-9 px-3.5 font-medium cursor-pointer"
          >
            {copy.actions.reopen}
          </Button>
        )}

        {bulkAllowedActions.includes("restore") && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setDialogState({
                kind: "confirm",
                action: "restore",
                rows: selectedRows,
              })
            }
            className="h-9 px-3.5 font-medium cursor-pointer"
          >
            {copy.actions.restore}
          </Button>
        )}
      </BulkBar>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        caption={copy.table.caption}
        sort={params.sort}
        onSortChange={(nextSort) => updateParams({ sort: nextSort, page: 1 })}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => setDialogState({ kind: "drawer", id: row.id })}
        getRowLabel={(r) => rowName(r)}
        empty={
          <EmptyState
            icon={Inbox}
            title={copy.empty.title}
            text={copy.empty.description}
            action={
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="h-10 px-5 font-medium cursor-pointer"
              >
                {copy.empty.clear}
              </Button>
            }
          />
        }
      />

      {/* Pagination */}
      {total > 0 && (
        <Pagination
          page={params.page}
          pageSize={params.pageSize}
          total={total}
          onPageChange={(page) => updateParams({ page })}
          onPageSizeChange={(pageSize) => updateParams({ pageSize, page: 1 })}
          noun={copy.table.nounPlural}
        />
      )}

      {/* Review Dialog (Approve / Reject) */}
      {dialogState?.kind === "review" && (
        <ReviewDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setDialogState(null);
          }}
          action={dialogState.action}
          rows={dialogState.rows}
          mailConfigured={mailConfigured}
          onSuccess={() => setSelectedIds(new Set())}
        />
      )}

      {/* Confirm Dialog (Archive / Reopen / Restore) */}
      {dialogState?.kind === "confirm" && (
        <ConfirmDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setDialogState(null);
          }}
          title={
            dialogState.rows.length > 1
              ? copy.dialog[dialogState.action].titleBulk(dialogState.rows.length)
              : copy.dialog[dialogState.action].title
          }
          description={
            dialogState.rows.length > 1
              ? copy.dialog[dialogState.action].descriptionBulk(
                  dialogState.rows.length
                )
              : copy.dialog[dialogState.action].description
          }
          confirmLabel={
            dialogState.rows.length > 1
              ? copy.dialog[dialogState.action].confirmBulk
              : copy.dialog[dialogState.action].confirm
          }
          tone={dialogState.action === "archive" ? "danger" : "default"}
          onConfirm={handleConfirmAction}
        />
      )}

      {/* Registration Details Drawer */}
      <RegistrationDrawer
        id={dialogState?.kind === "drawer" ? dialogState.id : null}
        open={dialogState?.kind === "drawer"}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
        onAction={(action, row) => {
          if (action === "approve" || action === "reject") {
            setDialogState({ kind: "review", action, rows: [row] });
          } else {
            setDialogState({ kind: "confirm", action, rows: [row] });
          }
        }}
        onNoteUpdated={() => router.refresh()}
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
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
