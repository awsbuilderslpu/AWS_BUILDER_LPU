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

export const ARTWORK_REGISTRY: Record<string, ArtworkConfig> = {
  "Blogs: laptop + servers + cloud": {
    src: "/images/artwork/Neon AWS Cloud Computing Network.png",
    alt: "Neon AWS Cloud Computing Network",
    objectFit: "contain",
  },
  "Blogs: cube + globe": {
    src: "/images/artwork/Neon Orbital Network Overlay.png",
    alt: "Neon Orbital Network Overlay",
    objectFit: "contain",
    objectPosition: "object-left",
  },
  "About: AWS cube + cloud": {
    src: "/images/artwork/Neon AWS Cloud Network Isometric Illustration.png",
    alt: "Neon AWS Cloud Network Isometric Illustration",
    objectFit: "contain",
    objectPosition: "object-right",
  },
  "Home: cloud + servers": {
    src: "/images/artwork/Futuristic AWS Cloud Infrastructure Network.png",
    alt: "Futuristic AWS Cloud Infrastructure Network",
    objectFit: "contain",
    objectPosition: "object-center",
  },
  "CTA cloud + servers": {
    src: "/images/artwork/Futuristic AWS Cloud Infrastructure Network.png",
    alt: "Futuristic AWS Cloud Infrastructure Network",
    objectFit: "contain",
  },
};

export interface ArtworkSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  className?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  objectFit?: "contain" | "cover";
  objectPosition?: string;
  imageClassName?: string;
}

export function ArtworkSlot({
  name,
  className,
  src: explicitSrc,
  alt: explicitAlt,
  priority: explicitPriority,
  objectFit: explicitFit,
  objectPosition: explicitPos,
  imageClassName,
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
            pos,
            imageClassName
          )}
        />
      </div>
    );
  }

  return null;
}
