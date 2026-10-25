import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/features/blogs/CategoryBadge";
import { PostImage } from "@/components/features/blogs/PostImage";
import { PostMeta } from "@/components/features/blogs/PostMeta";
import type { BlogPost } from "@/data/blogs";

export interface FeaturedArticleProps
  extends React.HTMLAttributes<HTMLElement> {
  post: BlogPost;
  className?: string;
}

export function FeaturedArticle({
  post,
  className,
  ...props
}: FeaturedArticleProps) {
  return (
    <article
      className={cn(
        "relative group overflow-hidden rounded-lg border border-border bg-card/70 transition-colors hover:border-primary/40",
        className
      )}
      {...props}
    >
      {/* Image block: relative aspect-[2/1] below sm; from sm up absolute inset-y-0 right-0 w-[66%] aspect-auto */}
      <div className="relative aspect-[2/1] sm:aspect-auto sm:absolute sm:inset-y-0 sm:right-0 sm:w-[66%] overflow-hidden">
        <PostImage
          src={post.image}
          label="Featured article image"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 66vw, 45vw"
        />
        <div
          aria-hidden="true"
          className="hidden sm:block absolute inset-0 bg-gradient-to-r from-card via-card/70 to-transparent pointer-events-none"
        />
      </div>

      {/* Text column: relative z-10, flex flex-col, px-6 pb-5 pt-[18px], sm:w-[50%] */}
      <div className="relative z-10 flex flex-col px-6 pb-5 pt-[18px] sm:w-[50%]">
        <CategoryBadge tone="solid" className="self-start">
          {post.category}
        </CategoryBadge>

        <h3 className="mt-3 text-2xl font-semibold leading-[1.17] text-foreground">
          <Link
            href={post.href}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-2 text-[14.5px] leading-[1.35] text-muted-foreground line-clamp-2 sm:line-clamp-3">
            {post.excerpt}
          </p>
        )}

        <PostMeta post={post} layout="stacked" className="mt-6" />
      </div>

      {/* Read More + ArrowRight */}
      <div
        aria-hidden="true"
        className="absolute bottom-5 right-6 z-10 hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary pointer-events-none"
      >
        <span>Read More</span>
        <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </article>
  );
}
