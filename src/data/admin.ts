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
  },
};

