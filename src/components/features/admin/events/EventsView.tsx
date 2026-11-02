"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarClock,
  Radio,
  CircleCheck,
  Plus,
  AlertCircle,
  Inbox,
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
import { notify } from "@/lib/admin/notify";
import { useListState } from "@/lib/admin/use-list-state";
import {
  setEventsStateAction,
  exportEventsAction,
} from "@/lib/events/actions";
import { buildEventCsvColumns } from "@/lib/events/csv-columns";
import { eventsListConfig } from "@/lib/events/list-config";
import type { EventAdminRow } from "@/lib/events/types";
import {
  commonEventActions,
  type EventAction,
} from "@/lib/events/view-logic";
import { labelToTab, tabToLabel } from "@/lib/registrations/view-logic";
import { getEventColumns } from "./eventColumns";
import { EventDrawer } from "./EventDrawer";

export interface EventCounts {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
}

export interface EventsViewProps {
  rows: EventAdminRow[];
  total: number;
  counts: EventCounts | null;
  params: ReturnType<typeof useListState>["params"];
  nowIso: string;
  loadError?: boolean;
  eventCounts?: Record<string, { registered: number; attended: number }>;
  isAdmin?: boolean;
}

type OpenState =
  | { kind: "form"; id: string | null }
  | { kind: "confirm"; action: "archive"; rows: EventAdminRow[] }
  | null;

const TAB_KEYS = ["all", "upcoming", "ongoing", "completed", "archived"] as const;

export function EventsView({
  rows,
  total,
  counts,
  params: _initialParams,
  nowIso,
  loadError = false,
  eventCounts = {},
  isAdmin = false,
}: EventsViewProps) {
  void _initialParams;
  const router = useRouter();
  const copy = adminCopy.events;

  const {
    params,
    queryText,
    setQueryText,
    setTab,
    setFilter,
    setDate,
    setSort,
    setPage,
    setPageSize,
    reset,
    isDefault,
  } = useListState(eventsListConfig);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [openState, setOpenState] = React.useState<OpenState>(null);

  // Clear page selection on any URL / filter change
  const [prevParamsKey, setPrevParamsKey] = React.useState("");
  const paramsKey = `${params.q}|${params.tab}|${params.page}|${params.pageSize}|${params.sort.column}|${params.sort.dir}|${params.filters.category}|${params.filters.publish}|${params.dates.from}|${params.dates.to}`;

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
      upcoming: copy.tabs.upcoming,
      ongoing: copy.tabs.ongoing,
      completed: copy.tabs.completed,
      archived: copy.tabs.archived,
    }),
    [copy.tabs]
  );

  const tabOptions = React.useMemo(
    () => TAB_KEYS.map((k) => tabLabelsMap[k]),
    [tabLabelsMap]
  );

  const activeTabLabel = tabToLabel(
    params.tab ?? "all",
    Array.from(TAB_KEYS),
    tabLabelsMap
  );

  const handleTabChange = (label: string) => {
    const nextTab = labelToTab(label, Array.from(TAB_KEYS), tabLabelsMap);
    setTab(nextTab);
  };

  // FilterBar configuration
  const filters: FilterBarFilter[] = React.useMemo(
    () => [
      {
        key: "category",
        label: copy.filters.category,
        allLabel: copy.filters.allCategories,
        options: [
          { value: "workshop", label: copy.categoryLabels.workshop },
          { value: "hackathon", label: copy.categoryLabels.hackathon },
          { value: "talk", label: copy.categoryLabels.talk },
          { value: "competition", label: copy.categoryLabels.competition },
          { value: "community", label: copy.categoryLabels.community },
        ],
      },
      {
        key: "publish",
        label: copy.filters.publishing,
        allLabel: copy.filters.allPublishing,
        options: [
          { value: "published", label: copy.filters.published },
          { value: "draft", label: copy.filters.draft },
        ],
      },
    ],
    [copy.filters, copy.categoryLabels]
  );

  const selectedRows = React.useMemo(
    () => rows.filter((r) => selectedIds.has(r.id)),
    [rows, selectedIds]
  );

  const bulkActions = React.useMemo(
    () => commonEventActions(selectedRows),
    [selectedRows]
  );

  const handleBulkAction = async (action: EventAction) => {
    if (action === "archive") {
      setOpenState({ kind: "confirm", action: "archive", rows: selectedRows });
      return;
    }

    const ids = selectedRows.map((r) => r.id);
    const res = await setEventsStateAction({ ids, action });

    if (res.ok) {
      notify.success(copy.results.done[action](res.count ?? ids.length));
      handleActionSuccess();
    } else {
      notify.error(copy.results.failedSome(ids.length));
    }
  };

  const handleSingleAction = React.useCallback(
    async (row: EventAdminRow, action: EventAction) => {
      if (action === "archive") {
        setOpenState({ kind: "confirm", action: "archive", rows: [row] });
        return;
      }

      const res = await setEventsStateAction({ ids: [row.id], action });
      if (res.ok) {
        notify.success(copy.results.done[action](1));
        handleActionSuccess();
      } else {
        notify.error(copy.results.failedSome(1));
      }
    },
    [copy.results, handleActionSuccess]
  );

  const handleConfirmArchive = async () => {
    if (openState?.kind !== "confirm" || openState.action !== "archive") return;
    const ids = openState.rows.map((r) => r.id);
    const res = await setEventsStateAction({ ids, action: "archive" });

    if (res.ok) {
      notify.success(copy.results.done.archive(res.count ?? ids.length));
      handleActionSuccess();
    } else {
      notify.error(copy.results.failedSome(ids.length));
    }
  };

  const columns = React.useMemo(
    () =>
      getEventColumns({
        nowIso,
        onEdit: (id) => setOpenState({ kind: "form", id }),
        onAction: handleSingleAction,
        eventCounts,
      }),
    [nowIso, handleSingleAction, eventCounts]
  );

  const csvColumns = React.useMemo(
    () => buildEventCsvColumns(copy.categoryLabels, copy.locationLabels),
    [copy.categoryLabels, copy.locationLabels]
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        title={copy.page.title}
        subtitle={copy.page.subtitle}
        actions={
          <div className="flex items-center gap-3">
            <ExportButton
              filename="events"
              columns={csvColumns}
              getRows={async () => {
                const search =
                  typeof window !== "undefined" ? window.location.search : "";
                const raw = Object.fromEntries(new URLSearchParams(search));
                const res = await exportEventsAction(raw);
                if (!res.ok || !res.rows) {
                  throw new Error(res.error ?? "Export failed");
                }
                if (res.truncated) {
                  notify.info(copy.export.truncated(res.rows.length));
                }
                return res.rows;
              }}
            />
            <Button
              type="button"
              onClick={() => setOpenState({ kind: "form", id: null })}
              className="h-10 gap-2 px-4 text-[13px] font-medium cursor-pointer"
            >
              <Plus className="size-4" />
              <span>{copy.actions.create}</span>
            </Button>
          </div>
        }
      />

      {/* Load error banner */}
      {loadError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300"
        >
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium">{copy.error.title}</p>
            <p className="text-muted-foreground">{copy.error.text}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              React.startTransition(() => {
                router.refresh();
              });
            }}
            className="h-8 px-3 text-xs cursor-pointer"
          >
            {copy.error.retry}
          </Button>
        </div>
      )}

      {/* 2. Status tabs */}
      <FilterChips
        options={tabOptions}
        value={activeTabLabel}
        onChange={handleTabChange}
        variant="solid"
      />

      {/* 3. StatCards */}
      <StatCardRow>
        <StatCard
          label={copy.stats.total}
          value={counts?.total ?? null}
          icon={CalendarDays}
          tone="blue"
          href={copy.statHrefs.total}
        />
        <StatCard
          label={copy.stats.upcoming}
          value={counts?.upcoming ?? null}
          icon={CalendarClock}
          tone="orange"
          href={copy.statHrefs.upcoming}
        />
        <StatCard
          label={copy.stats.ongoing}
          value={counts?.ongoing ?? null}
          icon={Radio}
          tone="green"
          href={copy.statHrefs.ongoing}
        />
        <StatCard
          label={copy.stats.completed}
          value={counts?.completed ?? null}
          icon={CircleCheck}
          tone="violet"
          href={copy.statHrefs.completed}
        />
      </StatCardRow>

      {/* 4. FilterBar */}
      <FilterBar
        searchPlaceholder={copy.filters.search}
        queryText={queryText}
        onQueryTextChange={setQueryText}
        filters={filters}
        filterValues={params.filters}
        onFilterChange={setFilter}
        dateRange={{ fromKey: "from", toKey: "to" }}
        dateValues={params.dates}
        onDateChange={setDate}
        onReset={reset}
        resetDisabled={isDefault}
      />

      {/* 5. BulkBar */}
      <BulkBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
      >
        {bulkActions.map((action) => (
          <Button
            key={action}
            type="button"
            size="sm"
            variant={action === "archive" ? "destructive" : "secondary"}
            onClick={() => handleBulkAction(action)}
            className="h-8 text-xs cursor-pointer"
          >
            {copy.bulk[action]}
          </Button>
        ))}
      </BulkBar>

      {/* 6. DataTable */}
      <DataTable
        caption={copy.table.caption}
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.title}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sort={params.sort}
        onSortChange={setSort}
        onRowClick={(row) => setOpenState({ kind: "form", id: row.id })}
        empty={
          total === 0 && isDefault ? (
            <EmptyState
              icon={Inbox}
              title={copy.empty.noneTitle}
              text={copy.empty.noneText}
              action={
                <Button
                  type="button"
                  onClick={() => setOpenState({ kind: "form", id: null })}
                  className="h-9 px-4 text-xs cursor-pointer"
                >
                  {copy.empty.create}
                </Button>
              }
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
                  className="h-9 px-4 text-xs cursor-pointer"
                >
                  {copy.empty.reset}
                </Button>
              }
            />
          )
        }
      />

      {/* 7. Pagination */}
      <Pagination
        page={params.page}
        pageSize={params.pageSize}
        total={total}
        pageSizes={[10, 25]}
        noun={copy.table.noun}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* 8. Event Drawer */}
      <EventDrawer
        open={openState?.kind === "form"}
        mode={openState?.kind === "form" && openState.id ? "edit" : "create"}
        eventId={openState?.kind === "form" ? openState.id : null}
        nowIso={nowIso}
        isAdmin={isAdmin}
        eventCounts={
          openState?.kind === "form" && openState.id
            ? eventCounts[openState.id] ?? null
            : null
        }
        onClose={() => setOpenState(null)}
        onSaved={handleActionSuccess}
      />

      {/* 9. Archive Confirm Dialog */}
      <ConfirmDialog
        open={openState?.kind === "confirm" && openState.action === "archive"}
        onOpenChange={(open) => !open && setOpenState(null)}
        title={copy.confirm.archiveTitle}
        description={copy.confirm.archiveText}
        confirmLabel={copy.confirm.confirmArchive}
        tone="danger"
        onConfirm={handleConfirmArchive}
      />
    </div>
  );
}
