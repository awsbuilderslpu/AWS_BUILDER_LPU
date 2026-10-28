"use client";

import * as React from "react";
import { Search, Menu } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { NotificationsBell } from "@/components/features/admin/NotificationsBell";
import { AdminUserMenu } from "@/components/features/admin/AdminUserMenu";
import { adminCopy } from "@/data/admin";
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
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center gap-4 border-b border-border bg-background/70 px-5 backdrop-blur-md">
      {/* Mobile left items: Hamburger & Logo (hidden from lg) */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
        >
          <Menu className="size-6" />
        </button>
        <Logo href="/admin" />
      </div>

      {/* Search trigger button */}
      <button
        type="button"
        onClick={onOpenCommand}
        className="flex h-11 flex-1 max-w-[660px] items-center gap-3 rounded-md border border-border bg-card/40 px-3.5 text-sm text-muted-foreground transition-colors hover:border-border/80 hover:bg-card/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="truncate">{adminCopy.searchPlaceholder}</span>
        <div className="ml-auto hidden items-center gap-1 sm:flex" aria-hidden="true">
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
            Ctrl
          </kbd>
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
            K
          </kbd>
        </div>
      </button>

      {/* Right actions: Bell & User Menu */}
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <NotificationsBell />
        <AdminUserMenu account={account} />
      </div>
    </header>
  );
}

