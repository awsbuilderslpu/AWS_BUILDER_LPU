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
    const isExternal = src.startsWith("http://") || src.startsWith("https://");
    const isSupabase =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      src.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    const unoptimized = isExternal && !isSupabase;

    return (
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        unoptimized={unoptimized}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-card to-accent/10 select-none overflow-hidden",
        className
      )}
      {...props}
    >
      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
