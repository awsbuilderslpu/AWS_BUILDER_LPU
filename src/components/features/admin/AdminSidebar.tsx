"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { LogoIcon } from "@/components/layout/Logo";
import { visibleNav } from "@/data/admin";
import { roleMeta, type Role } from "@/data/roles";
import { cn } from "@/lib/utils";
import type { AccountSummary } from "@/lib/auth/account";

export interface AdminSidebarProps {
  account: AccountSummary;
  pendingRegistrationsCount?: number;
  onNavigate?: () => void;
  onOpenCommand?: () => void;
  className?: string;
}

export function AdminSidebar({
  account,
  pendingRegistrationsCount,
  onNavigate,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = React.useMemo(() => visibleNav(account.role), [account.role]);

  // Group nav items by section
  const sections = React.useMemo(() => {
    const order = ["Overview", "Management", "Content"];
    const groups: { [key: string]: typeof navItems } = {};

    navItems.forEach((item) => {
      const sec = item.section || "Overview";
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(item);
    });

    return Object.entries(groups).sort(
      ([a], [b]) => order.indexOf(a) - order.indexOf(b)
    );
  }, [navItems]);

  const isAdministrator = account.role === "administrator";
  const consoleTitle = isAdministrator ? "Administrator" : "Admin";
  const roleLabel = roleMeta[(account.role as Role) || "participant"]?.label || consoleTitle;

  return (
    <aside
      className={cn(
        "relative flex h-full w-[260px] flex-col border-r border-border/80 bg-background select-none",
        className
      )}
    >
      {/* Background Orbital/Network Constellation with smooth fade mask */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 overflow-hidden opacity-10 select-none z-0 [mask-image:linear-gradient(to_top,black_30%,transparent_100%)]">
        <Image
          src="/images/artwork/Neon Orbital Network Overlay.png"
          alt=""
          fill
          priority
          sizes="260px"
          className="object-cover object-bottom"
        />
      </div>

      {/* Top Header with Logo & Console Indicator (Matches TopBar height h-[70px]) */}
      <div className="relative z-10 flex h-[70px] shrink-0 items-center border-b border-border/80 px-5">
        <Link
          href="/admin"
          className="group flex items-center gap-3 transition-opacity hover:opacity-95 select-none"
          aria-label="AWS Builder Group Admin Console"
        >
          <LogoIcon className="size-9 shrink-0 text-[#9D48FA] transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(157,72,250,0.5)]" />
          <div className="flex flex-col justify-center leading-none">
            <span className="text-[16px] font-bold tracking-tight text-foreground whitespace-nowrap">
              AWS Builder Group
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono font-medium tracking-[0.2em] text-muted-foreground uppercase">
                LPU
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold tracking-wider text-primary uppercase">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                {consoleTitle} Console
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Scrollable Navigation section (Clean, scrollbar hidden) */}
      <nav
        aria-label="Admin Navigation"
        className="relative z-10 flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map(([sectionTitle, items]) => (
          <div key={sectionTitle} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-muted-foreground/70 select-none">
              {sectionTitle}
            </div>

            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              if (!item.ready) {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      toast.info(`${item.label} is coming soon!`);
                    }}
                    className="group flex h-10 w-full items-center justify-between rounded-xl px-3 text-[14px] font-normal text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="size-[18px] shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="rounded border border-border bg-card/60 px-1.5 py-0.5 text-[9px] font-mono uppercase text-muted-foreground">
                      Soon
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex h-10 items-center justify-between rounded-xl px-3 text-[14px] transition-all duration-200",
                    isActive
                      ? "border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent font-medium text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                      : "font-normal text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  {/* Active glowing indicator pill */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary-hover shadow-[0_0_10px_rgba(255,153,0,0.8)]"
                    />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 transition-all duration-200",
                        isActive
                          ? "text-primary drop-shadow-[0_0_8px_rgba(255,153,0,0.5)]"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                      strokeWidth={isActive ? 2 : 1.75}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {/* Registrations pending badge */}
                  {item.key === "registrations" &&
                  pendingRegistrationsCount !== undefined &&
                  pendingRegistrationsCount > 0 ? (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-primary/40 bg-primary/20 px-1.5 text-[10px] font-mono font-bold text-primary shadow-[0_0_8px_rgba(255,153,0,0.3)]">
                      {pendingRegistrationsCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Fixed Bottom Section */}
      <div className="relative z-10 mt-auto shrink-0 border-t border-border/80 p-3.5 space-y-2 bg-background/95 backdrop-blur-md">
        {/* Compact AWS Public Site Link */}
        <Link
          href="/"
          onClick={onNavigate}
          className="group relative flex items-center gap-3 rounded-xl border border-border/80 bg-card/40 p-2.5 transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-[0_0_15px_rgba(255,153,0,0.12)]"
        >
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card overflow-hidden p-1">
            <Image
              src="/images/artwork/Neon Cloud Computing Emblem.png"
              alt="AWS Cloud"
              width={32}
              height={32}
              className="object-contain drop-shadow-[0_0_8px_rgba(255,153,0,0.4)] group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          <div className="flex flex-col min-w-0 flex-1 leading-tight">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-accent">
              AWS Community
            </span>
            <span className="truncate text-[12px] font-medium text-foreground/90 group-hover:text-foreground transition-colors">
              View Public Site
            </span>
          </div>

          <div className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground group-hover:border-primary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </Link>

        {/* Subtle Status Line */}
        <div className="flex items-center justify-between px-2 pt-0.5 text-[10px] font-mono text-muted-foreground/60 select-none">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LPU Chapter Online
          </span>
          <span>{roleLabel}</span>
        </div>
      </div>
    </aside>
  );
}
