import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/features/blogs/CategoryBadge";
import { PostImage } from "@/components/features/blogs/PostImage";
import { PostMeta } from "@/components/features/blogs/PostMeta";
import type { BlogPost } from "@/data/blogs";

export interface LatestPostItemProps
  extends React.HTMLAttributes<HTMLElement> {
  post: BlogPost;
  className?: string;
}

export function LatestPostItem({
  post,
  className,
  ...props
}: LatestPostItemProps) {
  return (
    <article
      className={cn(
        "relative group flex overflow-hidden rounded-md border border-border bg-card/60 transition-colors hover:border-primary/40",
        className
      )}
      {...props}
    >
      {/* Thumbnail: relative w-[28%] min-w-[96px] shrink-0 holding <PostImage label="Post image" /> */}
      <div className="relative w-[28%] min-w-[96px] shrink-0 overflow-hidden">
        <PostImage
          src={post.image}
          label="Post image"
          sizes="(max-width: 640px) 28vw, 15vw"
        />
      </div>

      {/* Body: flex min-w-0 flex-1 flex-col gap-1.5 p-3 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3">
        <CategoryBadge tone="orange" className="self-start">
          {post.category}
        </CategoryBadge>

        <h3 className="text-[15px] font-semibold leading-[1.2] text-foreground transition-colors group-hover:text-primary line-clamp-2">
          <Link
            href={post.href}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h3>

        <PostMeta post={post} layout="inline" className="mt-auto pt-1" />
      </div>
    </article>
  );
}
