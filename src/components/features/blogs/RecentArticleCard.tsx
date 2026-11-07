import * as React from "react";
import Link from "next/link";
import { FaAws } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/features/blogs/CategoryBadge";
import { PostImage } from "@/components/features/blogs/PostImage";
import { PostMeta } from "@/components/features/blogs/PostMeta";
import type { BlogPost } from "@/data/blogs";

export interface RecentArticleCardProps
  extends React.HTMLAttributes<HTMLElement> {
  post: BlogPost;
  className?: string;
}

export function RecentArticleCard({
  post,
  className,
  ...props
}: RecentArticleCardProps) {
  return (
    <article
      className={cn(
        "relative group flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-card/60 transition-colors hover:border-primary/40 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:translate-y-[-2px]",
        className
      )}
      {...props}
    >
      {/* Image area: relative aspect-[2.7/1] with <PostImage label="Post image" />, plus CategoryBadge tone="blue" at absolute bottom-2 left-3.5 */}
      <div className="relative aspect-[2.7/1] w-full overflow-hidden">
        <PostImage
          src={post.image}
          label="Post image"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
        />
        <div className="absolute bottom-2 left-3.5 z-10 flex items-center gap-1.5">
          <CategoryBadge tone="blue">{post.category}</CategoryBadge>
          {post.sourcePlatform === "aws_builder" && (
            <span className="inline-flex items-center gap-1 rounded bg-[#FF9900] px-1.5 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider shadow">
              <FaAws className="size-3" />
              AWS Builder
            </span>
          )}
        </div>
      </div>

      {/* Body: flex flex-1 flex-col px-3.5 pb-3.5 pt-3 */}
      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <h3 className="text-[15px] font-semibold leading-[1.25] text-foreground transition-colors group-hover:text-primary line-clamp-2 min-h-[2.5em]">
          <Link
            href={post.href}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h3>

        <PostMeta post={post} layout="inline" className="mt-auto pt-3" />
      </div>
    </article>
  );
}
