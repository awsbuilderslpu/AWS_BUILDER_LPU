import * as React from "react";
import { type LucideIcon, Infinity as InfinityIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface StatsRowProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: StatItem[];
  variant?: "plain" | "boxed";
  size?: "md" | "sm";
  action?: React.ReactNode;
  className?: string;
}

export function StatsRow({
  stats,
  variant = "plain",
  size = "md",
  action,
  className,
  ...props
}: StatsRowProps) {
  if (variant === "boxed") {
    const isSm = size === "sm";
    return (
      <div
        className={cn(
          "w-full rounded-xl border border-border bg-card/60 backdrop-blur-sm",
          isSm ? "p-3.5 sm:p-4 lg:p-5" : "p-5 sm:p-6",
          "flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between",
          className
        )}
        {...props}
      >
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:flex lg:flex-1 lg:items-center lg:justify-between lg:gap-4 xl:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <React.Fragment key={`${stat.label}-${idx}`}>
                <div className="flex items-center gap-3 sm:gap-3.5">
                  {Icon && (
                    <div
                      className={cn(
                        "flex shrink-0 items-center justify-center text-primary",
                        isSm ? "size-7 sm:size-8" : "size-10"
                      )}
                    >
                      <Icon
                        className={cn(
                          "stroke-[1.5]",
                          isSm ? "size-6 sm:size-7" : "size-8"
                        )}
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-foreground leading-tight",
                        isSm
                          ? "text-lg sm:text-xl lg:text-[22px] font-bold"
                          : "text-xl font-bold sm:text-2xl lg:text-[28px]"
                      )}
                    >
                      {stat.value === "∞" ? (
                        <InfinityIcon
                          className={cn(
                            "text-primary",
                            isSm ? "size-5 sm:size-6" : "size-7"
                          )}
                        />
                      ) : (
                        stat.value
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-muted-foreground mt-0.5 whitespace-nowrap",
                        isSm ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"
                      )}
                    >
                      {stat.label}
                    </span>
                  </div>
                </div>
                {idx < stats.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "hidden w-px bg-border lg:block",
                      isSm ? "h-8" : "h-12"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {action && (
          <div className="flex shrink-0 items-center pt-2 sm:pt-0 lg:ml-6 lg:pl-6 lg:border-l lg:border-border">
            {action}
          </div>
        )}
      </div>
    );
  }

  // Plain variant (Home Hero style)
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-6 sm:gap-8 lg:flex lg:items-center lg:gap-8 xl:gap-12",
        className
      )}
      {...props}
    >
      {stats.map((stat, idx) => (
        <React.Fragment key={`${stat.label}-${idx}`}>
          <div className="flex flex-col">
            <span className="text-2xl font-medium text-primary sm:text-3xl leading-none flex items-center">
              {stat.value === "∞" ? (
                <InfinityIcon className="size-7 sm:size-8 text-primary" />
              ) : (
                stat.value
              )}
            </span>
            <span className="mt-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
              {stat.label}
            </span>
          </div>
          {idx < stats.length - 1 && (
            <div
              aria-hidden="true"
              className="hidden h-10 w-px bg-border lg:block"
            />
          )}
        </React.Fragment>
      ))}
      {action && <div className="col-span-2 lg:col-span-1">{action}</div>}
    </div>
  );
}
