import * as React from "react";
import { Mouse } from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialLinks } from "@/components/ui/SocialLinks";

export interface HeroBottomBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function HeroBottomBar({ className, ...props }: HeroBottomBarProps) {
  return (
    <div
      className={cn(
        "flex h-[70px] w-full items-center justify-between border-t border-border/60 bg-background/60 px-6 backdrop-blur-sm xl:px-16 select-none",
        className
      )}
      {...props}
    >
      {/* Left: Scroll cue (hidden below sm) */}
      <div className="hidden sm:flex sm:items-center sm:gap-4">
        <a
          href="#cta"
          className="group flex items-center gap-3.5 text-muted-foreground transition-colors hover:text-primary"
        >
          <Mouse
            aria-hidden="true"
            className="size-7 stroke-[1.25] text-muted-foreground transition-colors group-hover:text-primary"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors group-hover:text-primary">
            SCROLL TO EXPLORE
          </span>
        </a>
        <span aria-hidden="true" className="h-px w-6 bg-border/80" />
      </div>

      {/* Right: Thin divider + Social Links */}
      <div className="flex w-full items-center justify-end gap-6 sm:w-auto sm:gap-8">
        <span
          aria-hidden="true"
          className="hidden h-px w-7 bg-border/80 sm:block"
        />
        <SocialLinks />
      </div>
    </div>
  );
}
