import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { Button } from "@/components/ui/button";
import type { JoinCardData } from "@/data/members";

export interface JoinCardProps {
  data: JoinCardData;
  className?: string;
}

export function JoinCard({ data, className }: JoinCardProps) {
  const Icon = data.icon;

  const content = (
    <div className="flex gap-3">
      <Icon
        className="size-8 text-primary shrink-0 stroke-[1.25]"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <h2 className="font-mono text-xs sm:text-[13px] font-bold uppercase tracking-wider leading-snug text-primary">
          {data.title}
        </h2>
        <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-muted-foreground">
          {data.text}
        </p>
        <Button
          asChild
          variant={data.cta.variant}
          withArrow
          className={cn(
            "mt-4 w-full h-10 text-xs sm:text-sm font-medium",
            data.cta.variant === "outline" &&
              "border-primary/70 hover:border-primary text-foreground"
          )}
        >
          <Link
            href={data.cta.href}
            scroll={data.cta.href.startsWith("?") ? false : undefined}
          >
            {data.cta.label}
          </Link>
        </Button>
      </div>
    </div>
  );

  if (data.framed) {
    return (
      <section className={className}>
        <CornerFrame className="rounded-lg bg-card/60 p-4 sm:p-5">
          {content}
        </CornerFrame>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card/60 p-4 sm:p-5",
        className
      )}
    >
      {content}
    </section>
  );
}
