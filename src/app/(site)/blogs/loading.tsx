import * as React from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { blogsHeading, blogsIntro } from "@/data/blogs";
import { BlogsDecor } from "@/components/features/blogs/BlogsDecor";

export default function BlogsLoading() {
  return (
    <section className="relative overflow-hidden pb-12">
      <BlogsDecor />

      {/* Header */}
      <div className="relative z-10 w-full px-6 pt-6 xl:pl-[12.4%] xl:pr-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-[clamp(18px,1.8vw,30px)]">
          <div className="flex flex-col items-start">
            <SectionEyebrow lines="both">Our Blogs</SectionEyebrow>
            <div className="mt-2.5">
              <PageHeading size="sm" as="h1" lines={blogsHeading} />
            </div>
          </div>

          <p className="text-base leading-[1.47] text-muted-foreground xl:mt-14 xl:max-w-[clamp(280px,21vw,352px)]">
            {blogsIntro}
          </p>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="relative z-10 w-full px-6 pt-8 xl:pl-[12.4%] xl:pr-6 space-y-8 animate-pulse">
        {/* Search & Filter Chips Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-full max-w-sm rounded-lg bg-card/60 border border-border" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-card/60 border border-border" />
            ))}
          </div>
        </div>

        {/* Featured Post Skeleton */}
        <div className="rounded-xl border border-border bg-card/40 p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="h-48 md:h-64 w-full md:w-1/2 rounded-lg bg-muted/20 shrink-0" />
          <div className="flex flex-col justify-center gap-3 flex-1">
            <div className="h-5 w-24 rounded bg-primary/20" />
            <div className="h-7 w-3/4 rounded bg-muted/20" />
            <div className="h-4 w-full rounded bg-muted/20" />
            <div className="h-4 w-2/3 rounded bg-muted/20" />
            <div className="h-4 w-32 rounded bg-muted/20 mt-2" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card/40 overflow-hidden flex flex-col">
              <div className="aspect-[2.7/1] w-full bg-muted/20" />
              <div className="p-4 space-y-2.5 flex-1">
                <div className="h-4 w-20 rounded bg-primary/20" />
                <div className="h-5 w-full rounded bg-muted/20" />
                <div className="h-4 w-24 rounded bg-muted/20 mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

