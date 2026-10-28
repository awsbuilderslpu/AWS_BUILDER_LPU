"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { Artwork } from "@/components/ui/Artwork";
import { visibleNav, adminCopy } from "@/data/admin";
import { cn } from "@/lib/utils";
import type { AccountSummary } from "@/lib/auth/account";

export interface AdminSidebarProps {
  account: AccountSummary;
  onNavigate?: () => void;
  className?: string;
}

export function AdminSidebar({
  account,
  onNavigate,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const navItems = React.useMemo(() => visibleNav(account.role), [account.role]);

  return (
    <aside
      className={cn(
        "flex h-full w-[240px] flex-col border-r border-border bg-background/80 backdrop-blur-md overflow-y-auto",
        className
      )}
    >
      {/* Top Header with Logo linking to /admin */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-border px-7">
        <Logo href="/admin" />
      </div>

      {/* Navigation items */}
      <nav aria-label="Admin" className="flex flex-col gap-2 px-3 pt-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          if (!item.ready) {
            return (
              <span
                key={item.key}
                aria-disabled="true"
                className="flex h-[50px] items-center gap-4 rounded-lg px-4 text-muted-foreground opacity-60 cursor-not-allowed select-none"
              >
                <Icon className="size-6 shrink-0" strokeWidth={1.5} />
                <span className="text-[16px]">{item.label}</span>
                <span className="ml-auto rounded border border-border bg-card/60 px-1.5 py-0.5 text-[11px] font-mono uppercase text-muted-foreground">
                  {adminCopy.soon}
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-[50px] items-center gap-4 rounded-lg px-4 text-[16px] transition-colors",
                isActive
                  ? "border border-primary/60 bg-gradient-to-r from-primary/25 to-primary/5 font-medium text-primary shadow-xs"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                className={cn("size-6 shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
                strokeWidth={1.5}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom block: hidden when viewport height is <= 700px */}
      <div className="mt-auto pt-6 [@media(max-height:700px)]:hidden">
        <Link
          href="/"
          onClick={onNavigate}
          aria-label={adminCopy.sidebarLink}
          className="group mx-4 mb-4 block"
        >
          <CornerFrame className="p-4 transition-colors group-hover:border-primary/40">
            <div className="mx-auto flex h-[170px] w-[170px] items-center justify-center overflow-hidden">
              <Artwork
                slot="adminSidebarCloud"
                sizes="200px"
                className="aspect-square w-[170px] h-[170px]"
              />
            </div>
            <div
              aria-hidden="true"
              className="mt-3 flex flex-col font-mono text-[15px] uppercase tracking-[0.18em] text-aws-blue select-none"
            >
              <span>{adminCopy.sidebarTagline[0]}</span>
              <span>{adminCopy.sidebarTagline[1]}</span>
              <span>{adminCopy.sidebarTagline[2]}</span>
              <span>{adminCopy.sidebarTagline[3]}</span>
              <div className="mt-0.5 flex items-center justify-between">
                <span>{adminCopy.sidebarTagline[4]}</span>
                <span className="flex size-9 items-center justify-center rounded-full border border-primary bg-primary/10 transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-4.5 text-primary" />
                </span>
              </div>
            </div>
          </CornerFrame>
        </Link>
      </div>
    </aside>
  );
}

