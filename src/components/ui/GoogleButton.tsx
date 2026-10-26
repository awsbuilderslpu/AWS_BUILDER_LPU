"use client";

import * as React from "react";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GoogleButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function GoogleButton({
  label,
  onClick,
  loading = false,
  disabled = false,
  className,
}: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "h-12 w-full text-[15.5px] font-semibold text-white",
        className
      )}
    >
      {loading ? (
        <Loader2 className="size-5! animate-spin shrink-0" aria-hidden="true" />
      ) : (
        <FcGoogle className="size-5! shrink-0" aria-hidden="true" />
      )}
      <span>{label}</span>
    </Button>
  );
}
