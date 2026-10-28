"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { visibleNav, adminCopy } from "@/data/admin";
import type { AppRole } from "@/lib/auth/account";

export interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: AppRole | null;
}

export function CommandMenu({ open, onOpenChange, role }: CommandMenuProps) {
  const router = useRouter();
  const navItems = React.useMemo(() => visibleNav(role), [role]);

  const handleSelect = (href: string, ready: boolean) => {
    if (!ready) return;
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={adminCopy.commandMenu.placeholder} />
      <CommandList>
        <CommandEmpty>{adminCopy.commandMenu.empty}</CommandEmpty>
        <CommandGroup heading={adminCopy.commandMenu.group}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.key}
                value={item.label}
                disabled={!item.ready}
                onSelect={() => handleSelect(item.href, item.ready)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                {!item.ready && (
                  <span className="rounded border border-border bg-card/60 px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                    {adminCopy.soon}
                  </span>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

