import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";

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
    <ArtworkSlot
      name={label}
      className={cn(
        "absolute inset-0 h-full w-full aspect-auto rounded-none border-0",
        className
      )}
      {...props}
    />
  );
}
