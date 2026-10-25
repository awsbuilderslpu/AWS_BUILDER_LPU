import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import type { PopularTopic } from "@/data/blogs";

export interface PopularTopicsProps extends React.HTMLAttributes<HTMLElement> {
  topics: PopularTopic[];
  className?: string;
}

export function PopularTopics({
  topics,
  className,
  ...props
}: PopularTopicsProps) {
  return (
    <section
      aria-labelledby="popular-topics-heading"
      className={cn(
        "rounded-lg border border-border bg-card/60 overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Header: px-4 pb-3.5 pt-4 with SectionEyebrow size="sm" lines="after" "Popular Topics" (id + role="heading" aria-level={2}) */}
      <div className="px-4 pb-3.5 pt-4">
        <SectionEyebrow
          id="popular-topics-heading"
          size="sm"
          lines="after"
          role="heading"
          aria-level={2}
        >
          Popular Topics
        </SectionEyebrow>
      </div>

      {/* List: <ul> border-t border-border/70 divide-y divide-border/70 */}
      <ul className="border-t border-border/70 divide-y divide-border/70">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <li key={topic.label}>
              <Link
                href={topic.href}
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-primary/5"
              >
                <Icon
                  className="size-7 shrink-0 text-primary"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-col">
                  <span className="text-[14.5px] font-semibold text-foreground truncate">
                    {topic.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {topic.count} posts
                  </span>
                </div>
                <ChevronRight
                  className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
