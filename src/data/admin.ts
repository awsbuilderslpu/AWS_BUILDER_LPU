import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  ClipboardList,
  Megaphone,
  ChartNoAxesColumn,
  Settings,
} from "lucide-react";
import type { AppRole } from "@/lib/auth/account";

export interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles: AppRole[];
  ready: boolean;
}

export const adminNav: AdminNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin", "core"],
    ready: true,
  },
  {
    key: "members",
    label: "Members",
    href: "/admin/members",
    icon: Users,
    roles: ["admin"],
    ready: false,
  },
  {
    key: "events",
    label: "Events",
    href: "/admin/events",
    icon: CalendarDays,
    roles: ["admin", "core"],
    ready: false,
  },
  {
    key: "blogs",
    label: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
    roles: ["admin", "core"],
    ready: false,
  },
  {
    key: "registrations",
    label: "Registrations",
    href: "/admin/registrations",
    icon: ClipboardList,
    roles: ["admin"],
    ready: false,
  },
  {
    key: "announcements",
    label: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
    roles: ["admin"],
    ready: false,
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    icon: ChartNoAxesColumn,
    roles: ["admin"],
    ready: false,
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
    ready: false,
  },
];

export function canAccessAdmin(role: AppRole | null): boolean {
  return role === "admin" || role === "core";
}

export function visibleNav(role: AppRole | null): AdminNavItem[] {
  if (!role) return [];
  return adminNav.filter((item) => item.roles.includes(role));
}

export const adminCopy = {
  skipLink: "Skip to content",
  searchPlaceholder: "Jump to a page...",
  soon: "Soon",
  bell: {
    label: "Notifications",
    empty: "No notifications yet.",
  },
  userMenu: {
    viewSite: "View site",
    account: "My account",
    signOut: "Sign out",
  },
  commandMenu: {
    placeholder: "Type a page name...",
    empty: "No pages found.",
    group: "Pages",
  },
  sidebarTagline: ["Learn", "Build", "Share", "Grow", "Together"] as const,
  sidebarLink: "View site",
  dashboard: {
    title: "Dashboard",
    subtitle: "A quick look at how the club is doing.",
    welcome: (name: string, role: string) => `Signed in as ${name} (${role}).`,
    note: "Admin tools appear in the sidebar as they're built.",
    cards: {
      pending: "Pending registrations",
      approved: "Approved members",
      total: "All registrations",
    },
    countsUnavailable: "Counts are unavailable right now.",
    kitLink: "Open the admin kit demo",
  },
  kit: {
    export: "Export",
    exporting: "Exporting...",
    exportDone: (n: number) => `Exported ${n} ${n === 1 ? "row" : "rows"}.`,
    exportFailed: "Couldn't export. Please try again.",
    reset: "Reset",
    from: "From",
    to: "To",
    searchDefault: "Search...",
    pagination: "Pagination",
    showing: (from: number, to: number, total: number, noun: string) =>
      `Showing ${from} to ${to} of ${total} ${noun}`,
    perPage: (n: number) => `${n} / page`,
    rowsPerPage: "Rows per page",
    previous: "Previous page",
    next: "Next page",
    pageN: (n: number) => `Page ${n}`,
    selected: (n: number) => `${n} selected`,
    clearSelection: "Clear selection",
    bulkActions: "Bulk actions",
    selectAll: "Select all rows on this page",
    selectRow: (name: string) => `Select ${name}`,
    sortBy: (column: string) => `Sort by ${column}`,
    emptyTitle: "Nothing to show",
    emptyText: "Try a different search or filter.",
    unavailable: "unavailable",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    failed: "Something went wrong. Please try again.",
  },
  forms: {
    image: {
      title: "Click to upload image",
      dragHint: "or drag and drop",
      types: "PNG, JPG or WebP",
      hint: (types: string, maxMb: number, recommended?: string) =>
        `${types} · up to ${maxMb} MB${recommended ? ` · ${recommended} recommended` : ""}`,
      replace: "Replace image",
      remove: "Remove image",
      processing: "Preparing image...",
      uploading: "Uploading...",
      uploaded: "Image uploaded.",
      removed: "Image removed.",
      previewFailed: "Preview unavailable.",
      errors: {
        type: "Please choose a PNG, JPG or WebP image.",
        tooLarge: (mb: number) => `That file is too large. Choose one under ${mb} MB.`,
        pixels: "That image is too large to process. Choose a smaller one.",
        unreadable: "We couldn't read that image. Try another file.",
        compress: (mb: number) =>
          `We couldn't make that image small enough (limit ${mb} MB). Try a smaller one.`,
        upload: "Upload failed. Please try again.",
        signedOut: "Please sign in again to upload images.",
      },
    },
    dateTime: {
      date: "Date",
      time: "Time",
      ist: "Times are in India time (IST).",
      both: "Choose both a date and a time.",
      clear: "Clear date and time",
    },
  },
};

