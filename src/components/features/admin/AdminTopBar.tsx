"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ChevronRight } from "lucide-react";
import { LogoIcon } from "@/components/layout/Logo";
import { NotificationsBell } from "@/components/features/admin/NotificationsBell";
import { AdminUserMenu } from "@/components/features/admin/AdminUserMenu";
import { adminNav } from "@/data/admin";
import type { AccountSummary } from "@/lib/auth/account";

export interface AdminTopBarProps {
  account: AccountSummary;
  onOpenMobileMenu?: () => void;
  onOpenCommand?: () => void;
}

export function AdminTopBar({
  account,
  onOpenMobileMenu,
  onOpenCommand,
}: AdminTopBarProps) {
  const pathname = usePathname();

  // Find the matching navigation item for breadcrumbs
  const currentNav = React.useMemo(() => {
    return adminNav.find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href)
    );
  }, [pathname]);

  const CurrentIcon = currentNav?.icon;

  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between gap-3 border-b border-border/80 bg-[#050B18]/95 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left side: Mobile Hamburger + Logo OR Desktop Dynamic Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile controls (hidden on lg) */}
        <div className="flex items-center gap-2.5 lg:hidden shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card/40 text-muted-foreground transition-colors hover:bg-card hover:text-foreground cursor-pointer"
          >
            <Menu className="size-5" />
          </button>
          <Link
            href="/admin"
            className="flex items-center gap-2 select-none"
            aria-label="Admin Console"
          >
            <LogoIcon className="size-7 shrink-0 text-[#9D48FA] drop-shadow-[0_0_10px_rgba(157,72,250,0.5)]" />
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-bold tracking-tight text-foreground">
                  Admin
                </span>
                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-primary">
                  LPU
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Breadcrumbs (hidden below lg) */}
        <nav
          aria-label="Breadcrumb"
          className="hidden lg:flex items-center gap-2 select-none min-w-0"
        >
          <Link
            href="/admin"
            className="text-xs font-mono font-medium text-muted-foreground/70 uppercase tracking-wider transition-colors hover:text-foreground"
          >
            Console
          </Link>

          {currentNav && currentNav.href !== "/admin" && (
            <>
              <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" />
              {currentNav.section && (
                <>
                  <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">
                    {currentNav.section}
                  </span>
                  <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" />
                </>
              )}
              <div className="flex items-center gap-2 font-medium text-foreground min-w-0">
                {CurrentIcon && (
                  <CurrentIcon className="size-4 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(255,153,0,0.35)]" />
                )}
                <span className="truncate text-sm font-semibold">
                  {currentNav.label}
                </span>
              </div>
            </>
          )}

          {currentNav?.href === "/admin" && (
            <>
              <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" />
              <div className="flex items-center gap-2 font-medium text-foreground">
                {CurrentIcon && (
                  <CurrentIcon className="size-4 text-primary shrink-0 drop-shadow-[0_0_8px_rgba(255,153,0,0.35)]" />
                )}
                <span className="text-sm font-semibold">Dashboard</span>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Center: Global Command Search Bar */}
      {onOpenCommand && (
        <div className="flex items-center justify-center flex-1 max-w-md mx-2">
          {/* Desktop search trigger */}
          <button
            type="button"
            onClick={onOpenCommand}
            aria-label="Search admin console (⌘K)"
            className="hidden md:flex h-9 w-full max-w-sm items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/40 px-3.5 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-card/70 hover:text-foreground cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="truncate text-[13px] text-muted-foreground">
                Search console pages...
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] text-muted-foreground">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5">
                ⌘K
              </kbd>
            </div>
          </button>

          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={onOpenCommand}
            aria-label="Search"
            className="flex md:hidden size-9 items-center justify-center rounded-xl border border-border bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
          >
            <Search className="size-4" />
          </button>
        </div>
      )}

      {/* Right side: Region Status + Notifications + User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        {/* Cluster / Region Status Badge */}
        <div
          title="AWS Infrastructure Region"
          className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono font-medium text-emerald-400 select-none"
        >
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ap-south-1</span>
        </div>

        {/* Notifications Bell */}
        <NotificationsBell />

        {/* Divider */}
        <div className="h-5 w-px bg-border/80 hidden sm:block" />

        {/* User Account Menu */}
        <AdminUserMenu account={account} />
      </div>
    </header>
  );
}
