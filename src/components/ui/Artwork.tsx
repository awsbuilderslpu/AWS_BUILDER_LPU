import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { type ArtworkKey, artworkManifest, getArtworkSrc } from "@/data/artwork";

export interface ArtworkProps {
  slot: ArtworkKey;
  className?: string;
  sizes: string;
  priority?: boolean;
}

export function Artwork({ slot, className, sizes, priority }: ArtworkProps) {
  const entry = artworkManifest[slot];
  const src = getArtworkSrc(slot);

  if (!src) {
    const label = entry ? entry.label : slot;
    return <ArtworkSlot name={label} className={className} />;
  }

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none relative aspect-[4/3] select-none", className)}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        quality={90}
        draggable={false}
        className={entry.imageClass}
        preload={priority ? true : undefined}
      />
    </div>
  );
}
