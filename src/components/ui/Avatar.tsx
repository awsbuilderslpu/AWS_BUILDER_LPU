import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: number; // px, default 32
  className?: string;
}

export function Avatar({
  name,
  src,
  size = 32,
  className,
  ...props
}: AvatarProps) {
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const fontSize = Math.max(9, Math.round(size * 0.38));

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card select-none",
        className
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30"
          />
          <span
            className="relative z-10 font-mono font-semibold uppercase text-foreground leading-none"
            style={{ fontSize: `${fontSize}px` }}
          >
            {initials}
          </span>
        </>
      )}
    </div>
  );
}
