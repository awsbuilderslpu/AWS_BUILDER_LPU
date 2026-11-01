import * as React from "react";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import {
  blogsHeading,
  blogsIntro,
  type BlogPost,
  type BlogTopic,
} from "@/data/blogs";
import { listPublicBlogs } from "@/lib/public/blogs.server";
import { toBlogPost, popularTopicCounts } from "@/lib/public/blog-cards";
import { publicObjectUrl } from "@/lib/storage/urls";
import { BlogsDecor } from "@/components/features/blogs/BlogsDecor";
import { BlogsExplorer } from "@/components/features/blogs/BlogsExplorer";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";

export interface BlogsSectionProps extends React.HTMLAttributes<HTMLElement> {
  posts?: BlogPost[];
  topicCounts?: Record<BlogTopic, number>;
  initialTopic?: string;
  className?: string;
}

export async function BlogsSection({
  posts,
  topicCounts,
  initialTopic = "All",
  className,
  ...props
}: BlogsSectionProps) {
  let resolvedPosts = posts;
  let resolvedTopicCounts = topicCounts;

  if (!resolvedPosts) {
    const nowIso = new Date().toISOString();
    const rows = await listPublicBlogs(nowIso);
    resolvedPosts = rows
      .map((row) =>
        toBlogPost(
          row,
          Date.parse(nowIso),
          row.featured_image_path
            ? publicObjectUrl("blog-images", row.featured_image_path)
            : null
        )
      )
      .filter((p): p is BlogPost => p !== null);
  }

  if (!resolvedTopicCounts) {
    resolvedTopicCounts = popularTopicCounts(resolvedPosts);
  }

  return (
    <section
      className={cn("relative overflow-hidden pb-12", className)}
      {...props}
    >
      {/* Direct child 1: BlogsDecor (Desktop xl and up) */}
      <BlogsDecor />

      {/* Direct child 2: Header */}
      <div className="relative z-10 w-full px-6 pt-6 xl:pl-[12.4%] xl:pr-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-[clamp(18px,1.8vw,30px)]">
          {/* Left block */}
          <div className="flex flex-col items-start">
            <SectionEyebrow lines="both">Our Blogs</SectionEyebrow>
            <div className="mt-2.5">
              <PageHeading size="sm" as="h1" lines={blogsHeading} />
            </div>
          </div>

          {/* Paragraph */}
          <p className="text-base leading-[1.47] text-muted-foreground xl:mt-14 xl:max-w-[clamp(280px,21vw,352px)]">
            {blogsIntro}
          </p>
        </div>

        {/* Mobile / Tablet Artwork (Below xl breakpoint) */}
        <div className="relative mx-auto mt-6 flex h-[180px] w-full max-w-sm items-center justify-center sm:h-[220px] xl:hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-2xl"
          />
          <ArtworkSlot
            name="Blogs: laptop + servers + cloud"
            src="/images/artwork/Neon AWS Cloud Computing Network.png"
            alt="AWS Cloud Computing Network"
            priority
            className="h-full w-full aspect-auto overflow-visible"
            imageClassName="drop-shadow-[0_0_35px_rgba(255,153,0,0.35)]"
          />
        </div>
      </div>

      {/* Direct child 3: BlogsExplorer */}
      <BlogsExplorer
        posts={resolvedPosts}
        topicCounts={resolvedTopicCounts}
        initialTopic={initialTopic}
      />
    </section>
  );
}
