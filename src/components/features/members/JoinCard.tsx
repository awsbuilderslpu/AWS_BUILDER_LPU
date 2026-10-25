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
        className="size-[38px] text-primary shrink-0 stroke-[1.25]"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <h2 className="font-mono text-[12.5px] font-bold uppercase tracking-[0.02em] leading-5 text-primary">
          {data.title}
        </h2>
        <p className="mt-2.5 text-[12.5px] leading-[1.55] text-muted-foreground">
          {data.text}
        </p>
        <Button
          asChild
          variant={data.cta.variant}
          withArrow
          className={cn(
            "mt-5 w-full h-[43px] text-[14.5px] font-medium",
            data.cta.variant === "outline" &&
              "border-primary/70 hover:border-primary text-foreground"
          )}
        >
          <Link href={data.cta.href}>{data.cta.label}</Link>
        </Button>
      </div>
    </div>
  );

  if (data.framed) {
    return (
      <section className={className}>
        <CornerFrame className="rounded-lg bg-card/60 py-5 pl-4 pr-5 md:py-5 md:pl-4 md:pr-5 lg:py-5 lg:pl-4 lg:pr-5">
          {content}
        </CornerFrame>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card/60 py-5 pl-4 pr-5",
        className
      )}
    >
      {content}
    </section>
  );
}
