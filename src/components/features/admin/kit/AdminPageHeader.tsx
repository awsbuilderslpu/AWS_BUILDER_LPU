import * as React from "react";
import { cn } from "@/lib/utils";

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 pt-7",
        className
      )}
    >
      <div>
        <h1 className="text-[36px] font-bold leading-tight tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[16px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </header>
  );
}

