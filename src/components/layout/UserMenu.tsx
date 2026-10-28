"use client";

import * as React from "react";
import Link from "next/link";
import { User, LogOut, ShieldCheck, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { roleMeta, type Role } from "@/data/roles";
import { cn } from "@/lib/utils";
import type { AccountSummary } from "@/lib/auth/account";

export interface UserMenuProps {
  account: AccountSummary;
  className?: string;
}

export function UserMenu({ account, className }: UserMenuProps) {
  const { signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  const roleKey = (account.role as Role) || "participant";
  const roleInfo = roleMeta[roleKey] || roleMeta.participant;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className={cn(
            "group flex items-center gap-2 rounded-full p-1 transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "hover:bg-white/5",
            className
          )}
        >
          <div className="relative">
            <Avatar name={account.displayName || "User"} size={36} />
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background",
                account.isActive ? "bg-emerald-500" : "bg-zinc-500"
              )}
              aria-hidden="true"
            />
          </div>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl border border-border bg-popover/95 p-1.5 backdrop-blur-xl shadow-xl"
      >
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-white truncate">
              {account.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {account.email}
            </p>
            <div className="pt-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                  roleInfo.tone.bg,
                  roleInfo.tone.text,
                  roleInfo.tone.ring
                )}
              >
                <ShieldCheck className="size-3" />
                {roleInfo.label}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-sm">
            <Link
              href="/account"
              className="flex items-center gap-2 px-2.5 py-2 text-foreground/90 hover:text-white"
            >
              <User className="size-4 text-muted-foreground" />
              <span>My Account</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onSelect={async (e) => {
            e.preventDefault();
            await signOut();
          }}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300"
        >
          <LogOut className="size-4 text-red-400" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

