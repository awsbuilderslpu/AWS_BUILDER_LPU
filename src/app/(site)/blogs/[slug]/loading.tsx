import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { publicCopy } from "@/data/public";

export default function BlogDetailLoading() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
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
        <div className="h-6 w-24 rounded-full bg-primary/20" />
        <div className="h-10 w-3/4 rounded-lg bg-card/60 border border-border" />

        {/* Author / meta row */}
        <div className="flex items-center gap-3 pt-2">
          <div className="size-10 rounded-full bg-muted/20" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded bg-muted/20" />
            <div className="h-3 w-40 rounded bg-muted/20" />
          </div>
        </div>
      </header>

      {/* Featured image skeleton */}
      <div className="mt-8 aspect-video w-full rounded-2xl border border-border bg-card/40" />

      {/* Body skeleton */}
      <div className="mt-8 space-y-4">
        <div className="h-4 w-full rounded bg-muted/20" />
        <div className="h-4 w-5/6 rounded bg-muted/20" />
        <div className="h-4 w-4/5 rounded bg-muted/20" />
        <div className="h-4 w-full rounded bg-muted/20" />
        <div className="h-4 w-2/3 rounded bg-muted/20" />
      </div>
    </article>
  );
}

