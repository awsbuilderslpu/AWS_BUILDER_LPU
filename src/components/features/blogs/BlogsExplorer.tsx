"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SearchInput } from "@/components/ui/SearchInput";
import { FilterChips } from "@/components/ui/FilterChips";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { FeaturedArticle } from "@/components/features/blogs/FeaturedArticle";
import { LatestPostItem } from "@/components/features/blogs/LatestPostItem";
import { RecentArticleCard } from "@/components/features/blogs/RecentArticleCard";
import { PopularTopics } from "@/components/features/blogs/PopularTopics";
import { BlogNewsletter } from "@/components/features/blogs/BlogNewsletter";
import { Reveal } from "@/components/motion/Reveal";
import { staggerDelay } from "@/lib/motion/tokens";
import {
  blogFilters,
  popularTopics,
  searchPlaceholder,
  allPostsHref,
  type BlogPost,
  type BlogTopic,
} from "@/data/blogs";
import { publicCopy } from "@/data/public";
import { splitPosts, filterPosts } from "@/lib/blogs/layout";

export interface BlogsExplorerProps {
  posts: BlogPost[];
  topicCounts: Record<BlogTopic, number>;
  initialTopic?: string;
}

export function BlogsExplorer({
  posts,
  topicCounts,
  initialTopic,
}: BlogsExplorerProps) {
  const [activeFilter, setActiveFilter] = React.useState<string>(
    initialTopic ?? "All"
  );
  const [query, setQuery] = React.useState<string>("");

  // Adjust activeFilter during render if initialTopic prop changed
  const [prevInitialTopic, setPrevInitialTopic] = React.useState(initialTopic);
  if (initialTopic !== prevInitialTopic) {
    setPrevInitialTopic(initialTopic);
    setActiveFilter(initialTopic ?? "All");
  }

  const isFiltering = activeFilter !== "All" || query.trim() !== "";

  const { featured, latest, recent } = React.useMemo(
    () => splitPosts(posts),
    [posts]
  );

  const results = React.useMemo(() => {
    if (!isFiltering) return [];
    return filterPosts(posts, activeFilter, query);
  }, [isFiltering, posts, activeFilter, query]);

  const computedPopularTopics = React.useMemo(() => {
    return popularTopics.map((pt) => ({
      ...pt,
      count: topicCounts[pt.topic] ?? 0,
      href: `/blogs?topic=${encodeURIComponent(pt.topic)}`,
    }));
  }, [topicCounts]);

  return (
    <div className="relative z-10 w-full px-6 pt-7 xl:pl-[9.7%] xl:pr-[2.6%]">
      {/* Controls row */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-5 xl:pl-[1.1%]">
        <SearchInput
          value={query}
          onChange={setQuery}
          ariaLabel="Search articles"
          placeholder={searchPlaceholder}
          className="h-10 xl:w-[clamp(300px,25.7vw,429px)] xl:shrink-0"
        />
        <FilterChips
          value={activeFilter}
          onChange={setActiveFilter}
          variant="solid"
          ariaLabel="Filter articles by topic"
          options={blogFilters}
        />
      </div>

      {/* Main grid (mt-7) */}
      <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_clamp(280px,19.3vw,323px)]">
        {/* Left column */}
        {posts.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-border bg-card/30 p-12 text-center">
            <p className="text-base text-muted-foreground">
              {publicCopy.blogs.empty}
            </p>
          </div>
        ) : !isFiltering ? (
          /* Normal view */
          <div className="flex flex-col gap-7">
            {/* Row A: grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
              {/* Featured section */}
              <section aria-labelledby="featured-article-heading">
                <SectionEyebrow
                  id="featured-article-heading"
                  size="sm"
                  role="heading"
                  aria-level={2}
                  className="mb-2.5"
                >
                  Featured Article
                </SectionEyebrow>
                {featured && (
                  <Reveal delay={staggerDelay(0)}>
                    <FeaturedArticle post={featured} />
                  </Reveal>
                )}
              </section>

              {/* Latest section */}
              <section aria-labelledby="latest-posts-heading">
                <div className="mb-2.5 flex items-center justify-between">
                  <SectionEyebrow
                    id="latest-posts-heading"
                    size="sm"
                    role="heading"
                    aria-level={2}
                  >
                    Latest Posts
                  </SectionEyebrow>
                  <Link
                    href={allPostsHref}
                    className="inline-flex items-center gap-1 text-[13.5px] font-medium text-primary transition-colors hover:text-primary-hover"
                  >
                    <span>View All</span>
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {latest.map((post, index) => (
                    <Reveal as="li" key={post.slug} delay={staggerDelay(index)}>
                      <LatestPostItem post={post} />
                    </Reveal>
                  ))}
                </ul>
              </section>
            </div>

            {/* Recent section */}
            <section aria-labelledby="recent-articles-heading">
              <SectionEyebrow
                id="recent-articles-heading"
                size="sm"
                role="heading"
                aria-level={2}
                className="mb-2.5"
              >
                Recent Articles
              </SectionEyebrow>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {recent.map((post, index) => (
                  <Reveal
                    as="li"
                    key={post.slug}
                    delay={staggerDelay(index)}
                    className="flex"
                  >
                    <RecentArticleCard post={post} />
                  </Reveal>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          /* Results view */
          <section aria-labelledby="results-heading" className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <SectionEyebrow
                id="results-heading"
                size="sm"
                role="heading"
                aria-level={2}
              >
                Results
              </SectionEyebrow>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-muted-foreground">
                  {results.length} article{results.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("All");
                    setQuery("");
                  }}
                  className="cursor-pointer text-[13px] font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  Clear
                </button>
              </div>
            </div>

            <p className="sr-only" aria-live="polite">
              Showing {results.length} articles
            </p>

            {results.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((post, index) => (
                  <Reveal
                    as="li"
                    key={post.slug}
                    delay={staggerDelay(index)}
                    className="flex"
                  >
                    <RecentArticleCard post={post} />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-card/30 p-8 text-center text-sm text-muted-foreground">
                No articles match your search. Try a different topic or keyword.
              </div>
            )}
          </section>
        )}

        {/* Right column */}
        <div className="flex flex-col gap-7 xl:justify-between">
          <PopularTopics
            topics={computedPopularTopics}
            className="xl:mx-[clamp(0px,0.65vw,11px)]"
          />
          <BlogNewsletter />
        </div>
      </div>
    </div>
  );
}
