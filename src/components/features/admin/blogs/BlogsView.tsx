"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CircleCheck,
  Pencil,
  CalendarClock,
  Archive,
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
  setBlogsStateAction,
  setFeaturedBlogAction,
  exportBlogsAction,
} from "@/lib/blogs/actions";
import { blogCategories } from "@/lib/blogs/categories";
import { buildBlogCsvColumns } from "@/lib/blogs/csv-columns";
import { blogLifecycle } from "@/lib/blogs/lifecycle";
import { blogsListConfig } from "@/lib/blogs/list-config";
import type { BlogAdminRow } from "@/lib/blogs/types";
import {
  commonBlogActions,
  type BlogAction,
} from "@/lib/blogs/view-logic";
import { labelToTab, tabToLabel } from "@/lib/registrations/view-logic";
import { FaAws } from "react-icons/fa6";
import { getBlogColumns } from "./blogColumns";
import { BlogDrawer } from "./BlogDrawer";
import { ImportAwsArticleDialog } from "./ImportAwsArticleDialog";

export interface BlogCounts {
  total: number;
  published: number;
  scheduled: number;
  drafts: number;
  archived: number;
}

export interface BlogsViewProps {
  rows: BlogAdminRow[];
  total: number;
  counts: BlogCounts | null;
  params: ReturnType<typeof useListState>["params"];
  nowIso: string;
  loadError?: boolean;
}

type OpenState =
  | { kind: "form"; id: string | null }
  | { kind: "confirm"; action: "archive" | "delete"; rows: BlogAdminRow[] }
  | null;

const TAB_KEYS = ["all", "published", "drafts", "scheduled", "archived"] as const;

export function BlogsView({
  rows,
  total,
  counts,
  params: _initialParams,
  nowIso,
  loadError = false,
}: BlogsViewProps) {
  void _initialParams;
  const router = useRouter();
  const copy = adminCopy.blogs;
  const nowMs = Date.parse(nowIso);

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
  } = useListState(blogsListConfig);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [openState, setOpenState] = React.useState<OpenState>(null);
  const [importAwsOpen, setImportAwsOpen] = React.useState(false);

  // Clear page selection on any URL / filter change
  const [prevParamsKey, setPrevParamsKey] = React.useState("");
  const paramsKey = `${params.q}|${params.tab}|${params.page}|${params.pageSize}|${params.sort.column}|${params.sort.dir}|${params.filters.category}|${params.dates.from}|${params.dates.to}`;

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
      published: copy.tabs.published,
      drafts: copy.tabs.drafts,
      scheduled: copy.tabs.scheduled,
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
        options: blogCategories.map((c) => ({
          value: c,
          label: c,
        })),
      },
    ],
    [copy.filters]
  );

  const selectedRows = React.useMemo(
    () => rows.filter((r) => selectedIds.has(r.id)),
    [rows, selectedIds]
  );

  const selectedLifecycles = React.useMemo(
    () => selectedRows.map((r) => blogLifecycle(r, nowMs)),
    [selectedRows, nowMs]
  );

  const bulkActions = React.useMemo(
    () => commonBlogActions(selectedLifecycles),
    [selectedLifecycles]
  );

  const handleBulkAction = async (action: BlogAction) => {
    if (action === "archive" || action === "delete") {
      setOpenState({ kind: "confirm", action, rows: selectedRows });
      return;
    }

    const ids = selectedRows.map((r) => r.id);
    const res = await setBlogsStateAction({ ids, action });

    if (res.ok) {
      notify.success(copy.results.done[action](res.changed ?? ids.length));
      handleActionSuccess();
    } else {
      notify.error(copy.results.failedSome(ids.length));
    }
  };

  const handleSingleAction = React.useCallback(
    async (row: BlogAdminRow, action: BlogAction) => {
      if (action === "archive" || action === "delete") {
        setOpenState({ kind: "confirm", action, rows: [row] });
        return;
      }

      const res = await setBlogsStateAction({ ids: [row.id], action });
      if (res.ok) {
        notify.success(copy.results.done[action](1));
        handleActionSuccess();
      } else {
        notify.error(copy.results.failedSome(1));
      }
    },
    [copy.results, handleActionSuccess]
  );

  const handleToggleFeatured = React.useCallback(
    async (row: BlogAdminRow) => {
      const nextFeatured = !row.isFeatured;
      const res = await setFeaturedBlogAction({ id: row.id, featured: nextFeatured });
      if (res.ok) {
        notify.success(copy.results.featuredDone);
        handleActionSuccess();
      } else {
        notify.error(copy.results.failedSome(1));
      }
    },
    [copy.results, handleActionSuccess]
  );

  const handleConfirmAction = async () => {
    if (openState?.kind !== "confirm") return;
    const { action, rows } = openState;
    const ids = rows.map((r) => r.id);
    const res = await setBlogsStateAction({ ids, action });

    if (res.ok) {
      notify.success(copy.results.done[action](res.changed ?? ids.length));
      handleActionSuccess();
    } else {
      notify.error(copy.results.failedSome(ids.length));
    }
  };

  const columns = React.useMemo(
    () =>
      getBlogColumns({
        nowIso,
        onEdit: (id) => setOpenState({ kind: "form", id }),
        onAction: handleSingleAction,
        onFeaturedToggle: handleToggleFeatured,
      }),
    [nowIso, handleSingleAction, handleToggleFeatured]
  );

  const csvColumns = React.useMemo(
    () => buildBlogCsvColumns(copy.statusLabels, nowMs),
    [copy.statusLabels, nowMs]
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
              filename="blogs"
              columns={csvColumns}
              getRows={async () => {
                const search =
                  typeof window !== "undefined" ? window.location.search : "";
                const raw = Object.fromEntries(new URLSearchParams(search));
                const res = await exportBlogsAction(raw);
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
              variant="outline"
              onClick={() => setImportAwsOpen(true)}
              className="h-10 gap-2 px-3.5 text-[13px] font-medium border-[#FF9900]/40 text-foreground hover:bg-[#FF9900]/10 hover:text-white hover:border-[#FF9900] cursor-pointer"
            >
              <FaAws className="size-4 text-[#FF9900]" />
              <span>Import AWS Article</span>
            </Button>
            <Button
              type="button"
              onClick={() => setOpenState({ kind: "form", id: null })}
              className="h-10 gap-2 px-4 text-[13px] font-medium cursor-pointer"
            >
              <Plus className="size-4" />
              <span>{copy.create}</span>
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
      <StatCardRow className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label={copy.stats.total}
          value={counts?.total ?? null}
          icon={FileText}
          tone="blue"
          href="/admin/blogs"
        />
        <StatCard
          label={copy.stats.published}
          value={counts?.published ?? null}
          icon={CircleCheck}
          tone="green"
          href="?tab=published"
        />
        <StatCard
          label={copy.stats.drafts}
          value={counts?.drafts ?? null}
          icon={Pencil}
          tone="muted"
          href="?tab=drafts"
        />
        <StatCard
          label={copy.stats.scheduled}
          value={counts?.scheduled ?? null}
          icon={CalendarClock}
          tone="violet"
          href="?tab=scheduled"
        />
        <StatCard
          label={copy.stats.archived}
          value={counts?.archived ?? null}
          icon={Archive}
          tone="muted"
          href="?tab=archived"
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
            variant={action === "archive" || action === "delete" ? "destructive" : "secondary"}
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

      {/* 8. Blog Drawer */}
      <BlogDrawer
        open={openState?.kind === "form"}
        mode={openState?.kind === "form" && openState.id ? "edit" : "create"}
        blogId={openState?.kind === "form" ? openState.id : null}
        nowIso={nowIso}
        onClose={() => setOpenState(null)}
        onSaved={handleActionSuccess}
      />

      {/* 9. Confirm Dialog (Archive / Delete) */}
      <ConfirmDialog
        open={openState?.kind === "confirm"}
        onOpenChange={(open) => !open && setOpenState(null)}
        title={
          openState?.kind === "confirm" && openState.action === "delete"
            ? openState.rows.length > 1
              ? copy.confirm.deleteTitleMultiple(openState.rows.length)
              : copy.confirm.deleteTitle
            : copy.confirm.archiveTitle
        }
        description={
          openState?.kind === "confirm" && openState.action === "delete"
            ? openState.rows.length > 1
              ? copy.confirm.deleteTextMultiple(openState.rows.length)
              : copy.confirm.deleteText
            : copy.confirm.archiveText
        }
        confirmLabel={
          openState?.kind === "confirm" && openState.action === "delete"
            ? copy.confirm.confirmDelete
            : copy.confirm.confirmArchive
        }
        tone="danger"
        onConfirm={handleConfirmAction}
      />

      {/* 10. Import from AWS Builder Dialog */}
      <ImportAwsArticleDialog
        open={importAwsOpen}
        onOpenChange={setImportAwsOpen}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}

