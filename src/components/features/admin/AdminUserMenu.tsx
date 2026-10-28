"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, User, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { roleMeta, type Role } from "@/data/roles";
import { adminCopy } from "@/data/admin";
import type { AccountSummary } from "@/lib/auth/account";

export interface AdminUserMenuProps {
  account: AccountSummary;
}

export function AdminUserMenu({ account }: AdminUserMenuProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  const roleKey = (account.role as Role) || "participant";
  const roleInfo = roleMeta[roleKey] || roleMeta.participant;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="group flex items-center gap-3 rounded-full p-1 transition-all hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
        >
          <Avatar name={account.displayName || "Admin"} size={40} />
          <div className="hidden flex-col items-start leading-tight text-left md:flex">
            <span className="text-[15px] font-semibold uppercase text-white truncate max-w-[140px]">
              {account.displayName}
            </span>
            <span className="text-[14px] text-muted-foreground">
              {roleInfo.label}
            </span>
          </div>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl border border-border bg-popover/95 p-1.5 shadow-xl backdrop-blur-xl"
      >
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-sm">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 text-foreground/90 hover:text-white"
          >
            <Globe className="size-4 text-muted-foreground" />
            <span>{adminCopy.userMenu.viewSite}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-sm">
          <Link
            href="/account"
            className="flex items-center gap-2.5 px-3 py-2 text-foreground/90 hover:text-white"
          >
            <User className="size-4 text-muted-foreground" />
            <span>{adminCopy.userMenu.account}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void handleSignOut();
          }}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300"
        >
          <LogOut className="size-4 text-red-400" />
          <span>{adminCopy.userMenu.signOut}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

