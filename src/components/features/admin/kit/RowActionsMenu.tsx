"use client";

import * as React from "react";
import { MoreVertical, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface RowActionItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  tone?: "danger";
  disabled?: boolean;
}

export interface RowActionsMenuProps {
  label: string;
  items: RowActionItem[];
  className?: string;
}

export function RowActionsMenu({
  label,
  items,
  className,
}: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex size-9 items-center justify-center rounded-md border border-border bg-card/40 transition-colors cursor-pointer",
            "hover:border-primary/50 hover:bg-card/80 hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background",
            className
          )}
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-[160px] border border-border bg-card/95 backdrop-blur-md p-1 shadow-xl"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.label}
              disabled={item.disabled}
              onSelect={() => item.onSelect()}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-[14px] cursor-pointer rounded-md transition-colors",
                item.tone === "danger"
                  ? "text-red-400 focus:bg-red-400/10 focus:text-red-400"
                  : "text-foreground focus:bg-card focus:text-white"
              )}
            >
              {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

