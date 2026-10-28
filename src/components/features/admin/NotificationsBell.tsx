"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { adminCopy } from "@/data/admin";

export interface NotificationsBellProps {
  count?: number;
}

// TODO: Wire to real announcements/notifications system in a future step
export function NotificationsBell({ count = 0 }: NotificationsBellProps) {
  const displayCount = count > 9 ? "9+" : count > 0 ? String(count) : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={adminCopy.bell.label}
          className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
        >
          <Bell className="size-5" />
          {displayCount && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm"
            >
              {displayCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-xl border border-border bg-popover/95 p-5 text-center shadow-xl backdrop-blur-xl"
      >
        <p className="text-sm text-muted-foreground">{adminCopy.bell.empty}</p>
      </PopoverContent>
    </Popover>
  );
}

