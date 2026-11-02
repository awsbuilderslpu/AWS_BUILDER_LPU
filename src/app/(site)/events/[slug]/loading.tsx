import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { publicCopy } from "@/data/public";

export default function EventDetailLoading() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          <span>{publicCopy.events.back}</span>
        </Link>
      </div>

      {/* Header section */}
      <header className="space-y-4">
        <div className="h-6 w-28 rounded-full bg-primary/20" />
        <div className="h-10 w-3/4 rounded-lg bg-card/60 border border-border" />
        <div className="h-4 w-1/2 rounded bg-muted/20" />
      </header>

      {/* Banner skeleton */}
      <div className="mt-8 aspect-[21/9] w-full rounded-2xl border border-border bg-card/40" />

      {/* Grid skeleton */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-4 w-full rounded bg-muted/20" />
          <div className="h-4 w-5/6 rounded bg-muted/20" />
          <div className="h-4 w-4/5 rounded bg-muted/20" />
          <div className="h-4 w-full rounded bg-muted/20" />
        </div>
        <div className="rounded-xl border border-border bg-card/40 p-6 space-y-4 h-fit">
          <div className="h-5 w-32 rounded bg-muted/20" />
          <div className="h-10 w-full rounded-lg bg-primary/20" />
          <div className="h-4 w-24 rounded bg-muted/20" />
        </div>
      </div>
    </article>
  );
}

