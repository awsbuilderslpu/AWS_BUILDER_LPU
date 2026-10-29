"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { adminCopy } from "@/data/admin";
import { notify } from "@/lib/admin/notify";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "default";
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = adminCopy.kit.confirm,
  tone = "default",
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [running, setRunning] = React.useState(false);
  const isLoading = running || pending;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setRunning(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      notify.error(adminCopy.kit.failed);
    } finally {
      setRunning(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border border-border bg-card p-6 shadow-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-white">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex flex-row items-center justify-end gap-3 sm:space-x-0">
          <AlertDialogCancel
            disabled={isLoading}
            autoFocus={tone === "danger"}
            className="h-11 px-5 border-border bg-card/40 hover:bg-card/80 text-foreground cursor-pointer font-medium mt-0"
          >
            {adminCopy.kit.cancel}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "h-11 px-5 font-medium cursor-pointer transition-colors",
              tone === "danger"
                ? "bg-red-500/90 hover:bg-red-500 text-white"
                : "bg-primary text-background hover:bg-primary-hover font-semibold",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <LoaderCircle
                  className="size-4 animate-spin shrink-0 mr-2"
                  aria-hidden="true"
                />
                <span>{confirmLabel}</span>
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

