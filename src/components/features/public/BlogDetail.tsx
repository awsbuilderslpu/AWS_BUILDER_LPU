import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { FaAws } from "react-icons/fa6";

import { cn } from "@/lib/utils";
import { publicCopy } from "@/data/public";
import { CategoryBadge } from "@/components/features/blogs/CategoryBadge";
import { Avatar } from "@/components/ui/Avatar";
import { formatIst } from "@/lib/datetime";
import { RichTextRenderer } from "@/components/features/admin/forms/RichTextRenderer";
import type { PublicBlogDetailRow } from "@/lib/public/blogs.server";

export interface BlogDetailProps extends React.HTMLAttributes<HTMLElement> {
  post: PublicBlogDetailRow;
  imageUrl: string | null;
  className?: string;
}

export function BlogDetail({
  post,
  imageUrl,
  className,
  ...props
}: BlogDetailProps) {
  const dateFormatted = post.publish_at
    ? formatIst(post.publish_at, { withTime: false })
    : "";
  const effectiveImage = imageUrl || post.external_image_url || null;

  return (
    <article
      className={cn("mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          <span>{publicCopy.blogs.back}</span>
        </Link>
      </div>

      {/* Header section */}
      <header className="space-y-4">
        <div>
          <CategoryBadge tone="solid">{post.category}</CategoryBadge>
        </div>

        <h1 className="text-4xl font-bold tracking-tight leading-tight text-foreground sm:text-5xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        {/* Byline */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-muted-foreground">
          <Avatar name={post.author_name} size={40} />
          <span className="font-medium text-foreground">
            {publicCopy.blogs.byline(post.author_name)}
          </span>
          {dateFormatted && (
            <>
              <span aria-hidden="true" className="text-border">
                •
              </span>
              <time dateTime={post.publish_at!}>{dateFormatted}</time>
            </>
          )}
          <span aria-hidden="true" className="text-border">
            •
          </span>
          <span>{publicCopy.blogs.readTime(post.read_minutes)}</span>
        </div>

        {post.source_url && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[#FF9900]/40 bg-[#FF9900]/10 p-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FF9900] text-black">
                <FaAws className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Published on AWS Builder Center</p>
                <p className="text-xs text-muted-foreground">Original article by {post.author_name}</p>
              </div>
            </div>
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF9900] px-3.5 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 shrink-0"
            >
              <span>Read on AWS Builder</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        )}
      </header>

      {/* Featured image */}
      {effectiveImage && (
        <div className="relative mt-8 aspect-[1200/630] w-full overflow-hidden rounded-lg border border-border">
          <Image
            src={effectiveImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
            unoptimized={
              (effectiveImage.startsWith("http://") ||
                effectiveImage.startsWith("https://")) &&
              (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
                !effectiveImage.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL))
            }
          />
        </div>
      )}

      {/* Body */}
      <div className="mt-10">
        <RichTextRenderer doc={post.body} variant="article" />
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 border-t border-border pt-6">
          <span className="mb-3 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {publicCopy.blogs.tags}
          </span>
          <div className="flex flex-wrap gap-2">
            {post.tags.filter(Boolean).map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center rounded border border-border bg-card/60 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
