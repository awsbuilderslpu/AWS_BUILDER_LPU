import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ArtworkConfig {
  src: string;
  alt: string;
  objectFit?: "contain" | "cover";
  objectPosition?: string;
  priority?: boolean;
}

export const ARTWORK_REGISTRY: Record<string, ArtworkConfig> = {};

export interface ArtworkSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  className?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  objectFit?: "contain" | "cover";
  objectPosition?: string;
}

export function ArtworkSlot({
  name,
  className,
  src: explicitSrc,
  alt: explicitAlt,
  priority: explicitPriority,
  objectFit: explicitFit,
  objectPosition: explicitPos,
  ...props
}: ArtworkSlotProps) {
  const registered = ARTWORK_REGISTRY[name];
  const src = explicitSrc || registered?.src;
  const alt = explicitAlt || registered?.alt || name;
  const priority = explicitPriority ?? registered?.priority ?? false;
  const fit = explicitFit || registered?.objectFit || "contain";
  const pos = explicitPos || registered?.objectPosition || "object-center";

  if (src) {
    return (
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center select-none overflow-hidden",
          className
        )}
        aria-hidden="true"
        {...props}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
          className={cn(
            "pointer-events-none select-none transition-opacity duration-300",
            fit === "contain" ? "object-contain" : "object-cover",
            pos
          )}
        />
      </div>
    );
  }

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

