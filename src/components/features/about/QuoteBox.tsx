import * as React from "react";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { cn } from "@/lib/utils";

export interface QuoteBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  attribution: string;
  className?: string;
}

export function QuoteBox({
  text,
  attribution,
  className,
  ...props
}: QuoteBoxProps) {
  return (
    <CornerFrame
      className={cn(
        "bg-card/40 backdrop-blur-sm p-8 md:p-8 lg:p-8",
        className
      )}
      {...props}
    >
      <figure>
        <blockquote className="font-mono text-[15px] uppercase tracking-[0.07em] leading-[1.7] text-foreground">
          “{text}”
        </blockquote>
        <figcaption className="mt-5 font-mono text-[13px] uppercase tracking-[0.1em] text-primary">
          — {attribution}
        </figcaption>
      </figure>
    </CornerFrame>
  );
}
