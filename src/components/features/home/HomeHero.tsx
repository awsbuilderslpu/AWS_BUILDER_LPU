import * as React from "react";
import Link from "next/link";

import { siteConfig } from "@/data/site";
import { heroHeading } from "@/data/home";
import { homeStats } from "@/data/stats";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PageHeading } from "@/components/ui/PageHeading";
import { Button } from "@/components/ui/button";
import { StatsRow } from "@/components/ui/StatsRow";
import { ArtworkSlot } from "@/components/ui/ArtworkSlot";
import { HeroDecor } from "@/components/features/home/HeroDecor";

export interface HomeHeroProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function HomeHero({ className, ...props }: HomeHeroProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[max(calc(100svh-72px),800px)] flex-col overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Right Artwork (Desktop xl and up, absolute layer z-0) */}
      <ArtworkSlot
        name="Home: cloud + servers"
        className="absolute right-0 top-[3%] bottom-0 hidden w-[48%] aspect-auto z-0 xl:flex"
      />

      {/* Hero Decor Layer (xl and up, z-[1]) */}
      <HeroDecor />

      {/* Main Content Wrapper (z-10) */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 py-16 xl:pl-[16%]">
        <div className="flex w-full max-w-[560px] flex-col items-start">
          {/* Eyebrow */}
          <SectionEyebrow lines="after" size="md">
            {siteConfig.name} / {siteConfig.org}
          </SectionEyebrow>

          {/* Headline (20px gap) */}
          <div className="mt-5">
            <PageHeading size="xl" as="h1" lines={heroHeading} />
          </div>

          {/* Subtitle / Description (24px gap) */}
          <p className="mt-6 max-w-[540px] text-lg leading-[1.5] text-muted-foreground">
            {siteConfig.description}
          </p>

          {/* CTAs (28px gap, 24px gap between buttons) */}
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <Button
              asChild
              variant="primary"
              size="lg"
              withArrow
              className="font-semibold"
            >
              <Link href="/events">Explore Events</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-medium"
            >
              <Link href={siteConfig.joinUrl}>Join the Club</Link>
            </Button>
          </div>

          {/* StatsRow (48px gap, plain variant, first stat flush left) */}
          <div className="mt-12 w-full">
            <StatsRow variant="plain" stats={homeStats} />
          </div>
        </div>

        {/* Right Artwork (Below xl breakpoint, normal flow under content) */}
        <div className="mt-12 mb-10 w-full max-w-md self-center xl:hidden">
          <ArtworkSlot
            name="Home: cloud + servers"
            className="aspect-[4/3] w-full"
          />
        </div>
      </div>
    </section>
  );
}
