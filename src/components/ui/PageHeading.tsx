import * as React from "react";
import { cn } from "@/lib/utils";

export interface HeadingLine {
  text: string;
  accent?: boolean;
  dot?: boolean;
  gradient?: boolean;
}

export interface PageHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  lines: HeadingLine[];
  size?: "xl" | "lg" | "md" | "sm";
  as?: "h1" | "h2";
  gradient?: boolean;
  className?: string;
}

export function PageHeading({
  lines,
  size = "lg",
  as: Component = "h1",
  gradient = false,
  className,
  ...props
}: PageHeadingProps) {
  return (
    <Component
      className={cn(
        "font-sans font-extrabold uppercase tracking-tight",
        size === "xl"
          ? "text-[clamp(40px,3.85vw,64px)] leading-[1.05]"
          : size === "md"
            ? "text-[clamp(34px,3.05vw,51px)] leading-[1.05]"
            : size === "sm"
              ? "text-[clamp(30px,2.65vw,44px)] leading-[1.05]"
              : "text-[clamp(34px,3.2vw,54px)] leading-[1.05]",
        className
      )}
      {...props}
    >
      {lines.map((line, idx) => (
        <React.Fragment key={`${line.text}-${idx}`}>
          <span
            className={cn(
              "block",
              line.accent
                ? (gradient || line.gradient)
                  ? "bg-gradient-to-r from-[#FF9900] via-[#FFB84D] to-[#FF8000] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,153,0,0.4)]"
                  : "text-primary"
                : "text-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
            )}
          >
            {line.text}
            {line.dot && (
              <span className="text-primary drop-shadow-[0_0_20px_rgba(255,153,0,0.7)]">.</span>
            )}
          </span>
          {idx < lines.length - 1 && " "}
        </React.Fragment>
      ))}
    </Component>
  );
}
