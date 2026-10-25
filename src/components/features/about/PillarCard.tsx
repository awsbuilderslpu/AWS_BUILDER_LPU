import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PillarCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function PillarCard({
  title,
  description,
  icon: Icon,
  className,
  ...props
}: PillarCardProps) {
  return (
    <article
      className={cn(
        "flex gap-5 rounded-md border border-border bg-card/60 p-5 2xl:p-6 transition-colors hover:border-primary/40",
        className
      )}
      {...props}
    >
      <Icon
        className="h-10 w-10 shrink-0 text-primary"
        strokeWidth={1.25}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <h2 className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-[1.5] text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
}
