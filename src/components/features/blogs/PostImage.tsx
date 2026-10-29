import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PostImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  label: string;
  sizes: string;
  className?: string;
}

export function PostImage({
  src,
  label,
  sizes,
  className,
  ...props
}: PostImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-card/50 to-accent/10 select-none overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--primary)_8%,transparent)_0%,transparent_70%)]" />
      <span className="relative z-10 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase opacity-70">
        [{label}]
      </span>
    </div>
  );
}
