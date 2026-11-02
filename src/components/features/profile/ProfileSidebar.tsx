"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  BookOpen,
  Folder,
  Award,
  FileText,
  Bookmark,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { profileCopy } from "@/data/profile";
import { isSoon } from "@/lib/profile/nav";

const iconMap: Record<string, LucideIcon> = {
  Profile: User,
  "My Events": Calendar,
  "My Blogs": BookOpen,
  "My Projects": Folder,
  "My Certificates": Award,
  "My Applications": FileText,
  Saved: Bookmark,
  Settings: Settings,
};

export function ProfileSidebar() {
  const currentPath = "/profile";

  return (
    <nav
      aria-label="Profile navigation"
      className="w-full lg:w-[240px] shrink-0"
    >
      {/* Mobile/Tablet Horizontal Scroll */}
      <div className="flex lg:hidden overflow-x-auto gap-2 pb-3 pt-1 scrollbar-none no-scrollbar">
        {profileCopy.nav.items.map((item) => {
          const Icon = iconMap[item.label] ?? User;
          const active = item.href === currentPath;
          const soon = isSoon(item);

          if (soon) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/50 bg-card/30 px-3 py-2 text-xs font-medium text-muted-foreground select-none cursor-not-allowed opacity-60"
              >
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground border border-border">
                  {profileCopy.nav.soonLabel}
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors select-none",
                active
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-card/60 text-muted-foreground hover:text-white hover:border-primary/40"
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop Vertical Sidebar */}
      <div className="hidden lg:flex flex-col gap-1.5 rounded-xl border border-border bg-card/60 p-3 backdrop-blur-sm">
        {profileCopy.nav.items.map((item) => {
          const Icon = iconMap[item.label] ?? User;
          const active = item.href === currentPath;
          const soon = isSoon(item);

          if (soon) {
            return (
              <div
                key={item.href}
                aria-disabled="true"
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium text-muted-foreground select-none cursor-not-allowed opacity-60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground border border-border">
                  {profileCopy.nav.soonLabel}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors select-none",
                active
                  ? "border border-primary/60 bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-card/80 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

