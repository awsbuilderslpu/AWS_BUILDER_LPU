"use client";

import * as React from "react";
import { PageHeading } from "@/components/ui/PageHeading";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { StatsRow } from "@/components/ui/StatsRow";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/button";
import { DotGrid } from "@/components/ui/decor/DotGrid";
import { PlusMark } from "@/components/ui/decor/PlusMark";
import { StackedLabel } from "@/components/ui/decor/StackedLabel";
import { InlineLabel } from "@/components/ui/decor/InlineLabel";
import { homeStats, eventStats, memberStats } from "@/data/stats";

export default function ComponentKitPage() {
  const [filterSolid, setFilterSolid] = React.useState("All");
  const [filterOutline, setFilterOutline] = React.useState("All Events");
  const [searchQuery, setSearchQuery] = React.useState("");

  const solidOptions = ["All", "Core Team", "Club Leads", "Mentors", "Community"];
  const outlineOptions = [
    "All Events",
    "Workshops",
    "Hackathons",
    "Tech Talks",
    "Competitions",
  ];

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* 1. PageHeading Gallery */}
      <div className="space-y-6">
        <SectionEyebrow lines="after" size="sm">
          UI Kit — Page Heading
        </SectionEyebrow>
        <div className="space-y-8 rounded-xl border border-border bg-card/40 p-6 sm:p-8">
          <div>
            <span className="font-mono text-xs text-muted-foreground uppercase block mb-3">
              Size XL (Home Hero)
            </span>
            <PageHeading
              size="xl"
              lines={[
                { text: "Build The Future" },
                { text: "On Cloud", dot: true },
                { text: "Together As One", accent: true },
              ]}
            />
          </div>
          <div className="border-t border-border pt-6">
            <span className="font-mono text-xs text-muted-foreground uppercase block mb-3">
              Size LG (Sub-pages Hero)
            </span>
            <PageHeading
              size="lg"
              lines={[
                { text: "A Community Of" },
                { text: "Builders", dot: true, accent: true },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 2. SectionEyebrow Gallery */}
      <div className="space-y-6">
        <SectionEyebrow lines="after" size="sm">
          UI Kit — Section Eyebrow Variants
        </SectionEyebrow>
        <div className="grid grid-cols-1 gap-6 rounded-xl border border-border bg-card/40 p-6 sm:p-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <span className="font-mono text-xs text-muted-foreground uppercase block">
              lines=&quot;both&quot; size=&quot;md&quot; (default)
            </span>
            <SectionEyebrow lines="both" size="md">
              Our Events
            </SectionEyebrow>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs text-muted-foreground uppercase block">
              lines=&quot;after&quot; size=&quot;md&quot;
            </span>
            <SectionEyebrow lines="after" size="md">
              AWS Builder Group / LPU
            </SectionEyebrow>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs text-muted-foreground uppercase block">
              lines=&quot;none&quot; size=&quot;md&quot;
            </span>
            <SectionEyebrow lines="none" size="md">
              Featured Article
            </SectionEyebrow>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs text-muted-foreground uppercase block">
              lines=&quot;both&quot; size=&quot;sm&quot;
            </span>
            <SectionEyebrow lines="both" size="sm">
              Core Team
            </SectionEyebrow>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs text-muted-foreground uppercase block">
              lines=&quot;after&quot; size=&quot;sm&quot;
            </span>
            <SectionEyebrow lines="after" size="sm">
              Popular Topics
            </SectionEyebrow>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs text-muted-foreground uppercase block">
              lines=&quot;none&quot; size=&quot;sm&quot;
            </span>
            <SectionEyebrow lines="none" size="sm">
              Student Guide
            </SectionEyebrow>
          </div>
        </div>
      </div>

      {/* 3. StatsRow Gallery */}
      <div className="space-y-6">
        <SectionEyebrow lines="after" size="sm">
          UI Kit — Stats Row (Plain &amp; Boxed)
        </SectionEyebrow>
        <div className="space-y-8 rounded-xl border border-border bg-card/40 p-6 sm:p-8">
          <div>
            <span className="font-mono text-xs text-muted-foreground uppercase block mb-4">
              Variant: Plain (Home Hero)
            </span>
            <StatsRow variant="plain" stats={homeStats} />
          </div>

          <div className="border-t border-border pt-6">
            <span className="font-mono text-xs text-muted-foreground uppercase block mb-4">
              Variant: Boxed with Action Button (Events Strip)
            </span>
            <StatsRow
              variant="boxed"
              stats={eventStats}
              action={
                <Button variant="primary" withArrow size="default">
                  View All Events
                </Button>
              }
            />
          </div>

          <div className="border-t border-border pt-6">
            <span className="font-mono text-xs text-muted-foreground uppercase block mb-4">
              Variant: Boxed without Action (Members Box)
            </span>
            <StatsRow variant="boxed" stats={memberStats} />
          </div>
        </div>
      </div>

      {/* 4. FilterChips & SearchInput Gallery */}
      <div className="space-y-6">
        <SectionEyebrow lines="after" size="sm">
          UI Kit — Filter Chips &amp; Search Input
        </SectionEyebrow>
        <div className="space-y-8 rounded-xl border border-border bg-card/40 p-6 sm:p-8">
          <div>
            <span className="font-mono text-xs text-muted-foreground uppercase block mb-3">
              FilterChips — variant=&quot;solid&quot; (Selected: {filterSolid})
            </span>
            <FilterChips
              variant="solid"
              options={solidOptions}
              value={filterSolid}
              onChange={setFilterSolid}
              ariaLabel="Filter members by team"
            />
          </div>

          <div className="border-t border-border pt-6">
            <span className="font-mono text-xs text-muted-foreground uppercase block mb-3">
              FilterChips — variant=&quot;outline&quot; (Selected: {filterOutline})
            </span>
            <FilterChips
              variant="outline"
              options={outlineOptions}
              value={filterOutline}
              onChange={setFilterOutline}
              ariaLabel="Filter events by category"
            />
          </div>

          <div className="border-t border-border pt-6 max-w-xl">
            <span className="font-mono text-xs text-muted-foreground uppercase block mb-3">
              SearchInput
            </span>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search members by name, role, skills..."
              ariaLabel="Search members"
            />
          </div>
        </div>
      </div>

      {/* 5. Decorations Gallery */}
      <div className="space-y-6">
        <SectionEyebrow lines="after" size="sm">
          UI Kit — Decorative Pieces (xl breakpoint)
        </SectionEyebrow>
        <div className="relative h-80 w-full rounded-xl border border-border bg-card/60 p-6 overflow-hidden">
          <span className="font-mono text-xs text-muted-foreground uppercase">
            Decorations Canvas (Hidden below 1280px / xl breakpoint by default):
          </span>

          {/* DotGrid Orange */}
          <div className="absolute left-8 top-16">
            <DotGrid cols={8} rows={4} tone="orange" />
          </div>

          {/* DotGrid Muted */}
          <div className="absolute left-64 top-16">
            <DotGrid cols={8} rows={4} tone="muted" />
          </div>

          {/* PlusMark */}
          <PlusMark className="absolute left-1/2 top-24" />
          <PlusMark className="absolute left-[54%] top-40" />

          {/* StackedLabel */}
          <StackedLabel
            lines={["Learn", "Build", "Share", "Grow", "Together"]}
            line
            className="absolute right-12 top-12"
          />

          {/* InlineLabel */}
          <InlineLabel
            items={["AWS", "Cloud", "Community", "LPU"]}
            className="absolute left-8 bottom-8"
          />
        </div>
      </div>
    </section>
  );
}
