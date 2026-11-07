"use client";

import * as React from "react";
import { AdminSidebar } from "@/components/features/admin/AdminSidebar";
import { AdminTopBar } from "@/components/features/admin/AdminTopBar";
import { CommandMenu } from "@/components/features/admin/CommandMenu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { adminCopy } from "@/data/admin";
import type { AccountSummary } from "@/lib/auth/account";

export interface AdminShellProps {
  account: AccountSummary;
  pendingRegistrationsCount?: number;
  children: React.ReactNode;
}

export function AdminShell({
  account,
  pendingRegistrationsCount,
  children,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Accessible skip to main content link */}
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      >
        {adminCopy.skipLink}
      </a>

      {/* Desktop Sidebar (hidden below lg) */}
      <div className="hidden lg:block">
        <AdminSidebar
          account={account}
          pendingRegistrationsCount={pendingRegistrationsCount}
          onOpenCommand={() => setCommandOpen(true)}
          className="sticky top-0 h-screen"
        />
      </div>

      {/* Mobile Sidebar in Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 border-r border-border bg-background"
        >
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <AdminSidebar
            account={account}
            pendingRegistrationsCount={pendingRegistrationsCount}
            onNavigate={() => setMobileMenuOpen(false)}
            onOpenCommand={() => {
              setMobileMenuOpen(false);
              setCommandOpen(true);
            }}
            className="w-full border-r-0"
          />
        </SheetContent>
      </Sheet>

      {/* Right Column: Top Bar & Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar
          account={account}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
        />

        <main
          id="admin-main"
          tabIndex={-1}
          className="min-w-0 flex-1 px-3.5 sm:px-6 pt-5 sm:pt-8 pb-8 outline-none"
        >
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        role={account.role}
      />

      {/* Global Admin Notifications */}
      <Toaster />
    </div>
  );
}

