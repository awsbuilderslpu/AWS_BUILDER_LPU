import * as React from "react";
import { cn } from "@/lib/utils";

interface ArtworkSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  className?: string;
}

export function ArtworkSlot({ name, className, ...props }: ArtworkSlotProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-6 text-center select-none overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--primary)_8%,transparent)_0%,transparent_70%)]" />
      <span className="relative z-10 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
        [{name}]
      </span>
    </div>
  );
}
