import * as React from "react";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { blogsHeading, blogsIntro } from "@/data/blogs";
import { BlogsDecor } from "@/components/features/blogs/BlogsDecor";
import { BlogsExplorer } from "@/components/features/blogs/BlogsExplorer";

export interface BlogsSectionProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function BlogsSection({ className, ...props }: BlogsSectionProps) {
  return (
    <section
      className={cn("relative overflow-hidden pb-12", className)}
      {...props}
    >
      {/* Direct child 1: BlogsDecor */}
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
      </div>

      {/* Direct child 3: BlogsExplorer */}
      <BlogsExplorer />
    </section>
  );
}
