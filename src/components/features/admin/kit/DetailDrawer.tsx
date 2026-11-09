"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  widthClass?: string;
}

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description = "Item details modal",
  children,
  footer,
  className,
  widthClass = "sm:max-w-2xl",
}: DetailDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 border border-border bg-card text-card-foreground shadow-2xl rounded-2xl overflow-hidden",
          widthClass,
          className
        )}
      >
        <div className="relative border-b border-border bg-card/95 px-5 sm:px-6 py-4 sm:py-5 pr-14 shrink-0">
          {/* Subtle top accent gradient */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <DialogTitle className="text-xl sm:text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription
            className={
              description &&
              description !== "Item details drawer" &&
              description !== "Item details modal"
                ? "text-xs sm:text-sm text-muted-foreground mt-1"
                : "sr-only"
            }
          >
            {description}
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4 sm:space-y-5 [scrollbar-width:thin]">
          {children}
        </div>

        {footer && (
          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2.5 sm:gap-3 border-t border-border bg-card/95 backdrop-blur-md px-5 sm:px-6 py-3.5 sm:py-4 shrink-0">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
