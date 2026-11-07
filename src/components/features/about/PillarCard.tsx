import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PillarCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
  highlight?: string;
  className?: string;
}

export function PillarCard({
  title,
  description,
  icon: Icon,
  tags,
  highlight,
  className,
  ...props
}: PillarCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-card/50 p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_0_25px_rgba(255,153,0,0.12)]",
        className
      )}
      {...props}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </div>
          {highlight && (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary/80 bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-full">
              {highlight}
            </span>
          )}
        </div>

        <h3 className="mt-4 font-mono text-base font-bold uppercase tracking-[0.08em] text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {tags && tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5 pt-4 border-t border-border/40">
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-muted-foreground/90 bg-muted/30 px-2 py-0.5 rounded border border-border/40 transition-colors group-hover:border-primary/30 group-hover:text-primary"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Subtle bottom edge glow on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </article>
  );
}
