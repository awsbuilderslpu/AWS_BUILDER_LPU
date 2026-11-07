"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { LogoIcon } from "@/components/layout/Logo";
import { NotificationsBell } from "@/components/features/admin/NotificationsBell";
import { AdminUserMenu } from "@/components/features/admin/AdminUserMenu";
import { siteConfig } from "@/data/site";
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
    <header className="sticky top-0 z-30 flex h-16 sm:h-[76px] items-center gap-2 sm:gap-4 border-b border-border bg-background/80 px-3 sm:px-5 backdrop-blur-md">
      {/* Mobile left items: Hamburger & Logo (hidden from lg) */}
      <div className="flex items-center gap-2 sm:gap-3 lg:hidden shrink-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
        >
          <Menu className="size-6" />
        </button>
        <Link
          href="/admin"
          className="group flex items-center gap-2 select-none"
          aria-label={`${siteConfig.name} Admin Home`}
        >
          <LogoIcon className="size-8 sm:size-9 shrink-0 text-[#9D48FA] transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(157,72,250,0.5)]" />
          <div className="hidden min-[420px]:flex flex-col justify-center leading-none">
            <span className="text-[15px] sm:text-[17px] font-bold tracking-tight text-foreground whitespace-nowrap">
              Admin
            </span>
            <span className="text-[9px] font-mono font-medium tracking-[0.2em] text-muted-foreground uppercase mt-0.5">
              {siteConfig.org}
            </span>
          </div>
        </Link>
      </div>

      {/* Right actions: Bell & User Menu */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-4 shrink-0">
        <NotificationsBell />
        <AdminUserMenu account={account} />
      </div>
    </header>
  );
}

