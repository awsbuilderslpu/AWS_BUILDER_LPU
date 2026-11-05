"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/layout/Logo";
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
        "relative flex h-full w-[250px] flex-col border-r border-border/80 bg-[#040914] overflow-x-hidden overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none",
        className
      )}
    >
      {/* Background Orbital/Network Constellation at the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 overflow-hidden opacity-35 select-none z-0">
        <Image
          src="/images/artwork/Neon Orbital Network Overlay.png"
          alt=""
          fill
          priority
          sizes="250px"
          className="object-cover object-bottom"
        />
      </div>

      {/* Top Header with Logo linking to /admin */}
      <div className="relative z-10 flex h-[76px] shrink-0 items-center border-b border-border/80 px-6">
        <Logo href="/admin" />
      </div>

      {/* Navigation items */}
      <nav aria-label="Admin" className="relative z-10 flex flex-col gap-1.5 px-3 pt-5">
        {navItems.map((item) => {
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
                className="group flex h-[46px] w-full items-center gap-3.5 rounded-xl px-3.5 text-[15px] font-normal text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white text-left"
              >
                <Icon
                  className="size-5 shrink-0 text-slate-400 transition-colors group-hover:text-white"
                  strokeWidth={1.75}
                />
                <span className="truncate">{item.label}</span>
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
                "group relative flex h-[46px] items-center gap-3.5 rounded-xl px-3.5 text-[15px] transition-all",
                isActive
                  ? "border border-[#FF9900] bg-gradient-to-r from-[#FF9900]/25 via-[#FF9900]/10 to-transparent font-medium text-[#FF9900] shadow-[0_0_15px_rgba(255,153,0,0.35)]"
                  : "font-normal text-slate-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  isActive ? "text-[#FF9900]" : "text-slate-400 group-hover:text-white"
                )}
                strokeWidth={isActive ? 2 : 1.75}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom block: AWS Community Card */}
      <div className="relative z-10 mt-auto p-3.5 pt-6">
        <Link
          href="/"
          onClick={onNavigate}
          aria-label={adminCopy.sidebarLink}
          className="group relative block rounded-2xl border border-[#FF9900]/40 bg-[#060e1e]/90 p-3.5 backdrop-blur-md transition-all hover:border-[#FF9900]/80 hover:shadow-[0_0_20px_rgba(255,153,0,0.25)]"
        >
          {/* Cloud Artwork */}
          <div className="relative mx-auto mb-2 flex h-[90px] w-full items-center justify-center overflow-hidden">
            <Image
              src="/images/artwork/Neon Cloud Computing Emblem.png"
              alt="AWS Cloud"
              width={160}
              height={90}
              style={{ width: "auto" }}
              className="h-full w-auto object-contain drop-shadow-[0_0_14px_rgba(255,153,0,0.4)]"
            />
          </div>

          {/* Tagline & Arrow Button */}
          <div
            aria-hidden="true"
            className="flex items-end justify-between font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#00e5ff] select-none"
          >
            <div className="flex flex-col space-y-0.5">
              <span>{adminCopy.sidebarTagline[0]}</span>
              <span>{adminCopy.sidebarTagline[1]}</span>
              <span>{adminCopy.sidebarTagline[2]}</span>
              <span>{adminCopy.sidebarTagline[3]}</span>
              <div className="flex items-center gap-1.5">
                <span>{adminCopy.sidebarTagline[4]}</span>
                <span className="text-[#00e5ff] transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>

            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/90 bg-primary/10 shadow-[0_0_10px_rgba(255,153,0,0.35)] transition-all group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-black">
              <ArrowRight className="size-4 text-primary group-hover:text-black transition-colors" />
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
