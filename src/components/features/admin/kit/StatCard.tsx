import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { adminCopy } from "@/data/admin";
import { cn } from "@/lib/utils";

export type StatTone = "blue" | "green" | "orange" | "violet" | "red" | "muted";

export interface StatCardProps {
  label: string;
  value: number | string | null;
  icon: LucideIcon;
  tone: StatTone;
  hint?: string;
  href?: string;
  className?: string;
}

const toneStyles: Record<
  StatTone,
  { tileBorder: string; tileBg: string; tileText: string }
> = {
  blue: {
    tileBorder: "border-accent/60",
    tileBg: "bg-accent/10",
    tileText: "text-accent",
  },
  green: {
    tileBorder: "border-success/60",
    tileBg: "bg-success/10",
    tileText: "text-success",
  },
  orange: {
    tileBorder: "border-primary/60",
    tileBg: "bg-primary/10",
    tileText: "text-primary",
  },
  violet: {
    tileBorder: "border-violet/60",
    tileBg: "bg-violet/10",
    tileText: "text-violet",
  },
  red: {
    tileBorder: "border-red-400/60",
    tileBg: "bg-red-400/10",
    tileText: "text-red-400",
  },
  muted: {
    tileBorder: "border-border",
    tileBg: "bg-muted/10",
    tileText: "text-muted-foreground",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
  href,
  className,
}: StatCardProps) {
  const styles = toneStyles[tone];

  const content = (
    <>
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg border",
          styles.tileBorder,
          styles.tileBg
        )}
      >
        <Icon
          className={cn("size-6", styles.tileText)}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col justify-center min-w-0">
        <span className="text-[28px] font-semibold leading-tight text-white tracking-tight">
          {value !== null ? (
            value
          ) : (
            <span aria-label={adminCopy.kit.unavailable}>-</span>
          )}
        </span>
        <span className="text-[14px] text-muted-foreground truncate leading-snug">
          {label}
        </span>
        {hint && (
          <span className="text-[12px] text-muted-foreground/80 leading-none mt-0.5">
            {hint}
          </span>
        )}
      </div>
    </>
  );

  const baseClasses = cn(
    "flex items-center gap-3.5 rounded-lg border border-border bg-card/60 p-4 min-h-[78px] transition-colors",
    href &&
      "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

