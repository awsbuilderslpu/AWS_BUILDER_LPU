"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ClipboardCheck,
  LayoutDashboard,
  ArrowUpRight,
  UserRound,
  Globe,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { canAccessAdmin } from "@/data/admin";
import { roleMeta } from "@/data/roles";
import { authCopy } from "@/data/auth";
import { profileCopy } from "@/data/profile";
import { cn } from "@/lib/utils";
import type { AccountSummary } from "@/lib/auth/account";

export interface AccountMenuProps {
  account: AccountSummary;
  showViewSite?: boolean;
  className?: string;
}

export function AccountMenu({
  account,
  showViewSite = false,
  className,
}: AccountMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isPending = account.registrationStatus === "pending";
  const roleLabel = isPending
    ? profileCopy.access.pending
    : account.role && roleMeta[account.role]
      ? roleMeta[account.role].label
      : null;

  let footerText: string | null = null;
  if (isPending) {
    footerText = profileCopy.access.pending;
  } else if (account.role && roleMeta[account.role]) {
    footerText = authCopy.menu.account.footer(roleMeta[account.role].label);
  }

  const handleSignOut = async () => {
    await signOut();
    React.startTransition(() => {
      router.push("/");
      router.refresh();
    });
  };

  const isRowActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    if (href === "/profile") {
      return pathname === "/profile" || pathname.startsWith("/profile/");
    }
    if (href === "/") {
      return pathname === "/";
    }
    return false;
  };

  const menuItems = [
    ...(!account.profileComplete
      ? [
        {
          key: "finish",
          href: "?auth=complete",
          label: authCopy.menu.account.finish,
          icon: ClipboardCheck,
          hasArrow: false,
          scrollFalse: true,
        },
      ]
      : []),
    ...(canAccessAdmin(account.role)
      ? [
        {
          key: "dashboard",
          href: "/admin",
          label: authCopy.menu.account.dashboard,
          icon: LayoutDashboard,
          hasArrow: true,
          scrollFalse: false,
        },
      ]
      : []),
    {
      key: "profile",
      href: "/profile",
      label: authCopy.menu.account.profile,
      icon: UserRound,
      hasArrow: true,
      scrollFalse: false,
    },
    ...(showViewSite
      ? [
        {
          key: "viewSite",
          href: "/",
          label: authCopy.menu.account.viewSite,
          icon: Globe,
          hasArrow: true,
          scrollFalse: false,
        },
      ]
      : []),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={authCopy.menu.account.trigger}
          className={cn(
            "group inline-flex h-12 max-w-[260px] items-center gap-3 rounded-full border border-border bg-card/60 py-1 pl-1 pr-3 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            className
          )}
        >
          <Avatar
            name={account.displayName || "User"}
            src={account.avatarUrl}
            size={40}
          />
          <div className="hidden min-w-0 flex-1 flex-col leading-tight sm:flex">
            <span className="max-w-[150px] truncate text-sm font-semibold text-foreground">
              {account.displayName}
            </span>
            {roleLabel && (
              <span className="truncate text-xs text-muted-foreground">
                {roleLabel}
              </span>
            )}
          </div>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="ml-auto !size-4 shrink-0 text-muted-foreground motion-safe:transition-transform group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[300px] overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-xl"
      >
        <div className="flex items-center gap-3 px-4 pb-3 pt-4">
          <Avatar
            name={account.displayName || "User"}
            src={account.avatarUrl}
            size={44}
          />
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[15px] font-semibold text-foreground">
              {account.displayName}
            </span>
            <span className="truncate text-[13px] text-muted-foreground">
              {account.email}
            </span>
            {isPending && (
              <span className="truncate text-[13px] text-muted-foreground">
                {profileCopy.access.pending}
              </span>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-0 h-px bg-border" />

        <div className="p-2 space-y-0.5">
          {menuItems.map((item) => {
            const active = isRowActive(item.href);
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.key}
                asChild
                className={cn(
                  "flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-[15px] transition-colors outline-none",
                  active
                    ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary focus:bg-primary/15 focus:text-primary"
                    : "text-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                )}
              >
                <Link
                  href={item.href}
                  scroll={item.scrollFalse ? false : undefined}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="!size-[18px] shrink-0"
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.hasArrow && (
                    <ArrowUpRight
                      size={14}
                      aria-hidden="true"
                      className="ml-auto !size-3.5 shrink-0 text-muted-foreground"
                    />
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              void handleSignOut();
            }}
            className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-[15px] text-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
          >
            <LogOut
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className="!size-[18px] shrink-0"
            />
            <span className="flex-1 text-left">{authCopy.menu.account.logout}</span>
          </DropdownMenuItem>
        </div>

        {footerText && (
          <>
            <DropdownMenuSeparator className="my-0 h-px bg-border" />
            <div className="px-4 pb-4 pt-2 text-xs text-muted-foreground">
              {footerText}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

