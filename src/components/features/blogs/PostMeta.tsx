import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { formatEventDate } from "@/lib/blogs/layout";
import type { BlogPost } from "@/data/blogs";

export interface PostMetaProps extends React.HTMLAttributes<HTMLDivElement> {
  post: BlogPost;
  layout: "inline" | "stacked";
  className?: string;
}

export function PostMeta({
  post,
  layout,
  className,
  ...props
}: PostMetaProps) {
  if (layout === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground",
          className
        )}
        {...props}
      >
        <Avatar name={post.authorName} src={post.authorImage} size={18} />
        <span className="min-w-0 truncate text-foreground/80">
          {post.authorName}
        </span>
        <span aria-hidden="true" className="select-none">
          •
        </span>
        <span className="shrink-0">{formatEventDate(post.date)}</span>
        <span className="ml-auto shrink-0 whitespace-nowrap">
          {post.readMinutes} min read
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      {...props}
    >
      <Avatar name={post.authorName} src={post.authorImage} size={32} />
      <div className="flex flex-col">
        <span className="text-[13px] font-semibold text-foreground">
          {post.authorName}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatEventDate(post.date)} • {post.readMinutes} min read
        </span>
      </div>
    </div>
  );
}
