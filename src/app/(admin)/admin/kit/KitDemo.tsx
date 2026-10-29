"use client";

import * as React from "react";
import {
  Users,
  UserCheck,
  Clock,
  GraduationCap,
  ShieldAlert,
  Archive,
  Plus,
  Mail,
  BookOpen,
  Calendar,
  Hash,
  Shield,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/FilterChips";
import {
  AdminPageHeader,
  ExportButton,
  StatCard,
  StatCardRow,
  StatusBadge,
  RoleBadge,
  UserCell,
  FilterBar,
  DataTable,
  Pagination,
  BulkBar,
  DetailDrawer,
  DrawerSection,
  DetailRow,
  RowActionsMenu,
  ConfirmDialog,
  statusTones,
  type DataColumn,
} from "@/components/features/admin/kit";
import { useListState } from "@/lib/admin/use-list-state";
import { type ListConfig } from "@/lib/admin/list-params";
import { type CsvColumn } from "@/lib/admin/csv";
import { notify } from "@/lib/admin/notify";
import { demoItems, type DemoItem } from "@/lib/admin/demo-data";
import {
  ImageUpload,
  DateTimeField,
  DateField,
  TimeField,
} from "@/components/features/admin/forms";
import { formatIst } from "@/lib/datetime";

const listConfig: ListConfig = {
  tabs: ["all", "pending", "approved", "rejected", "archived"],
  filters: {
    role: ["admin", "core", "member", "student", "participant"],
    year: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
  },
  dateKeys: ["from", "to"],
  sorts: ["name:asc", "name:desc", "appliedOn:asc", "appliedOn:desc"],
  defaultSort: "appliedOn:desc",
  pageSizes: [10, 25, 50],
};

const exportColumns: CsvColumn<DemoItem>[] = [
  { header: "Name", value: (r) => r.name },
  { header: "Email", value: (r) => r.email },
  { header: "Status", value: (r) => r.status },
  { header: "Role", value: (r) => r.role },
];

export function KitDemo() {
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
  } = useListState(listConfig);

  // Demo controls state
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [drawerRow, setDrawerRow] = React.useState<DemoItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DemoItem | null>(null);
  const [bulkRejectOpen, setBulkRejectOpen] = React.useState(false);
  const [forceLoading, setForceLoading] = React.useState(false);
  const [forceEmpty, setForceEmpty] = React.useState(false);

  // Form tools demo state
  const [featuredImage, setFeaturedImage] = React.useState<string | null>(null);
  const [avatarImage, setAvatarImage] = React.useState<string | null>(null);
  const [eventStart, setEventStart] = React.useState<string | null>(null);
  const [demoDate, setDemoDate] = React.useState<string>("");
  const [demoTime, setDemoTime] = React.useState<string>("");

  // Clear selection whenever tab, search, filters, or page change
  // Uses React's recommended render-phase state adjustment pattern
  const filterKey = `${params.tab}:${params.q}:${params.page}:${params.pageSize}:${JSON.stringify(params.filters)}:${JSON.stringify(params.dates)}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setSelectedIds(new Set());
  }

  // Client-side filtering and sorting for the demo data
  const filteredRows = React.useMemo(() => {
    if (forceEmpty) return [];

    let rows = [...demoItems];

    // Tab filter
    if (params.tab && params.tab !== "all") {
      rows = rows.filter((r) => r.status === params.tab);
    }

    // Search query
    if (params.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.regNo.toLowerCase().includes(q)
      );
    }

    // Filters
    if (params.filters.role) {
      rows = rows.filter((r) => r.role === params.filters.role);
    }
    if (params.filters.year) {
      rows = rows.filter((r) => r.year === params.filters.year);
    }

    // Dates
    if (params.dates.from) {
      rows = rows.filter((r) => r.appliedOn >= params.dates.from!);
    }
    if (params.dates.to) {
      rows = rows.filter((r) => r.appliedOn <= params.dates.to!);
    }

    // Sort
    const col = params.sort.column;
    const dir = params.sort.dir;
    rows.sort((a, b) => {
      let cmp = 0;
      if (col === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (col === "appliedOn") {
        cmp = a.appliedOn.localeCompare(b.appliedOn);
      }
      return dir === "desc" ? -cmp : cmp;
    });

    return rows;
  }, [params, forceEmpty]);

  // Pagination slice
  const total = filteredRows.length;
  const pagedRows = React.useMemo(() => {
    const start = (params.page - 1) * params.pageSize;
    return filteredRows.slice(start, start + params.pageSize);
  }, [filteredRows, params.page, params.pageSize]);

  // Data table columns
  const columns: DataColumn<DemoItem>[] = [
    {
      key: "name",
      header: "Name",
      sortKey: "name",
      isRowHeader: true,
      cell: (row) => <UserCell name={row.name} secondary={row.email} />,
    },
    {
      key: "regNo",
      header: "Reg No",
      cell: (row) => (
        <span className="font-mono text-[13px] text-muted-foreground">
          {row.regNo}
        </span>
      ),
    },
    {
      key: "programme",
      header: "Programme",
      cell: (row) => <span>{row.programme}</span>,
    },
    {
      key: "year",
      header: "Year",
      cell: (row) => (
        <span className="text-muted-foreground">{row.year}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={statusTones[row.status]}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </StatusBadge>
      ),
    },
    {
      key: "appliedOn",
      header: "Applied on",
      sortKey: "appliedOn",
      cell: (row) => (
        <span className="text-muted-foreground text-[13px]">
          {row.appliedOn}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => (
        <RowActionsMenu
          label={`Actions for ${row.name}`}
          items={[
            {
              label: "Edit",
              onSelect: () => notify.info(`Edit action triggered for ${row.name}`),
            },
            {
              label: "Remove",
              tone: "danger",
              onSelect: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <AdminPageHeader
        title="Admin kit demo"
        subtitle="Shared kit components preview with local mock data."
        actions={
          <>
            <ExportButton
              filename="demo-students"
              columns={exportColumns}
              getRows={() => filteredRows}
            />
            <Button
              type="button"
              onClick={() => notify.success("Added new demo item successfully.")}
              className="h-11 px-5 cursor-pointer bg-primary text-background hover:bg-primary-hover font-semibold"
            >
              <Plus className="size-4 shrink-0 mr-1.5" aria-hidden="true" />
              <span>+ Add demo item</span>
            </Button>
          </>
        }
      />

      {/* 2. Notice Card */}
      <div className="flex items-center gap-3 rounded-lg border border-red-400/60 bg-red-400/10 px-4 py-3 text-sm text-red-400">
        <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
        <span>
          Demo data. This page exists only in development and is deleted before launch.
        </span>
      </div>

      {/* 3. Stat Cards with 6 Tones */}
      <StatCardRow>
        <StatCard
          label="Total registrations"
          value={43}
          icon={Users}
          tone="blue"
          hint="All time"
        />
        <StatCard
          label="Approved members"
          value={18}
          icon={UserCheck}
          tone="green"
          hint="Active contributors"
        />
        <StatCard
          label="Pending review"
          value={12}
          icon={Clock}
          tone="orange"
          hint="Awaiting decision"
        />
        <StatCard
          label="Students"
          value={28}
          icon={GraduationCap}
          tone="violet"
          hint="Undergraduates"
        />
        <StatCard
          label="Rejected"
          value={8}
          icon={ShieldAlert}
          tone="red"
          hint="Ineligible"
        />
        <StatCard
          label="Archived"
          value={5}
          icon={Archive}
          tone="muted"
          hint="Past cohorts"
        />
      </StatCardRow>

      {/* Demo State Toggles */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setForceLoading((v) => !v)}
          className="h-8 text-xs cursor-pointer border-border bg-card/40"
        >
          {forceLoading ? "Loading: ON" : "Show loading"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setForceEmpty((v) => !v)}
          className="h-8 text-xs cursor-pointer border-border bg-card/40"
        >
          {forceEmpty ? "Empty state: ON" : "Show empty state"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => notify.info("Test notification from kit demo.")}
          className="h-8 text-xs cursor-pointer border-border bg-card/40"
        >
          Fire a toast
        </Button>
      </div>

      {/* 4. Status Tabs */}
      <FilterChips
        options={["All", "Pending", "Approved", "Rejected", "Archived"]}
        value={
          params.tab
            ? params.tab.charAt(0).toUpperCase() + params.tab.slice(1)
            : "All"
        }
        onChange={(val) => setTab(val.toLowerCase())}
        variant="solid"
      />

      {/* 5. Filter Bar */}
      <FilterBar
        queryText={queryText}
        onQueryTextChange={setQueryText}
        filters={[
          {
            key: "role",
            label: "Role",
            allLabel: "All roles",
            options: [
              { value: "admin", label: "Admin" },
              { value: "core", label: "Core Team" },
              { value: "member", label: "Member" },
              { value: "student", label: "Student" },
              { value: "participant", label: "Participant" },
            ],
          },
          {
            key: "year",
            label: "Year",
            allLabel: "All years",
            options: [
              { value: "1st Year", label: "1st Year" },
              { value: "2nd Year", label: "2nd Year" },
              { value: "3rd Year", label: "3rd Year" },
              { value: "4th Year", label: "4th Year" },
            ],
          },
        ]}
        filterValues={params.filters}
        onFilterChange={setFilter}
        dateRange={{ fromKey: "from", toKey: "to" }}
        dateValues={params.dates}
        onDateChange={setDate}
        onReset={reset}
        resetDisabled={isDefault}
      />

      {/* 6. Bulk Action Bar */}
      <BulkBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())}>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            notify.success(`Approved ${selectedIds.size} selected students.`)
          }
          className="h-9 px-4 cursor-pointer bg-primary text-background hover:bg-primary-hover font-semibold text-xs"
        >
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setBulkRejectOpen(true)}
          className="h-9 px-4 cursor-pointer border-red-400/60 text-red-400 hover:bg-red-400/10 text-xs font-medium"
        >
          Reject
        </Button>
      </BulkBar>

      {/* 7. Data Table */}
      <DataTable
        columns={columns}
        rows={pagedRows}
        getRowId={(r) => r.id}
        caption="Demo students table"
        sort={params.sort}
        onSortChange={setSort}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(r) => setDrawerRow(r)}
        getRowLabel={(r) => r.name}
        loading={forceLoading}
      />

      {/* 8. Pagination */}
      <Pagination
        page={params.page}
        pageSize={params.pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        noun="students"
      />

      {/* 9. Form Tools Section */}
      <section className="rounded-lg border border-border bg-card/40 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Form tools</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Image uploads here are real files in your Supabase Storage; delete the demo files afterwards.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Featured Image Upload (Public bucket) */}
          <div className="space-y-2">
            <ImageUpload
              id="demo-featured-image"
              label="Featured image"
              bucket="blog-images"
              value={featuredImage}
              onChange={setFeaturedImage}
              aspect={1200 / 630}
              recommended="1200 x 630"
            />
            <p className="text-xs text-muted-foreground">
              Stored path: <code>{featuredImage ?? "none"}</code>
            </p>
          </div>

          {/* Profile Photo Upload (Private bucket, avatar circle) */}
          <div className="space-y-2">
            <ImageUpload
              id="demo-profile-photo"
              label="Profile photo"
              bucket="avatars"
              value={avatarImage}
              onChange={setAvatarImage}
              previewShape="circle"
              aspect={1}
            />
            <p className="text-xs text-muted-foreground">
              Stored path: <code>{avatarImage ?? "none"}</code>
            </p>
          </div>
        </div>

        {/* Date and Time Fields */}
        <div className="border-t border-border/60 pt-6 space-y-6">
          <div className="space-y-2 max-w-xl">
            <DateTimeField
              id="demo-event-start"
              label="Event start"
              value={eventStart}
              onChange={setEventStart}
            />
            <div className="space-y-0.5 text-xs text-muted-foreground">
              <p>UTC value: {eventStart ?? "none"}</p>
              <p>Shown to visitors: {eventStart ? formatIst(eventStart) : "none"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
            <DateField
              id="demo-date-field"
              label="Date"
              value={demoDate}
              onChange={setDemoDate}
            />
            <TimeField
              id="demo-time-field"
              label="Time"
              value={demoTime}
              onChange={setDemoTime}
            />
          </div>
        </div>
      </section>

      {/* 10. Detail Drawer */}
      <DetailDrawer
        open={Boolean(drawerRow)}
        onOpenChange={(open) => !open && setDrawerRow(null)}
        title={drawerRow?.name || "Student details"}
        description="Detailed record for student"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerRow(null)}
              className="h-11 px-5 cursor-pointer font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                notify.success(`Saved changes for ${drawerRow?.name}.`);
                setDrawerRow(null);
              }}
              className="h-11 px-5 cursor-pointer bg-primary text-background hover:bg-primary-hover font-semibold"
            >
              Save
            </Button>
          </>
        }
      >
        {drawerRow && (
          <>
            <DrawerSection icon={UserCheck} title="Personal Information">
              <DetailRow icon={Mail} label="Email">
                {drawerRow.email}
              </DetailRow>
              <DetailRow icon={Hash} label="Reg Number">
                <span className="font-mono">{drawerRow.regNo}</span>
              </DetailRow>
              <DetailRow icon={BookOpen} label="Programme">
                {drawerRow.programme}
              </DetailRow>
              <DetailRow icon={Calendar} label="Academic Year">
                {drawerRow.year}
              </DetailRow>
            </DrawerSection>

            <DrawerSection icon={Shield} title="Role & Status">
              <DetailRow label="Assigned Role">
                <RoleBadge role={drawerRow.role} />
              </DetailRow>
              <DetailRow label="Current Status">
                <StatusBadge tone={statusTones[drawerRow.status]}>
                  {drawerRow.status.charAt(0).toUpperCase() +
                    drawerRow.status.slice(1)}
                </StatusBadge>
              </DetailRow>
              <DetailRow icon={Calendar} label="Applied On">
                {drawerRow.appliedOn}
              </DetailRow>
            </DrawerSection>

            <DrawerSection icon={FileText} title="Administrative Notes">
              <p className="text-sm text-muted-foreground leading-relaxed">
                This registration record is simulated for interface demonstration purposes.
                All changes made here are local to the current session.
              </p>
            </DrawerSection>
          </>
        )}
      </DetailDrawer>

      {/* Single Row Delete ConfirmDialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove student record"
        description={`Are you sure you want to remove ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        tone="danger"
        onConfirm={async () => {
          notify.success(`Removed ${deleteTarget?.name}.`);
          setDeleteTarget(null);
        }}
      />

      {/* Bulk Reject ConfirmDialog */}
      <ConfirmDialog
        open={bulkRejectOpen}
        onOpenChange={setBulkRejectOpen}
        title="Reject selected registrations"
        description={`Are you sure you want to reject ${selectedIds.size} selected registration(s)?`}
        confirmLabel="Reject"
        tone="danger"
        onConfirm={async () => {
          notify.success(`Rejected ${selectedIds.size} registrations.`);
          setSelectedIds(new Set());
          setBulkRejectOpen(false);
        }}
      />
    </div>
  );
}
