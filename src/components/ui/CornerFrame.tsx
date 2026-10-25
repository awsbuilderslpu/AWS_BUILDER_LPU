import * as React from "react";
import { cn } from "@/lib/utils";

interface CornerFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CornerFrame({ children, className, ...props }: CornerFrameProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card/60 p-6 md:p-8 lg:p-10",
        className
      )}
      {...props}
    >
      {/* Four Orange L-Shaped Corner Brackets */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[1px] -left-[1px] h-5 w-5 rounded-tl-sm border-t-2 border-l-2 border-primary"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[1px] -right-[1px] h-5 w-5 rounded-tr-sm border-t-2 border-r-2 border-primary"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-5 w-5 rounded-bl-sm border-b-2 border-l-2 border-primary"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[1px] -right-[1px] h-5 w-5 rounded-br-sm border-b-2 border-r-2 border-primary"
      />

      {children}
    </div>
  );
}
